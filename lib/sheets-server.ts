// ──────────────────────────────────────────────────────────────
// lib/sheets-server.ts — Lecture du Google Sheet côté SERVEUR uniquement.
//
// ⚠️ Ne JAMAIS importer ce module dans un composant client :
//    il lit la clé privée (GOOGLE_PRIVATE_KEY) depuis process.env.
//    Utilisé exclusivement par la route serveur app/api/assiduite.
//
// Auth : JWT compte de service -> access token (aucune dépendance externe).
// ──────────────────────────────────────────────────────────────
import crypto from "node:crypto"

const SHEET_ID = process.env.GOOGLE_SHEET_ID
const SA_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const SA_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY

// ── Utils ─────────────────────────────────────────────────────
const b64url = (buf: string | Buffer) =>
  Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

const norm = (s: unknown) =>
  String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()

const a1 = (title: string) => `'${title.replace(/'/g, "''")}'`

// dd/mm/yyyy -> yyyy-mm-dd (laisse tel quel si déjà ISO ou inconnu)
function toISODate(v: string): string {
  const s = String(v ?? "").trim()
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`
  return s
}
// "14:00:00" -> "14:00"
const toHHMM = (v: string) => String(v ?? "").trim().slice(0, 5)

// ── Auth ──────────────────────────────────────────────────────
async function getAccessToken(): Promise<string> {
  if (!SHEET_ID || !SA_EMAIL || !SA_KEY_RAW)
    throw new Error("Credentials Google manquants (GOOGLE_SHEET_ID / GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY).")
  const key = SA_KEY_RAW.replace(/\\n/g, "\n")
  const now = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const claim = b64url(JSON.stringify({
    iss: SA_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }))
  const input = `${header}.${claim}`
  const signature = b64url(crypto.sign("RSA-SHA256", Buffer.from(input), key))
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${input}.${signature}`,
    }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`Auth Google échouée : ${JSON.stringify(json)}`)
  return json.access_token as string
}

// Lit plusieurs onglets en UNE seule requête (économise le quota Sheets :
// 60 lectures/min/utilisateur). Renvoie les valeurs dans l'ordre demandé.
async function batchGet(token: string, titles: string[]): Promise<string[][][]> {
  const ranges = titles.map((t) => `ranges=${encodeURIComponent(a1(t))}`).join("&")
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchGet?${ranges}&majorDimension=ROWS`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const json = await res.json()
  if (!res.ok) throw new Error(`Lecture Sheet échouée : ${JSON.stringify(json)}`)
  return ((json.valueRanges ?? []) as { values?: string[][] }[]).map((vr) => vr.values ?? [])
}

// Transforme une plage en tableau d'objets indexés par entête normalisée
function toObjects(values: string[][]): Record<string, string>[] {
  const headers = (values[0] ?? []).map(norm)
  return values.slice(1)
    .filter((r) => r.some((c) => String(c).trim() !== ""))
    .map((row) => {
      const o: Record<string, string> = {}
      headers.forEach((h, i) => { o[h] = row[i] ?? "" })
      return o
    })
}

// ── Types renvoyés au client (mêmes formes que le Hub Assiduité) ──
export type PresenceStatus = "présent" | "absent" | "excusé" | "retard"
export interface Session {
  id: number; titre: string; date: string; heure: string
  salle: string; formatrice: string; beneficiaireIds: number[]; statut: string
}
export interface Beneficiaire {
  id: number; prenom: string; nom: string; niveau: string; statut: string
}
export interface AssiduiteData {
  sessions: Session[]
  beneficiaires: Beneficiaire[]
  presences: Record<number, Record<number, PresenceStatus>>
}

function normEtat(v: string): PresenceStatus {
  const n = norm(v)
  if (n.startsWith("absent")) return "absent"
  if (n.startsWith("excuse")) return "excusé"
  if (n.startsWith("retard")) return "retard"
  return "présent"
}

// ── Lecture + mapping complet ─────────────────────────────────
export async function fetchAssiduiteData(): Promise<AssiduiteData> {
  const token = await getAccessToken()
  const [evRows, persRows, inscRows, assRows, intRows] = await batchGet(token, [
    "EVENEMENT", "PERSONNE", "INSCRIPTION", "ASSIDUITE", "INTERVENANT",
  ])

  const evenements = toObjects(evRows)
  const personnes = toObjects(persRows)
  const inscriptions = toObjects(inscRows)
  const assiduite = toObjects(assRows)
  const intervenants = toObjects(intRows)

  // Intervenants : id -> "Prenom Nom"
  const intName = new Map<string, string>()
  for (const i of intervenants) intName.set(String(i["id"]), `${i["prenom"] ?? ""} ${i["nom"] ?? ""}`.trim())

  // Personnes : id -> {prenom, nom}
  const persName = new Map<string, { prenom: string; nom: string }>()
  for (const p of personnes) persName.set(String(p["id"]), { prenom: p["prenom"] ?? "", nom: p["nom"] ?? "" })

  // Inscription retenue par personne : "En cours" prioritaire, sinon la dernière vue
  const inscByPers = new Map<string, { niveau: string; statut: string }>()
  for (const ins of inscriptions) {
    const pid = String(ins["personne id"])
    const enCours = norm(ins["statut"]) === "en cours"
    const current = inscByPers.get(pid)
    if (!current || enCours) {
      inscByPers.set(pid, {
        niveau: ins["niveau / classe"] || ins["niveau"] || "",
        statut: enCours ? "actif" : "inactif",
      })
    }
  }

  // Bénéficiaires = personnes ayant une inscription
  const beneficiaires: Beneficiaire[] = []
  for (const [pid, insc] of inscByPers) {
    const p = persName.get(pid)
    if (!p) continue
    beneficiaires.push({
      id: Number(pid), prenom: p.prenom, nom: p.nom,
      niveau: insc.niveau, statut: insc.statut,
    })
  }

  // Présences + participants par événement
  const presences: Record<number, Record<number, PresenceStatus>> = {}
  const participants = new Map<number, Set<number>>()
  for (const a of assiduite) {
    const evId = Number(a["evenement id"])
    const pId = Number(a["personne id"])
    if (!evId || !pId) continue
    ;(presences[evId] ??= {})[pId] = normEtat(a["etat"])
    let set = participants.get(evId)
    if (!set) { set = new Set(); participants.set(evId, set) }
    set.add(pId)
  }

  // Sessions depuis EVENEMENT
  const sessions: Session[] = evenements.map((e) => {
    const id = Number(e["id"])
    return {
      id,
      titre: e["titre"] || "",
      date: toISODate(e["date"]),
      heure: toHHMM(e["heure_debut"] || e["heure debut"] || ""),
      salle: e["salle"] || "",
      formatrice: intName.get(String(e["animateur : id_membre_area"] ?? e["animateur"] ?? "")) || "",
      beneficiaireIds: Array.from(participants.get(id) ?? []),
      statut: e["statut"] || "",
    }
  })

  return { sessions, beneficiaires, presences }
}

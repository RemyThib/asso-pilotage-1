// ──────────────────────────────────────────────
// Fiche atelier — types & helpers (Lot 2 du chantier 2.1)
// ──────────────────────────────────────────────
// Étend la structure historique des sessions d'atelier avec :
//   • compétences ciblées (cf. lib/positionnement.ts → 4 thématiques)
//   • public ciblé (tranche d'âge, taille de groupe, ratio encadrement)
//   • organisation (tâches, besoins, étapes, personnes impliquées)
//   • mode de groupage (homogène par défaut, hétérogène en option)
//
// Ces champs alimenteront l'algorithme de composition de groupes (Lot 3).

import type { Thematique } from "./positionnement"

// ──────────────────────────────────────────────
// Tranches d'âge — barrières dures pour la composition de groupes
// ──────────────────────────────────────────────
// Décision projet : un bénéficiaire de 7 ans et un de 18 ans ne peuvent
// pas être dans le même groupe même s'ils ont des notes similaires.
// L'algorithme refuse tout mélange entre tranches.

export type TrancheAge = "6-9" | "10-13" | "14-18"

export const TRANCHES_AGE: { key: TrancheAge; min: number; max: number; label: string }[] = [
  { key: "6-9",   min: 6,  max: 9,  label: "6-9 ans" },
  { key: "10-13", min: 10, max: 13, label: "10-13 ans" },
  { key: "14-18", min: 14, max: 18, label: "14-18 ans" },
]

/** Retourne la tranche dans laquelle un âge tombe (null si hors plage). */
export function trancheFor(age: number | null): TrancheAge | null {
  if (age === null) return null
  const t = TRANCHES_AGE.find(t => age >= t.min && age <= t.max)
  return t?.key ?? null
}

// ──────────────────────────────────────────────
// Fiche descriptive — nouveaux champs étendus
// ──────────────────────────────────────────────

export interface FicheAtelier {
  /** Thématiques évaluées par le test de positionnement qui sont pertinentes
   *  pour cet atelier. L'algorithme se base sur les notes de ces thématiques. */
  competencesCiblees: Thematique[]

  /** Tranche d'âge cible. null = pas de borne. */
  ageMin: number | null
  ageMax: number | null

  /** Nombre de bénéficiaires visé par groupe. null = pas de contrainte. */
  tailleGroupeCible: number | null

  /** 1 encadrant pour N bénéficiaires. null = pas de ratio strict.
   *  Ex : atelier exposé → 2 (1 bénévole pour 2 bénéficiaires). */
  ratioEncadrement: number | null

  /** Mode de groupage. False (défaut) = homogène (niveaux proches ensemble).
   *  True = hétérogène (mélange volontaire des niveaux). */
  mixerNiveaux: boolean

  // Organisation libre — alimentent la fiche descriptive, pas l'algo
  taches: string[]
  besoins: string[]
  etapes: string[]
  personnesImpliqueesIds: number[]

  /** Période sur laquelle s'étend l'atelier (ex : vacances scolaires).
   *  Indépendante du champ `date` de la session qui reste la date principale
   *  de référence. null = atelier sur une seule séance, pas de période. */
  dateDebut: string | null
  dateFin:   string | null
}

// ──────────────────────────────────────────────
// Valeurs par défaut + migration douce
// ──────────────────────────────────────────────

export function emptyFiche(): FicheAtelier {
  return {
    competencesCiblees: [],
    ageMin: null,
    ageMax: null,
    tailleGroupeCible: null,
    ratioEncadrement: null,
    mixerNiveaux: false,
    taches: [],
    besoins: [],
    etapes: [],
    personnesImpliqueesIds: [],
    dateDebut: null,
    dateFin:   null,
  }
}

/** Une session qui vient de l'ancien format n'a aucun de ces champs.
 *  On comble les manques pour que la page ne crashe pas. */
export function migrateFiche<T extends Partial<FicheAtelier>>(s: T): T & FicheAtelier {
  return {
    ...s,
    competencesCiblees:     s.competencesCiblees     ?? [],
    ageMin:                 s.ageMin                 ?? null,
    ageMax:                 s.ageMax                 ?? null,
    tailleGroupeCible:      s.tailleGroupeCible      ?? null,
    ratioEncadrement:       s.ratioEncadrement       ?? null,
    mixerNiveaux:           s.mixerNiveaux           ?? false,
    taches:                 s.taches                 ?? [],
    besoins:                s.besoins                ?? [],
    etapes:                 s.etapes                 ?? [],
    personnesImpliqueesIds: s.personnesImpliqueesIds ?? [],
    dateDebut:              s.dateDebut              ?? null,
    dateFin:                s.dateFin                ?? null,
  }
}

/** Calcule le nombre d'encadrants requis pour un groupe donné.
 *  null si l'atelier n'impose pas de ratio. */
export function encadrantsRequis(
  ratio: number | null,
  tailleGroupe: number,
): number | null {
  if (ratio === null || ratio <= 0) return null
  return Math.ceil(tailleGroupe / ratio)
}

// ──────────────────────────────────────────────
// Période d'atelier (helpers d'affichage)
// ──────────────────────────────────────────────

/** Vrai si la période est valide (les deux dates sont remplies et début ≤ fin). */
export function periodeValide(dateDebut: string | null, dateFin: string | null): boolean {
  if (!dateDebut || !dateFin) return false
  const d = new Date(dateDebut).getTime()
  const f = new Date(dateFin).getTime()
  if (isNaN(d) || isNaN(f)) return false
  return d <= f
}

/** Formate une période en français : "du 6 au 21 avril 2026".
 *  Renvoie une chaîne vide si la période n'est pas valide. */
export function formatPeriode(dateDebut: string | null, dateFin: string | null): string {
  if (!periodeValide(dateDebut, dateFin)) return ""
  const d = new Date(dateDebut!)
  const f = new Date(dateFin!)
  const mois = (date: Date) => date.toLocaleDateString("fr-FR", { month: "long" })
  // Même mois et même année → "du 6 au 21 avril 2026"
  if (d.getMonth() === f.getMonth() && d.getFullYear() === f.getFullYear()) {
    return `du ${d.getDate()} au ${f.getDate()} ${mois(f)} ${f.getFullYear()}`
  }
  // Sinon → "du 6 avril au 5 mai 2026"
  return `du ${d.getDate()} ${mois(d)} au ${f.getDate()} ${mois(f)} ${f.getFullYear()}`
}

/** Durée d'une période : nombre de jours (1+) ou nombre de semaines arrondies. */
export function dureePeriode(dateDebut: string | null, dateFin: string | null): string {
  if (!periodeValide(dateDebut, dateFin)) return ""
  const ms = new Date(dateFin!).getTime() - new Date(dateDebut!).getTime()
  const jours = Math.round(ms / 86400000) + 1
  if (jours < 7) return `${jours} jour${jours > 1 ? "s" : ""}`
  const semaines = Math.round(jours / 7)
  return `${semaines} sem.${jours !== semaines * 7 ? ` (${jours} j)` : ""}`
}

"use client"

export default function Adr005Page() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-10 space-y-10">
      <header>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">Explication · ADR</span>
        <h1 className="text-3xl font-bold text-foreground mt-4">ADR 005 — Accessibilité numérique (RGAA / WCAG 2.1 AA)</h1>
        <p className="text-muted mt-2">Mise en conformité RGAA 4.1 / WCAG 2.1 niveau AA pour l&apos;outil de pilotage AREA Nantes.</p>
      </header>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <span className="text-emerald-700 font-semibold text-sm">Statut :</span>
        <span className="text-emerald-800 font-bold text-sm">Accepté</span>
        <span className="text-emerald-600 text-xs ml-auto">2026-05-21</span>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground mt-2">Contexte</h2>
        <p className="text-sm text-muted leading-relaxed">
          L&apos;association AREA accompagne des familles allophones. L&apos;outil de pilotage doit être
          accessible à toutes les personnes de l&apos;équipe, quel que soit leur équipement ou leurs besoins.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground mt-2">Décision</h2>
        <p className="text-sm text-muted leading-relaxed">
          Le projet respecte le <strong>RGAA (Référentiel Général d&apos;Amélioration de l&apos;Accessibilité)</strong> version 4.1, aligné WCAG 2.1 niveau AA.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold text-foreground mt-2">Règles appliquées</h2>

        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">Navigation clavier</h3>
          <ul className="list-disc list-inside text-sm text-muted space-y-1">
            <li>Tous les éléments interactifs sont atteignables au clavier (Tab / Shift+Tab)</li>
            <li>Ordre de focus logique dans chaque page</li>
            <li>Lien d&apos;évitement &quot;Aller au contenu principal&quot; en début de page</li>
            <li>Fermeture des modales au <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">Escape</code></li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">Focus visible</h3>
          <ul className="list-disc list-inside text-sm text-muted space-y-1">
            <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">:focus-visible</code> ring teal AREA (#2bbfbf) sur tous les éléments</li>
            <li>Jamais <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">outline: none</code> sans alternative visible</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">Composants ARIA</h3>
          <ul className="list-disc list-inside text-sm text-muted space-y-1">
            <li>SlideOver : <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">role=&quot;dialog&quot;</code> + <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">aria-modal</code> + <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">aria-labelledby</code> + focus trap</li>
            <li>Navigation : <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">aria-current=&quot;page&quot;</code> sur lien actif, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">aria-label</code> sur <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">&lt;nav&gt;</code></li>
            <li>Alertes dynamiques : <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">role=&quot;alert&quot;</code> + <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">aria-live=&quot;assertive&quot;</code></li>
            <li>Boutons icône : <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">aria-label</code> explicite</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">Formulaires</h3>
          <ul className="list-disc list-inside text-sm text-muted space-y-1">
            <li>Chaque <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">&lt;input&gt;</code> / <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">&lt;select&gt;</code> / <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">&lt;textarea&gt;</code> est lié à son <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">&lt;label&gt;</code> via <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">htmlFor</code> / <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">id</code></li>
            <li>Champs requis : attribut <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">required</code> présent</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">Contenu</h3>
          <ul className="list-disc list-inside text-sm text-muted space-y-1">
            <li>Langue de la page déclarée : <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">&lt;html lang=&quot;fr&quot;&gt;</code></li>
            <li>Hiérarchie de titres respectée (h1 → h2 → h3)</li>
            <li>Pas de contenu uniquement véhiculé par la couleur</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground mt-2">Contrastes</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-3 py-2 border border-border font-semibold text-foreground">Élément</th>
              <th className="px-3 py-2 border border-border font-semibold text-foreground">Couleur texte</th>
              <th className="px-3 py-2 border border-border font-semibold text-foreground">Fond</th>
              <th className="px-3 py-2 border border-border font-semibold text-foreground">Ratio</th>
              <th className="px-3 py-2 border border-border font-semibold text-foreground">WCAG AA</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-2 border border-border text-muted">Texte principal</td>
              <td className="px-3 py-2 border border-border text-muted">#0f172a</td>
              <td className="px-3 py-2 border border-border text-muted">#f7f5f1</td>
              <td className="px-3 py-2 border border-border text-muted">~17:1</td>
              <td className="px-3 py-2 border border-border text-emerald-700 font-semibold">✅ Passe</td>
            </tr>
            <tr>
              <td className="px-3 py-2 border border-border text-muted">Texte muted</td>
              <td className="px-3 py-2 border border-border text-muted">#475569</td>
              <td className="px-3 py-2 border border-border text-muted">#f7f5f1</td>
              <td className="px-3 py-2 border border-border text-muted">~5.7:1</td>
              <td className="px-3 py-2 border border-border text-emerald-700 font-semibold">✅ Passe</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground mt-2">Checklist PR obligatoire avant merge</h2>
        <div className="bg-slate-50 rounded-xl p-5 space-y-3">
          {[
            "Navigation clavier testée sur la fonctionnalité",
            "Contrastes vérifiés (outil : webaim.org/resources/contrastchecker/)",
            "Labels liés aux inputs",
            "Boutons icône ont un aria-label",
            "Pas de outline: none sans alternative",
            "Extension axe DevTools vérifiée (0 erreur critique)",
          ].map((item) => (
            <label key={item} className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 rounded border-border accent-ateliers shrink-0"
              />
              <span className="text-sm text-muted">{item}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground mt-2">Outils recommandés</h2>
        <ul className="list-disc list-inside text-sm text-muted space-y-2">
          <li><strong>axe DevTools</strong> (extension Chrome/Firefox) — audit automatique</li>
          <li><strong>WAVE</strong> — <a href="https://wave.webaim.org/" target="_blank" rel="noopener noreferrer" className="text-ateliers-dark underline hover:opacity-80">wave.webaim.org</a></li>
          <li><strong>Contrast Checker</strong> — <a href="https://webaim.org/resources/contrastchecker/" target="_blank" rel="noopener noreferrer" className="text-ateliers-dark underline hover:opacity-80">webaim.org/resources/contrastchecker/</a></li>
          <li><strong>VoiceOver</strong> (Mac : Cmd+F5) pour test lecteur d&apos;écran</li>
        </ul>
      </section>
    </div>
  )
}

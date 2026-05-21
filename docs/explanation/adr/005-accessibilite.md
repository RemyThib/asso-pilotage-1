---
type: explanation
adr: "005"
statut: accepté
date: 2026-05-21
---

# ADR 005 — Accessibilité numérique (RGAA / WCAG 2.1 AA)

## Contexte
L'association AREA accompagne des familles allophones. L'outil de pilotage doit être
accessible à toutes les personnes de l'équipe, quel que soit leur équipement ou leurs
besoins.

## Décision
Le projet respecte le **RGAA (Référentiel Général d'Amélioration de l'Accessibilité)**
version 4.1, aligné WCAG 2.1 niveau AA.

## Règles appliquées

### Navigation clavier
- Tous les éléments interactifs sont atteignables au clavier (Tab / Shift+Tab)
- Ordre de focus logique dans chaque page
- Lien d'évitement "Aller au contenu principal" en début de page
- Fermeture des modales au `Escape`

### Focus visible
- `:focus-visible` ring teal AREA (#2bbfbf) sur tous les éléments
- Jamais `outline: none` sans alternative visible

### Composants ARIA
- SlideOver : `role="dialog"` + `aria-modal` + `aria-labelledby` + focus trap
- Navigation : `aria-current="page"` sur lien actif, `aria-label` sur `<nav>`
- Alertes dynamiques : `role="alert"` + `aria-live="assertive"`
- Boutons icône : `aria-label` explicite

### Formulaires
- Chaque `<input>` / `<select>` / `<textarea>` est lié à son `<label>` via `htmlFor` / `id`
- Champs requis : attribut `required` présent

### Contenu
- Langue de la page déclarée : `<html lang="fr">`
- Hiérarchie de titres respectée (h1 → h2 → h3)
- Pas de contenu uniquement véhiculé par la couleur

### Contrastes
- Texte normal : ratio ≥ 4.5:1 (WCAG AA)
- Texte grand (≥ 18px bold) : ratio ≥ 3:1
- `--muted` (#475569) sur fond crème (#f7f5f1) : ~5.7:1 ✅

## Checklist PR (obligatoire avant merge)
- [ ] Navigation clavier testée sur la fonctionnalité
- [ ] Contrastes vérifiés (outil : https://webaim.org/resources/contrastchecker/)
- [ ] Labels liés aux inputs
- [ ] Boutons icône ont un aria-label
- [ ] Pas de `outline: none` sans alternative
- [ ] Extension axe DevTools vérifiée (0 erreur critique)

## Outils recommandés
- **axe DevTools** (extension Chrome/Firefox) — audit automatique
- **WAVE** — https://wave.webaim.org/
- **Contrast Checker** — https://webaim.org/resources/contrastchecker/
- **VoiceOver** (Mac : Cmd+F5) pour test lecteur d'écran

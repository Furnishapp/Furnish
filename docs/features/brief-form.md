# Furnish — Brief client (MVP)

> Version radicalement allégée par rapport au draft initial. La version riche (7-10 sections) est reportée en V2 quand le brief deviendra personnalisable par le pro (templates type Typeform).
> *Dernière mise à jour : 26 avril 2026*

---

## Philosophie

Le brief est un **complément**, pas le cœur du produit. Le JTBD principal est *sourcer → présenter → valider → devis*. Le brief sert à :
- Donner du contexte au pro pour la curation
- Alimenter automatiquement la slide « brief » de la présentation client
- Servir de base au résumé IA (V1.5)

**Règles d'UX** :
- Toutes les sections sont optionnelles
- Le brief est non-bloquant : on peut sourcer et présenter sans avoir rempli quoi que ce soit
- Sauvegarde auto à chaque champ (debounce 500 ms)
- Score de complétion visible mais sans pression
- Pas de wizard 7 étapes — un seul écran scrollable, pliable par section

---

## Structure MVP — 3 sections, 12 champs

### Section 1 — Le projet *(4 champs)*

| Champ | Type | Notes |
|---|---|---|
| Nom du projet | texte | Déjà géré ailleurs (création projet) |
| Type de projet | select | Rénovation · Déco seule · Ameublement · Home staging · Autre |
| Surface (m²) | nombre | |
| Date de livraison souhaitée | date | Affiché en haut du dashboard projet |

### Section 2 — Le client & le contexte *(4 champs)*

| Champ | Type | Notes |
|---|---|---|
| Client | select dans CRM | Pré-rempli si projet déjà associé à un client |
| Vision en quelques mots | texte long | 3 à 5 lignes max — sera dans la slide brief |
| Usages principaux | checkboxes | Résidence principale · Secondaire · Location longue · Airbnb · Bureau · Autre |
| Contraintes à anticiper | texte long | Champ libre — copro, délais, occupants, animaux, etc. |

### Section 3 — Style & budget *(4 champs)*

| Champ | Type | Notes |
|---|---|---|
| Styles préférés | tags multi | Liste pré-remplie : Scandinave · Japandi · Industriel · Bohème · Minimaliste · Classique · Haussmannien · Mid-century · Méditerranéen · Wabi-sabi · *Ajouter…* |
| Styles à éviter | tags multi | Même liste |
| Enveloppe budget totale | nombre + flexibilité | Slider : Ferme · Flex ±10 % · Flex ±25 % · Indicatif |
| Moodboard d'inspiration | upload + URLs | Drag-drop images + paste Pinterest URLs — alimente le moodboard global du projet |

---

## Ce qu'on a retiré du draft initial

| Section / champ | Pourquoi retiré | Quand on l'ajoute |
|---|---|---|
| Adresse postale du bien | Confidentielle, pas utile pour l'outil | V2 si géolocalisation artisans utile |
| Liste détaillée des occupants (âges, besoins) | Trop détaillé, le pro le sait déjà | V2 (briefs personnalisables) |
| Constraintes copro / ABF / DP / PC | Métier de l'archi, pas du décorateur | V3 (module Chantier) |
| Section Pièces complète dans le brief | Vit déjà dans l'onglet Pièces du projet | Jamais dans le brief |
| Mode de financement | Hors scope outil | Jamais |
| Section attentes envers le pro (vue client) | Vit dans la conversation, pas dans l'app | V2 si module entretien client |
| Photos avant par pièce | Vit dans l'onglet Pièces | Jamais dans le brief |
| Animaux domestiques | Champ « contraintes » suffit | Jamais |

---

## UX du formulaire MVP

- **Un seul écran scrollable**, sections pliables (collapsed par défaut au premier ouverture, expanded ensuite)
- **Sauvegarde auto** à chaque champ (debounce 500 ms)
- **Score de complétion** : `4/12 champs renseignés (33 %)` — visible discrètement en haut
- **Pas de wizard 7 étapes** — pas de friction navigationnelle
- **Bouton « Générer un résumé »** (V1.5) en bas → IA résume en 3 phrases pour la slide présentation
- **Bouton « Exporter en PDF »** (V1) → version mise en forme avec branding studio

---

## Stockage technique

Voir [`../architecture/DATA-MODEL.md`](../architecture/DATA-MODEL.md) — table `project_briefs`. Les champs JSONB (`styles_wanted`, `palette`, etc.) absorbent les évolutions sans migration.

```sql
-- Snapshot des colonnes utilisées au MVP
project_briefs:
  project_type           TEXT
  surface_m2             NUMERIC
  delivery_date          DATE      -- déjà sur projects, dupliqué ici pour autonomie
  vision_text            TEXT
  usages                 JSONB
  constraints_text       TEXT
  styles_wanted          JSONB
  styles_avoided         JSONB
  budget_min             NUMERIC
  budget_max             NUMERIC
  budget_flexibility     TEXT
  document_urls          JSONB     -- pour upload moodboard
  completion_percent     INT
```

Toutes les autres colonnes du schéma `project_briefs` (cf. [`../architecture/DATA-MODEL.md`](../architecture/DATA-MODEL.md)) restent présentes mais inutilisées au MVP — elles s'allumeront en V2 quand le brief sera enrichi.

---

## Roadmap brief

| Phase | Ajout |
|---|---|
| **V1 (MVP)** | 12 champs ci-dessus, sauvegarde auto, export PDF |
| **V1.5** | Résumé IA (Claude Haiku ou GPT-4 mini) injecté dans la slide brief |
| **V2** | Brief personnalisable type Typeform : le pro ajoute/supprime/renomme ses propres questions, sauvegarde des templates réutilisables |
| **V2** | Section Pièces enrichie (travaux par pièce, mobilier à conserver/remplacer) |
| **V2.5** | Import OCR + LLM d'un brief PDF d'un autre outil |
| **V3** | Brief collaboratif temps réel (Supabase Realtime) — pro et client remplissent à 4 mains |

---

*Voir [`../specs/MVP-SCOPE.md`](../specs/MVP-SCOPE.md) pour le périmètre complet, [`../architecture/DATA-MODEL.md`](../architecture/DATA-MODEL.md) pour le schéma table.*

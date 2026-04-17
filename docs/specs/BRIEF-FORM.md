# Furnish — Cahier des charges du Brief projet

> Spécification détaillée du formulaire de brief. À rattacher à [MVP-SPEC.md](./MVP-SPEC.md) (section 5.1).

---

## 0. Philosophie du brief

Le brief est **le point d'entrée unique** de toute la donnée projet. Tout ce qui est rempli ici alimente ensuite automatiquement les autres modules (pièces, chantier, sourcing, finance).

Il doit être :
- **Progressif** : on ne bloque pas le user sur un champ manquant, il peut revenir
- **Intelligent** : les sections pertinentes s'affichent selon le type de projet
- **Exhaustif** : pose les bonnes questions pour qu'il n'y ait pas de "trou" plus tard
- **Collaboratif** : plusieurs personnes peuvent le remplir à 4 mains (pro + client)

**Format :** formulaire en plusieurs étapes (wizard), sauvegarde auto à chaque champ, barre de progression.

---

## 1. Variants par persona

| Section | Pro | Particulier | Client invité |
|---------|:-:|:-:|:-:|
| Identité du demandeur | ✅ | ✅ | ❌ (pré-rempli par le pro) |
| Identité du client | ✅ | ❌ (auto = demandeur) | 👁️ (lecture) |
| Typologie du bien | ✅ | ✅ | 👁️ |
| Objectifs | ✅ | ✅ | 👁️ |
| Budget | ✅ | ✅ | 👁️ (masquable par le pro) |
| Style & inspirations | ✅ | ✅ | ✅ (peut enrichir) |
| Contraintes | ✅ | ✅ | ✅ |
| Documents | ✅ | ✅ | ✅ (peut uploader) |
| Planning souhaité | ✅ | ✅ | 👁️ |

---

## 2. Structure du formulaire

### Section 1 — Le projet en bref
Questions d'identification rapides pour créer le squelette.

| Champ | Type | Requis | Notes |
|-------|------|--------|-------|
| Nom du projet | texte | ✅ | Ex : "Rénovation appart Bègles" |
| Type de projet | select | ✅ | Rénovation / Déco seule / Ameublement / Construction neuve / Home staging / Autre |
| Typologie du bien | select | ✅ | Appart / Maison / Local pro / Local commercial / Chambre d'hôtes / Meublé touristique |
| Surface totale (m²) | nombre | | |
| Adresse du bien | adresse auto-complétée (Google Places) | | Pour carto + distance artisans |
| Date de démarrage souhaitée | date | | |
| Date de livraison souhaitée | date | | Calcule la durée auto |
| Photo de couverture | upload image | | Affichée dans dashboard |

---

### Section 2 — Les personnes
Qui est impliqué, qui décide, qui paie ?

#### 2a. Le client / propriétaire (obligatoire si pro)
| Champ | Type | Requis |
|-------|------|--------|
| Civilité | M / Mme / Autre | |
| Prénom, nom | texte | ✅ |
| Email | email | ✅ |
| Téléphone | tel | |
| Adresse postale | adresse | |
| Statut | Propriétaire / Locataire / Futur acquéreur / Investisseur | |
| Est-il aussi l'utilisateur du lieu ? | oui / non | |
| Le client est-il invité sur le projet ? | toggle | → si oui, envoie magic link |

#### 2b. Les habitants / utilisateurs (si différents du client)
Liste ajoutable (+ Add) :
- Prénom, nom
- Âge ou tranche (enfant, ado, adulte, sénior)
- Lien avec le client (conjoint, enfant, parent, colocataire…)
- Besoins spécifiques (mobilité réduite, allergie, animaux…)

#### 2c. L'équipe projet (si pro)
Liste ajoutable (+ Add membre de l'équipe) — sera invité dans `project_members`.

---

### Section 3 — Objectifs & vision
Comprendre le POURQUOI du projet.

| Champ | Type | Requis |
|-------|------|--------|
| Pourquoi ce projet ? (3-5 lignes) | texte long | ✅ |
| Qu'est-ce qui ne fonctionne pas aujourd'hui ? | texte long | |
| Quel est le rêve/vision ? | texte long | |
| Usages principaux du bien | checkboxes | Résidence principale / Secondaire / Location longue durée / Location courte durée / Bureau / Commerce / Atelier |
| Nombre d'occupants réguliers | nombre | |
| Animaux domestiques | checkboxes | Chien / Chat / Autre / Aucun |
| Particularités à conserver absolument | texte long | Cheminée, parquet d'origine, vue, etc. |
| Particularités à supprimer impérativement | texte long | |

---

### Section 4 — Budget
Transparence budgétaire = clé pour un bon projet.

| Champ | Type | Requis |
|-------|------|--------|
| Enveloppe totale | plage (min-max) ou montant fixe | ✅ |
| Répartition souhaitée | sliders % | Travaux / Ameublement / Déco / Imprévus |
| Le budget est-il flexible ? | select | Ferme / Flexible ±10% / Flexible ±25% / Indicatif |
| Mode de financement | select | Apport personnel / Crédit / Mixte / À définir |
| Des achats sont-ils déjà faits ? | toggle | Si oui, liste des produits achetés |
| Acceptez-vous l'occasion / vintage ? | oui / non / certains produits |

---

### Section 5 — Style & inspirations
La partie "mood" — data qui nourrit le moodboard.

| Champ | Type | Requis |
|-------|------|--------|
| Styles préférés | checkboxes multiples | Scandinave / Japandi / Industriel / Bohème / Minimaliste / Classique / Haussmannien / Art déco / Contemporain / Provençal / Méditerranéen / Wabi-sabi / Mid-century / Autre |
| Styles à éviter | checkboxes | Idem |
| Palette de couleurs | color picker multiple ou images | |
| Matériaux favoris | checkboxes | Bois clair / Bois foncé / Métal / Laiton / Pierre / Béton / Lin / Velours / Cuir / Rotin / Marbre / Carrelage / Terrazzo |
| Matériaux à éviter | checkboxes | |
| Ambiance lumineuse | select | Chaude / Froide / Contrastée / Douce |
| Moodboard inspiration | upload images + URL Pinterest/Instagram | |
| Marques favorites | tags libres | HAY, Maisons du Monde, AM.PM, Ferm Living… |
| Références 3D/projets admirés | URLs + commentaires | |

---

### Section 6 — Les pièces
Pour chaque pièce du projet — form répété.

| Champ | Type | Requis |
|-------|------|--------|
| Nom de la pièce | texte | ✅ |
| Type | select | Salon / Cuisine / SDB / Chambre / Bureau / Entrée / Dressing / Couloir / Buanderie / Garage / Terrasse / Jardin / Autre |
| Surface (m²) | nombre | |
| Dimensions L×l×h | nombre ×3 | Calcule m² auto |
| Orientation | N/NE/E/SE/S/SO/O/NO | |
| Exposition lumière | select | Très lumineuse / Lumineuse / Moyenne / Sombre |
| Photos de l'état actuel | upload (multi) | |
| Usages prévus | checkboxes | |
| Travaux prévus | checkboxes | Peinture / Sol / Plomberie / Élec / Cloison / Cuisine équipée / SDB complète / Menuiseries / Chauffage / Autre |
| Mobilier à conserver | liste | |
| Mobilier à remplacer | liste | |
| Priorité de la pièce | select | Critique / Importante / Si budget |
| Commentaires libres | texte long | |

---

### Section 7 — Contraintes
Ce qui pourrait bloquer le projet si pas anticipé.

| Champ | Type |
|-------|------|
| Bien en copropriété ? | oui/non |
| Si oui, règlement de copro contraignant ? | upload PDF + texte |
| Autorisations requises (DP, PC, ABF, etc.) ? | checkboxes |
| Bien classé / zone patrimoniale ? | oui/non + précisions |
| Contraintes techniques connues | texte long (électricité refaite, plomb, amiante, humidité…) |
| Contraintes de délai absolues | texte (date mariage, déménagement prévu) |
| Besoins d'accessibilité PMR | oui/non + précisions |
| Nuisances à anticiper | texte (voisins sensibles, horaires chantier…) |
| Le bien est-il occupé pendant les travaux ? | oui/non/partiellement |

---

### Section 8 — Documents & Pièces jointes
Liste type, uploads optionnels.

- [ ] Plan du bien (PDF/image)
- [ ] Photos état actuel par pièce
- [ ] Acte de propriété / bail (si pertinent)
- [ ] Diagnostic technique (DPE, amiante, plomb, électrique…)
- [ ] Règlement de copropriété
- [ ] Devis déjà reçus
- [ ] Inspirations (Pinterest, Instagram, sites)
- [ ] Liste de courses déjà faite (Excel, Notes…)
- [ ] Autre document

Format : drag & drop, multi-upload, stockage Supabase Storage, prévisualisation PDF/image.

---

### Section 9 — Planning & jalons
Objectifs temporels macro.

| Champ | Type |
|-------|------|
| Date de signature / début | date |
| Date de livraison cible | date |
| Jalons importants (emménagement, événement…) | liste (date + description) |
| Disponibilité du bien pour travaux | select | Totale / Le week-end seulement / Certains créneaux / À définir |
| Flexibilité du planning | Ferme / ±2 semaines / ±1 mois / Flexible |

---

### Section 10 — Attentes envers le pro (si client)
*Section visible uniquement quand un client invité remplit le brief.*

- Qu'attendez-vous de votre maître d'œuvre / décorateur ?
- Niveau d'implication souhaité dans les décisions (Tout déléguer / Co-décider / Décider moi-même avec accompagnement)
- Fréquence de points d'étape souhaitée (Hebdomadaire / Bimensuelle / Mensuelle / À la demande)
- Canal de communication préféré (Email / SMS / App / Appel / Visio)

---

## 3. Logique conditionnelle

- Section 2a (client) : cachée pour un particulier (auto-rempli avec son profil)
- Section 2c (équipe) : visible seulement si `account_type = pro`
- Section 10 : visible seulement si remplisseur = rôle `client_*`
- Champs "travaux prévus" dans les pièces : si aucun coché, la section chantier démarre vide mais cliquable
- Budget "ferme vs flexible" : alimente les alertes de dépassement dans Finance

---

## 4. UX du formulaire

- **Wizard en étapes** avec barre de progression (10 étapes = 10 sections)
- **Sauvegarde auto** à chaque champ (debounce 500ms)
- **Skip possible** : chaque étape a un "Compléter plus tard"
- **Score de complétion** visible (ex: "Brief complété à 72 %")
- **Pop-ups d'aide contextuelle** sur les champs techniques
- **Mode collaboratif** : deux personnes remplissent en même temps (Supabase Realtime)
- **Mode clonage** : "Dupliquer depuis un brief précédent" (pour les pros)
- **Mode import** : permettre d'importer un brief depuis un PDF (OCR + LLM parsing) — V2
- **Export PDF** : le brief complet peut être exporté en PDF (pour le client, pour l'artisan)

---

## 5. Data model (extension de `projects`)

Le brief est stocké dans des tables dédiées plutôt qu'un gros JSONB sur `projects`, pour faciliter les requêtes et l'historique.

```
projects           -- existant
project_briefs     -- 1-1 avec project_id
  project_id, project_type, surface, address, 
  start_date, delivery_date, cover_url,
  why_text, vision_text, flexible_budget, budget_min, budget_max,
  styles_wanted (jsonb), styles_avoided (jsonb),
  palette (jsonb), materials_wanted (jsonb), materials_avoided (jsonb),
  constraints_text, planning_flexibility,
  completion_percent, completed_at

project_occupants
  project_id, first_name, last_name, age_range, relation, needs

project_documents
  project_id, name, url, type (plan/photo/diagnostic/contract/other), uploaded_by, uploaded_at

project_rooms      -- partagé avec section 5.2 "Pièces" de la spec
  id, project_id, name, type, surface_m2, width, length, height,
  orientation, light_exposure, usages (jsonb), works_planned (jsonb),
  priority, notes
```

---

## 6. Décisions prises

- [x] **Brief non-obligatoire.** Tous les modules ouverts dès la création du projet. Rappel visuel permanent ("Brief complété à X %"). Accessible et modifiable à tout moment. Chaque modification alimente les autres sections (ex : ajout d'une pièce dans le brief = création auto dans l'onglet Pièces).
- [x] **Brief paramétrable par le pro en V2** (type Typeform — add/remove questions, réordonner, sauvegarder comme template réutilisable depuis ses Settings).
- [x] **Synthèse IA activée.** Le brief génère automatiquement un résumé IA (style, budget, points d'attention, risques de dépassement). Exposé sur :
  - La page d'accueil du projet (encart "Résumé intelligent")
  - L'export PDF du brief
  - L'espace client (vue simplifiée)
- [x] **Export PDF du brief :** layout dédié mais utilisant le **branding du pro** (couleur primaire, logo, typo). Pour un particulier, layout Furnish neutre.

---

## 7. Version LIGHT pour le MVP (en attendant le paramétrage V2)

**Pourquoi un brief light :** tant que le pro ne peut pas personnaliser son brief (V2), proposer 10 sections exhaustives d'office serait trop lourd. On livre une version condensée au MVP, que le pro peut enrichir lui-même en ajoutant des notes.

### Brief MVP — 7 sections (au lieu de 10)

| Section | Contenu essentiel |
|---------|-------------------|
| **1. Projet** | Nom, type, typologie, surface, adresse, dates (démarrage + livraison), photo de couverture |
| **2. Personnes** | Client (pour pros) · Équipe (pour pros) · Occupants (1-2 lignes, pas détaillé) |
| **3. Objectifs** | Pourquoi (3 lignes) · Vision (3 lignes) · Usages (checkboxes) |
| **4. Budget** | Enveloppe totale · Répartition (sliders travaux/ameublement/déco) · Flexibilité |
| **5. Style** | Styles préférés (checkboxes) · Styles à éviter · Palette · Matériaux favoris · Moodboard (upload images + URL Pinterest) |
| **6. Documents** | Plans, photos, diagnostics, inspirations — drag & drop multi-upload |
| **7. Planning** | Jalons clés + flexibilité |

**Ce qu'on enlève au MVP (reporté à V2) :**
- La section Pièces détaillée dans le brief (vit désormais dans l'onglet Pièces)
- Les Contraintes techniques détaillées (copro, ABF, diagnostics) — transformé en un simple champ "Contraintes" libre
- Les Attentes envers le pro (section dédiée client invité seulement)
- Les occupants détaillés avec âges/besoins (juste un champ texte "Qui habitera / utilisera le lieu")

### UX MVP
- Wizard 7 étapes
- Sauvegarde auto
- "Skip pour plus tard" sur chaque étape
- Barre de progression + score de complétion affiché sur la page d'accueil projet
- Bouton "Résumé intelligent" (IA) dès que 50 % complété

### Que la V2 apportera
- Personnalisation complète (ajouter/retirer/renommer des questions, type Typeform)
- Templates de brief sauvegardables
- Section Pièces enrichie dans le brief (avec travaux prévus par pièce)
- Section Contraintes détaillée (copro, permis, ABF…)
- Import PDF d'un ancien brief (OCR + LLM)

---

## 8. Questions à trancher restantes

- [ ] L'IA de synthèse tourne sur quel modèle (Claude Haiku rapide ? GPT-4 mini ?) et à quelle fréquence (regénère à chaque modif du brief ou manuel ?)
- [ ] Pour les pros sans branding défini, on utilise un thème Furnish par défaut propre ?
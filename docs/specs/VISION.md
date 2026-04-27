# Furnish — Vision

> *Dernière mise à jour : 27 avril 2026*
> Document vivant. Toute évolution de la promesse, du marché ou des hypothèses fondamentales passe par une PR.

---

## La promesse

**La gestion de projet de A à Z pour les décorateurs d'intérieur — du brief client jusqu'à la validation finale.**

Furnish remplace le triptyque Excel + WhatsApp + PowerPoint par un outil unifié qui couvre quatre étapes critiques : **brief, sourcing, présentation, validation**. Pas plus, pas moins.

---

## Le problème

### Côté décorateur

Le sourcing d'ameublement est un enfer logistique. Un projet moyen génère 30 à 80 produits issus d'une dizaine de retailers différents (Maisons du Monde, AM.PM, La Redoute, Selency, brocantes, sites de niche). Le décorateur perd plusieurs heures par semaine à :
- copier-coller des produits dans Excel
- maintenir des prix à jour qui ont changé
- assembler des PowerPoint clients à chaque itération
- protéger ses fournisseurs (envoyer un lien direct = perdre la commande)
- relancer le client par mail pour valider

### Côté client final

Reçoit des PDF mal mis en page, des liens fournisseurs qui cassent l'effet « waouh » du travail de curation, valide par mail (« OK pour la table mais pas la chaise rouge ») de manière non traçable. Pas d'expérience digne du tarif facturé (souvent 5 à 15 % du budget meubles).

### Côté outils existants

Aucune vraie option satisfaisante pour le marché FR.

| Outil | Prix mensuel | Force | Pourquoi ça ne sert pas notre cible |
|---|---|---|---|
| **Houzz Pro** (US) | 149 à 249 $ + 60 $/siège supp | All-in-one, 3D, leads | Trop cher, contrats 12 mois auto-renouvelés sans rappel, support faible, UI ancienne, pas pensé pour le marché FR (TVA, format devis) |
| **Studio Designer** (US) | 72 $/user/mois | Compta + procurement solide | Pas de 3D natif, vieillissant, par siège donc cher en équipe |
| **Programa** (AU/UK) | ~50 à 80 $/mois | Beau, moderne, designer-first | Procurement orienté trade nord-américain, pas de format devis FR |
| **DesignFiles** (US) | 49 à 69 $/mois | Accessible, solo-friendly | UI datée, pas de marque blanche client travaillée, US-only |
| Outils IA (Foyr, ReimagineHome, etc.) | 19 à 99 $/mois | Visualisation 3D AI | Uniquement de la viz, zéro gestion projet |
| Notion / Airtable | 10 à 20 $/mois | Flexible | DIY chronophage, présentations clients laides |

**Le marché FR est désert.** Aucun acteur SaaS spécialisé décoration d'intérieur n'a percé en France à ce jour. Les pros bricolent.

---

## La solution

Un outil unifié, élégant et rapide qui couvre quatre étapes critiques :

1. **Brief** — capter la vision client en une fois, comme source unique
2. **Sourcing** — coller une URL, le produit s'ajoute au moodboard de la pièce. Scraping tous retailers FR.
3. **Présentation** — générer un livrable client en marque blanche, en un clic
4. **Validation** — collecter les retours et générer le devis final au format légal FR

---

## Le job to be done

> *« Permets-moi de générer mes présentations client, mon devis et mon suivi budgétaire instantanément, sans aucun effort de saisie de données, pour que mon client perçoive la valeur de mon travail de curation. »*

Le pro ne paye pas pour gagner du temps de saisie. Il paye pour deux choses :
1. **Récupérer 5 à 10 heures par projet** sur le sourcing et la présentation
2. **Augmenter sa valeur perçue** auprès du client final (donc son TJM ou son taux de transformation)

---

## Pour qui

### MVP (V1) — décorateurs indépendants français

- 1 à 5 personnes, 3 à 10 projets en parallèle
- TJM 400 à 800 € HT
- Outils actuels : Excel + WhatsApp + Pinterest + Canva ou Keynote
- Volume estimé en France : ~8 000 à 12 000 cibles potentielles

### Phase 2 (V2) — particuliers en rénovation

- Couples ou personnes seules en rénov, budget 10 à 100 k€
- 1 projet ponctuel, durée 3 à 12 mois
- Volume potentiel : ~150 000 chantiers/an en France

### Anti-personas (cf. [`PERSONAS.md`](./PERSONAS.md))

- Grandes agences 50+ personnes (besoins RBAC, SSO, audit log = trop coûteux à servir)
- Pure-players travaux/artisans (pas leur métier)
- Marketplaces de meubles (pas notre game)

---

## Le différenciant

### Ce qu'on fait différemment

1. **Focus radical** — pas de comptabilité, pas de plans 3D natifs, pas de gestion artisans. On excelle sur la donnée produit, la présentation, la validation, le devis. **Quatre piliers, rien d'autre.**
2. **Marque blanche structurelle** — tout livrable client porte la marque du décorateur, jamais Furnish (sauf watermark Free particulier en V2)
3. **Expérience no-login pour le client** — un lien, une présentation Waouh, validation en un clic, sans compte à créer
4. **Stack moderne** — interface foudroyante de rapidité (Next 15 + Tailwind v4 + Server Components) à une fraction du prix des acteurs historiques
5. **Marché FR-first** — format de devis légal FR par défaut, TVA française, retailers FR scrapés en priorité, support en français

### Ce qu'on fait pareil que les autres (assumé)

- Bibliothèque de produits sourcing (table stakes)
- Moodboards (table stakes)
- Présentations clients (table stakes)
- Stripe pour le paiement (standard)

---

## Comment on gagne

| Source | Modèle | Quand |
|---|---|---|
| **Récurrent B2B** | 49 € HT/siège/mois, abonnement | V1 |
| **One-shot B2C** | 49 €/projet, paiement unique | V2 |
| **Affiliation** | Skimlinks/Sovrn, commission 3-8 % sur achats meubles via présentations | V3 |
| **Marketplace de templates** | Pros vendent leurs briefs/chantiers types, on prend 20 % | V4 |

Détails dans [`PRICING.md`](./PRICING.md).

---

## North Star Metric

**Nombre de projets ayant généré une présentation partagée et validée par un client final.**

C'est la preuve que l'outil a remplacé Excel + PowerPoint sur tout le cycle. Une présentation envoyée puis validée = la chaîne sourcing → curation → présentation → décision a fonctionné.

### Métriques satellites

| Métrique | Cible V1 (à 5 clients payants) | Cible V2 (à 50 clients) |
|---|---|---|
| Activation (présentation envoyée dans les 30 jours) | 80 % | 90 % |
| Rétention 3 mois (Pro) | 70 % | 85 % |
| Projets validés / mois (NSM) | 10 | 100 |
| Produits scrapés / projet (médiane) | 30 | 50 |
| Temps brief → première présentation envoyée | < 5 jours | < 3 jours |

---

## Hypothèses risquées (à tester)

Ces hypothèses fondent toute la thèse. Si une seule s'effondre, on rebascule la stratégie.

| # | Hypothèse | Test | Si faux |
|---|---|---|---|
| **H1** | Les décorateurs FR indépendants paient 49 €/mois pour cet outil | Pricing page V1 + 5 alpha customers | Tester 29 € ou freemium |
| **H2** | Le scraping URL fonctionne sur ≥ 80 % des retailers FR utilisés | Audit 50 URLs Bordeluche réelles | Investir lourd dans formulaires manuels + patterns par retailer |
| **H3** | La présentation no-login client génère un effet « waouh » suffisant pour valoriser le pro | Interviews 10 clients finaux post-validation | Repositionner : outil interne pro, présentation déléguée à Canva/Figma |
| **H4** | Le particulier paye 49 € one-shot pour son projet rénov | Landing page V1.5 + 100 inscrits free + ratio conversion | Repositionner uniquement B2B |
| **H5** | Les pros recommandent l'outil à leurs pairs (NPS positif) | Mesure NPS à M+3 sur 5 premiers clients | Investir ad spend, abandonner viralité |

---

## Vision long terme (à 5 ans)

D'ici 2031, Furnish est devenu **le standard de gestion de projet déco en France**, et a commencé à pénétrer Belgique, Suisse romande et Royaume-Uni.

- 2 000 à 5 000 décorateurs payants (B2B)
- 30 000 à 50 000 particuliers payants/an (B2C one-shot)
- Module affiliation rentable, ~10-15 % du revenu total
- Marketplace templates ouvert : pros qui vendent leurs briefs/checklists/chantiers types

**Ce qu'on ne devient PAS d'ici 2031** :
- Pas de plateforme de mise en relation (on n'est pas Houzz)
- Pas de marketplace de meubles (on n'est pas Made / La Redoute)
- Pas un acteur compta/facturation (on s'intègre avec Pennylane / Tiime)
- Pas un outil de chantier travaux (on reste dans la déco)

---

## Why now

Plusieurs vagues convergent en 2026 :

1. **Le SaaS B2B vertical est mature** — les acteurs spécialisés métier (Doctolib pour les médecins, Pennylane pour les comptables, Lemonway pour les marketplaces) ont prouvé que les pros paient cher pour un outil ultra-spécifique.
2. **Houzz Pro a déçu en Europe** — prix qui triple en 2 ans, contrats piégés, support inexistant en français → boulevard pour un acteur local.
3. **La déco est en boom post-Covid** — les particuliers investissent massivement dans leur intérieur, le marché de la rénov pèse ~62 Mds € en France (Anah/Capeb 2025).
4. **L'IA accessible** — résumés de brief, génération de copy de présentation, scraping intelligent : ce qui aurait coûté 6 mois de R&D en 2022 est en API en 2026.
5. **Le no-code/low-code arrive à plafond** — les indépendants qui ont essayé Notion + Make + Airtable se rendent compte que la couture est plus chronophage qu'un outil dédié.

---

## Principes produit

Quatre principes qui doivent guider chaque arbitrage produit, même tardif. Si un nouveau feature pitch contredit l'un d'eux, on le refuse.

### 1. Focus radical sur quatre piliers

Brief, sourcing, présentation, validation. C'est tout. Toute feature qui ne sert pas directement l'un des quatre est suspecte par défaut, même si « ce serait sympa ».

### 2. Marque blanche structurelle

Le client final ne doit jamais voir Furnish. Tout livrable porte la marque du pro. Le pro nous paie pour faire briller SA marque, pas la nôtre.

### 3. Zéro friction côté client final

Pas de compte, pas de connexion, pas d'app à télécharger, pas de Captcha. Lien magique → présentation → validation. Trois clics maximum.

### 4. Calme et précision

Le pro garde l'outil 5 ans, pas 5 semaines. Donc : pas d'animation gadget, pas d'emoji partout, pas de « notre solution révolutionnaire ». Du chiffre clair, des transitions calmes, des textes UI sobres. Cf. [`BRAND.md`](./BRAND.md).

---

## Anti-vision

Ce qu'on refuse de devenir, même si la pression marché augmente.

| Tentation | Pourquoi on refuse |
|---|---|
| Plateforme de mise en relation décorateurs ↔ particuliers | C'est Houzz, c'est l'enfer du référencement payant et de la course aux leads |
| Marketplace de meubles propres | Capex énorme, marges faibles, on devient Made.com, on perd la confiance des pros |
| Outil de comptabilité native | Pas notre métier, on s'intègre avec Pennylane/Tiime |
| Modélisation 3D propriétaire | Trop cher en R&D, partenariat Floorplanner suffira en V3 |
| Outil de chat client interne | Les pros utilisent déjà WhatsApp/SMS/email avec leurs clients, on s'y greffe |
| App mobile native | PWA suffit pour 95 % des cas. Pas d'iOS dev en V1-V3. |
| Pivot international rapide | FR-first jusqu'à 500 décorateurs payants. Sinon dispersion. |

---

## Décisions ouvertes

- [ ] Définir les seuils précis de DoD V1 (combien de signups, combien d'activation, combien de payants)
- [ ] Trancher si on lance la V2 particulier en parallèle de l'acquisition pro V1, ou strictement après
- [ ] Choisir entre lancement public ou bêta privée invite-only pour V1
- [ ] Décider si on accepte les pros non-français en V1 (UK, BE) ou strict FR

---

*Voir [`PERSONAS.md`](./PERSONAS.md) pour les profils cibles, [`MVP-SCOPE.md`](./MVP-SCOPE.md) pour le périmètre V1, [`ROADMAP.md`](./ROADMAP.md) pour la trajectoire.*

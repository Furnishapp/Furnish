# Furnish — Personas

## Persona principal (MVP) — Le décorateur indépendant

**Profil type** : 1 à 5 personnes, basé en France, gère 3 à 10 projets en parallèle. Profil hybride : architecte d'intérieur, décorateur, conciergerie premium qui propose la déco en service annexe.

**Outils actuels** : Excel, WhatsApp, Pinterest, Canva ou Keynote pour les présentations, dizaines d'onglets ouverts en sourcing.

**Frictions** :
- Recommencer la même présentation client à chaque projet
- Perdre une heure à mettre à jour Excel quand un prix change
- Risque de perdre une vente quand le client voit le lien fournisseur direct

**Ce qu'il veut** :
- Un outil qui ressemble à un livre de marque, pas à un ERP
- Aller vite : capter une URL, drag-drop dans une pièce, partager
- Garder la main sur sa proposition de valeur (curation invisibilisée pour le client)

**Ce qu'il ne veut pas** :
- Apprendre un nouvel ERP métier compliqué
- Migrer son CRM existant
- Payer 200 € / mois pour des features qu'il n'utilisera pas

**Client zéro** : Bordeluche (Victor Le Barbier) — conciergerie qui accompagne ponctuellement des particuliers sur leur déco d'intérieur. Cas d'usage réel à dogfooder.

**Cibles à conquérir ensuite** : agences de décoration type Makasa, architectes d'intérieur indépendants, conciergeries Airbnb / meublé touristique premium.

---

## Persona secondaire (V2) — Le particulier en rénovation

**Profil type** : couple ou personne seule en pleine rénovation d'un appart ou d'une maison, budget 10 k€ à 100 k€, 1 projet à la fois, motivé sur 3 à 12 mois.

**Outils actuels** : Pinterest, Notes Apple, Excel approximatif, captures d'écran dans la pellicule.

**Frictions** :
- Pas d'outil pour centraliser les choix de meubles avec budget en temps réel
- Difficulté à partager ses choix avec son conjoint·e
- Oubli des prix, des liens, des dimensions

**Ce qu'il veut** :
- Un outil simple, sans jargon pro, sans onboarding interminable
- Tracker son budget pour ne pas déraper
- Partager facilement avec son conjoint·e

**Ce qu'il ne veut pas** :
- Un abonnement mensuel pour un projet ponctuel
- Un module devis / facturation pro

**Conversion attendue** : 49 € one-shot par projet (vs version free limitée à 25 produits, 1 projet, 2 pièces).

---

## Persona tertiaire (V1+) — Le client final

Pas un user de l'app, mais un acteur clé du parcours : il reçoit le lien de présentation envoyé par le décorateur.

**Ce qu'il vit** :
- Lien magique, pas de compte à créer
- Présentation marque blanche, professionnelle, fluide
- Capacité à valider, commenter, ou demander une modif sans friction

**Ce qu'il ne doit jamais voir** :
- Les noms des fournisseurs
- Les liens d'achat directs
- L'interface technique du décorateur

C'est le persona qui valide la valeur perçue du décorateur. Si l'expérience est moche, le décorateur perd son client.

---

## Anti-personas (à ne pas servir au MVP)
- **Grandes agences (50+ personnes)** : besoin de RBAC complexe, audit log, SSO. Trop coûteux à servir, pas notre marché.
- **Pure-player travaux / artisans** : pas leur outil, leur job c'est le chantier pas la déco.
- **Marketplaces de meubles** : on ne devient pas un comparateur, on est un outil de gestion.

# Furnish — Pricing

## Plans (V1 — MVP)

### Pro Trial
- 0 € pendant 7 jours
- Aucune CB requise pour démarrer
- Accès à toutes les features pro
- Branding "Powered by Furnish" sur les présentations
- Bloqué à J+7 si pas de conversion (CTA upgrade en dur)

### Pro
- **49 € HT / siège / mois**
- Toutes les features pro
- Multi-projets illimités
- Branding studio personnalisé (logo + couleur)
- Invitation clients gratuite
- Support email standard
- TVA française appliquée si client FR

### Pro Annual *(à tester en V2)*
- 490 € HT / siège / an
- Soit ~2 mois offerts
- Levier rétention sur les clients confirmés

---

## Plans (V2 — ouverture B2C)

### Personal Free
- 0 € à vie
- 1 projet actif maximum
- 25 produits maximum
- 2 pièces maximum
- Export PDF avec watermark Furnish
- Invitation collaborateur uniquement en lecture
- Pas d'accès au module présentation pro
- Pas d'accès au module commentaires/validation

### Personal Premium
- **49 € one-shot par projet** (paiement unique, pas de récurrence)
- Débloque le projet à vie (pas d'expiration)
- Produits illimités, pièces illimitées
- Invitation conjoint·e ou famille en édition (gratuit)
- Export PDF sans watermark
- Pas de présentation client pro (réservé aux pros)
- Possibilité d'upgrader vers Pro (option B, conserve les projets)

---

## Logique de pricing

### Pourquoi 49 € pour les deux ?
- Round number, prix psychologique
- Pour le pro : équivalent ~1h de TJM, retour sur investissement immédiat sur le 1er projet sourcé
- Pour le particulier : 49 € c'est le prix d'un dîner à deux, contre 50 k€ de rénovation = rapport 1/1000
- Cohérence dans la communication

### Pourquoi par siège (pro) ?
- Anti-abus : un studio de 5 personnes ne peut pas partager un compte
- Aligné sur le standard SaaS B2B (Linear, Notion, Figma)
- Permet une montée en gamme naturelle quand l'agence grossit

### Pourquoi one-shot (particulier) ?
- Un particulier rénove 1 fois tous les 5-10 ans, pas 12 fois par an
- Pas de friction d'engagement, pas d'oubli de désabonnement
- Affiliation prend le relais sur la rentabilité (V3)

---

## Stratégie d'essai et conversion

### Essai pro
- **7 jours sans CB** (friction minimale)
- Email de relance à J+5 et J+7
- À J+7 : présentations bloquées, projet en lecture seule, invite à payer

### Conversion particulier
- Free → Premium au moment où l'utilisateur atteint une limite (25 produits, 2 pièces, export PDF)
- Pop-in contextuel "Tu as atteint la limite gratuite — débloque ce projet pour 49 €"

---

## Anti-abus

| Risque | Mitigation |
|---|---|
| Une agence partage un seul compte pro | Session unique par compte (déconnexion auto ailleurs) |
| Multiple comptes free pour contourner les limites | 1 free par adresse email vérifiée + détection IP/device |
| Désabonnement et re-abonnement pour avoir plusieurs essais 7j | 1 essai par adresse email à vie |
| Présentation publique téléchargée puis re-uploadée ailleurs | Watermark dans le PDF + share_token unique par envoi |

---

## Revenus complémentaires (V3)

### Affiliation
- Intégration **Skimlinks** ou **Sovrn Commerce** sur les liens fournisseurs masqués au client
- Commission moyenne attendue : **3 à 8 %** du panier client
- Pas de surcoût pour le client final
- Transparence dans les CGU (le pro est informé)

### Templates marketplace (V4+)
- Pros vendent leurs briefs types ou chantiers types à d'autres pros
- Furnish prend 20 % de commission

---

## Pricing à NE PAS faire

- ❌ Plan free pro (cannibalise B2B et inonde le support)
- ❌ Plan basé sur le nombre de projets (pénalise les bons clients)
- ❌ Plan basé sur le volume de produits (pénalise la qualité)
- ❌ Lifetime deal (AppSumo et co — détruit la valeur perçue)

---

## Décisions ouvertes

- [ ] TVA : auto-calculée par Stripe Tax ou gestion manuelle ?
- [ ] Devise : EUR uniquement au MVP, ouvrir GBP/CHF en V3 ?
- [ ] Refund policy : remboursement 30 jours sans condition ou plus strict ?
- [ ] Coupon code / programme parrainage : V2 ou plus tard ?
- [ ] Plan annuel : on le sort dès la V1 ou on attend V2 ?

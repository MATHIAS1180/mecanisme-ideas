# Assets Manquants - Guide de Création

## Images Open Graph & Social Media

### 1. og-image.png
- **Dimensions:** 1200×630px
- **Format:** PNG
- **Emplacement:** `/public/og-image.png`
- **Contenu suggéré:**
  - Logo Nodus Protocol (glyph "N")
  - Titre: "Nodus Protocol"
  - Sous-titre: "Solana Coordination Terminal"
  - Background: Dégradé sombre (#07111a → #050b10)
  - Accents: Vert (#8cf5c5) et Bleu (#7dd3ff)
  - Style: Terminal financier, grille subtile

### 2. twitter-image.png
- **Dimensions:** 1200×630px (même que OG)
- **Format:** PNG
- **Emplacement:** `/public/twitter-image.png`
- **Note:** Peut être identique à og-image.png

---

## Favicons

### 3. favicon.ico
- **Dimensions:** 32×32px (multi-size: 16×16, 32×32)
- **Format:** ICO
- **Emplacement:** `/public/favicon.ico`
- **Contenu:** Lettre "N" stylisée sur fond gradient

### 4. favicon-16x16.png
- **Dimensions:** 16×16px
- **Format:** PNG
- **Emplacement:** `/public/favicon-16x16.png`

### 5. favicon-32x32.png
- **Dimensions:** 32×32px
- **Format:** PNG
- **Emplacement:** `/public/favicon-32x32.png`

### 6. apple-touch-icon.png
- **Dimensions:** 180×180px
- **Format:** PNG
- **Emplacement:** `/public/apple-touch-icon.png`
- **Note:** Utilisé par iOS pour l'icône d'accueil

### 7. android-chrome-192x192.png
- **Dimensions:** 192×192px
- **Format:** PNG
- **Emplacement:** `/public/android-chrome-192x192.png`

### 8. android-chrome-512x512.png
- **Dimensions:** 512×512px
- **Format:** PNG
- **Emplacement:** `/public/android-chrome-512x512.png`

---

## Palette de Couleurs (pour référence design)

```css
/* Backgrounds */
--bg: #07111a
--bg-soft: #0b1824
--bg-darker: #041018
--bg-darkest: #050810

/* Accents */
--accent: #8cf5c5 (vert principal)
--accent-2: #7dd3ff (bleu)
--accent-3: #ffc86e (orange/or)

/* Text */
--text: #edf7ff (blanc cassé)
--muted: #8ea9bc (gris bleuté)
```

---

## Outils Recommandés

### Génération Automatique
- **Favicon Generator:** https://realfavicongenerator.net/
  - Upload une image 512×512px
  - Génère tous les formats automatiquement
  - Télécharge un package complet

### Design
- **Figma** (gratuit)
- **Canva** (templates OG image)
- **Photoshop / GIMP**

### Optimisation
- **TinyPNG:** https://tinypng.com/ (compression PNG)
- **Squoosh:** https://squoosh.app/ (compression avancée)

---

## Template Figma/Design

### Logo "N" Stylisé
```
Forme: Carré arrondi (border-radius: 14px)
Background: Gradient linéaire 135deg
  - Start: #8cf5c5 (vert)
  - End: #ffc86e (orange)
Lettre: "N"
  - Font: Space Grotesk Bold
  - Color: #051019 (sombre)
  - Size: 60% de la hauteur
  - Weight: 800
```

### OG Image Layout
```
┌─────────────────────────────────────┐
│                                     │
│  [Logo N]  Nodus Protocol           │ ← Header
│                                     │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │   Solana Coordination         │  │ ← Main
│  │   Terminal                    │  │
│  │                               │  │
│  │   Deterministic • On-Chain    │  │
│  │   Devnet Beta                 │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  [Grille subtile en background]    │ ← Background
│                                     │
└─────────────────────────────────────┘
```

---

## Checklist de Validation

Après création des assets:

- [ ] Tous les fichiers sont dans `/public/`
- [ ] Les dimensions sont exactes
- [ ] Les fichiers sont optimisés (< 200KB pour OG, < 50KB pour favicons)
- [ ] Le logo est lisible à toutes les tailles
- [ ] Les couleurs correspondent à la palette
- [ ] Test sur différents devices (iOS, Android, Desktop)
- [ ] Test partage social (Twitter, LinkedIn, Discord)
- [ ] Validation avec https://www.opengraph.xyz/

---

## Commande de Test

Après ajout des assets:

```bash
# Vérifier que les fichiers existent
ls -la public/

# Build et vérifier
npm run build

# Tester en local
npm run dev

# Ouvrir http://localhost:3000 et inspecter:
# - Favicon dans l'onglet
# - Meta tags dans <head>
# - Partage sur réseaux sociaux
```

---

## Exemple de Génération Rapide avec Favicon Generator

1. Créer une image 512×512px avec le logo "N"
2. Aller sur https://realfavicongenerator.net/
3. Upload l'image
4. Configurer:
   - iOS: Utiliser l'image telle quelle
   - Android: Utiliser l'image telle quelle
   - Windows: Utiliser l'image telle quelle
   - macOS Safari: Utiliser couleur #8cf5c5
5. Générer et télécharger
6. Extraire dans `/public/`
7. Vérifier que les chemins correspondent dans `layout.tsx`

---

**Note:** Les métadonnées sont déjà configurées dans `layout.tsx`. Il suffit de créer les images et de les placer dans `/public/`.

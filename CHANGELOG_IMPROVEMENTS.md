# Changelog - Améliorations UI et Corrections

## Date: 2026-04-08

## 🐛 Corrections de Bugs

### 1. Timer bloqué après résolution de cycle ✅

**Problème:** Le timer ne se mettait pas à jour après qu'un cycle soit résolu. L'interface restait bloquée sur l'affichage du premier cycle.

**Cause:** Une condition dans le `useEffect` empêchait le polling de continuer quand `remainingSeconds === 0` et que le cycle n'avait pas changé.

**Solution:**
- Supprimé la condition bloquante qui empêchait le refresh
- Ajouté la détection de nouveau cycle (`isNewCycle`)
- Ajouté un appel immédiat à `refreshLive()` au montage du composant
- Clear automatique des messages d'erreur/notice lors d'un nouveau cycle

**Fichiers modifiés:**
- `apps/web/src/app/play/page.tsx`

### 2. Confirmation des montants d'entrée ✅

**Vérification:** Tous les montants sont bien à 0.01 SOL comme spécifié:
- Smart contract: `ENTRY_LAMPORTS = 10_000_000` (0.01 SOL) ✅
- SDK: `ENTRY_LAMPORTS = 10_000_000` (0.01 SOL) ✅
- UI: Affiche "0.01 SOL" ✅
- Whitepaper V2: Corrigé à 0.01 SOL ✅

## 🎨 Améliorations UI - Graphique Professionnel

### Nouveau Composant: CycleGraph

**Créé:** `apps/web/src/components/cycle-graph.tsx`

**Fonctionnalités:**

1. **Graphique SVG animé en temps réel**
   - Courbe lissée avec interpolation quadratique
   - Affichage des 60 derniers points (30 secondes d'historique)
   - Zone remplie sous la courbe avec gradient
   - Point actuel pulsant avec effet de glow

2. **Barre de pression verticale**
   - Animation fluide de 0 à 40
   - Segments de couleur (vert → orange → rouge)
   - Indicateur "LOCK" quand pression = 40
   - Particules animées lors d'augmentation de pression

3. **Indicateurs visuels**
   - Pot en SOL avec couleur cyan
   - Timer avec code couleur selon urgence:
     - Vert (#00d2d3): > 60s
     - Jaune (#ffb100): 30-60s
     - Orange (#ffa502): < 30s
     - Rouge (#ff4757): 0s
   - Pression avec ratio (X / 40)

4. **Barre de progression**
   - Affiche le temps restant visuellement
   - Animation shimmer (effet de brillance)
   - Labels 0s et temps max
   - Couleur dynamique selon urgence

5. **Overlay de fin de cycle**
   - Apparaît quand `isActive = false`
   - Icône animée (bounce)
   - Message "Cycle Terminé"
   - Effet de blur sur le fond

### Styles CSS Ajoutés

**Fichier:** `apps/web/src/app/globals.css`

**Animations:**
- `pulse`: Point actuel pulsant
- `pulseOuter`: Cercle extérieur du point
- `particleRise`: Particules montantes lors d'augmentation de pression
- `shimmer`: Effet de brillance sur la barre de progression
- `bounce`: Icône qui rebondit
- `fadeIn`: Apparition de l'overlay

**Effets visuels:**
- Gradients dynamiques basés sur la couleur d'urgence
- Filtres SVG (glow, blur)
- Box-shadows avec couleurs dynamiques
- Backdrop-filter pour effet de verre

### Intégration dans la Page Play

**Modifications:**
- Graphique placé en haut de la page (pleine largeur)
- Terminal de télémétrie amélioré avec plus d'infos:
  - Numéro de cycle
  - Statut terminal lock
  - Ratio de curses (X / 5)
  - Ratio de pression (X / 40)
- Layout responsive avec grid CSS

## 📊 Données Affichées

### Graphique Principal
- Pot actuel en SOL
- Timer avec format MM:SS
- Pression actuelle / 40
- Leader actuel (adresse courte)
- Courbe d'évolution du temps restant
- Barre de pression avec segments

### Terminal de Télémétrie
- Cycle # (numéro du cycle)
- Leader (adresse)
- Countdown (format lisible)
- Pot en SOL
- Pression / 40
- Terminal lock (🔒 ACTIVE ou Inactive)
- Carry-over en SOL
- Curses actives / 5
- Statut (gagné/perdu)

## 🎯 Expérience Utilisateur

### Avant
- Interface basique avec données textuelles
- Pas de visualisation graphique
- Timer qui se bloquait après résolution
- Difficile de voir l'évolution du cycle

### Après
- Graphique professionnel animé en temps réel
- Visualisation claire de l'évolution du temps
- Barre de pression intuitive
- Couleurs dynamiques selon l'urgence
- Particules et animations pour les événements
- Timer qui se met à jour correctement
- Overlay clair quand le cycle est terminé

## 🚀 Performance

- Graphique optimisé avec SVG natif
- Animations CSS hardware-accelerated
- Polling à 2 secondes (équilibré)
- Historique limité à 60 points max
- Pas de re-render inutile

## 📱 Responsive

- Graphique adaptatif sur mobile
- Hauteur réduite sur petits écrans (180px vs 250px)
- Stats qui s'empilent sur mobile
- Textes réduits pour mobile

## 🔧 Configuration

Aucune configuration nécessaire. Le graphique s'adapte automatiquement:
- `maxSeconds`: Calculé depuis `vault.timerResetSlots`
- `remainingSeconds`: Calculé en temps réel
- `pressure`: Depuis `vault.pressureCount`
- `pot`: Balance du vault PDA
- `leader`: Depuis `vault.leader`
- `isActive`: `remainingSeconds > 0`

## 📦 Build

Build réussi sans erreurs:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (9/9)
Route /play: 7.31 kB (First Load JS: 192 kB)
```

## 🎨 Palette de Couleurs

- Cyan: `#00d2d3` (normal, > 60s)
- Jaune: `#ffb100` (attention, 30-60s)
- Orange: `#ffa502` (urgent, < 30s)
- Rouge: `#ff4757` (critique, 0s ou terminal lock)
- Blanc: `#ffffff` (textes)
- Transparences: rgba pour les overlays et effets

## 📝 Notes Techniques

1. **Courbe lissée:** Utilise des courbes quadratiques Bézier pour un rendu fluide
2. **Gestion mémoire:** Limite à 60 points pour éviter la surcharge
3. **Détection de cycle:** Compare `cycleNumber` pour détecter les nouveaux cycles
4. **Particules:** Créées lors d'augmentation de pression, auto-supprimées après 1s
5. **Animations:** Toutes en CSS pour performance optimale

## 🔮 Améliorations Futures Possibles

- Historique des cycles précédents sous le graphique
- Notifications sonores pour événements critiques
- Mode plein écran pour le graphique
- Export du graphique en image
- Replay des cycles passés
- Statistiques de performance du joueur

# 🎨 AMÉLIORATIONS PROPOSÉES POUR NODUS

## 1. 🎨 CYCLE GRAPH AMÉLIORÉ

### Problème Actuel
Le SVG est fonctionnel mais visuellement basique. Manque d'impact et de "wow factor".

### Solution: Nouveau Design Moderne

Je vais créer un nouveau composant `cycle-graph-enhanced.tsx` avec:

#### Features Visuelles
1. **Effet Néon Pulsant** sur la courbe principale
2. **Particules de Fond Animées** (étoiles/points lumineux)
3. **Gradient Dynamique** qui change selon l'urgence
4. **Barre de Pression 3D** avec effet de remplissage liquide
5. **Overlay de Fin** plus impactant avec animation
6. **Glow Effects** sur tous les éléments importants

#### Palette de Couleurs Améliorée
```css
--neon-cyan: #00f5ff
--neon-green: #39ff14
--neon-orange: #ff6b35
--neon-red: #ff006e
--glow-cyan: rgba(0, 245, 255, 0.6)
--glow-green: rgba(57, 255, 20, 0.6)
```

---

## 2. 🎉 MODAL DE VICTOIRE

### Composant: `WinnerModal.tsx`

```typescript
interface WinnerModalProps {
  isOpen: boolean;
  isWinner: boolean;
  payout: string;
  pot: string;
  pressure: number;
  cycleNumber: number;
  onClose: () => void;
}
```

#### Features
- **Confettis animés** (canvas ou react-confetti)
- **Animation d'entrée** (scale + fade)
- **Affichage du payout** en gros avec animation de compteur
- **Stats du cycle** (pression finale, durée, etc.)
- **Bouton "Nouveau Cycle"** pour fermer
- **Auto-close** après 15 secondes
- **Son de victoire** (optionnel, avec toggle)

#### Design
- Fullscreen backdrop avec blur
- Card centrale avec gradient animé
- Icônes animées (🏆 pour victoire, 😢 pour défaite)
- Bouton CTA prominent

---

## 3. 🔔 SYSTÈME DE NOTIFICATIONS TOAST

### Librairie: `react-hot-toast`

```bash
npm install react-hot-toast
```

### Intégration dans `play/page.tsx`

```typescript
import toast, { Toaster } from 'react-hot-toast';

// Exemples d'utilisation:
toast.success('Deposit réussi! Tu es maintenant leader 👑');
toast.error('Solde insuffisant dans le session wallet');
toast.loading('Transaction en cours...', { id: 'tx' });
toast.success('Transaction confirmée!', { id: 'tx' });
```

### Customisation
```typescript
<Toaster
  position="top-right"
  toastOptions={{
    style: {
      background: 'var(--panel-strong)',
      color: 'var(--text)',
      border: '1px solid var(--line)',
    },
    success: {
      iconTheme: {
        primary: 'var(--accent)',
        secondary: 'var(--bg)',
      },
    },
  }}
/>
```

---

## 4. ⏱️ INDICATEUR DE COOLDOWN

### Ajout dans `play/page.tsx`

```typescript
const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

// Dans refreshLive():
if (nextVault && sessionWallet) {
  const { userState } = getNodusAccounts(programId, sessionWallet.publicKey);
  const acc = await connection.getAccountInfo(userState);
  if (acc && acc.data) {
    const user = UserState.unpack(acc.data);
    const cooldownSlots = compute_cooldown_slots(user.action_count_this_cycle);
    const nextActionSlot = user.last_action_slot + cooldownSlots;
    const remaining = Math.max(0, nextActionSlot - currentSlot);
    setCooldownRemaining(remaining);
  }
}
```

### Affichage
```typescript
{cooldownRemaining > 0 && (
  <div className="cooldown-indicator">
    ⏳ Cooldown: {Math.ceil(cooldownRemaining * 0.45)}s
  </div>
)}
```

---

## 5. 🎯 BADGES SUR BOUTONS D'ACTIONS

### Composant: `ActionButton.tsx`

```typescript
interface ActionButtonProps {
  action: string;
  description: string;
  cost: string;
  disabled: boolean;
  badge?: {
    text: string;
    color: 'green' | 'orange' | 'red';
  };
  used?: boolean;
  limit?: { current: number; max: number };
  onClick: () => void;
}
```

### Exemples
```typescript
<ActionButton
  action="Shield"
  badge={{ text: "Leader Only", color: "orange" }}
  used={userState?.shield_used}
  limit={{ current: userState?.shield_used ? 1 : 0, max: 1 }}
/>

<ActionButton
  action="Sabotage"
  badge={{ text: "Non-Leader", color: "green" }}
  limit={{ current: userState?.sabotage_used_count || 0, max: 2 }}
/>
```

---

## 6. 🔄 BOUTON RECLAIM SNIPE

### Ajout dans `play/page.tsx`

```typescript
const [activeSnipe, setActiveSnipe] = useState<{
  wallet: string;
  expiry: bigint;
  escrow: bigint;
} | null>(null);

// Dans refreshLive():
if (nextVault.active_snipe_wallet !== "11111...1") {
  setActiveSnipe({
    wallet: nextVault.active_snipe_wallet,
    expiry: nextVault.active_snipe_expiry_slot,
    escrow: nextVault.active_snipe_escrow_lamports,
  });
} else {
  setActiveSnipe(null);
}

// Bouton conditionnel:
{activeSnipe && activeSnipe.wallet === sessionWallet?.publicKey.toBase58() && (
  <button
    className="button button--warning"
    onClick={handleReclaimSnipe}
    disabled={loading}
  >
    🔓 Reclaim Snipe ({formatSolFromLamports(activeSnipe.escrow)} SOL)
  </button>
)}
```

---

## 7. 📊 OPTIMISATION RPC CALLS

### Problème Actuel
5 calls toutes les 2s = 150 calls/minute → risque de 429

### Solution: Batch Requests

```typescript
async function refreshLive() {
  const { vault: vaultPda, userState: userStatePda } = getNodusAccounts(programId, sessionWallet.publicKey);
  
  // 1 seul call pour tout récupérer
  const [vaultAccount, userStateAccount, currentSlot] = await Promise.all([
    connection.getAccountInfo(vaultPda),
    connection.getAccountInfo(userStatePda),
    connection.getSlot(),
  ]);
  
  // Parse les données
  const vault = vaultAccount ? decodeVault(vaultAccount.data) : null;
  const user = userStateAccount ? UserState.unpack(userStateAccount.data) : null;
  
  // Calculs locaux
  const pot = vaultAccount ? vaultAccount.lamports : 0;
  const sessionBalance = await connection.getBalance(sessionWallet.publicKey);
  
  // Total: 2 calls au lieu de 5
}
```

### Réduction
- Avant: 5 calls × 30/min = 150 calls/min
- Après: 2 calls × 30/min = 60 calls/min
- **Gain: 60% de réduction**

---

## 8. 📱 AMÉLIORATIONS RESPONSIVE

### Breakpoints Additionnels

```css
/* Tablette portrait */
@media (max-width: 768px) and (orientation: portrait) {
  .cycle-graph__header {
    grid-template-columns: 1fr 1fr;
  }
  
  .action-grid {
    grid-template-columns: 1fr;
  }
}

/* Mobile landscape */
@media (max-width: 896px) and (orientation: landscape) {
  .play-container {
    grid-template-columns: 1fr 350px;
  }
  
  .cycle-graph {
    padding: 1.5rem;
  }
}

/* Très petit mobile */
@media (max-width: 375px) {
  .cycle-graph__stat .value {
    font-size: 1.25rem;
  }
  
  .button-row {
    flex-direction: column;
  }
  
  .button-row button {
    width: 100%;
  }
}
```

---

## 9. 🎵 SONS (OPTIONNEL)

### Librairie: `use-sound`

```bash
npm install use-sound
```

### Intégration

```typescript
import useSound from 'use-sound';

const [playDeposit] = useSound('/sounds/deposit.mp3', { volume: 0.5 });
const [playVictory] = useSound('/sounds/victory.mp3', { volume: 0.7 });
const [playDefeat] = useSound('/sounds/defeat.mp3', { volume: 0.5 });

// Dans handleAction:
if (action === "Deposit") {
  playDeposit();
}

// Dans WinnerModal:
useEffect(() => {
  if (isOpen && isWinner) {
    playVictory();
  } else if (isOpen && !isWinner) {
    playDefeat();
  }
}, [isOpen, isWinner]);
```

### Toggle Son

```typescript
const [soundEnabled, setSoundEnabled] = useState(true);

<button onClick={() => setSoundEnabled(!soundEnabled)}>
  {soundEnabled ? '🔊' : '🔇'}
</button>
```

---

## 10. 📈 MINI HISTORIQUE

### Composant: `RecentCycles.tsx`

```typescript
interface RecentCyclesProps {
  cycles: Array<{
    number: number;
    winner: string;
    payout: string;
    pressure: number;
    timestamp: number;
  }>;
}
```

### Affichage sur Play Page

```typescript
<article className="metric-board">
  <h3>Derniers Cycles</h3>
  {recentCycles.slice(0, 3).map((cycle) => (
    <div key={cycle.number} className="history-row">
      <span>Cycle #{cycle.number}</span>
      <div>
        <strong>{shortenAddress(cycle.winner)}</strong>
        <small>{cycle.payout} SOL</small>
      </div>
    </div>
  ))}
  <Link href="/history" className="button button--secondary">
    Voir tout l'historique →
  </Link>
</article>
```

---

## 🎯 PRIORITÉS D'IMPLÉMENTATION

### 🔴 Critique (À faire en premier)
1. Cycle Graph Amélioré
2. Modal de Victoire
3. Système de Toast

### 🟡 Important (Semaine 1)
4. Indicateur de Cooldown
5. Optimisation RPC
6. Badges sur Boutons

### 🟢 Nice to Have (Semaine 2)
7. Bouton Reclaim Snipe
8. Responsive Amélioré
9. Sons
10. Mini Historique

---

## 📦 DÉPENDANCES À AJOUTER

```json
{
  "dependencies": {
    "react-hot-toast": "^2.4.1",
    "react-confetti": "^6.1.0",
    "use-sound": "^4.0.1"
  }
}
```

---

**Prêt à implémenter ces améliorations?** 🚀

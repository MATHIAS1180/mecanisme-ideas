# Vérifier si le Vault est Initialisé

## Program ID Actuel
```
By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo
```

## Vérification sur Solana Explorer

1. **Aller sur**: https://explorer.solana.com/address/By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo?cluster=devnet

2. **Vérifier**:
   - Le program existe? ✅
   - Il y a des transactions? ✅
   - Il y a des comptes associés? ✅

## Trouver l'Adresse du Vault PDA

Le vault PDA est dérivé du program ID avec le seed "vault".

**Adresse du Vault PDA**: Tu peux la trouver en:
1. Ouvrant DevTools > Console sur ton app
2. Cherchant "vault_account" ou "vaultPda" dans les logs

Ou calcule-la avec ce script:

```typescript
import { PublicKey } from "@solana/web3.js";

const programId = new PublicKey("By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo");
const [vaultPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("vault")],
  programId
);

console.log("Vault PDA:", vaultPda.toBase58());
```

## Vérifier le Vault sur Explorer

Une fois que tu as l'adresse du vault PDA:

1. **Aller sur**: https://explorer.solana.com/address/VAULT_PDA_ADDRESS?cluster=devnet
2. **Vérifier**:
   - Le compte existe? 
   - Il a un balance > 0?
   - Il a des données (Account Data)?

## Si le Vault N'existe Pas

C'est normal! Il faut l'initialiser UNE SEULE FOIS:

1. **Connecter** ton wallet principal (pas session wallet)
2. **Cliquer** sur "Initialize Vault" sur la page /play
3. **Approuver** la transaction
4. **Attendre** confirmation (quelques secondes)
5. **Rafraîchir** la page

## Si le Vault Existe Déjà

Mais que l'app dit qu'il n'est pas initialisé, c'est probablement:

1. **Problème RPC**: Le RPC public devnet ne trouve pas le compte
   - **Solution**: Configure Tatum RPC
   
2. **Cache**: Le frontend a un cache obsolète
   - **Solution**: Rafraîchir la page (Ctrl+F5)
   
3. **Mauvais Program ID**: L'app utilise un ancien program ID
   - **Solution**: Vérifier que `NEXT_PUBLIC_NODUS_PROGRAM_ID` est bien `By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo`

## Commandes de Vérification

### Vérifier le Program ID dans l'app

Ouvrir DevTools > Console et taper:
```javascript
console.log("Program ID:", process.env.NEXT_PUBLIC_NODUS_PROGRAM_ID);
```

Tu devrais voir: `By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo`

### Vérifier le Vault PDA

Dans DevTools > Console:
```javascript
// Chercher dans les logs
// Tu devrais voir des messages comme:
"vault_account: ..."
"vaultPda: ..."
```

## Résumé

1. ✅ Smart contract PAS modifié (même Program ID)
2. ✅ Seuls les fichiers frontend modifiés (polling, retry logic)
3. ⚠️ Si ça demande d'initialiser, c'est soit:
   - Le vault n'a jamais été initialisé (normal, fais-le)
   - Le RPC ne trouve pas le vault (configure Tatum)

## Action Recommandée

1. **D'abord**: Configure Tatum RPC dans Vercel
2. **Ensuite**: Rafraîchir l'app
3. **Si toujours pas initialisé**: Clique sur "Initialize Vault"
4. **Puis**: Teste un dépôt

Le smart contract est le même, pas de souci! 👍

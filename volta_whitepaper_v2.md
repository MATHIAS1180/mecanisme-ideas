# Volta Protocol — Whitepaper V2

**Statut du document :** Version de travail figée avant développement Anchor.
**Supersède :** Whitepaper V1 (toutes les sections V1 sont remplacées par ce document).

---

## Objectif du document

Ce document constitue la spécification complète et définitive du protocole Volta pour la V1 devnet. Il est conçu pour être exploitable directement par :

- un développeur Anchor/Rust sans ambiguïté sur les instructions, les guards et les invariants ;
- un designer produit avec des specs d'interface précises et les événements à ritualiser ;
- un auditeur de smart contract avec les vecteurs d'attaque documentés et les mitigations retenues ;
- un investisseur ou partenaire avec l'analyse économique et juridique ;
- un futur concurrent qui, en lisant ce document, comprend pourquoi il ne peut pas simplement forker le protocole.

Ce document n'est pas un avis juridique. Il contient cependant une analyse juridique préliminaire structurée qui devra être validée par un conseil spécialisé avant le lancement mainnet.

---

## Résumé exécutif

Volta Protocol est un mécanisme de redistribution on-chain sur Solana fondé sur la pression temporelle, la lecture du flux public et la prise de décision active. Les participants ne délèguent pas leur capital à un tiers, n'achètent pas un billet aléatoire et ne parient pas sur un événement externe : ils prennent eux-mêmes des actions déterministes dans une session ouverte, visible et compétitive où chaque décision a des conséquences économiques immédiates et irréversibles.

Le cœur du protocole :

- une entrée fixe alimente un pot commun ;
- le dernier participant à prendre le leadership avant expiration du timer remporte le cycle ;
- le timer se compresse à mesure que la session accumule de la pression ;
- des coups spéciaux asymétriques modifient le rapport de force sans jamais introduire de hasard ;
- 98 % du pot est redistribué selon les règles du cycle ;
- 2 % sont versés automatiquement au wallet du protocole ;
- le tout reste autonome, sans oracle, sans admin et sans intervention humaine une fois déployé.

La première version vise devnet avec :

- wallet de session financé par une seule transaction initiale côté utilisateur ;
- RPC public devnet, latence ressentie de 400 à 900 ms selon congestion ;
- timer minimum affiché de 15 secondes ;
- vocabulaire et interface de type terminal financier.

---

## 1. Principes fondateurs

### 1.1 Ce que Volta doit être

- un protocole de coordination financière on-chain ;
- une compétition de timing, de conviction et de lecture du flux ;
- un système de redistribution totalement déterministe ;
- un mécanisme perpétuel, autonome et sans données externes ;
- une expérience lisible en 30 secondes mais difficile à maîtriser en profondeur ;
- le protocole financier on-chain le plus spectaculaire à regarder jouer, conçu pour le streaming live.

### 1.2 Ce que Volta ne doit pas être

- pas une loterie (aucun résultat aléatoire) ;
- pas un prediction market (aucune dépendance à un événement externe) ;
- pas un produit dérivé indexé sur un prix externe ;
- pas une promesse de rendement passif ;
- pas un système géré par une équipe qui décide quand, comment ou pour qui la redistribution a lieu.

### 1.3 Sources de vérité du protocole

Le protocole ne se base que sur :

- le slot courant du cluster Solana (via `Clock`) ;
- les signatures effectives de chaque instruction ;
- les lamports détenus par les comptes du protocole ;
- l'état interne des PDAs du programme ;
- les règles codées dans le smart contract.

Aucune API, aucun prix, aucun oracle, aucun keeper obligatoire.

---

## 2. Terminologie officielle

Les termes suivants sont normatifs pour le produit, la documentation et l'interface.

| Terme | Définition normative |
|---|---|
| **Cycle** | Session économique complète allant du premier engagement jusqu'à la redistribution. |
| **Leader** | Adresse actuellement en tête du cycle et éligible à la redistribution si le timer expire. |
| **Pot** | Capital accumulé dans le vault du cycle courant. |
| **Entrée** | Montant fixe unitaire qui alimente le pot lorsqu'une action payante est exécutée. |
| **Pression** | Compteur abstrait mesurant combien d'actions irréversibles ont comprimé le cycle. |
| **Reset timer** | Durée réappliquée au compte à rebours lorsqu'une action spécifique l'exige. |
| **Terminal lock** | État final du cycle où plus aucune action payante n'est acceptée. |
| **Session wallet** | Clé temporaire financée une seule fois par le wallet principal pour signer toutes les actions sans popup récurrente. |
| **Coup spécial** | Action payante qui modifie la dynamique sans introduire de hasard. |
| **Carry-over** | Part du pot reportée vers le cycle suivant via la mécanique de malédiction. |
| **Near-miss** | Moment où un participant perd le leadership ou manque une fenêtre de justesse — événement à ritualiser. |
| **Moment clipable** | Événement spécifique suffisamment spectaculaire pour être partagé spontanément sur X/Twitter. |

---

## 3. Expérience utilisateur en une phrase

Un participant ouvre une session en signant une seule transaction pour financer un wallet de session, puis il peut prendre des positions et déclencher des coups spéciaux en temps réel sans nouvelle popup wallet, jusqu'à ce qu'un leader conserve sa position assez longtemps pour capter la redistribution finale — pendant ce temps, des spectateurs et des streamers suivent le cycle en live.

---

## 4. Vue d'ensemble d'un cycle

1. Un premier participant entre dans le cycle avec une entrée fixe et devient leader.
2. Le pot commence à grossir et le timer commence à courir.
3. D'autres participants peuvent prendre le leadership ou utiliser des coups spéciaux pour accélérer, perturber, protéger ou dévaloriser la position du leader.
4. Chaque action irréversible augmente la pression du cycle.
5. Plus la pression monte, plus les futures fenêtres de reset deviennent courtes.
6. En fin de cycle, une fenêtre terminale de 15 secondes s'ouvre.
7. Une fois le verrou terminal activé, plus aucune action payante n'est admise.
8. Si le leader survit jusqu'à expiration, le cycle est résolu : le gagnant reçoit sa part, le protocole prend ses 2 %, un éventuel carry-over est stocké, puis le cycle suivant peut commencer.

---

## 5. Paramètres économiques de référence V1

Ces paramètres sont figés pour le design et l'implémentation initiale. Ils pourront être retunés avant mainnet.

### 5.1 Entrée fixe

**Entrée standard : 0.01 SOL**

Raisons du choix : équité entre participants, résistance naturelle aux baleines, lisibilité du risque, facilité de calcul dans l'interface, compatibilité avec des coups spéciaux tarifés en multiples simples. Le montant de 0.01 SOL est adapté pour la phase devnet et permet une participation accessible tout en maintenant un engagement économique réel.

### 5.2 Distribution à la résolution

Sur la base du pot brut du cycle :

```
fee protocole     = 2 % du pot brut
carry-over        = curse_count % du pot brut  (max 5 %)
gain gagnant      = pot brut − fee protocole − carry-over
```

**Exemples numériques :**

| Curses actives | Fee protocole | Carry-over | Gain gagnant |
|---|---|---|---|
| 0 | 2 % | 0 % | 98 % |
| 3 | 2 % | 3 % | 95 % |
| 5 | 2 % | 5 % | 93 % |

**Exemples complets :**

Cycle simple — 5 deposits à 0.01 SOL :
- Pot brut : 0.05 SOL
- Fee protocole : 0.001 SOL
- Gagnant : 0.049 SOL

Cycle avec 1 anchor et 2 curses — 8 deposits + 1 anchor + 2 curses :
- 8 × 0.01 = 0.08 SOL + 0.02 SOL (anchor) + 0.02 SOL (curses) = **0.12 SOL**
- Fee protocole : 0.0024 SOL
- Carry-over : 0.0024 SOL
- Gagnant : **0.1152 SOL**

Cycle avec snipe déclenché :
- Pot avant snipe : 0.1 SOL
- Escrow sniper : 0.01 SOL, deposit adversaire : 0.01 SOL → les deux entrent dans le pot
- Pot brut : **0.12 SOL**, leadership : sniper (pas le déposant)

---

## 6. Modèle temporel

### 6.1 Slots vs secondes

Le programme ne travaille qu'en slots via `Clock::get()`. L'interface convertit en secondes avec un coefficient de 400 à 500 ms par slot (estimation devnet, non-garantie). Cette estimation est un confort UX, pas une garantie juridique ou technique.

### 6.2 Variable centrale : la pression

La pression est le compteur qui comprime le cycle. Elle augmente à chaque action irréversible engageant de la valeur.

| Action | Delta pression |
|---|---|
| `deposit` | +1 |
| `blizzard` | +1 |
| `sabotage` | +1 |
| `shield` | +1 |
| `curse` | +1 |
| `anchor` | +2 |
| `arm_snipe` (armement seul) | 0 |
| Snipe déclenché | +2 (entrée déposant + escrow sniper simultanément irréversibles) |

### 6.3 Courbe de reset de référence V1

Soit `p` la pression après l'action qui vient d'être validée. Pour les actions qui resetent le timer :

```
T_reset(p) = max(15 secondes, 180 secondes − 5 secondes × (p − 1))
```

| Pression | Durée de reset |
|---|---|
| 1 | 180 s |
| 10 | 135 s |
| 20 | 85 s |
| 30 | 35 s |
| ≥ 34 | 15 s (plancher) |

### 6.4 Verrou terminal garantissant la finitude

- À partir d'une pression de **34** : toute action qui reset le timer le remet au plancher de 15 s.
- À partir d'une pression de **40** : le cycle entre en `terminal_lock = true`.
- En `terminal_lock`, aucune nouvelle action payante n'est acceptée — seul `resolve` est autorisé une fois le délai expiré.

### 6.5 Entropie contrôlée sur la fenêtre de résolution

**Problème :** avec un timer déterministe exact, un bot peut soumettre un `deposit` à `expiry_slot − 2` de façon systématique et reproductible.

**Solution V1 :** la fenêtre de résolution est valide dans l'intervalle `[expiry_slot, expiry_slot + jitter_slots]` où `jitter_slots` est dérivé du hash du slot d'expiration lui-même :

```rust
let jitter_slots = (Clock::get()?.slot.wrapping_mul(2654435761) >> 28) % 5;
// jitter ∈ [0, 4] slots, soit 0 à ~2 secondes de variation
// non-prédictible avant le slot d'expiration, 100 % déterministe après
```

Ce jitter est calculé on-chain dans l'instruction `resolve`. Il rend le timing exact impossible à anticiper sans modifier la nature déterministe du protocole. Aucun oracle n'est impliqué : le hash du slot est une donnée native Solana.

**Note d'implémentation :** `jitter_slots` doit être stocké dans `VoltaVault` au moment du dernier reset du timer pour que `resolve` puisse le vérifier de façon idempotente. Il ne doit pas être recalculé à chaque appel de `resolve`.

### 6.6 Quelles actions resetent le timer

Actions qui resetent le timer : `deposit`, snipe déclenché, `anchor`.

Actions qui ne resetent pas le timer : `blizzard`, `sabotage`, `shield`, `curse`, `arm_snipe` tant qu'il n'est pas déclenché.

---

## 7. Conditions de victoire et de résolution

Le gagnant d'un cycle est le leader courant au moment exact où le timer expire et où la résolution devient valide.

La résolution est possible lorsque :

- le cycle a déjà eu au moins un leader ;
- aucun reset du timer n'a eu lieu depuis suffisamment de slots ;
- `current_slot >= expiry_slot + jitter_slots` (voir section 6.5) ;
- le cycle n'est pas déjà résolu.

`resolve` peut être appelée par n'importe qui. Le résolvant ne reçoit pas de privilège particulier en V1. Le gagnant est incité à appeler `resolve` lui-même (il reçoit le pot). Une incitation au résolveur externe pourra être envisagée en V2 si nécessaire.

---

## 8. Les actions du protocole

### 8.1 Deposit — prise de leadership

**Intention :** le participant paie une entrée fixe, devient leader et réapplique un timer conforme à la pression actuelle.

**Conditions d'éligibilité :**
- aucun cooldown actif pour ce wallet de session ;
- aucun shield actif (`shield_expires_slot > current_slot`) ;
- cycle non en `terminal_lock` ;
- session wallet avec solde suffisant ;
- cycle non déjà résolu.

**Effets on-chain :**
1. Transférer 1 entrée (0.1 SOL) du session wallet vers le vault PDA.
2. `pressure_count += 1`.
3. `leader = signer`.
4. `leader_since_slot = current_slot`.
5. Calculer `jitter_slots` et le stocker.
6. `timer_reset_slots = T_reset(pressure_count)` en slots.
7. `timer_start_slot = current_slot`.

**Effet psychologique :** deposit est l'action centrale de conviction. Elle engage du capital, expose publiquement l'adresse et place son auteur sous pression immédiate. C'est l'action qui génère le plus de near-miss et la plupart des moments clipables.

### 8.2 Resolve — redistribution du cycle

**Intention :** clore proprement le cycle et distribuer les lamports selon les règles du protocole.

**Guards :**
- `current_slot >= timer_start_slot + timer_reset_slots + jitter_slots` ;
- `leader != Pubkey::default()` (au moins un deposit a eu lieu) ;
- `!cycle_already_resolved`.

**Effets on-chain :**
1. Calculer `fee_lamports = vault_lamports * 200 / 10000` (2 %).
2. Calculer `carry_over = vault_lamports * curse_count / 10000`.
3. Calculer `winner_payout = vault_lamports - fee_lamports - carry_over`.
4. Transférer `winner_payout` vers le wallet du leader.
5. Transférer `fee_lamports` vers le protocol fee wallet (PDA ou adresse figée dans le programme).
6. Stocker `carry_over` dans `carry_over_lamports` pour le prochain cycle.
7. Remettre à zéro l'état éphémère (voir liste ci-dessous).
8. `cycle_number += 1`.
9. Émettre l'événement `CycleResolved` (voir section 13).

**État à remettre à zéro après resolve :**

`leader`, `leader_since_slot`, `timer_start_slot`, `timer_reset_slots`, `pressure_count`, `curse_count`, `shield_expires_slot`, `active_snipe_wallet`, `active_snipe_expiry_slot`, `anchor_count`, `terminal_lock`, `jitter_slots`.

**État conservé entre cycles :**

`cycle_number`, `carry_over_lamports`, statistiques historiques cumulées.

### 8.3 Shield

**Intention :** le leader verrouille temporairement l'accès aux prises de leadership sans arrêter le temps.

**Coûts et limites :**
- coût : 1 entrée (0.01 SOL) ;
- pression : +1 ;
- usage : 1 fois par wallet et par cycle (`shield_used = true` dans `UserState`) ;
- condition : uniquement le leader (`signer == leader`) ;
- indisponible en `terminal_lock`.

**Effets on-chain :**
1. Transférer 1 entrée vers le vault.
2. `pressure_count += 1`.
3. `shield_expires_slot = current_slot + shield_duration_slots`.
4. Ne pas toucher le timer.

**Durée de référence V1 :** 12 secondes converties en slots (~24 slots à 500 ms/slot). Stocker la constante `SHIELD_DURATION_SLOTS` dans le programme.

**Règle de cohérence :** `deposit` doit vérifier `current_slot < shield_expires_slot` et rejeter si vrai. `sabotage`, `curse`, `blizzard` et `resolve` ne sont pas bloqués par le shield.

### 8.4 Sabotage

**Intention :** un participant non-leader paie pour couper brutalement le temps restant du leader.

**Coûts et limites :**
- coût : 1 entrée (0.01 SOL) ;
- pression : +1 ;
- usage : 2 fois maximum par wallet et par cycle (`sabotage_used_count <= 2`) ;
- condition : interdit au leader (`signer != leader`) ;
- indisponible en `terminal_lock`.

**Effets on-chain :**
1. Transférer 1 entrée vers le vault.
2. `pressure_count += 1`.
3. Calculer le temps restant : `remaining_slots = (timer_start_slot + timer_reset_slots) - current_slot`.
4. Si `remaining_slots <= 0` : rejeter (le timer est déjà expiré, la résolution est imminente).
5. `timer_reset_slots = remaining_slots / 2` (division entière).
6. `timer_start_slot = current_slot` (le timer repart de la nouvelle valeur réduite).

**Effet cumulé :** deux sabotages successifs peuvent réduire le temps restant à un quart de sa valeur précédente.

**Moment clipable prioritaire :** sabotage déclenché avec `remaining_slots <= 30` (≈ 15 secondes). C'est le near-miss le plus puissant du protocole — le leader était à quelques secondes de gagner.

### 8.5 Anchor

**Intention :** le leader paie cher pour racheter du temps et relancer une fenêtre plus longue, sans effacer la pression déjà accumulée.

**Coûts et limites :**
- coût : 2 entrées (0.02 SOL) ;
- pression : +2 ;
- usage : 1 fois par wallet et **2 fois maximum au total par cycle** (`anchor_count <= 2`) ;
- condition : uniquement le leader (`signer == leader`) ;
- indisponible en `terminal_lock`.

**Effets on-chain :**
1. Transférer 2 entrées vers le vault.
2. `pressure_count += 2`.
3. `anchor_count += 1`.
4. `timer_reset_slots = 180_secondes_en_slots`.
5. Recalculer et stocker `jitter_slots`.
6. `timer_start_slot = current_slot`.

**Pourquoi anchor reset à 180 s malgré une pression élevée :** anchor n'est pas un nouveau cycle. C'est un rachat de respiration. La tension reste forte parce que la pression globale continue de progresser — les prochains resets reviennent vite à des fenêtres courtes, et anchor est globalement limité à 2 usages.

**Tag d'interface :** si anchor est joué à `pressure_count >= 32`, afficher le label "last breath" visible pour tous les observateurs.

### 8.6 Arm Snipe

**Intention :** un participant dépose une entrée en escrow pour piéger la prochaine tentative adverse de prise de leadership.

**Coûts et limites :**
- coût : 1 entrée placée en escrow (non dans le vault) ;
- pression : 0 tant que le snipe n'a pas été déclenché ;
- un seul snipe actif global à la fois (`active_snipe_wallet != Pubkey::default()`) ;
- un wallet ne peut pas avoir plusieurs snipes actifs ;
- indisponible en `terminal_lock`.

**Effets à l'armement :**
1. Transférer 1 entrée du session wallet vers le `SnipeEscrow` PDA.
2. `active_snipe_wallet = signer`.
3. `active_snipe_expiry_slot = current_slot + snipe_ttl_slots`.
4. Ne pas toucher le leader, le timer ou la pression.

**Durée TTL du snipe V1 :** 60 secondes converties en slots (~120 slots). Constant `SNIPE_TTL_SLOTS`.

**Effets au déclenchement** (prochain `deposit` par un wallet différent du sniper, avant expiration) :
1. Les lamports de l'escrow sniper + l'entrée du déposant sont tous transférés vers le vault.
2. `pressure_count += 2`.
3. `leader = active_snipe_wallet` (le sniper, pas le déposant).
4. `leader_since_slot = current_slot`.
5. Calculer et stocker `jitter_slots`.
6. `timer_reset_slots = T_reset(pressure_count)`.
7. `timer_start_slot = current_slot`.
8. Vider le snipe actif.

**Gestion de l'atomicité (vecteur MEV) :** la logique de déclenchement du snipe doit être intégralement contenue dans l'instruction `deposit`. À la validation d'un `deposit`, le programme doit vérifier en premier lieu si un snipe actif non-expiré existe et si le signataire n'est pas le sniper. Cette vérification est atomique dans le même slot et ne peut pas être front-run à l'intérieur d'un seul slot Solana.

**Effets à l'expiration :**
- L'escrow peut être remboursé au sniper via `reclaim_snipe`.
- `reclaim_snipe` vérifie `current_slot > active_snipe_expiry_slot` et `active_snipe_wallet == signer`.
- Le remboursement peut aussi être traité de manière paresseuse à la prochaine interaction du sniper.

### 8.7 Curse

**Intention :** un participant paie pour diminuer la part du futur gagnant sans modifier la course au leadership.

**Coûts et limites :**
- coût : 1 entrée (0.01 SOL) ;
- pression : +1 ;
- usage : 1 fois par wallet et par cycle (`curse_used = true`) ;
- limite globale : **5 malédictions par cycle** (`curse_count <= 5`) ;
- indisponible en `terminal_lock`.

**Effets on-chain :**
1. Transférer 1 entrée vers le vault.
2. `pressure_count += 1`.
3. `curse_count += 1`.

**Note économique :** chaque curse augmente le carry-over du cycle suivant d'1 %. Un cycle avec 5 curses démarre le cycle suivant avec un pot bonus de 5 % du pot précédent — ce qui attire plus de participants et crée un effet boule de neige.

### 8.8 Blizzard

**Intention :** un participant ajoute de la valeur au pot et augmente la pression sans prendre le leadership.

**Coûts et limites :**
- coût : 1 entrée (0.01 SOL) ;
- pression : +1 ;
- pas de limite stricte autre que le cooldown ;
- indisponible en `terminal_lock`.

**Effets on-chain :**
1. Transférer 1 entrée vers le vault.
2. `pressure_count += 1`.

**Usage stratégique :** blizzard permet de charger le pot et d'accélérer la compression sans s'exposer comme nouveau leader. Utilisé par des participants qui veulent augmenter le pot (pour rendre la résolution plus attractive) ou pousser la session vers le plancher sans s'engager.

---

## 9. Cooldown et anti-spam

Sans cooldown, la stratégie optimale deviendrait un script de spam. Volta introduit un coût temporel propre à chaque wallet de session.

### 9.1 Cooldown intra-cycle

Le cooldown s'applique à toutes les actions payantes initiées par un même wallet de session.

```
cooldown_slots = base_cooldown_slots × max(0, action_count_cycle − 1)^1.5
```

Effet attendu :
- les deux premières actions restent fluides ;
- les suivantes deviennent de plus en plus coûteuses en temps ;
- le spam mono-wallet est pénalisé ;
- un participant doit choisir ses moments.

**Implémentation :** dans `UserState`, stocker `last_action_slot` et `action_count_this_cycle`. Vérifier dans chaque instruction payante que `current_slot >= last_action_slot + cooldown_slots(action_count_this_cycle)`.

### 9.2 Réinitialisation du cooldown

Le compteur individuel repart à zéro lorsque `cycle_number` change. Vérifier dans chaque instruction : si `user_state.current_cycle_number != vault.cycle_number`, réinitialiser `action_count_this_cycle = 0` et mettre à jour `current_cycle_number`.

### 9.3 Limitation des fermes de wallets (mitigation V1)

**Problème :** un acteur contrôlant N wallets de session peut contourner le cooldown intra-cycle en alternant les wallets. En early devnet (faible participation), cela permet une domination à faible coût.

**Mitigation V1 :** ajouter dans `VoltaVault` un champ `min_unique_depositors: u8`. Si à l'heure de la résolution `unique_depositors_count < 2`, bloquer `resolve` pendant `SOLO_RESOLVE_DELAY_SLOTS` supplémentaires (30 secondes en slots). Cela ne supprime pas la ferme de wallets mais rend peu rentable de dominer un cycle sans concurrent réel.

**Note :** un cooldown inter-cycle complet (pénaliser les wallets ayant beaucoup participé au cycle précédent) est décrit comme option V2. Il complique l'expérience devnet sans apporter de valeur proportionnelle sur un réseau de test.

---

## 10. Wallet de session et UX sans friction

### 10.1 Problème à résoudre

Si l'utilisateur doit approuver une popup wallet pour chaque entrée, chaque sabotage, chaque shield ou chaque curse, le rythme du mécanisme est détruit. La décision humaine doit être séparée de la friction de signature.

### 10.2 Solution retenue

Sequence :
1. Le frontend génère localement une keypair de session (jamais transmise au serveur).
2. L'utilisateur signe une seule transaction depuis son wallet principal pour financer ce wallet de session avec un budget borné.
3. Toutes les actions du cycle sont signées localement par le wallet de session, sans popup.
4. Quand le budget est épuisé ou que la session expire, une nouvelle transaction de financement est nécessaire.
5. Le reliquat du wallet de session est renvoyé au wallet principal via une transaction signée uniquement par le wallet de session.

### 10.3 Ce que le site n'a pas le droit de faire

Le site n'obtient jamais une autorisation illimitée sur le wallet principal. Il ne peut agir qu'au travers du budget explicitement transféré. Cette contrainte est enforced by design : le wallet de session n'a physiquement accès qu'aux lamports qu'il contient.

### 10.4 Paramètres UX recommandés V1

- budget de session visible avant signature (ex : "Vous autorisez 1.5 SOL pour cette session") ;
- durée d'expiration de session visible ;
- bouton de récupération du solde restant accessible à tout moment ;
- affichage des fonds encore disponibles dans l'interface de jeu ;
- message explicite : "Chaque action est une transaction on-chain, mais aucune popup supplémentaire n'est requise."

### 10.5 Gestion de la perte du wallet de session

**Risque :** si l'onglet est fermé brutalement pendant une session active, le wallet de session (avec son budget restant) est techniquement orphelin.

**Solution V1 minimale :** le frontend stocke la keypair de session chiffrée dans `localStorage` avec le seed du wallet principal comme clé de déchiffrement. À la reconnexion, si un wallet de session actif est détecté pour ce wallet principal, proposer la restauration automatique avec affichage du solde restant et du budget non-dépensé.

**Bouton de sweep d'urgence :** toujours accessible depuis le menu — permet de signer une transaction de sweep depuis le wallet principal qui récupère le solde du wallet de session orphelin même sans la keypair de session complète (via une instruction dédiée `sweep_session` qui vérifie la signature du wallet principal enregistré comme authority).

---

## 11. Moments à ritualiser — spécification interface

Cette section est normative pour le designer et le développeur frontend. Ces événements doivent être détectés en temps réel via les événements émis par le programme (voir section 13) et déclenchent des comportements d'interface spécifiques.

### 11.1 Les 6 moments clipables prioritaires

#### Moment 1 — Sabotage dans les 15 dernières secondes (near-miss critique)

**Détection :** événement `SabotageExecuted` avec `remaining_slots_before <= 30`.

**Comportement interface :**
- Freeze visuel du timer pendant 300 ms (effect "choc").
- Affichage du temps restant avant et après en grand format : "de 14s → 7s".
- Nom/adresse du sabotageur affiché en rouge pendant 3 secondes.
- Son distinct (différent du sabotage normal).
- Pour la victime : afficher "SABOTAGED" en superposition sur son interface pendant 2 secondes.
- Pour les spectateurs (viewer mode) : animation de compression du timer visible.

#### Moment 2 — Snipe déclenché (vol de leadership)

**Détection :** événement `SnipeTriggered`.

**Comportement interface :**
- Animation de "vol de leadership" : l'adresse du sniper remplace celle du leader avec une transition visuelle de 500 ms.
- Pour la victime (le déposant piégé) : afficher "SNIPED" en superposition + afficher exactement combien de SOL elle a perdus en opportunité ("Vous avez perdu le leadership — coût : 0.1 SOL").
- Pour le sniper : afficher "LEADERSHIP CAPTURÉ" avec le nouveau pot.
- Durée d'affichage spéciale : 3 secondes minimum avant retour à l'état normal.

#### Moment 3 — Résolution d'un pot ≥ 5 SOL

**Détection :** événement `CycleResolved` avec `winner_payout_lamports >= 5_000_000_000`.

**Comportement interface :**
- Écran de résolution maintenu 8 secondes minimum avant le démarrage automatique du cycle suivant.
- Affichage du montant exact redistribué en grand format.
- Animation de transfert vers le wallet gagnant (barre de progression visuelle).
- Génération automatique de la "Resolution Card" (voir section 12).
- Badge "Mega Cycle" affiché dans l'historique pour ce cycle.

#### Moment 4 — Double sabotage consécutif (timer écrasé à ¼)

**Détection :** deux événements `SabotageExecuted` successifs sur le même leader avec un intervalle de moins de 60 secondes.

**Comportement interface :**
- Affichage de l'effet cumulé : "Timer réduit à [X]s — compressé 4×".
- Badge "Double Crush" visible pour tous les observateurs du cycle.
- Son et effet visuel distincts du sabotage simple.

#### Moment 5 — Anchor joué à pression ≥ 32

**Détection :** événement `AnchorUsed` avec `pressure_count >= 32`.

**Comportement interface :**
- Label "LAST BREATH" affiché sur le leader en rouge pour tous les observateurs.
- Affichage du coût (0.2 SOL) et de la pression actuelle.
- Note : à pression ≥ 32, le prochain deposit mettra le cycle à ≥ 33, très proche du plancher.

#### Moment 6 — Cycle avec 5 curses (pot maudit)

**Détection :** `curse_count == 5` atteint pendant le cycle.

**Comportement interface :**
- Badge "CURSED CYCLE" affiché sur le pot en temps réel.
- Affichage du carry-over promis : "5 % du pot → cycle suivant".
- À la résolution : la résolution card affiche "Cycle maudit — carry-over : [X] SOL vers le prochain cycle".

### 11.2 Viewer mode

**Description :** URL partageable (`/watch/live`) permettant de suivre le cycle en cours en lecture seule, optimisée pour les spectateurs et les streamers.

**Blocs obligatoires du viewer mode :**

| Bloc | Contenu | Taille |
|---|---|---|
| Pot courant | SOL + USD équivalent | Grand |
| Leader courant | Adresse courte (4 premiers + 4 derniers caractères) | Grand |
| Timer | Compte à rebours en secondes + barre de progression compressée | Grand |
| Pression | Compteur + jauge vers le terminal lock | Moyen |
| Prochain reset | Durée si quelqu'un deposit maintenant | Moyen |
| Dernières actions | Feed temps réel des 5 dernières actions avec type + wallet | Petit |
| Historique cycle | Mini-graphe d'évolution du pot pendant le cycle | Petit |

**Règle de lisibilité :** un spectateur qui n'a jamais vu Volta doit comprendre qui gagne et combien de temps il reste en moins de 3 secondes.

**Note technique :** le viewer mode ne signe aucune transaction. Il écoute uniquement les événements on-chain via subscription WebSocket au programme. Les mises à jour doivent être interpolées localement (pas de re-fetch à chaque slot) pour une expérience fluide.

### 11.3 Émotions à ritualiser — spec comportementale

| Émotion | Déclencheur | Ritualisation interface |
|---|---|---|
| Rage | Vol de leadership par snipe | "SNIPED" superposition + perte SOL affichée en rouge |
| Euphorie | Résolution gagnante | Écran résolution 8 s + montant en grand + sound distinct |
| Honte/Fierté | Résultats publics de fin de cycle | Adresse du gagnant dans le feed public — permanente |
| Revenge | Perte par sabotage | Feed affiche "Sabotagé par [X]" — incitation directe au cycle suivant |
| Countdown anxiety | Timer < 30 secondes | Fréquence de rafraîchissement × 2, couleur du timer passe au rouge |
| Near-miss | Sabotage à < 15 s ou snipe | Voir moments clipables ci-dessus |

---

## 12. Resolution Card — spec auto-génération

Après chaque cycle, l'interface génère automatiquement une image statique (PNG ou SVG) partageable sur X/Twitter.

**Contenu de la carte :**
- Logo Volta Protocol.
- Numéro de cycle (`Cycle #N`).
- Montant du pot redistribué.
- Adresse courte du gagnant.
- Durée du cycle (en secondes).
- Nombre total d'actions.
- Actions spéciales utilisées (liste des coups : shield, sabotage, anchor, snipe, curse, blizzard).
- Pression finale atteinte.
- Carry-over vers le prochain cycle (si > 0).
- URL du viewer mode pour le prochain cycle.

**Format :** 1200 × 630 px (dimensions standard Twitter card). Généré côté client en SVG puis exporté en PNG.

**Partage :** bouton "Share cycle" affiché immédiatement après la résolution, avant le démarrage du cycle suivant.

---

## 13. Événements on-chain (Anchor events)

Le programme doit émettre des événements Anchor pour chaque action significative. Ces événements sont la source de vérité pour le frontend, le viewer mode et les analytics.

```rust
#[event]
pub struct DepositExecuted {
    pub cycle_number: u64,
    pub new_leader: Pubkey,
    pub pressure_count: u64,
    pub new_timer_slots: u64,
    pub pot_lamports: u64,
}

#[event]
pub struct SabotageExecuted {
    pub cycle_number: u64,
    pub sabotageur: Pubkey,
    pub remaining_slots_before: u64,
    pub remaining_slots_after: u64,
    pub pressure_count: u64,
}

#[event]
pub struct SnipeTriggered {
    pub cycle_number: u64,
    pub sniper: Pubkey,
    pub victim_depositor: Pubkey,
    pub pressure_count: u64,
    pub pot_lamports: u64,
}

#[event]
pub struct SnipeArmed {
    pub cycle_number: u64,
    pub sniper: Pubkey,
    pub expiry_slot: u64,
}

#[event]
pub struct ShieldActivated {
    pub cycle_number: u64,
    pub leader: Pubkey,
    pub expires_slot: u64,
    pub pressure_count: u64,
}

#[event]
pub struct AnchorUsed {
    pub cycle_number: u64,
    pub leader: Pubkey,
    pub anchor_count: u8,
    pub pressure_count: u64,
    pub new_timer_slots: u64,
}

#[event]
pub struct CurseAdded {
    pub cycle_number: u64,
    pub curser: Pubkey,
    pub curse_count: u8,
    pub pressure_count: u64,
}

#[event]
pub struct BlizzardExecuted {
    pub cycle_number: u64,
    pub executor: Pubkey,
    pub pressure_count: u64,
    pub pot_lamports: u64,
}

#[event]
pub struct CycleResolved {
    pub cycle_number: u64,
    pub winner: Pubkey,
    pub winner_payout_lamports: u64,
    pub protocol_fee_lamports: u64,
    pub carry_over_lamports: u64,
    pub final_pressure: u64,
    pub curse_count: u8,
    pub cycle_duration_slots: u64,
    pub total_actions: u64,
}

#[event]
pub struct TerminalLockActivated {
    pub cycle_number: u64,
    pub pressure_count: u64,
}
```

---

## 14. Structures on-chain

### 14.1 VoltaVault (PDA global du programme)

```rust
#[account]
pub struct VoltaVault {
    // Cycle courant
    pub cycle_number: u64,                    // 8 bytes
    pub leader: Pubkey,                       // 32 bytes
    pub leader_since_slot: u64,               // 8 bytes
    pub timer_start_slot: u64,                // 8 bytes
    pub timer_reset_slots: u64,               // 8 bytes
    pub jitter_slots: u64,                    // 8 bytes
    pub pressure_count: u64,                  // 8 bytes
    pub terminal_lock: bool,                  // 1 byte
    pub shield_expires_slot: u64,             // 8 bytes
    pub anchor_count: u8,                     // 1 byte
    pub curse_count: u8,                      // 1 byte
    pub active_snipe_wallet: Pubkey,          // 32 bytes
    pub active_snipe_expiry_slot: u64,        // 8 bytes
    pub carry_over_lamports: u64,             // 8 bytes
    pub unique_depositors_count: u8,          // 1 byte (mitigation ferme wallets)
    pub protocol_fee_bps: u16,                // 2 bytes (200 = 2 %)
    // Statistiques du cycle courant
    pub total_actions_this_cycle: u64,        // 8 bytes
    // Dernière résolution (pour affichage historique)
    pub last_resolved_winner: Pubkey,         // 32 bytes
    pub last_resolved_payout: u64,            // 8 bytes
    pub last_cycle_pot: u64,                  // 8 bytes
    pub last_cycle_pressure: u64,             // 8 bytes
    pub last_cycle_duration_slots: u64,       // 8 bytes
    // Bump
    pub bump: u8,                             // 1 byte
}
// Taille totale estimée : ~220 bytes + discriminant 8 bytes = ~228 bytes
```

### 14.2 UserState (PDA par wallet de session)

```rust
#[account]
pub struct UserState {
    pub authority: Pubkey,                    // 32 bytes — wallet de session
    pub current_cycle_number: u64,            // 8 bytes
    pub action_count_this_cycle: u16,         // 2 bytes
    pub last_action_slot: u64,                // 8 bytes
    pub shield_used: bool,                    // 1 byte
    pub sabotage_used_count: u8,              // 1 byte
    pub anchor_used: bool,                    // 1 byte
    pub curse_used: bool,                     // 1 byte
    pub has_deposited_this_cycle: bool,       // 1 byte (pour unique_depositors_count)
    pub active_snipe_escrow_lamports: u64,    // 8 bytes
    pub bump: u8,                             // 1 byte
}
// Taille totale estimée : ~64 bytes + discriminant 8 bytes = ~72 bytes
```

### 14.3 SnipeEscrow PDA

```rust
#[account]
pub struct SnipeEscrow {
    pub owner: Pubkey,                        // 32 bytes
    pub cycle_number: u64,                    // 8 bytes
    pub lamports_locked: u64,                 // 8 bytes
    pub expiry_slot: u64,                     // 8 bytes
    pub bump: u8,                             // 1 byte
}
// Taille totale estimée : ~57 bytes + discriminant = ~65 bytes
```

---

## 15. Jeu d'instructions Anchor

La V1 reste sous 10 instructions.

```
1.  initialize        — déploiement initial, crée VoltaVault
2.  deposit           — prise de leadership + gestion snipe actif
3.  shield            — protection temporaire
4.  sabotage          — compression du timer
5.  anchor            — rachat de temps
6.  arm_snipe         — armement du piège
7.  reclaim_snipe     — remboursement escrow expiré
8.  curse             — malédiction sur le gain
9.  blizzard          — charge silencieuse du pot
10. resolve           — redistribution du cycle
```

`initialize` ne doit pouvoir être appelée qu'une seule fois (guard sur l'existence du compte VoltaVault). L'authority de mise à jour du programme doit être burned après audit pour rendre le programme non-upgradeable.

---

## 16. Architecture de sécurité du vault PDA

### 16.1 Structure du vault

Le vault est un PDA dérivé avec un seed déterministe :

```rust
let (vault_pda, bump) = Pubkey::find_program_address(
    &[b"volta_vault"],
    program_id,
);
```

Seul le programme peut signer pour ce PDA via `invoke_signed`. Aucune clé privée externe ne contrôle le vault.

### 16.2 Distribution automatique des 2 %

Le protocol fee wallet est une adresse figée dans le programme comme constante :

```rust
pub const PROTOCOL_FEE_WALLET: Pubkey = pubkey!("...");
```

Non modifiable après déploiement. La distribution se fait dans `resolve` via un transfert de lamports direct, sans instruction externe.

### 16.3 Safe math

Toutes les opérations arithmétiques sur les lamports et les slots doivent utiliser `checked_add`, `checked_sub`, `checked_mul`, `checked_div`. Tout overflow → erreur d'instruction, pas de wrapping silencieux.

```rust
let fee_lamports = vault_lamports
    .checked_mul(200)
    .ok_or(VoltaError::MathOverflow)?
    .checked_div(10000)
    .ok_or(VoltaError::MathOverflow)?;
```

### 16.4 Reentrancy

Solana est moins vulnérable à la reentrancy qu'EVM grâce au modèle de comptes. Cependant, les CPIs (cross-program invocations) peuvent créer des situations de reentrancy si le programme appelle un programme externe qui rappelle le programme original.

**Règle V1 :** le programme Volta n'émet aucun CPI sauf les transferts de lamports natifs (system_program transfer). Aucun SPL token, aucun programme tiers. Cette contrainte doit être documentée et vérifiée à l'audit.

**Pattern vérification-mise à jour-interaction :** dans chaque instruction qui modifie l'état et transfère des lamports, toujours dans cet ordre : (1) vérifier tous les guards, (2) mettre à jour l'état on-chain, (3) transférer les lamports. Ne jamais transférer avant d'avoir mis à jour l'état.

### 16.5 Résumé des vecteurs d'attaque et mitigations

| Vecteur | Risque | Mitigation retenue | Statut V1 |
|---|---|---|---|
| Spam mono-wallet | Domination par répétition | Cooldown exponentiel par wallet | ✅ Implémenté |
| Ferme de wallets | Domination multi-wallet | `min_unique_depositors` + `SOLO_RESOLVE_DELAY` | ✅ Implémenté (partiel) |
| Bot de timing optimal | Deposit exact à `expiry_slot − 1` | Jitter aléatoire dérivé du hash de slot | ✅ Implémenté |
| Front-running MEV snipe | Insertion d'un deposit avant arm_snipe | Atomicité intra-slot du check snipe dans deposit | ✅ Implémenté |
| Reentrancy via CPI | Rappel du programme pendant exécution | Aucun CPI externe, pattern verify-update-transfer | ✅ Implémenté |
| Integer overflow | Wrapping silencieux sur lamports | Safe math checked_* sur toutes les opérations | ✅ Implémenté |
| PDA manipulation | Dérivation d'un PDA usurpateur | Seeds déterministes + bump vérifié dans chaque instruction | ✅ Implémenté |
| Resolve prématurée | Résolution avant expiration réelle | Guard `current_slot >= expiry_slot + jitter_slots` | ✅ Implémenté |
| Cooldown inter-cycle bypass | Wallet connu rebypasse le cooldown après résolution | Réinitialisation sur cycle_number change | ✅ Implémenté |
| Griefing gratuit | Nuire sans bénéfice propre | Toute action adversaire coûte au moins 1 entrée | ✅ Par design |
| Collusion | Coordination hors-chaîne pour dominer un cycle | Snipe rend la collusion instable (trahison rentable) | ⚠️ Atténué, non-éliminé |
| Cooldown inter-cycle complet | Ferme de bots multi-cycles | Non implémenté V1 | 🔜 V2 |

---

## 17. Psychologie encodée dans l'économie

Le protocole ne doit pas dépendre de gimmicks visuels pour être prenant. Les mécanismes psychologiques sortent directement des règles économiques.

### 17.1 FOMO (Fear of Missing Out)

Le pot est public, le timer est visible et chaque compression réduit la fenêtre d'opportunité. L'inaction se voit et se ressent. Un pot de 3 SOL avec 20 secondes restantes est une fenêtre qui se ferme en temps réel.

### 17.2 Loss Aversion (Kahneman-Tversky)

Chaque entrée précédente est perdue si elle n'a pas permis de finir leader au bon moment. Le participant supporte une douleur économique concrète et irréversible. Le near-miss (sabotage à 2 secondes, snipe au dernier moment) amplifie cette douleur par l'effet "j'aurais pu gagner".

### 17.3 Variable Ratio Reinforcement (Skinner)

Le schéma de récompense le plus addictif connu est celui où la récompense arrive de façon imprévisible. Dans Volta, la variabilité provient de : (a) le jitter de résolution (non-prédictible avant expiration), (b) l'apparition imprévisible des coups adverses (sabotage, snipe), (c) la durée variable des cycles selon les actions des adversaires. Le participant ne sait jamais exactement quand ni si il va gagner.

### 17.4 Escalation of Commitment (Sunk Cost)

Plus un participant a déjà engagé du capital ou du temps dans un cycle, plus il lui est psychologiquement difficile d'abandonner. Chaque action passée renforce l'engagement vers la prochaine.

### 17.5 Countdown Anxiety

La compression du timer rend chaque seconde restante plus dense. Le passage de 180 s à 15 s n'est pas linéaire dans la perception — les 15 dernières secondes sont objectivement plus intenses que les 180 premières. Volta n'invente pas cette urgence ; il la code dans la structure même de la session.

### 17.6 Social Proof

Le leader, les changements de tête, les grosses résolutions et les historiques de wallets gagnants créent un signal public continu. Un wallet qui a gagné 3 cycles consécutifs est un signal de compétence visible par tous.

### 17.7 Zeigarnik Effect

Un cycle ouvert mais non résolu attire naturellement l'attention. La session inachevée est une tension cognitive que le cerveau cherche à résoudre. C'est pourquoi le viewer mode doit afficher le cycle actuel même aux non-participants : l'exposition crée l'envie de participer.

### 17.8 Rage et Revenge Loop

Perdre le leadership à cause d'un snipe génère de la rage spécifique et dirigée vers l'adresse du sniper. Cette rage est le moteur de rétention le plus puissant : le participant revient dans le cycle suivant pour "se venger". L'interface doit rendre cette adresse visible et mémorable, pas l'obscurcir.

---

## 18. Différenciation vs Fomo3D

Fomo3D (Ethereum, 2018) est le précédent le plus proche de Volta. Tout participant, journaliste ou régulateur fera cette comparaison. Ce document doit y répondre explicitement.

**Fomo3D :** timer qui se remet à zéro à chaque achat de clé, dernier acheteur gagne le jackpot, redistribution partielle aux holders de clés, pas de coups spéciaux.

**Différences fondamentales :**

| Point | Fomo3D | Volta |
|---|---|---|
| Résultat | Quasi-hasard : exploité par un bot de congestion gas en 2018 | Déterministe : jitter intra-slot non-front-runnable |
| Espace stratégique | Une seule action (acheter une clé) | 6 actions asymétriques avec effets différents |
| Compression temporelle | Timer identique à chaque achat | Courbe de pression compressive — chaque action comprime davantage |
| Anti-bot | Aucun mécanisme | Cooldown + terminal lock + jitter + atomicité snipe |
| Hasard | Résultat influencé par congestion réseau (gas wars) | Zéro hasard : uniquement la stratégie des participants |
| Distribution | Partielle aux holders (passive) | 100 % aux participants actifs, 0 % passif possible |
| Framing légal | Classifié gambling dans plusieurs juridictions | Compétition de compétence (voir section 19) |

**Conclusion :** Volta partage avec Fomo3D la mécanique de base "dernier en tête gagne", mais en est une évolution fondamentalement différente par sa complexité stratégique, sa résistance aux bots et son absence totale de hasard. La comparaison directe devrait être cherchée, pas évitée, car elle renforce la position de Volta.

---

## 19. Analyse juridique préliminaire

**Avertissement :** cette section est une analyse fonctionnelle, pas un avis juridique. Elle doit être validée par un conseil spécialisé en droit des jeux et droit financier avant le lancement mainnet.

### 19.1 Howey Test (classification security, droit américain)

Une security au sens du Howey Test requiert les 4 éléments simultanément :

**Critère 1 — Investissement d'argent :** Oui. Les participants déposent du SOL. Ce critère est satisfait.

**Critère 2 — Entreprise commune :** Partiellement. Il y a un pot commun, mais chaque cycle est indépendant et il n'y a aucun partage des profits au prorata entre participants passifs.

**Critère 3 — Expectation de profit :** Oui pour les participants actifs. Mais l'expectation n'est pas passive — elle est directement conditionnée aux décisions du participant.

**Critère 4 — Efforts d'un tiers :** **Non.** C'est le critère clé. Les profits des participants dépendent uniquement de leurs propres décisions et des décisions des autres participants, pas des efforts de l'équipe Volta. Une fois le programme déployé, l'équipe n'a aucun rôle dans l'issue d'un cycle.

**Conclusion Howey :** Volta ne satisfait pas le critère 4, donc ne devrait pas être classifié comme security. Cette position doit être défendue explicitement avec des analyses de conseil spécialisé, notamment compte tenu de l'environnement SEC post-2024.

### 19.2 Analyse gambling

La définition légale du gambling varie par juridiction mais repose généralement sur deux éléments : (1) enjeu financier + (2) résultat dépendant du hasard.

**Suisse (Loi sur les jeux d'argent, 2019) :** un jeu de hasard est défini comme un jeu où le résultat dépend principalement du hasard ou d'événements non prédictibles par les joueurs. Dans Volta, le résultat dépend uniquement des décisions actives des participants — aucun générateur de nombres aléatoires, aucun événement externe. La compétition de compétences (skill competition) est explicitement distinguée du jeu de hasard en droit suisse.

**Singapour (Remote Gambling Act 2014) :** exclut explicitement les compétitions de compétences. Volta peut être défendu comme tel.

**États-Unis :** varie par état, mais la majorité distingue skill games du gambling. Les éléments clés pour la défense : aucun élément de hasard, victoire déterminée par le timing et la stratégie, participants actifs uniquement.

**Plan de collecte de données de compétence dès devnet :** pour renforcer la défense "skill game", le protocole doit collecter et publier dès devnet les statistiques montrant que les participants récurrents ont des taux de victoire significativement supérieurs aux débutants. Ces données constituent une preuve empirique de compétence dominante sur le hasard.

### 19.3 Analyse Ponzi

Un schéma de Ponzi rémunère les anciens participants avec l'argent des nouveaux, créant une promesse de rendement non-soutenable.

**Volta n'est pas un Ponzi car :**
- aucune promesse de rendement passif ;
- aucune continuité entre cycles (chaque cycle est économiquement indépendant) ;
- 98 % du capital déposé dans un cycle est redistribué dans ce même cycle ;
- le carry-over (2–5 %) est un mécanisme connu et transparent qui ne "rembourse" pas d'anciens participants.

### 19.4 Structure légale recommandée

**Pour le wallet percevant les 2 % :** ce wallet ne doit pas être contrôlé par une personne physique identifiable en nom propre. Les options recommandées, par ordre décroissant de protection :

1. **Fondation de droit suisse (Zug)** — structure sans but lucratif avec objet social clair (développement du protocole). La fee de 2 % est une "protocol fee" de service, similaire à un frais de plateforme.
2. **Fondation de droit des Îles Caïmans** — structure similaire, souvent préférée pour les protocoles DeFi.
3. **DAO avec governance token** — plus décentralisé mais complexe à mettre en place en V1.

**Juridictions de lancement recommandées pour la V1 :**
- Suisse (droit clair sur les compétitions de compétences, environnement crypto favorable).
- Singapour (MAS cadre clair, distinction skill game vs gambling établie).
- Éviter : États-Unis (incertitude réglementaire), France (AMF restrictif sur les protocoles de redistribution).

**À traiter impérativement avec un conseil avant mainnet :**
- structure légale exacte du wallet percevant les 2 % ;
- analyse juridiction par juridiction des marchés cibles ;
- conditions générales d'utilisation et avertissements à afficher.

---

## 20. Moat compétitif

### 20.1 Hypothèse de départ

Le code Anchor sera open source. Un concurrent peut forker le contrat et le redéployer avec 0 % de frais le lendemain du lancement. Ce document documente pourquoi ce fork ne réussira pas à long terme.

### 20.2 Moat à 6 mois (faible — à construire activement)

À 6 mois, le moat économique est minimal. Un fork à 0 % a 2 % d'avantage mécanique par cycle.

**Actions à mener dès le lancement pour construire le moat :**

**Historique on-chain non-portable (priorité 1) :** chaque résolution de cycle sur le protocole original produit un événement `CycleResolved` vérifiable on-chain. L'interface doit afficher de façon permanente un "Hall of Last Leaders" — les 20 plus gros gagnants de l'historique Volta, avec leur montant, la pression finale et le numéro de cycle. Un fork commence avec un historique vide. Cette asymétrie est structurelle et s'accroît avec le temps.

**Carry-over comme lock-in (priorité 2) :** le carry-over accumulé sur le protocole original (jusqu'à 5 % du pot précédent) crée une incitation directe à rester dans l'écosystème original. Le prochain cycle du protocole original démarre avec un pot bonus que le fork n'a pas. Cette mécanique est déjà dans le design — son rôle de moat doit être mis en avant dans la communication.

**Confiance accumulée prouvée on-chain (priorité 3) :** après 100 cycles sans incident, le protocole peut afficher "100 cycles — [X] SOL redistribués — 0 exploit". Cette preuve est vérifiable par quiconque sur Solana Explorer. Un fork ne peut pas fabriquer cet historique.

### 20.3 Moat à 2 ans (moyen-fort)

Si Volta a redistribué 500+ SOL sur 1 000+ cycles, la confiance accumulée et l'historique on-chain créent une asymétrie forte. Les participants préfèrent un protocole avec un track record prouvé.

**Mécaniques à activer à 2 ans :**

Identité on-chain par adresse : afficher dans l'interface le "rank" de chaque wallet (nombre de cycles joués, nombre de victoires, ROI cumulé, coups spéciaux préférés). Ce profil est lié à l'adresse wallet et n'est pas transférable vers un fork. C'est le début d'une réputation on-chain.

### 20.4 Moat à 10 ans (fort par accumulation)

À 10 ans, si le protocole a survécu à plusieurs vagues réglementaires et a maintenu une activité continue, le moat est structural : historique de 10 ans de redistribution honnête, réputation irréproductible, communauté établie, itérations V2/V3 avec nouvelles mécaniques que seul le protocole original peut certifier comme "officiel".

**Note pour les développeurs :** chaque version du protocole doit maintenir la compatibilité des adresses de wallet avec les versions précédentes. Un utilisateur qui a joué sur V1 doit voir son historique V1 dans l'interface V2.

---

## 21. Flux complet d'un cycle type

### 21.1 Ouverture

- Pot de départ éventuellement alimenté par carry-over.
- Premier participant finance son wallet de session (si pas déjà fait).
- Il exécute `deposit` → devient leader → timer part à 180 s.

### 21.2 Milieu de cycle

- D'autres participants entrent via `deposit`.
- Un participant utilise `blizzard` pour charger le pot sans s'exposer.
- Un autre lance `curse` pour rendre le gain du leader moins attractif.
- La pression augmente, les futurs resets deviennent plus courts.

### 21.3 Compression

- Le leader utilise `shield`.
- Un challenger répond avec `sabotage`.
- Un autre arme un `snipe`.
- Le prochain `deposit` tombe dans le piège → snipe déclenché → moment clipable n°2.

### 21.4 Respiration exceptionnelle

- Le leader engage 2 entrées pour utiliser `anchor`.
- Le timer repart à 180 s mais la pression est plus forte qu'avant.
- Tag "LAST BREATH" s'affiche si pression ≥ 32.

### 21.5 Phase terminale

- Le timer atteint son plancher de 15 s (pression ≥ 34).
- À pression 40, `terminal_lock = true` → plus aucune action payante.
- Le leader doit simplement tenir la dernière fenêtre.

### 21.6 Résolution

- `resolve` devient valide dès `current_slot >= expiry_slot + jitter_slots`.
- Le gagnant (ou n'importe qui) appelle `resolve`.
- Le gagnant reçoit sa part, le protocole prend 2 %, le carry-over est stocké.
- La Resolution Card est générée.
- Le cycle suivant est immédiatement prêt.

---

## 22. Paramètres de déploiement V1 devnet

### 22.1 Pourquoi devnet d'abord

- valider la compréhension du produit ;
- mesurer la vraie latence ressentie ;
- tester les phases du cycle ;
- observer les comportements sans coût réel ;
- collecter les premières données de compétence pour l'analyse juridique.

### 22.2 Constantes programme V1 (à figurer dans le code)

```rust
pub const ENTRY_LAMPORTS: u64 = 10_000_000;         // 0.01 SOL
pub const PROTOCOL_FEE_BPS: u16 = 200;              // 2 %
pub const MAX_CURSES: u8 = 5;
pub const MAX_ANCHOR_GLOBAL: u8 = 2;
pub const SHIELD_DURATION_SLOTS: u64 = 30;          // ~15 s à 500 ms/slot
pub const SNIPE_TTL_SLOTS: u64 = 120;               // ~60 s
pub const TIMER_MIN_SLOTS: u64 = 38;                // ~19 s (plancher)
pub const TIMER_MAX_SLOTS: u64 = 450;               // ~225 s
pub const PRESSURE_TERMINAL_FLOOR: u64 = 34;        // timer bloqué au plancher
pub const PRESSURE_TERMINAL_LOCK: u64 = 40;         // plus aucune action
pub const SOLO_RESOLVE_DELAY_SLOTS: u64 = 60;       // ~30 s si unique déposant
pub const RESET_DECAY_SLOTS: u64 = 12;              // 12 slots de réduction par unité de pression
```

### 22.3 Ce qu'il ne faut pas promettre sur devnet

- aucune garantie de latence stable à 400 ms ;
- aucune robustesse contre congestion forte ;
- aucune équivalence avec l'expérience mainnet ;
- aucune conclusion définitive sur la légalité avant validation juridique.

---

## 23. Framing produit et interface

### 23.1 Termes autorisés

`position`, `leadership`, `cycle`, `redistribution`, `protocol fee`, `session`, `pression`, `terminal lock`, `entrée`, `pot`, `carry-over`, `compression`, `malédiction`, `exécution`, `participant`.

### 23.2 Termes interdits

`pari`, `jackpot`, `mise de casino`, `joueur`, `chance`, `commission de la maison`, `gagner de l'argent facilement`, `rendement`.

### 23.3 Blocs interface prioritaires

| Bloc | Contenu |
|---|---|
| Pot courant | SOL + USD |
| Leader courant | Adresse courte |
| Temps restant | Secondes + barre de progression |
| Pression actuelle | Compteur + jauge |
| Prochaine durée de reset | Si quelqu'un deposit maintenant |
| Coups spéciaux | Disponibles / indisponibles / coûts |
| Budget session wallet | SOL restant |
| Historique des derniers cycles | 5 dernières résolutions |

---

## 24. Roadmap de développement recommandée

**Phase A — Cœur économique :**
`initialize`, `deposit`, `resolve`, courbe de pression, jitter de résolution, terminal lock, carry-over, safe math.

**Phase B — UX de session :**
session wallet, financement et sweep, affichage temps restant, affichage budget restant, restauration de session.

**Phase C — Coups spéciaux simples :**
`blizzard`, `curse`, `shield`.

**Phase D — Coups spéciaux complexes :**
`sabotage`, `anchor`, `arm_snipe`, `reclaim_snipe`.

**Phase E — Spectacle et distribution :**
événements Anchor complets, viewer mode URL partageable, Resolution Card auto-générée, moments clipables ritualisés dans l'interface.

**Phase F — Analytics et lisibilité :**
historique de cycles, Hall of Last Leaders, profils de wallets, indicateurs de pression et de compression, données de compétence pour analyse juridique.

---

## 25. Décisions figées par ce document

Les points suivants sont considérés comme figés pour lancer le développement de la V1 :

- nom de travail du protocole : Volta Protocol ;
- entrée unitaire : 0.1 SOL ;
- wallet de session obligatoire ;
- timer minimum cible : 15 secondes ;
- fee protocole fixe : 2 % ;
- malédictions bornées à 5 par cycle ;
- anchor à 2 entrées, 2 usages max par cycle ;
- terminal lock obligatoire pour garantir la fin ;
- logique entièrement déterministe et sans hasard ;
- jitter de résolution dérivé du hash de slot (non-oracle) ;
- 6 moments clipables à ritualiser dans l'interface ;
- viewer mode partageable comme livrable Phase E ;
- Resolution Card auto-générée comme livrable Phase E ;
- différenciation explicite vs Fomo3D dans toute communication publique.

---

## 26. Questions ouvertes à traiter avant mainnet

- valeur exacte des slots pour chaque constante selon les mesures réelles sur devnet ;
- validation juridique complète avec conseil spécialisé (Howey, gambling, structure légale) ;
- stratégie de restauration du wallet de session (implémentation complète) ;
- cooldown inter-cycle complet (V2) ;
- récompense éventuelle du résolveur externe (V2) ;
- gestion finale de `reclaim_snipe` (paresseuse vs instruction dédiée) ;
- niveau de télémétrie produit acceptable sans compromettre la décentralisation ;
- structure légale précise du wallet percevant les 2 % ;
- données de compétence collectées sur devnet : analyse et publication avant mainnet.

---

## 27. Conclusion

Volta Protocol V2 combine :

- une course au leadership avec compression temporelle lisible ;
- des coups spéciaux asymétriques créant un espace stratégique réel ;
- une finitude garantie par terminal lock et jitter de résolution ;
- une UX réaliste grâce au wallet de session ;
- 6 moments clipables spécifiés pour le streaming et la viralité ;
- une architecture anti-bot documentée et actionnable ;
- une analyse juridique préliminaire structurée pour la défense "skill game" ;
- un moat compétitif articulé sur 3 horizons temporels ;
- une différenciation explicite vs Fomo3D pour toute communication publique.

Cette spécification est suffisante pour ouvrir la phase de conception technique détaillée, de modélisation Anchor et de prototypage frontend sans ambiguïté.

---

*Volta Protocol Whitepaper V2 — Document de travail figé avant développement.*
*Toute modification doit être documentée comme amendment numéroté, pas comme modification silencieuse de ce document.*

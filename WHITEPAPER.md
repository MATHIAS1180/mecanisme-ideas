# Nodus Protocol - Whitepaper V1

## Statut du document

Ce document fige la version de travail du mecanisme Nodus avant developpement.

Objectif du document :

- decrire le mecanisme de maniere complete et coherente ;
- resoudre les ambiguities restantes dans les notes du README ;
- fournir une base exploitable par un developpeur Anchor, un designer produit, un auditeur, un investisseur ou un partenaire potentiel ;
- adapter la premiere version a un lancement sur devnet avec wallet de session et timer minimum cible de 15 secondes.

Ce document n'est pas un avis juridique. Il sert de specification fonctionnelle, economique, technique et operationnelle.

## Resume executif

Nodus Protocol est un mecanisme de redistribution on-chain sur Solana fonde sur la pression temporelle, la lecture du flux public et la prise de decision active. Les participants n'achetent pas un billet aleatoire et ne deleguent pas leur capital a un tiers : ils prennent eux-memes des actions deterministes dans une session ouverte, visible et competitive.

Le coeur du protocole est simple :

- une entree fixe alimente un pot commun ;
- le dernier participant a prendre le leadership avant expiration du timer remporte le cycle ;
- le timer se compresse a mesure que la session accumule de la pression ;
- des coups speciaux modifient le rapport de force sans jamais introduire de hasard ;
- 98 % du pot est redistribue selon les regles du cycle ;
- 2 % sont verses automatiquement au wallet du protocole ;
- le tout reste autonome, sans oracle, sans admin et sans intervention humaine une fois deploye.

La premiere version vise devnet avec :

- wallet de session finance par une seule transaction initiale cote utilisateur ;
- RPC public devnet ;
- latence cible ressentie de l'ordre de 400 a 900 ms selon congestion ;
- timer minimum affiche de 15 secondes au lieu de 5 secondes afin de rester jouable dans un environnement de test ;
- vocabulaire et interface de type terminal financier, pas de framing casino.

## 1. Principes fondateurs

### 1.1 Ce que Nodus doit etre

- un protocole de coordination financiere on-chain ;
- une competition de timing, de conviction et de lecture du flux ;
- un systeme de redistribution totalement deterministe ;
- un mecanisme perpetuel, autonome et sans donnees externes ;
- une experience lisible en 30 secondes mais difficile a maitriser en profondeur.

### 1.2 Ce que Nodus ne doit pas etre

- pas une loterie ;
- pas un prediction market ;
- pas un produit derive indexe sur un prix externe ;
- pas une promesse de rendement passif ;
- pas un systeme gere par une equipe qui decide quand, comment ou pour qui la redistribution a lieu.

### 1.3 Sources de verite du protocole

Le protocole ne se base que sur :

- le slot courant du cluster Solana ;
- les signatures effectives ;
- les lamports detenus par les comptes du protocole ;
- l'etat interne des PDAs du programme ;
- les regles codees dans le smart contract.

Aucune API, aucun prix, aucun oracle, aucun keeper obligatoire.

## 2. Terminologie officielle

Les termes suivants sont normatifs pour le produit, la documentation et l'interface.

- Cycle : une session economique complete allant du premier engagement jusqu'a la redistribution.
- Leader : adresse actuellement en tete du cycle et eligible a la redistribution si le timer expire.
- Pot : capital accumule dans le vault du cycle courant.
- Entree : montant fixe unitaire qui alimente le pot lorsqu'une action payante est executee.
- Pression : compteur abstrait qui mesure combien d'actions irreversibles ont deja comprime le cycle.
- Reset timer : duree reappliquee au compte a rebours lorsqu'une action specifique l'exige.
- Terminal lock : etat final du cycle dans lequel plus aucune action payante n'est acceptee, de facon a garantir une fin certaine.
- Session wallet : cle temporaire financee une seule fois par le wallet principal de l'utilisateur pour signer ensuite toutes les actions de la session sans popup recurrente.
- Coup special : action payante qui modifie la dynamique sans introduire de hasard.
- Carry-over : part du pot reportee vers le cycle suivant, notamment via la mecanique de malediction.

## 3. Experience utilisateur en une phrase

Un participant ouvre une session en signant une seule transaction pour financer un wallet de session, puis il peut prendre des positions et declencher des coups speciaux en temps reel sans nouvelle popup wallet, jusqu'a ce qu'un leader conserve sa position assez longtemps pour capter la redistribution finale.

## 4. Vue d'ensemble d'un cycle

Chaque cycle suit la sequence suivante :

1. Un premier participant entre dans le cycle avec une entree fixe et devient leader.
2. Le pot commence a grossir et le timer commence a courir.
3. D'autres participants peuvent prendre le leadership ou utiliser des coups speciaux pour accelerer, perturber, proteger ou devaloriser la position du leader.
4. Chaque action irreversible augmente la pression du cycle.
5. Plus la pression monte, plus les futures fenetres de reset deviennent courtes.
6. En fin de cycle, une fenetre terminale de 15 secondes s'ouvre.
7. Une fois le verrou terminal active, plus aucune action payante n'est admise.
8. Si le leader survit jusqu'a expiration, le cycle est resolu : le gagnant recoit sa part, le protocole prend ses 2 %, un eventuel carry-over est stocke, puis le cycle suivant peut commencer.

## 5. Parametres economiques de reference V1

Ces parametres sont la reference de travail pour la V1 devnet. Ils pourront etre retunes avant mainnet, mais ils sont consideres comme figes pour le design et l'implementation initiale.

### 5.1 Entree fixe

- Entree standard : 0.01 SOL

Raisons du choix :

- equite entre participants ;
- resistance naturelle aux baleines ;
- lisibilite du risque ;
- facilite de calcul dans l'interface ;
- moindre domination par un acteur capable de surpayer tout le monde ;
- compatibilite avec des coups speciaux aussi tarifies en multiples simples de l'entree.

### 5.2 Distribution a la resolution

Sur la base du pot brut du cycle :

- 2 % vont automatiquement au wallet du protocole ;
- le gagnant recoit 98 % moins l'effet cumule des maledictions ;
- la part retiree par les maledictions est reportee au cycle suivant sous forme de carry-over.

Formule :

- fee protocole = 2 % du pot brut ;
- carry-over = curse_count % du pot brut ;
- gain gagnant = pot brut - fee protocole - carry-over.

Avec 3 maledictions actives :

- fee protocole = 2 % ;
- carry-over = 3 % ;
- gagnant = 95 %.

Avec 5 maledictions actives :

- fee protocole = 2 % ;
- carry-over = 5 % ;
- gagnant = 93 %.

## 6. Modele temporel

### 6.1 Le protocole travaille en slots, l'interface affiche des secondes

Le programme n'utilise jamais des secondes comme source de verite. Tout est verifie en slots via Clock.

Le frontend affiche une estimation en secondes a partir d'un coefficient de conversion. Pour la V1 devnet, l'affichage pourra partir sur une hypothese de 400 a 500 ms par slot, en assumant que l'estimation visuelle n'est qu'un confort UX et non une garantie juridique ou technique.

### 6.2 Variable centrale : la pression

La pression est le compteur qui compresse le cycle. Elle augmente a chaque action irreversible qui engage de la valeur dans le cycle.

Dans cette specification V1 :

- deposit augmente la pression de 1 ;
- blizzard augmente la pression de 1 ;
- sabotage augmente la pression de 1 ;
- shield augmente la pression de 1 ;
- curse augmente la pression de 1 ;
- anchor augmente la pression de 2 car elle coute deux entrees ;
- arm_snipe n'augmente pas la pression tant que l'escrow n'a pas ete converti en pot ;
- un snipe declenche augmente la pression de 2, car l'entree du deposant et l'escrow du sniper deviennent irreversibles simultanement.

### 6.3 Courbe de reset de reference V1

La V1 adopte une courbe simple, lisible et developpable rapidement.

Soit p la pression apres l'action qui vient d'etre validee.

Pour les actions qui resetent le timer, la duree reappliquee est :

T_reset(p) = max(15 secondes, 180 secondes - 5 secondes x (p - 1))

Exemples :

- pression 1 : reset a 180 s ;
- pression 10 : reset a 135 s ;
- pression 20 : reset a 85 s ;
- pression 30 : reset a 35 s ;
- pression 34 et plus : reset a 15 s.

### 6.4 Verrou terminal garantissant la finitude

Pour eviter tout cycle infini, Nodus introduit un verrou terminal.

Regle normative V1 :

- a partir d'une pression de 34, toute action qui reset le timer le remet au plancher de 15 secondes ;
- a partir d'une pression de 40, le cycle entre en terminal lock ;
- en terminal lock, aucune nouvelle action payante n'est acceptee ;
- seul resolve est alors autorise une fois le delai expire.

Effet pratique :

- le protocole laisse exister une phase finale nerveuse ;
- mais il interdit qu'un acteur prolonge indefiniment le cycle a 15 secondes ;
- la fin du cycle est certaine et bornée.

### 6.5 Quelles actions resetent le timer

Actions qui resetent le timer :

- deposit ;
- snipe declenche ;
- anchor.

Actions qui ne resetent pas le timer :

- blizzard ;
- sabotage ;
- shield ;
- curse ;
- arm_snipe tant qu'il n'est pas declenche.

## 7. Conditions de victoire et de resolution

Le gagnant d'un cycle est le leader courant au moment exact ou le timer expire et ou la resolution devient valide.

La resolution est possible lorsque :

- le cycle a deja eu au moins un leader ;
- aucun reset du timer n'a eu lieu depuis suffisamment de slots ;
- le delai effectif du cycle courant est ecoule ;
- le cycle n'est pas deja resolu.

Resolve peut etre appelee par n'importe qui. Le resolvant ne recoit pas de privilege particulier dans cette specification V1. L'objectif est de garder la logique simple. Une incitation au resolveur pourra etre envisagee plus tard si cela s'avere necessaire en production.

## 8. Les actions du protocole

## 8.1 Deposit - prise de leadership

### Intention

Le participant paie une entree fixe, devient leader et reapplique un timer conforme a la pression actuelle.

### Qui peut l'utiliser

- tout participant non bloque par cooldown ;
- sauf si un shield actif interdit temporairement les prises de leadership ;
- sauf si le cycle est en terminal lock.

### Effets

- ajoute 1 entree au pot ;
- augmente la pression de 1 ;
- remplace le leader courant ;
- met a jour leader_since_slot ;
- reset le timer selon T_reset(p).

### Conditions d'echec

- shield actif ;
- cooldown actif pour le wallet ;
- cycle deja en terminal lock ;
- session wallet sans solde suffisant ;
- tentative de participation sur un cycle deja resolu.

### Effet psychologique

Deposit est l'action centrale de conviction. Elle engage du capital, expose publiquement l'adresse et place son auteur sous pression immediate.

## 8.2 Resolve - redistribution du cycle

### Intention

Clore proprement le cycle et distribuer les lamports selon les regles du protocole.

### Qui peut l'utiliser

- n'importe quelle adresse.

### Effets

- verifie que le timer est expire ;
- calcule le fee protocole ;
- calcule le carry-over des maledictions ;
- transfere la part du gagnant ;
- stocke le carry-over pour le cycle suivant ;
- remet a zero l'etat ephemere du cycle ;
- incremente cycle_number.

### Etat a remettre a zero

- leader ;
- leader_since_slot ;
- pressure_count ;
- curse_count ;
- shield_expires ;
- active_snipe ;
- anchor_count ;
- terminal_lock ;
- timer de cycle.

### Ce qui est conserve

- cycle_number ;
- carry_over_lamports ;
- statistiques historiques ;
- eventuels compteurs globaux utilises pour l'analytics.

## 9. Les coups speciaux

Les coups speciaux sont au coeur de l'identite du protocole. Ils doivent rester deterministes, lisibles et rares. Ils ne sont pas des animations marketing ; ils sont des actions economiques reelles.

Par defaut, toute action payante autre que anchor coute 1 entree. Anchor coute 2 entrees.

## 9.1 Shield

### Resume

Le leader peut verrouiller temporairement l'acces aux prises de leadership sans arreter le temps.

### Couts et limites

- cout : 1 entree ;
- pression : +1 ;
- usage : 1 fois par wallet et par cycle ;
- condition : uniquement le leader ;
- indisponible en terminal lock.

### Effets

- ajoute 1 entree au pot ;
- positionne shield_expires_slot a maintenant + duree de shield ;
- n'arrete pas le timer ;
- n'empeche pas sabotage, curse, blizzard ou resolve.

### Duree de reference V1

- 12 secondes ciblees cote interface, converties en slots.

### Effet produit

Shield est defensif mais jamais gratuit. Le leader bloque les challengers, mais il laisse le temps continuer a courir, ce qui transforme la protection en pari agressif.

## 9.2 Sabotage

### Resume

Un participant non leader paie pour couper brutalement le temps restant du leader.

### Couts et limites

- cout : 1 entree ;
- pression : +1 ;
- usage : 2 fois maximum par wallet et par cycle ;
- condition : interdit au leader ;
- indisponible en terminal lock.

### Effets

- ajoute 1 entree au pot ;
- calcule le temps restant ;
- divise ce temps restant par 2 ;
- ne change pas le leader ;
- ne reset pas le timer.

### Effet cumule

Deux sabotages successifs peuvent reduire le temps restant a un quart de sa valeur precedente.

### Effet produit

Sabotage cree un choc de compression. Il transforme un leader confortable en leader paniquant sans donner gratuitement la victoire a l'attaquant.

## 9.3 Anchor

### Resume

Le leader paie cher pour racheter du temps et relancer une fenetre plus longue, sans effacer la pression deja accumulee.

### Couts et limites

- cout : 2 entrees ;
- pression : +2 ;
- usage : 1 fois par wallet et 2 fois maximum au total par cycle ;
- condition : uniquement le leader ;
- indisponible en terminal lock.

### Effets

- ajoute 2 entrees au pot ;
- met a jour anchor_count ;
- reset le timer a 180 secondes cibles pour la V1 devnet ;
- ne remet pas la pression a zero ;
- ne change pas le leader.

### Pourquoi Anchor reset a 180 secondes alors que la pression continue de monter

Anchor n'est pas un nouveau cycle. C'est un rachat de respiration. La tension economique reste forte parce que :

- le leader a paye cher ;
- la pression globale continue a progresser ;
- les prochaines prises de leadership reviendront vite a des fenetres plus courtes ;
- Anchor est globalement limite.

## 9.4 Arm Snipe

### Resume

Un participant depose une entree en escrow pour pieger la prochaine tentative adverse de prise de leadership.

### Couts et limites

- cout : 1 entree placee en escrow ;
- pression : 0 tant que le snipe n'a pas ete declenche ;
- un seul snipe actif global a la fois ;
- un wallet ne peut pas avoir plusieurs snipes actifs ;
- indisponible en terminal lock.

### Effets a l'armement

- transfere 1 entree du participant vers un PDA d'escrow ;
- stocke snipe_wallet et snipe_expiry_slot ;
- ne change pas le leader ;
- ne reset pas le timer.

### Effets au declenchement

Le prochain deposit emis par un autre wallet, avant expiration du snipe, provoque :

- transfert de l'entree du deposant vers le pot ;
- transfert de l'escrow du sniper vers le pot ;
- augmentation de pression de 2 ;
- leader = sniper, et non deposant ;
- reset du timer selon la nouvelle pression ;
- vidage du snipe actif.

### Effets a l'expiration

Si le snipe n'est pas declenche avant son expiration ou avant le terminal lock :

- l'escrow peut etre rembourse au sniper ;
- le remboursement peut etre traite par une instruction dediee ou de maniere paresseuse a la prochaine interaction du sniper.

### Effet produit

Arm Snipe cree une zone de dissuasion visible. Il force les autres participants a se demander si leur prochaine action ne servira pas de balle a quelqu'un d'autre.

## 9.5 Curse

### Resume

Un participant paie pour diminuer la part du futur gagnant sans modifier la course au leadership.

### Couts et limites

- cout : 1 entree ;
- pression : +1 ;
- usage : 1 fois par wallet et par cycle ;
- limite globale : 5 maledictions par cycle ;
- indisponible en terminal lock.

### Effets

- ajoute 1 entree au pot ;
- augmente curse_count de 1 ;
- ne change pas le leader ;
- ne reset pas le timer ;
- augmente le carry-over promis au cycle suivant.

### Effet produit

Curse attaque la qualite du gain plutot que la probabilite de gagner. C'est une pression morale et economique sur le leader : meme s'il survit, son extraction finale sera amputee.

## 9.6 Blizzard

### Resume

Un participant ajoute de la valeur au pot et augmente la pression sans prendre le leadership.

### Couts et limites

- cout : 1 entree ;
- pression : +1 ;
- pas de limite stricte autre que le cooldown ;
- indisponible en terminal lock.

### Effets

- ajoute 1 entree au pot ;
- augmente la pression de 1 ;
- ne change pas le leader ;
- ne reset pas le timer.

### Effet produit

Blizzard est l'action de compression silencieuse. Elle permet de charger le pot, pousser la session vers le plancher et perturber la lecture de l'intention adverse sans s'exposer comme nouveau leader.

## 10. Cooldown et anti-spam

Sans cooldown, la strategie optimale deviendrait un script de spam. Nodus introduit donc un cout temporel propre a chaque wallet de session.

### 10.1 Cooldown intra-cycle

Le cooldown s'applique a toutes les actions payantes initiees par un meme wallet de session.

Formule cible V1 :

cooldown_slots = base_cooldown_slots x max(0, action_count_cycle - 1)^1.5

Effet attendu :

- les deux premieres actions restent relativement fluides ;
- les suivantes deviennent de plus en plus couteuses en temps ;
- le spam mono-wallet est penalise ;
- un participant doit choisir ses moments plutot que marteler le bouton.

### 10.2 Reinitialisation du cooldown

Le compteur individuel du cycle repart a zero lorsque cycle_number change.

### 10.3 Pourquoi pas de cooldown inter-cycle en V1

Le cooldown inter-cycle est une option interessante contre les fermes de bots, mais il complique l'experience sur devnet et peut ralentir l'apprentissage produit. Il est donc decrit comme option future, pas comme exigence de la V1.

## 11. Wallet de session et une seule signature utilisateur au depart

Cette section est normative car elle conditionne l'UX du protocole.

### 11.1 Probleme a resoudre

Si l'utilisateur doit approuver une popup wallet pour chaque entree, chaque sabotage, chaque shield ou chaque curse, le produit est mort. Le rythme du mecanisme exige que la decision humaine soit separee de la friction de signature du wallet principal.

### 11.2 Solution retenue

Nodus utilise un wallet de session.

Sequence :

1. Le frontend genere localement une keypair de session.
2. L'utilisateur signe une seule transaction depuis son wallet principal pour financer ce wallet de session avec un budget borne.
3. Toutes les actions du cycle sont ensuite signees localement par le wallet de session, sans nouvelle popup du wallet principal.
4. Quand le budget est epuise ou que la session expire, l'utilisateur doit signer une nouvelle transaction de financement s'il veut continuer.
5. Le reliquat du wallet de session est renvoye au wallet principal en fin de session via une transaction signee uniquement par le wallet de session.

### 11.3 Ce que l'utilisateur accepte concretement

Au minimum, en V1 :

- 1 transaction a l'ouverture de la session.

Parfois, selon son comportement :

- 1 transaction supplementaire s'il veut recharger le budget de session ;
- aucune autre popup pour les actions du cycle tant que le budget de session suffit.

### 11.4 Ce que le site n'a pas le droit de faire

Le site n'obtient jamais une autorisation illimitee sur le wallet principal. Il ne peut pas vider le wallet principal ni declencher arbitrairement des transferts depuis celui-ci. Il ne peut agir qu'au travers du budget que l'utilisateur a explicitement transfere au wallet de session.

### 11.5 Parametres UX recommandes V1

- budget de session visible avant signature ;
- duree d'expiration de session visible ;
- bouton de recuperation du solde restant ;
- affichage clair des fonds encore disponibles ;
- message expliquant que chaque action reste une transaction on-chain, mais sans nouvelle popup du wallet principal.

### 11.6 Risques a expliquer a l'utilisateur

- si l'onglet est ferme brutalement, il faut pouvoir restaurer ou recuperer le wallet de session ;
- le budget de session reste a risque tant qu'il n'est pas sweepe ;
- une session trop longue n'est pas souhaitable ;
- il faut plafonner l'exposition maximale par session.

## 12. Regles de coherence et invariants du protocole

Les invariants ci-dessous doivent etre vrais a tout moment.

- il n'existe qu'un seul leader par cycle ;
- toute redistribution se fait selon des regles purement deterministes ;
- chaque action payante irreversible ajoute de la valeur au pot actuel ou au carry-over futur ;
- aucun participant passif ne peut gagner ;
- aucune action ne depend d'un nombre aleatoire ;
- le cycle a une fin certaine grace au terminal lock ;
- le fee protocole est fixe et calculable a l'avance ;
- le protocole ne peut pas etre pause ou modifie par un admin une fois deploye et finalise ;
- le programme doit rester comprehensible pour un audit externe rapide.

## 13. Etats on-chain recommandes

## 13.1 NodusVault

Le compte central du cycle.

Champs recommandes V1 :

- leader : Pubkey
- leader_since_slot : u64
- timer_start_slot : u64
- timer_reset_slots : u64
- pressure_count : u64
- cycle_number : u64
- terminal_lock : bool
- shield_expires_slot : u64
- anchor_count : u8
- curse_count : u8
- carry_over_lamports : u64
- active_snipe_wallet : Pubkey
- active_snipe_expiry_slot : u64
- protocol_fee_bps : u16

Champs optionnels mais utiles :

- last_resolved_winner : Pubkey
- last_resolved_payout : u64
- last_cycle_pot : u64
- last_cycle_pressure : u64

## 13.2 UserState

Compte individuel associe au wallet de session.

Champs recommandes V1 :

- authority : Pubkey
- current_cycle_number : u64
- action_count_this_cycle : u16
- last_action_slot : u64
- shield_used : bool
- sabotage_used_count : u8
- anchor_used : bool
- curse_used : bool
- active_snipe_escrow_lamports : u64

## 13.3 SnipeEscrow PDA

Compte temporaire optionnel pour isoler proprement l'escrow du snipe.

Champs recommandes :

- owner : Pubkey
- cycle_number : u64
- lamports_locked : u64
- expiry_slot : u64

## 14. Jeu d'instructions recommande pour Anchor

La V1 peut rester sous une dizaine d'instructions.

Jeu recommande :

1. initialize
2. deposit
3. shield
4. sabotage
5. anchor
6. arm_snipe
7. reclaim_snipe
8. curse
9. blizzard
10. resolve

Si une reduction de surface est necessaire, reclaim_snipe peut etre fusionnee dans une logique de remboursement paresseux.

## 15. Flux complet d'un cycle type

### 15.1 Ouverture

- pot de depart eventuellement alimente par carry-over ;
- premier participant finance son wallet de session s'il ne l'a pas deja fait ;
- il execute deposit ;
- il devient leader ;
- timer part a 180 secondes cibles.

### 15.2 Milieu de cycle

- d'autres participants entrent ;
- un participant utilise blizzard pour charger le pot sans s'exposer ;
- un autre place curse pour rendre le gain du leader moins attractif ;
- la pression augmente ;
- les futurs resets deviennent plus courts.

### 15.3 Compression

- le leader utilise shield ;
- un challenger repond avec sabotage ;
- un autre arme un snipe ;
- le prochain deposit tombe dans le piege ;
- le snipe prend le leadership et pousse la pression d'un coup.

### 15.4 Respiration exceptionnelle

- le leader engage 2 entrees pour utiliser anchor ;
- le timer repart long ;
- mais la pression est plus forte qu'avant ;
- la courbe de compression reprendra rapidement lors du prochain changement de leadership.

### 15.5 Phase terminale

- le timer atteint son plancher de 15 secondes ;
- la pression continue de monter ;
- a partir de la pression 40, plus aucune action payante n'est acceptee ;
- le leader doit simplement tenir la derniere fenetre.

### 15.6 Resolution

- resolve devient valide ;
- le gagnant recoit sa part ;
- le protocole prend 2 % ;
- le carry-over eventuel est stocke ;
- le cycle suivant est immediatement pret.

## 16. Exemples numeriques

## 16.1 Cycle simple sans coups speciaux

- 5 deposits a 0.01 SOL
- pot brut = 0.05 SOL
- pas de malediction
- fee protocole = 0.001 SOL
- gagnant = 0.049 SOL

## 16.2 Cycle avec 1 anchor et 2 curses

- 8 deposits = 0.08 SOL
- 1 anchor = 0.02 SOL
- 2 curses = 0.02 SOL
- pot brut = 0.12 SOL
- fee protocole = 0.0024 SOL
- carry-over = 0.0024 SOL
- gagnant = 0.1152 SOL

## 16.3 Cycle avec snipe declenche

- pot avant snipe = 0.10 SOL
- sniper arme 0.01 SOL en escrow
- un adversaire tente deposit pour 0.01 SOL
- les 0.02 SOL entrent dans le pot
- pot brut devient 0.12 SOL
- le sniper, et non le deposant, prend le leadership

## 17. Logique psychologique encodee dans l'economie

Le protocole ne doit pas dependre de gimmicks visuels pour etre prenant. Les mecanismes psychologiques doivent sortir directement des regles economiques.

### 17.1 FOMO

Le pot est public, le timer est visible et chaque compression reduit la fenetre d'opportunite. L'inaction se voit et se ressent.

### 17.2 Loss aversion

Chaque entree precedente est perdue si elle n'a pas permis de finir leader au bon moment. Le participant supporte une douleur economique concrete et irreversible.

### 17.3 Escalation of commitment

Plus un participant a deja engage du capital ou du temps, plus il devient difficile psychologiquement de laisser filer le cycle sans reagir.

### 17.4 Countdown anxiety

La compression du timer rend chaque seconde restante plus dense. Nodus ne fabrique pas artificiellement l'urgence ; il code l'urgence dans la structure meme de la session.

### 17.5 Social proof

Le leader, les changements de tete, les grosses resolutions et les historiques de wallets gagnants creent un signal public continu.

### 17.6 Zeigarnik effect

Un cycle ouvert mais non resolu attire naturellement l'attention. La session inachevee devient une tension cognitive.

## 18. Resistance aux bots et aux abus

### 18.1 Bots de timing

Le mecanisme n'elimine pas les bots. Il les rend moins dominants grace a quatre leviers :

- courbe de compression non constante ;
- coups speciaux qui modifient la dynamique ;
- cooldown par wallet ;
- verrou terminal qui empeche une prolongation infinie du plancher.

La V1 devnet a un timer minimum de 15 secondes pour rester jouable malgre un RPC gratuit potentiellement lent.

### 18.2 Spam mono-wallet

Le cooldown transforme le spam en cout temporel croissant.

### 18.3 Baleines

Une baleine peut financer plus d'actions, mais elle ne peut pas acheter une victoire par une seule taille de ticket. Elle doit toujours jouer dans la meme structure de timing et de pression que les autres.

### 18.4 Collusion

La collusion n'est pas impossible, mais elle reste fragile. Plus la session est tendue, plus un accord hors chaine est facile a trahir au dernier moment. Nodus ne promet pas d'abolir la collusion ; il cherche a la rendre instable et risquee.

### 18.5 Griefing

Tout griefing coute de vraies entrees. L'attaquant ne peut pas nuire gratuitement.

### 18.6 Perte de session wallet

Le produit doit prevoir une restauration temporaire de session ou un sweep assiste. C'est un sujet UX critique, pas un detail.

## 19. Profil de deploiement V1 sur devnet

### 19.1 Pourquoi devnet d'abord

- valider la comprehension du produit ;
- mesurer la vraie latence ressentie ;
- tester les phases du cycle ;
- observer les comportements sans cout reel eleve ;
- instrumenter la telemetrie du frontend.

### 19.2 Ce qui est realiste avec le RPC public devnet

- prototyper ;
- valider le wallet de session ;
- tester la logique du vault ;
- observer une UX fluide mais imparfaite ;
- travailler avec un timer plancher de 15 secondes.

### 19.3 Ce qu'il ne faut pas promettre sur devnet

- aucune garantie stable a 400 ms ;
- aucune robustesse contre congestion forte ;
- aucune conclusion definitive sur l'experience mainnet ;
- aucune equivalence avec un RPC premium.

## 20. Framing produit et interface

L'interface doit ressembler a un terminal financier simplifie.

Blocs prioritaires :

- pot courant ;
- leader courant ;
- temps restant ;
- pression actuelle ;
- prochaine fenetre de reset si quelqu'un prend la tete maintenant ;
- coups speciaux disponibles et indisponibles ;
- budget restant du wallet de session ;
- historique des derniers cycles.

Termes autorises :

- position
- leadership
- cycle
- redistribution
- protocol fee
- session
- pression
- terminal lock

Termes interdits :

- pari
- jackpot
- mise de casino
- joueur
- chance

## 21. Roadmap de developpement recommandee

Le whitepaper couvre le mecanisme complet. Pour le developpement, l'ordre recommande est le suivant.

### Phase A - coeur economique

- initialize
- deposit
- resolve
- courbe de pression
- terminal lock
- carry-over

### Phase B - UX de session

- session wallet
- financement et sweep
- affichage temps restant
- affichage budget restant

### Phase C - coups speciaux simples

- blizzard
- curse
- shield

### Phase D - coups speciaux complexes

- sabotage
- anchor
- arm_snipe
- reclaim_snipe

### Phase E - analytics et lisibilite

- historique de cycles
- tableaux de bord de performance
- indicateurs de pression et de compression

## 22. Decisions gelees par ce document

Les points suivants sont consideres comme figes pour lancer le developpement de la V1 :

- nom de travail du protocole : Nodus Protocol ;
- entree unitaire : 0.01 SOL ;
- wallet de session obligatoire pour une UX acceptable ;
- timer minimum cible : 15 secondes ;
- fee protocole fixe : 2 % ;
- maledictions bornees a 5 par cycle ;
- anchor a 2 entrees ;
- terminal lock obligatoire pour garantir la fin ;
- logique entierement deterministic et sans hasard.

## 23. Questions ouvertes a traiter avant mainnet

Le mecanisme est suffisamment specifie pour commencer le developpement. Les questions suivantes restent cependant a arbitrer avant un lancement mainnet.

- valeur exacte des slots pour chaque constante selon les mesures reelles ;
- eventuelle recompense du resolveur ;
- strategie de restauration du wallet de session ;
- besoin ou non d'un cooldown inter-cycle ;
- gestion finale de reclaim_snipe ;
- niveau de telemetrie produit acceptable sans compromettre la decentralisation ;
- structure legale precise du wallet percevant les 2 %.

## 24. Conclusion

Nodus Protocol n'est pas un simple dernier-deposant-gagne. La version figee ici combine :

- une course au leadership ;
- une compression temporelle lisible ;
- des coups speciaux asymetriques ;
- une finitude garantie ;
- une UX realiste grace au wallet de session ;
- une adaptation explicite au devnet et a un timer minimum de 15 secondes.

Cette specification est suffisante pour ouvrir la phase de conception technique detaillee, de modelisation Anchor et de prototypage frontend.
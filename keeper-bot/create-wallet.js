/**
 * Script pour créer un keeper wallet et obtenir la private key en base58
 */

const { Keypair } = require("@solana/web3.js");
const bs58 = require("bs58");

// Générer nouveau keypair
const keypair = Keypair.generate();

// Encoder la private key en base58
const privateKeyBase58 = bs58.default ? bs58.default.encode(keypair.secretKey) : bs58.encode(keypair.secretKey);

console.log("🎉 Keeper Wallet créé!");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("");
console.log("📍 Public Key (adresse):");
console.log(keypair.publicKey.toBase58());
console.log("");
console.log("🔑 Private Key (base58) - GARDE ÇA SECRET:");
console.log(privateKeyBase58);
console.log("");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("");
console.log("⚠️  IMPORTANT:");
console.log("1. Copie la Private Key ci-dessus");
console.log("2. Garde-la en sécurité (ne la partage JAMAIS)");
console.log("3. Tu en auras besoin pour Railway");
console.log("");
console.log("💰 Fund ce wallet sur devnet:");
console.log(`   solana airdrop 1 ${keypair.publicKey.toBase58()} --url devnet`);
console.log("");

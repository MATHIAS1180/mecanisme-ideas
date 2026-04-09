// Script pour vérifier si le vault existe
const { Connection, PublicKey } = require("@solana/web3.js");

const PROGRAM_ID = "3SYz8vyWqY2tTNduxZ7ULGS5vMsQEyEbo1iXGPSVTjtH";
const RPC_URL = "https://api.devnet.solana.com";

async function checkVault() {
  const connection = new Connection(RPC_URL, "confirmed");
  const programId = new PublicKey(PROGRAM_ID);
  
  // Derive vault PDA
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("nodus_vault")],
    programId
  );
  
  console.log("Program ID:", PROGRAM_ID);
  console.log("Vault PDA:", vaultPda.toBase58());
  
  // Check if vault exists
  const accountInfo = await connection.getAccountInfo(vaultPda);
  
  if (accountInfo) {
    console.log("✅ VAULT EXISTS!");
    console.log("Owner:", accountInfo.owner.toBase58());
    console.log("Data length:", accountInfo.data.length);
    console.log("Lamports:", accountInfo.lamports);
  } else {
    console.log("❌ VAULT NOT FOUND!");
    console.log("Le vault doit être initialisé avec l'instruction Initialize");
  }
}

checkVault().catch(console.error);

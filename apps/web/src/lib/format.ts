export function shortenAddress(value: string, size = 4) {
  if (!value) return "Unconfigured";
  if (value.length <= size * 2) return value;
  return `${value.slice(0, size)}...${value.slice(-size)}`;
}

export function formatSolFromLamports(lamports: bigint | number) {
  const value = typeof lamports === "number" ? BigInt(lamports) : lamports;
  return (Number(value) / 1_000_000_000).toFixed(4);
}

export function formatCountdown(seconds: number) {
  if (seconds <= 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

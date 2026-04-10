export function shortenAddress(value: string, size = 4) {
  if (!value) return "Unconfigured";
  if (value.length <= size * 2) return value;
  return `${value.slice(0, size)}...${value.slice(-size)}`;
}

export function formatSolFromLamports(lamports: bigint | number, withSeparator = false) {
  const value = typeof lamports === "number" ? BigInt(lamports) : lamports;
  const sol = (Number(value) / 1_000_000_000).toFixed(4);
  
  if (withSeparator) {
    const [integer, decimal] = sol.split('.');
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${formattedInteger}.${decimal}`;
  }
  
  return sol;
}

export function formatCountdown(seconds: number) {
  if (seconds <= 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

export function formatTimestamp(unixTimestamp: number) {
  const date = new Date(unixTimestamp * 1000);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(date);
}

export function formatRelativeTime(unixTimestamp: number) {
  const now = Date.now();
  const diff = now - (unixTimestamp * 1000);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

export function formatRating(rating: number | null | undefined): string {
  if (rating === null || rating === undefined) return "—";
  return rating.toFixed(1);
}

export function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return "—";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

export function formatDate(
  dateString: string | null | undefined,
  fallback: string = "Sin fecha"
): string {
  if (!dateString) return fallback;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function getRatingColor(rating: number | null | undefined): string {
  if (rating === null || rating === undefined) return "text-zinc-500";
  if (rating >= 8) return "text-emerald-400";
  if (rating >= 5) return "text-amber-400";
  return "text-rose-500";
}

export function getPlatformBadge(platform: string | null | undefined) {
  switch (platform?.toLowerCase()) {
    case "netflix":
      return { bg: "bg-red-950/70 border-red-800/50 text-red-300", name: "Netflix" };
    case "disney+":
    case "disney":
      return { bg: "bg-blue-950/70 border-blue-800/50 text-blue-300", name: "Disney+" };
    case "prime video":
    case "prime":
      return { bg: "bg-sky-950/70 border-sky-800/50 text-sky-300", name: "Prime Video" };
    case "hbo max":
    case "max":
      return { bg: "bg-purple-950/70 border-purple-800/50 text-purple-300", name: "Max" };
    case "cine":
      return { bg: "bg-amber-950/70 border-amber-600/50 text-amber-300 font-semibold", name: "🎟️ Cine" };
    default:
      return { bg: "bg-zinc-800/70 border-zinc-700/50 text-zinc-300", name: platform || "Streaming" };
  }
}

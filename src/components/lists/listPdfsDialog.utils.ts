export function estimateBulkPdfMinutes(count: number): string {
  // ~2–3 PDFs/sec with concurrency 4 on a typical server
  const seconds = Math.ceil(count / 2.5);
  if (seconds < 120) return `~${Math.ceil(seconds / 60) || 1} min`;
  const mins = Math.ceil(seconds / 60);
  if (mins < 120) return `~${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `~${hours}h ${rem}m` : `~${hours}h`;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeMarkdownCell(s: string): string {
  return s.replace(/\|/g, "\\|");
}

const CALL_STATUSES = new Set([
  "raw",
  "masked",
  "mixed",
  "clean",
  "unchecked",
]);

export function whitelistCallStatus(status: string): string {
  return CALL_STATUSES.has(status) ? status : "unchecked";
}

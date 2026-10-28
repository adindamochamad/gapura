import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { GapuraConfig, RegionRef } from "./types.js";

export interface ProviderRow {
  id: string;
  name: string;
  hosts: string[];
  processing_region: string;
  docs_url: string | null;
  source_note: string;
  verified_at: string | null;
}

let cachedProviders: ProviderRow[] | null = null;

export function providersJsonPath(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, "../../data/providers.json");
}

export function loadProviders(): ProviderRow[] {
  if (cachedProviders) return cachedProviders;
  const raw = readFileSync(providersJsonPath(), "utf8");
  cachedProviders = JSON.parse(raw) as ProviderRow[];
  return cachedProviders;
}

function hostMatches(pattern: string, host: string): boolean {
  const h = host.toLowerCase();
  const p = pattern.toLowerCase();
  if (p === "*") return false;
  if (p.startsWith("*.")) {
    const suffix = p.slice(1);
    return h.endsWith(suffix) || h === p.slice(2);
  }
  if (p.includes("*")) {
    const [prefix, suffix] = p.split("*");
    return h.startsWith(prefix ?? "") && h.endsWith(suffix ?? "");
  }
  return h === p;
}

export function resolveProvider(
  host: string,
  config?: GapuraConfig,
): { provider: ProviderRow; region_ref: RegionRef } {
  const rows = loadProviders();
  const h = host.toLowerCase();

  let match: ProviderRow | undefined;
  for (const row of rows) {
    if (row.id === "unknown") continue;
    for (const pattern of row.hosts) {
      if (hostMatches(pattern, h)) {
        match = row;
        break;
      }
    }
    if (match) break;
  }

  if (!match) {
    match = rows.find((r) => r.id === "unknown")!;
  }

  const override = config?.provider_overrides?.[match.id];
  const processing_region =
    override?.processing_region ?? match.processing_region;
  const verified_at = override?.verified_at ?? match.verified_at;

  let verification = match.source_note;
  if (processing_region === "belum terverifikasi") {
    verification = "belum terverifikasi";
  } else if (verified_at) {
    verification = `menurut dokumentasi penyedia, diakses ${verified_at}`;
  }

  return {
    provider: match,
    region_ref: {
      provider_id: match.id,
      processing_region,
      verification,
      docs_url: match.docs_url,
      verified_at,
    },
  };
}

export function formatProviderAge(row: ProviderRow): string {
  if (!row.verified_at) return "belum terverifikasi";
  const verified = new Date(row.verified_at);
  const days = Math.floor(
    (Date.now() - verified.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days > 90) return `${row.verified_at} (perlu verifikasi ulang)`;
  return row.verified_at;
}

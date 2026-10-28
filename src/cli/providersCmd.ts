import { loadProviders, formatProviderAge } from "../core/providers.js";

export function runProvidersList(): void {
  const rows = loadProviders();
  console.log("Penyedia LLM (data/providers.json)\n");
  for (const row of rows) {
    console.log(`${row.id} — ${row.name}`);
    console.log(`  host: ${row.hosts.join(", ")}`);
    console.log(`  wilayah: ${row.processing_region}`);
    console.log(`  verifikasi: ${formatProviderAge(row)}`);
    if (row.docs_url) console.log(`  docs: ${row.docs_url}`);
    console.log("");
  }
}

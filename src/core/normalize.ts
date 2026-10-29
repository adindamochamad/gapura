const INVISIBLE_RE = /[\u200B-\u200D\u2060\uFEFF\u00AD]/g;

function mapDecimalDigit(ch: string): string {
  if (ch >= "0" && ch <= "9") return ch;
  const cp = ch.codePointAt(0)!;
  if (cp >= 0x0660 && cp <= 0x0669) return String(cp - 0x0660);
  if (cp >= 0x06f0 && cp <= 0x06f9) return String(cp - 0x06f0);
  const nf = ch.normalize("NFKC");
  if (nf >= "0" && nf <= "9" && nf.length === 1) return nf;
  return ch;
}

/** Normalisasi teks sebelum deteksi Tirai (di Gapura, bukan di Tirai). */
export function normalizeForScan(text: string): string {
  let t = text.normalize("NFKC");
  t = t.replace(/\p{Nd}/gu, mapDecimalDigit);
  t = t.replace(INVISIBLE_RE, "");
  let prev = "";
  while (prev !== t) {
    prev = t;
    t = t.replace(
      /(\d{3,})[\s.\-](\d{3,})/g,
      (_m, a: string, b: string) => `${a}${b}`,
    );
  }
  return t;
}

export type Pasal161Label = "sebagian" | "isi manual" | "konteks";

export interface Pasal161Section {
  id: "a" | "b" | "c" | "d" | "e" | "f" | "g";
  title: string;
  quote: string;
  label: Pasal161Label;
  gapura_fills: string;
}

export const PASAL161_SECTIONS: Pasal161Section[] = [
  {
    id: "a",
    title: "Perekaman dan pemetaan siklus transfer",
    quote:
      "melakukan perekaman dan pemetaan siklus transfer Data Pribadi dan implikasinya",
    label: "sebagian",
    gapura_fills:
      "Log mencatat kapan, ke penyedia mana, jenis data apa, dan berapa kali muncul. Implikasi transfer tetap Anda yang tulis.",
  },
  {
    id: "b",
    title: "Cukup, relevan, terbatas",
    quote:
      "memastikan bahwa Data Pribadi yang ditransfer cukup, relevan, dan terbatas sesuai dengan tujuan transfer Data Pribadi",
    label: "sebagian",
    gapura_fills:
      "Yang otomatis: jenis, jumlah, plus indikasi penyamaran di body request. Apakah sudah cukup dan relevan — bukan ranah Gapura.",
  },
  {
    id: "c",
    title: "Instrumen hukum rujukan",
    quote:
      "mengidentifikasi instrumen hukum yang digunakan sebagai rujukan untuk proses transfer Data Pribadi",
    label: "isi manual",
    gapura_fills:
      "Isi dari config; Gapura menampilkan teks itu tanpa mengecek kebenarannya.",
  },
  {
    id: "d",
    title: "Penilaian efektivitas instrumen",
    quote:
      "melakukan penilaian efektivitas instrumen hukum yang digunakan untuk proses transfer Data Pribadi yang akan dilakukan sebelum melakukan transfer Data Pribadi",
    label: "isi manual",
    gapura_fills:
      "Sama seperti (c): kolom config, tanpa penilaian dari alat ini.",
  },
  {
    id: "e",
    title: "Instrumen pelengkap",
    quote:
      "menggunakan instrumen pelengkap apabila dibutuhkan, baik berupa instrumen kontraktual, teknis, dan/ atau organisasional",
    label: "sebagian",
    gapura_fills:
      "Kalau request terlihat disamarkan, itu tercatat. Kontrak, SOP, dan langkah organisasi — manual.",
  },
  {
    id: "f",
    title: "Langkah prosedural instrumen pelengkap",
    quote:
      "menerapkan langkah prosedural yang dapat ditempuh jika akan menggunakan instrumen pelengkap",
    label: "isi manual",
    gapura_fills:
      "Prosedur internal: isi config, Gapura tidak memvalidasi.",
  },
  {
    id: "g",
    title: "Evaluasi ulang berkala",
    quote:
      "mengevaluasi ulang secara berkala dalam kurun waktu yang memadai",
    label: "sebagian",
    gapura_fills:
      "Rentang waktu log plus tanggal tinjau berikutnya (config). Pelaksanaan tinjauannya di luar alat ini.",
  },
];

export const PASAL162_H_NOTE =
  "Butir h membahas format data yang dikirim — plain text, disamarkan, atau terenkripsi. Gapura hanya memberi status panggilan (raw, masked, mixed, clean, unchecked). Itu beda hal dengan enkripsi di koneksi.";

export const LEGAL_DISCLAIMER = "Bukan pendapat hukum.";

export const PP_SOURCE_NOTE =
  "Kutip Pasal 161 dari OCR legaltrans.id; belum dicocokkan ke JDIH resmi.";

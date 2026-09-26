// "Title" di tabel projects nullable, jadi input null/undefined/non-string
// dipetakan jadi string kosong, bukan TypeError. Transformasinya sendiri
// tidak diubah supaya URL proyek yang sudah dibagikan tetap sama.
export const toSlug = (title) =>
  String(title ?? "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
// Kolom is_published & order_index berasal dari tabel `projects` (lihat README).
// Baris yang secara eksplisit berisi false dianggap belum dipublikasikan,
// sehingga tidak pernah ditampilkan di beranda maupun halaman detail.
// Nilai null/undefined diperlakukan sebagai terpublikasi agar proyek lama
// yang belum punya nilai tetap tampil.
export const isProjectPublished = (project) => project?.is_published !== false;

// Saring proyek yang belum dipublikasikan dari sebuah daftar (aman untuk
// nilai non-array, misalnya cache localStorage yang korup).
export const getPublishedProjects = (projects) =>
  (Array.isArray(projects) ? projects : []).filter(isProjectPublished);

// Urutkan sesuai order_index; order_index null diletakkan di akhir dan
// data di antre dengan id menurun supaya urutan lamanya tetap sama.
export const sortProjectsByOrder = (projects) =>
  [...(Array.isArray(projects) ? projects : [])].sort((a, b) => {
    const orderA = a?.order_index ?? Number.MAX_SAFE_INTEGER;
    const orderB = b?.order_index ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return (b?.id ?? 0) - (a?.id ?? 0);
  });

// Siap pakai untuk hasil query maupun cache: sudah tersaring dan terurut.
export const prepareProjects = (projects) =>
  sortProjectsByOrder(getPublishedProjects(projects));

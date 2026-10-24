# Musik latar

Folder ini berisi **5 musik instrumental romantis orisinal** (dibuat khusus untuk project ini, bebas dipakai
termasuk untuk komersial). Setiap tamu yang membuka undangan akan mendapat lagu **acak**, lalu berlanjut
ke lagu berikutnya saat selesai. Tombol play/pause muncul di kanan bawah setelah undangan dibuka.

| File | Judul | Nuansa |
|---|---|---|
| romantis-1-senja-di-taman.mp3 | Senja di Taman | Piano lembut + string, C mayor |
| romantis-2-janji-suci.mp3 | Janji Suci | Balada pelan, F mayor |
| romantis-3-kotak-musik.mp3 | Kotak Musik Rindu | Kotak musik, G mayor |
| romantis-4-langkah-berdua.mp3 | Langkah Berdua | Waltz 3/4, D mayor |
| romantis-5-cahaya-lilin.mp3 | Cahaya Lilin | Piano + string, Eb mayor |

## Mengatur musik per undangan

```js
music: '',                                      // kosong / 'random' = acak dari daftar di atas (bawaan)
music: '/assets/audio/romantis-2-janji-suci.mp3', musicTitle: 'Janji Suci',   // satu lagu tertentu
music: '/assets/audio/lagu-klien.mp3', musicTitle: 'Judul lagu klien',        // lagu pilihan klien
music: false,                                   // tanpa musik & tanpa tombol
```

Mengganti daftar lagu acak untuk semua undangan: isi `music` di `site.config.js`, contoh
`music: [{ src: '/assets/audio/a.mp3', title: 'Judul A' }, ...]`.

Bila memakai lagu milik klien, pastikan lagunya boleh dipakai (bebas royalti atau berlisensi).
Ukuran ideal di bawah 3 MB per lagu.

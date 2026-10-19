# Foto

Simpan foto klien di sini, misalnya per klien: `assets/img/raka-nadia/foto-1.jpg`.

Kompres foto dulu (lebar maks. ±1200 px, di bawah 300 KB) agar undangan cepat terbuka,
misalnya dengan squoosh.app.

Lalu isi di data undangan:

```js
hosts: { people: [ { name: 'Raka', photo: '/assets/img/raka-nadia/raka.jpg' } ] },
gallery: { photos: [
  { src: '/assets/img/raka-nadia/foto-1.jpg', alt: 'Prewedding di pantai' },
  { src: '/assets/img/raka-nadia/foto-2.jpg', alt: 'Lamaran' }
] }
```

Selama `photos` belum diisi, galeri menampilkan kotak placeholder sebanyak `placeholders`.

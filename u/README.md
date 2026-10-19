# Folder undangan klien

Taruh undangan pesanan klien di sini, satu folder per klien:

```
u/raka-nadia/index.html      →  https://domainanda.vercel.app/u/raka-nadia
u/khitan-alif/index.html     →  https://domainanda.vercel.app/u/khitan-alif
```

Cara membuat: salin `index.html` dari salah satu folder di `templates/`, lalu ubah isi `window.INVITATION`.
Jangan lupa ganti `slug` dengan nama folder agar RSVP dan ucapan tiap klien terpisah.

Halaman di folder ini otomatis tidak diindeks Google (diatur di `vercel.json`).

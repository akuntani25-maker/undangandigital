# Undangan Digital — Website Jasa + Template

Situs statis (HTML, CSS, JavaScript murni) untuk bisnis jasa undangan digital:

- **Landing page** jasa: galeri template dengan filter, fitur, paket harga, cara order, FAQ, tombol WhatsApp.
- **15 template undangan beranimasi** (pernikahan, syar'i, adat Jawa, pantai, tunangan, khitanan, aqiqah, ulang tahun anak, sweet 17, acara kantor):
  layar memuat, 5 efek buka sampul (amplop, tirai, gerbang 3D, zoom, geser), partikel melayang
  (kelopak, daun, bintang, kilau, gelembung, konfeti, hati), judul muncul per huruf, ornamen yang "tergambar",
  bagian yang muncul bergantian saat di-scroll, menu navigasi bawah, tombol gulir otomatis & musik.
- **Ekstra kustom domain** di halaman harga + panduan pemasangannya (bagian 7).
- **Pembuat link tamu** untuk membuat link bernama per tamu + pesan WhatsApp + unduh CSV.
- **Backend RSVP & ucapan gratis** memakai Google Sheets (opsional).

Tidak perlu build, tidak perlu `npm install`. Langsung bisa di-deploy ke Vercel.

---

## Struktur folder

```
├── index.html                 Landing page
├── site.config.js             ⭐ Nama brand, nomor WA, Instagram, kota
├── favicon.svg
├── vercel.json                Pengaturan Vercel (URL bersih, header)
├── assets/
│   ├── css/landing.css        Gaya landing page
│   ├── css/invitation.css     Gaya bersama semua undangan
│   ├── js/landing.js          Filter template, menu HP, link WA
│   ├── js/invitation.js       Mesin undangan (cover, countdown, RSVP, dll.)
│   ├── js/decor.js            Ilustrasi SVG: bunga, ranting, kupu-kupu, ornamen, segel lilin
│   ├── css/styles.css         5 gaya tata letak (botanical, editorial, collage, royal, watercolor)
│   ├── css/canvas.css, js/canvas.js   Gaya kanvas: adegan taman, tugu, rumah kebaya, ondel-ondel + animasi loop
│   ├── css/painted.css, js/painter.js, js/adat.js   Gaya lukisan: mesin sapuan kuas + adegan 5 adat (Jawa, Bali, Minang, Toraja, Sasak)
│   ├── img/                   Foto klien
│   └── audio/                 Musik latar
├── assets/js/templates-data.js  Daftar template yang tampil di landing page
├── templates/                 15 demo template (dibuka dari landing page)
├── u/                         Undangan pesanan klien (satu folder per klien)
├── tools/link-tamu.html       Pembuat link tamu
└── backend/google-apps-script.gs   Kode untuk RSVP & ucapan ke Google Sheets
```

---

## 1. Atur identitas bisnis

Buka `site.config.js` dan ganti:

```js
brandName: 'Undanganku',
whatsapp: '6281234567890',   // format 62..., tanpa + dan spasi
instagram: 'undanganku',
city: 'Lombok Timur',
siteUrl: 'https://undanganku.vercel.app'   // isi setelah deploy
```

Semua tombol WhatsApp di landing page otomatis memakai nomor ini, lengkap dengan pesan sesuai paket/template yang diklik.

Harga & isi paket ada langsung di `index.html` (cari `id="harga"`). Jawaban FAQ soal pembayaran juga perlu Anda isi (cari `[Isi metode pembayaran`).

---

## 2. Coba di komputer sendiri

Karena memakai path absolut (`/assets/...`), buka lewat server lokal, bukan klik dua kali file:

```bash
npx serve .
# atau
python3 -m http.server 3000
```

Lalu buka `http://localhost:3000`. Contoh undangan dengan nama tamu:
`http://localhost:3000/templates/sakura-pastel/?to=Budi+Santoso`

---

## 3. Upload ke GitHub & deploy ke Vercel

**Lewat situs GitHub (tanpa Git):**
1. Ekstrak zip ini.
2. Di github.com buat repository baru (mis. `undangan-digital`), boleh Private.
3. Klik **Add file → Upload files**, seret **isi** folder hasil ekstrak (bukan folder induknya), lalu **Commit changes**.

**Atau lewat terminal:**
```bash
cd undangan-digital
git init
git add .
git commit -m "Situs undangan digital"
git branch -M main
git remote add origin https://github.com/USERNAME/undangan-digital.git
git push -u origin main
```

**Deploy di Vercel:**
1. Masuk ke vercel.com dengan akun GitHub.
2. **Add New → Project**, pilih repository tadi, klik **Import**.
3. Framework Preset: **Other**. Build Command & Output Directory: biarkan kosong.
4. Klik **Deploy**. Selesai — situs tayang di `https://nama-project.vercel.app`.

Setiap kali Anda push/upload perubahan ke GitHub, Vercel otomatis memperbarui situs.
Domain sendiri (mis. `undanganku.id`) bisa ditambahkan di **Project → Settings → Domains**.

---

## 4. Membuat undangan untuk klien

1. Salin folder template, mis. `templates/sakura-pastel/` → `u/raka-nadia/`.
2. Buka `u/raka-nadia/index.html` dan ubah isi `window.INVITATION`:
   - `slug: 'raka-nadia'` — **wajib unik** per klien (memisahkan RSVP/ucapan).
   - `cover`, `hosts`, `events`, `gift`, dst. sesuai data klien.
   - Bagian yang tidak dipakai cukup dihapus (mis. hapus `story` untuk paket Basic).
3. Ganti juga `<title>` dan `<meta property="og:...">` di atas file — inilah yang tampil sebagai pratinjau saat link dibagikan di WhatsApp.
4. Upload ke GitHub → otomatis tayang di `https://domainanda/u/raka-nadia`.

### Ringkasan isi data undangan

| Kunci | Fungsi |
|---|---|
| `slug` | ID unik undangan |
| `timeZone` | `Asia/Jakarta` (WIB), `Asia/Makassar` (WITA), `Asia/Jayapura` (WIT) |
| `theme.style` | Gaya tata letak: `botanical` (panel lengkung + buket bunga), `editorial` (koran/majalah), `collage` (amplop, polaroid, renda), `royal` (tirai, ornamen sudut, kamea oval), `watercolor` (cat air, tepi sobek, ranting, kupu-kupu), `canvas` (adegan ilustrasi menyambung + animasi loop — perlu memuat `canvas.css` & `canvas.js`, lihat template Taman Betawi), `painted` (lukisan di atas kanvas, halaman menyatu, tombol & kartu dilukis — perlu memuat `painted.css`, `painter.js` & `adat.js`, lihat 5 template adat) |
| `theme.adat` | Khusus gaya `painted`: `jawa`, `bali`, `minang`, `toraja`, `sasak` — menentukan adegan, palet, bingkai samping, bingkai foto & ornamen |
| `theme.variant` | Varian gaya: `magazine` (editorial berwarna), `scrapbook` (kolase anak) |
| `theme.masthead`, `theme.edition` | Judul koran & keterangan edisi (khusus gaya `editorial`) |
| `theme.heroFrame` | `true` untuk menampilkan bingkai foto juga di bagian pembuka |
| `theme.opening` | Efek buka sampul: `bloom` (buket membelah), `paper` (halaman dibalik), `seal` (segel lilin retak + amplop), `drape` (tirai terkumpul), `wash` (cat air meluber), `camera` (kamera menyelam ke pintu rumah — gaya canvas), `dive` (kamera menyelam ke adegan lukisan — gaya painted), juga `envelope`, `curtain`, `gate`, `zoom`, `slide-up` |
| `theme.particles` | `petals`, `leaves`, `stars`, `sparkle`, `bubbles`, `confetti`, `hearts`, `snow`, `none` |
| `theme.ornament` | `floral`, `batik`, `leaf`, `line`, `islamic`, `cloud`, `confetti`, `geo`, `deco`, `wave`, `arch`, `sparkle` |
| `theme.frame` | Bingkai foto/monogram di sampul: `arch`, `circle`, `oval` (dengan mahkota), `polaroid`, `rect`, `none` |
| `theme.pattern` | Pola latar halus: `dots`, `grid`, `diamond` (opsional) |
| `monogram` | Teks di bingkai & layar memuat bila belum ada foto (default: inisial dari judul) |
| `autoScroll` | `false` untuk menyembunyikan tombol gulir otomatis |
| `music` | Path mp3, mis. `/assets/audio/lagu.mp3` (kosong = tanpa musik) |
| `cover` | `eyebrow`, `title`, `photo` (foto sampul), `toLabel`, `note`, `button` |
| `hero` | `eyebrow`, `title`, `text` |
| `opening` | `arabic` (opsional), `greeting`, `text` |
| `quote` | `text`, `source` |
| `hosts` | `heading`, `joiner` (mis. `&`), `hidePhotos` (untuk undangan syar'i), `people: [{ role, name, parents, photo, instagram }]` |
| `events` | `[{ name, start, end, timeText, venue, address, mapsUrl, mapEmbed, mapQuery }]` — `start`/`end` format `2027-02-14T08:00:00+08:00`; `mapEmbed: true` menampilkan peta langsung di undangan |
| `video` | `youtubeId` (kode setelah `v=` di link YouTube), `heading`, `text` |
| `dresscode` | `text`, `colors: ['#hex', ...]` |
| `rundown` / `story` | `heading`, `items: [{ when, title, text }]` |
| `gallery` | `photos: [{ src, alt }]` atau `placeholders: 5` |
| `streaming` | `url`, `text` |
| `gift` | `text`, `accounts: [{ bank, number, holder }]`, `address` |
| `rsvp` | `true` atau `{ maxGuests, options, heading, text }`; `false` untuk mematikan |
| `wishes` | `true` atau `{ heading, text }`; `false` untuk mematikan |
| `endpoint` | URL Google Apps Script (lihat bagian 6) |
| `closing` | `text`, `greeting`, `signatureLabel`, `signature` |

Warna bunga & dekorasi memakai variabel `--fl-1`, `--fl-2`, `--fl-3`, `--leaf`, `--leaf-2`, `--gold`, `--seal`, `--drape`, `--velvet`, `--env`, `--hill-1..3`, `--sky-1/2`, `--branch`.

Warna & font tiap template diatur di blok `<style>` paling atas (`--bg`, `--accent`, `--font-display`, dll.), jadi Anda bisa membuat variasi warna baru tanpa menyentuh mesin undangan.

**Link Google Maps:** di Google Maps, buka lokasi → Bagikan → Salin link, tempel ke `mapsUrl`.

---

## 5. Membuat link per tamu

Buka `https://domainanda/tools/link-tamu`:
1. Isi link undangan klien (mis. `https://domainanda/u/raka-nadia`).
2. Tempel daftar nama, satu per baris.
3. Klik **Buat Link** → salin per tamu, kirim langsung via WhatsApp, atau **Unduh CSV** untuk diserahkan ke klien.

Format link: `.../u/raka-nadia?to=Budi+Santoso` — nama tamu tampil di sampul undangan.

---

## 6. (Opsional) RSVP & ucapan tersimpan di Google Sheets

Tanpa pengaturan ini, RSVP dan ucapan hanya tersimpan di HP tamu masing-masing (cocok untuk demo).
Agar semua ucapan tampil untuk semua tamu dan klien bisa melihat rekap kehadiran:

1. Buat Google Sheets baru (bisa satu sheet untuk semua klien).
2. **Ekstensi → Apps Script**, hapus isi `Code.gs`, tempel isi `backend/google-apps-script.gs`, simpan.
3. **Deploy → Deployment baru → ⚙ Aplikasi web**
   - Jalankan sebagai: **Saya**
   - Yang memiliki akses: **Siapa saja**
4. Izinkan akses, lalu salin **URL aplikasi web** (berakhiran `/exec`).
5. Isi di data undangan: `endpoint: 'https://script.google.com/macros/s/XXXX/exec'`.

Data masuk ke tab **RSVP** dan **Ucapan**, dibedakan per undangan lewat kolom *Undangan* (slug).
Setiap kali kode Apps Script diubah, buat **deployment versi baru** agar perubahan berlaku.

---

## 7. Ekstra kustom domain (mis. `rakadannadia.com`)

Satu project Vercel bisa melayani banyak domain klien. Setiap domain diarahkan ke folder undangannya.

1. **Beli domain** atas nama klien di registrar (Niagahoster, DomaiNesia, IDCloudHost, dll.).
2. **Tambahkan ke Vercel:** Project → **Settings → Domains → Add**, ketik `rakadannadia.com`
   (Vercel akan menawarkan juga `www.rakadannadia.com`; terima saja).
3. **Atur DNS** di panel registrar persis seperti yang ditampilkan Vercel (biasanya satu record **A** untuk domain utama
   dan satu **CNAME** untuk `www`). Tunggu sampai status di Vercel menjadi **Valid** (beberapa menit sampai 48 jam). HTTPS dipasang otomatis.
4. **Arahkan domain ke folder klien** dengan menambah aturan di `vercel.json` bagian `"rewrites"`:

```json
"rewrites": [
  {
    "source": "/",
    "has": [{ "type": "host", "value": "(www\\.)?rakadannadia\\.com" }],
    "destination": "/u/raka-nadia/index.html"
  }
]
```

   Tambah satu blok seperti itu untuk setiap domain klien. Upload ke GitHub → Vercel memperbarui otomatis.
5. Link tamu menjadi `https://rakadannadia.com/?to=Budi+Santoso`. Di alat **link tamu**, isi link undangan dengan `https://rakadannadia.com`.

Saat masa aktif habis dan klien tidak memperpanjang: hapus blok rewrite-nya dan hapus domain dari Vercel.

## 8. Foto & musik

- Foto: lihat `assets/img/README.md` (kompres dulu agar cepat terbuka).
- Musik: lihat `assets/audio/README.md`. Gunakan musik bebas royalti/berlisensi.

## Setelah mengubah file CSS/JS

Setiap link ke file `.css`/`.js` memakai nomor versi, mis. `/assets/css/landing.css?v=5`.
Bila Anda mengubah isi file di `assets/` atau `site.config.js`, naikkan nomornya (cari-ganti `?v=5` → `?v=6`
di semua file `.html`) agar browser pengunjung langsung memakai versi terbaru, bukan versi lama yang tersimpan.

Bila halaman tampak berantakan setelah update, coba buka di tab penyamaran (incognito) atau tekan **Ctrl+Shift+R**.

## Catatan

- Nama, tanggal, alamat, dan nomor rekening di template adalah **contoh fiktif** untuk demo.
- Masa aktif paket (3/6/12 bulan) dikelola manual: hapus atau ganti folder klien di `u/` saat masa aktif habis.
- Halaman di `u/` dan `tools/` diberi `noindex` agar undangan klien tidak muncul di Google.

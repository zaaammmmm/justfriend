# Just Friend — Astro + TypeScript

Migrasi awal prototipe `portfolio_pertemanan_v2.html` ke Astro static site, mengikuti PRD `docs/PRD_Portfolio_Pertemanan_v1.2.md` (Opsi A: Astro + GSAP + Lenis + CSS scroll-driven; tanpa React island).

> **Status:** fondasi implementasi dan migrasi layout. Ini belum dinyatakan sebagai rilis produksi. Detail audit dan kriteria yang belum lulus ada di `docs/PRD-v1.2-audit.md`.

## Kebutuhan

- Node.js 20.3+ (disarankan LTS yang masih didukung Astro).
- npm.
- ExifTool untuk membersihkan metadata foto sebelum commit.
- ffmpeg bila menyiapkan video sesuai pipeline PRD.

## Menjalankan

```bash
cp .env.example .env
# Set URL deploy pada environment shell (juga di environment Variables hosting).
export PUBLIC_SITE_URL=https://domain-kamu.example
npm install
npm run dev
```

Build dan preview:

```bash
npm run check
npm run build
npm run preview
```

Output statis berada di `dist/`. Konfigurasi hosting dapat memakai Vercel, Netlify, atau Cloudflare Pages. Jika situs perlu benar-benar privat, aktifkan proteksi akses di sisi hosting; `noindex` bukan autentikasi.

## Mengganti data placeholder

Semua data ada di `src/content/`:

- `members/*.json` — nama, panggilan, fakta, foto, tanda tangan, consent.
- `moments/*.json` — slug, tanggal, cerita, foto, featured, consent.
- `jokes/*.json` — kutipan inside jokes (maks. 80 karakter) dan consent.
- `gallery/*.json` — foto galeri, caption, urutan, rotasi, consent.
- `videos/*.json` — ambient/story, poster, sumber, rasio, consent, transkrip/caption.

Aset gambar pada JSON menggunakan path relatif ke file konten. Ganti PNG placeholder dengan foto AVIF/WebP/JPEG yang sudah mendapat persetujuan. Perbarui path di JSON. **Jangan memasukkan foto orang tanpa izin.** `consent` wajib bernilai `true`; schema Zod akan menggagalkan validasi bila nilainya tidak `true`. `hidden: true` mengecualikan entri dari HTML yang dirender.

`consent: true` pada data seed hanya menandai konten placeholder sintetis, bukan persetujuan dari orang sungguhan. Jangan menyalin nilai itu untuk foto/kutipan nyata sebelum izin diperoleh.

### Menghapus seseorang / materi

1. Set `hidden: true` pada entri terkait.
2. Hapus juga referensi aset yang tidak lagi digunakan.
3. Jalankan `npm run build`, deploy ulang (target proses ≤ 24 jam sesuai PRD).
4. Jika file pernah berada di repo publik, hapus dari riwayat Git bila diperlukan (history rewrite) dan bersihkan cache CDN. `hidden` hanya menghilangkan entri dari HTML; bukan penghapusan riwayat Git.

## Privasi aset

Sebelum menambahkan foto ke repositori, bersihkan EXIF/lokasi **pada file sumber**, bukan hanya ketika build:

```bash
sudo apt install libimage-exiftool-perl
./scripts/strip-image-metadata.sh public/images/foto-anggota.webp
```

Periksa hasilnya dengan `exiftool -a -G1 -s public/images/foto-anggota.webp`. Gunakan repo privat bila materi tidak boleh diunduh publik. Jangan menaruh token, URL privat, atau data sensitif di file konten.

Video cerita dimuat hanya setelah tombol dipilih. Koleksi seed saat ini berisi 3 ambient dan 1 story, tetapi semuanya masih `sourceReady: false` sehingga poster saja yang dirender. Video ambient memakai IntersectionObserver, `preload="none"`, `muted`, `playsinline`, batas 1 di mobile/2 desktop, dan poster fallback. File video belum disediakan; letakkan di `public/video/` atau sesuaikan URL ke object storage/CDN yang mendukung range request. Encode tanpa audio untuk ambient dan buang metadata:

```bash
ffmpeg -i in.mov -an -map_metadata -1 -vf "scale=-2:720,fps=24" -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart public/video/ambient-720.mp4
ffmpeg -i in.mov -an -map_metadata -1 -vf "scale=-2:720,fps=24" -c:v libvpx-vp9 -crf 36 -b:v 0 public/video/ambient-720.webm
```

## Font dan gambar produksi

Prototype v2 memakai Google Fonts dan foto Unsplash. Migrasi ini sengaja menghindari request font pihak ketiga dan memakai fallback sistem sampai font berlisensi siap. PRD mengharuskan font WOFF2 subset total ≤120 KB, maksimal 2 file preload, lisensi diverifikasi, dan fallback `size-adjust`; tambahkan font lokal yang telah dipilih sebelum rilis. Foto tempat nyata hero, lapisan parallax 3–5, foto candid, ephemera, tanda tangan hasil scan, grain tile, serta OG final 1200×630 juga masih perlu diganti dari placeholder.

`PUBLIC_SITE_URL` harus diisi pada environment proses build (shell/hosting) agar canonical dan `og:url` valid; `astro.config.mjs` membaca `process.env`. Meta `noindex,nofollow` dan `robots.txt` disiapkan sesuai PRD. Untuk pengujian preview WhatsApp, deploy ke URL staging yang dapat diakses crawler lalu uji menggunakan URL inspector/preview nyata.

## Arsitektur

```text
src/
  content.config.ts
  content/{members,moments,jokes,gallery,videos}/
  components/{BaseLayout,Splash,Hero,MemberList,Timeline,StackCards,Marquee,HorizontalGallery,VideoClip,Closing,StoryDialog}.astro
  pages/index.astro
  scripts/
    main.ts
    motion.ts
    splash.ts
    smooth-scroll.ts
    video.ts
    fallbacks.ts
    animations/*.ts
public/{images,video}/
scripts/{validate-assets.mjs,strip-image-metadata.sh}
docs/{PRD_Portfolio_Pertemanan_v1.2.md,PRD-v1.2-audit.md,portfolio_pertemanan_v2.html}
```

Satu halaman Astro dirender statis; data koleksi dikompilasi ke HTML. GSAP/Lenis hanya diinisialisasi di browser. Koleksi foto menggunakan `image()` Astro Content Collections + Zod; gambar ditransformasikan melalui `astro:assets` ke WebP responsive variants. Tidak ada SPA atau React island.

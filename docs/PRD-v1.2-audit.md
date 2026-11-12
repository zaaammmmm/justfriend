# Audit migrasi HTML v2 → Astro (PRD v1.2)

Tanggal: 12 November 2026. Sumber utama: `PRD_Portfolio_Pertemanan_v1.2.md` dan `portfolio_pertemanan_v2.html` yang tersimpan bersama proyek.

## Ringkasan hasil

HTML v2 memberi dasar visual gelap-sinematik dan alur: hero, kolase polaroid, anggota, timeline, kartu momen, inside jokes, video poster, galeri, penutup, dialog, dan share. Keterbatasan prototipe v2: data statis, lima polaroid, foto Unsplash/font Google eksternal, video hanya poster, drag Pointer Events tanpa inersia GSAP, belum ada consent schema, dan belum ada arsitektur Astro.

Migrasi ini membentuk static Astro + TypeScript dengan komponen terpisah, Content Collections + Zod, `image()` untuk aset, Astro Image transforms, Lenis + GSAP/ScrollTrigger, modul animasi yang lazy-import plugin tambahan, dialog native, serta kontrol reduced-motion. Seluruh data dan aset yang disertakan adalah placeholder sintetis.

## Status 20 acceptance criteria

Legenda: **Fondasi** berarti implementasi utama ada, belum berarti lulus QA; **Parsial** berarti sebagian requirement belum dipenuhi; **Belum** berarti belum ada implementasi; **Belum diuji** berarti perlu pengukuran browser/perangkat/deploy.

| # | Kriteria | Status | Catatan implementasi / sisa pekerjaan |
|---:|---|---|---|
| 1 | Lenis sinkron dengan ScrollTrigger; pin/scrub stabil | Fondasi, belum diuji | GSAP ticker menjalankan Lenis RAF dan memanggil `ScrollTrigger.update`; horizontal gallery memakai pin/scrub. Uji iOS Safari dan scroll cepat masih wajib. |
| 2 | Polaroid drag, inertia, bounds, tilt velocity | Fondasi, belum diuji | `Draggable` + `InertiaPlugin`, bounds hero, tilt berdasarkan velocity, dan tombol panah keyboard ada di `animations/hero.ts`. Uji touch/throw/bounds belum dilakukan. |
| 3 | Judul kinetic width-neutral tanpa layout shift | Parsial | Huruf judul dipisah saat markup dan dianimasikan per huruf; hover lift tersedia. Variable font dengan sumbu width-neutral/weight dan CLS ≤0,05 belum disiapkan/diukur. |
| 4 | Timeline SVG digambar saat scroll, titik akurat, keyboard, path mobile | Fondasi, belum diuji | Dua path SVG; `getPointAtLength` + sampling dipakai untuk memetakan posisi titik ke progres path. Titik berupa button. Perlu uji resize dan pembaca layar. |
| 5 | Stacking cards CSS view timeline + fallback GSAP | Fondasi, belum diuji | `view-timeline-name`, `timeline-scope`, `animation-timeline` dan fallback `ScrollTrigger` tersedia; kartu terakhir tidak diberi `has-next`. Uji Chrome/Safari/iOS diperlukan. |
| 6 | Progress bar CSS scroll timeline + fallback | Fondasi, belum diuji | CSS `@supports (animation-timeline: scroll())`; fallback GSAP hanya saat tidak didukung. |
| 7 | Marquee arah/kecepatan, hover 0,2×, pause, visibility | Fondasi, belum diuji | `Lenis` velocity mengatur arah/boost, hover memperlambat, tombol pause, `IntersectionObserver`, cleanup ticker/listener. Uji timeScale negatif dan lifecycle. |
| 8 | Gallery pinned desktop, native mobile, keyboard focus mapping | Fondasi, belum diuji | Desktop fine pointer memakai pin/scrub; mobile memakai overflow + scroll-snap; fokus item dipetakan ke progres vertikal dan `scrollLeft` direset. Uji keyboard/iOS. |
| 9 | Dialog, Esc, focus management, deep link, Lenis stop | Fondasi, belum diuji | Native `<dialog>` menyediakan modal focus handling/Esc; slug `#momen-*`, close/focus restore, dan Lenis stop/start ditangani. Uji browser aktual. |
| 10 | Reduced motion OS dan manual; konten tetap terlihat | Fondasi, belum diuji | `prefers-reduced-motion`, preferensi manual session-scoped, CSS fallback, dan teardown animasi tersedia. Perlu QA screen reader dan toggle berulang. |
| 11 | Splash/intro ≤2,5 detik, skip, DOM removal | Fondasi, belum diuji | Critical image/font wait, minimum display, timeout, skip pointer/keyboard, unlock Lenis, dan failsafe inline 2,5 detik. Ukur waktu nyata pada jaringan lambat. |
| 12 | Consent wajib; `hidden:true` tidak masuk HTML | Fondasi | Zod `consent: z.literal(true)` pada semua koleksi; page memfilter `hidden`. `scripts/validate-assets.mjs` memeriksa consent, hidden, dan file aset. Perlu tes negatif dengan fixture consent false/missing. |
| 13 | Metadata foto/lokasi tidak tertinggal | Prosedur tersedia, belum diverifikasi | Skrip ExifTool disediakan. Jalankan pada file asli yang akan dipublikasikan dan periksa hasilnya; placeholder tidak menggantikan proses izin. |
| 14 | Target performa PRD (LCP/CLS/INP/JS/FPS) | Belum diuji | Belum ada Lighthouse/WebPageTest, bundle gzip, long-task, frame-rate, atau pengukuran Android nyata. |
| 15 | Meta statis dan preview aplikasi chat | Fondasi, belum diuji | Title/description/canonical/OG/Twitter/noindex/robots statis; OG masih placeholder. Perlu `PUBLIC_SITE_URL` nyata, staging crawl, dan uji preview WhatsApp/Telegram. |
| 16 | Ambient video lazy, pause out-of-view, concurrency, poster fallback | Fondasi, belum diuji | `sourceReady` mengontrol render; jika aktif, video memakai `preload=none`, observer, save-data guard, batas 1 mobile/2 desktop, poster fallback, dan cleanup. Tiga data ambient masih `sourceReady:false`; file/budget belum diuji. |
| 17 | Story video klik, keyboard controls, caption/transkrip | Parsial | Dialog dan native video controls, `preload=metadata`, caption/transkrip tersedia; seed story `sourceReady:false`, jadi belum ada file yang benar-benar diputar. |
| 18 | Kontras/ukuran teks dan visual sesuai PRD | Parsial | Palet gelap/kertas/amber dan batas glow diikuti; beberapa label masih 10–11 px. Audit kontras 4,5:1 dan ukuran minimum belum dilakukan. |
| 19 | Sticky lintas browser dan overflow-x aman | Fondasi, belum diuji | `overflow-x: clip`, `scrollbar-gutter: stable`, dan sticky stack; Safari/iOS/WebView belum diuji. |
| 20 | Parallax 3–5 layer, ≥45 fps Android, LCP ≤2,5 s | Parsial | Modul parallax tersedia, tetapi hero saat ini hanya memiliki satu layer latar. Layer foto terpisah, responsive variants, FPS dan LCP belum dibuat/diukur. |

## Gap utama sebelum rilis

1. **Konten nyata belum diberikan.** Nama, fakta, kutipan, cerita, foto, tanggal, video, tiket/ephemera, tanda tangan, tekstur, dan OG harus diganti/ditinjau pemilik. Semua entri seed diberi `placeholder: true`; tidak ada foto orang nyata di paket.
2. **Jumlah dan variasi.** Seed saat ini: 6 anggota, 7 momen (5 featured), 12 jokes, 6 foto galeri, 3 ambient placeholder, 1 story placeholder, dan 5 ephemera. Jumlah memenuhi beberapa rentang PRD, tetapi aset visualnya masih placeholder.
3. **Font.** Font eksternal Google tidak digunakan. Saat ini fallback sistem; font WOFF2 berlisensi, subset total ≤120 KB, maksimal 2 preload, dan fallback `size-adjust` belum dipasang.
4. **Hero/parallax.** Baru satu layer background; PRD meminta 3–5 layer dan pengukuran FPS. Kinetic variable-font width-neutral belum ada.
5. **Member details.** Hover-follow photo, Flip tap-to-expand, signature DrawSVG, dan cursor label memiliki fondasi kode; belum diuji. Signature SVG per anggota belum disediakan.
6. **Video.** Tiga ambient dan satu story terdaftar, tetapi `sourceReady:false`. Tambahkan file WebM/MP4, poster teroptimasi, transkrip/caption, metadata bersih, dan ukur budget byte sebelum mengaktifkan `sourceReady`.
7. **Privasi.** `consent:true` pada seed hanya untuk konten sintetis, bukan izin dari orang sungguhan. `hidden:true` mengeluarkan item dari HTML build, tetapi tidak menghapus Git history, cache CDN, atau file yang sudah diunduh.
8. **Analitik.** Tidak ada analytics/tracker pada starter. Jika dibutuhkan, gunakan opsi tanpa cookie sesuai PRD dan dokumentasikan.

## Verifikasi yang dilakukan di lingkungan pembuatan

- `node --check astro.config.mjs` dan `node --check scripts/validate-assets.mjs`.
- `bash -n scripts/strip-image-metadata.sh`.
- `node scripts/validate-assets.mjs`: memeriksa JSON koleksi, `consent`, `hidden`, dan referensi gambar lokal.
- `astro check` dan `astro build` **belum dijalankan** karena `npm install` mengalami timeout di lingkungan ini. Belum ada klaim build sukses atau acceptance criteria lulus.

## Risiko teknis untuk QA berikutnya

- Pastikan seluruh plugin GSAP yang diimpor (`Draggable`, `InertiaPlugin`, `Flip`, `SplitText`, `DrawSVGPlugin`, `CustomEase`, `CustomBounce`) tersedia di versi paket yang dipasang.
- Uji Lenis + ScrollTrigger pin/scrub di iOS Safari dan pastikan cleanup tidak meninggalkan ticker/observer/listener.
- Uji CSS view timeline dan fallback GSAP pada browser target.
- Ukur bundle awal gzip ≤120 KB sesuai opsi arsitektur, LCP/CLS/INP, frame rate Android, dan video bytes.
- Uji aksesibilitas keyboard, focus restoration, kontras, reduced-motion, serta preview OG di aplikasi chat.

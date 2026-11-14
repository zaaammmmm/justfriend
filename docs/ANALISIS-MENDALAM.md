# Analisis Mendalam & Hardening — Just Friend

Tanggal audit: 14 November 2026  
Basis: source code dan dokumentasi yang terdapat di `justfriend.zip` (Astro 5, TypeScript, GSAP/ScrollTrigger, Lenis, Three.js). Audit ini bukan klaim browser QA; build penuh dan pengujian lintas perangkat belum berhasil dijalankan di lingkungan audit.

## Ringkasan eksekutif

**Kualitas fondasi: baik; kesiapan rilis: belum.** Struktur Astro, Content Collections + Zod, pemisahan komponen, motion modules, kontrol reduced-motion, native dialog, dan validasi konten merupakan fondasi yang cukup matang. PRD/audit internal juga transparan soal banyak kriteria yang baru berstatus fondasi.

Risiko tertinggi bukan kekurangan efek visual, melainkan **beban runtime animasi, integritas navigasi/responsive, aksesibilitas saat motion dimatikan, dan proses konten/privasi yang belum menjadi release gate**. Menambah animasi sebelum isu ini ditangani akan memperbesar biaya debugging dan menurunkan performa.

## Temuan prioritas

### P0 — harus diselesaikan sebelum publikasi

| Temuan | Bukti/lokasi | Dampak | Rekomendasi |
|---|---|---|---|
| Konten seed dan consent dapat salah dipahami sebagai izin nyata | `src/content/**/*.json`, `content.config.ts` | `consent: true` pada seed sintetis bukan persetujuan orang yang fotonya dipakai. `hidden` hanya mencegah render pada build baru; tidak menghapus Git history/CDN/unduhan. | Gate rilis terpisah: inventaris subjek, bukti persetujuan, pemilik konten, tanggal review, dan prosedur takedown. Jangan commit aset asli sebelum izin. |
| Mode publik/private tidak punya konfigurasi release yang tegas | `BaseLayout.astro`: robots selalu `noindex,nofollow`; `astro.config.mjs`: `example.invalid` fallback | Deploy bisa tidak terindeks walau sengaja public; canonical/OG bisa menunjuk domain placeholder jika env terlupa. | Jadikan `PUBLIC_SITE_URL` wajib saat production; kontrol `PUBLIC_INDEXABLE`/robots dengan default aman `false`; fail build bila URL masih placeholder. |
| WebGL shader berpotensi menghabiskan GPU dan context | `src/scripts/animations/horizontal.ts → initGalleryShaders()` | Renderer, ticker, texture loader dibuat per gambar; semua gambar dirender terus-menerus walau offscreen. Banyak canvas/context dapat menabrak batas browser, boros baterai/HP. | Maksimal satu renderer/context (shader satu canvas overlay) atau cap renderer; lazy-load texture; render hanya ketika terlihat/velocity aktif; fallback gambar asli; teardown saat reduced-motion/visibility. |

### P1 — bug/risiko pengalaman yang signifikan

| Temuan | Bukti/lokasi | Dampak | Rekomendasi |
|---|---|---|---|
| Timeline memilih SVG berdasarkan viewport hanya sekali | `animations/timeline.ts`, pemilihan `.timeline-tall`/`.timeline-wide` saat init | Resize melewati breakpoint 639 px bisa membuat path yang dipakai tersembunyi/keliru; titik progress tidak dihitung ulang pada refresh. | Rebuild trigger/path/fractions saat media query berubah; hitung ulang setelah layout/image load; batasi sampling atau gunakan koordinat yang dirancang langsung. |
| Splash mem-preload aset placeholder, bukan aset hero aktual | `components/BaseLayout.astro`, `scripts/splash.ts` | Menunggu gambar yang tidak selalu menjadi LCP; splash bisa menambah waktu menuju konten tanpa membantu kesiapan visual. | Ambil URL hero dari data yang benar, atau hilangkan image wait dan prioritaskan hero `<img fetchpriority=high>`/decode. Splash harus non-blocking dan tidak menahan scroll saat JS gagal. |
| Boot mengatur scroll ke 0 pada `load` | `scripts/main.ts` | Deep link/anchor dan browser back-forward restoration dapat terganggu; scroll pengguna bisa dipaksa ke atas setelah navigasi. | Hanya reset scroll jika splash/intro memang aktif dan URL tidak berisi hash; hormati `scrollRestoration`. |
| Async cleanup berpotensi datang setelah teardown | `scripts/main.ts → addAsyncCleanup()` | Promise init dapat resolve sesudah motion dimatikan; ada kondisi guard, tetapi lifecycle toggle cepat perlu diuji. | Gunakan generation token/AbortController per setup; semua initializer async menerima signal dan idempotent teardown. |
| Dialog hash memakai decodeURIComponent tanpa guard | `scripts/main.ts → openFromHash()` | Hash malformed dapat melempar exception; deep-link hanya membuka jika tombol sudah ada. | `try/catch` decode, validasi slug, fokus heading/dialog, dan fallback URL yang aman. |
| Header/controls event lifecycle | `main.ts`, `initFloatingHeader`, `initGlobalControls` | Listener global tidak memiliki teardown; aman untuk satu page load, tetapi menghambat hot navigation/Astro view transitions jika kelak dipakai. | Buat satu lifecycle root dan AbortController; dokumentasikan bahwa view transitions belum didukung. |

### P2 — kualitas, maintainability, dan polish

- **Motion preference:** `sessionStorage` berarti pilihan manual hilang saat tab/sesi baru. Pertimbangkan `localStorage` (dengan fallback aman) agar pilihan bertahan; jangan override preferensi OS.
- **Aksesibilitas:** perlu audit nama aksesibel pada canvas image-sequence, gallery shader (decorative), dialog, tombol anggota, label motion toggle, video caption/transcript, focus ring di latar paper/graphite, serta kontras label kecil. `role=img` pada canvas harus punya deskripsi tekstual alternatif yang bermakna.
- **Video:** `sourceReady:false` membuat story belum dapat diputar. Untuk sumber yang aktif, validasi MIME, caption VTT lokal, poster, transkrip, durasi, ukuran, dan fallback error harus masuk acceptance test. Video remote sebaiknya HTTPS dan allowlist host.
- **Content schema:** `date` hanya regex, sehingga `2026-99-99` lolos; `aspect` berupa string bebas; `mp4` bebas; `signaturePath` bebas; `fact`/`quote` tidak selalu wajib. Perketat validasi tanggal kalender, rasio, URL/path, dan field yang harus tampil.
- **Asset pipeline:** `validate-assets.mjs` awal hanya cek JSON, consent/hidden, dan file foto/poster; belum mendeteksi slug duplikat, path traversal, source video HTTP, atau placeholder yang belum ditandai. Hardening validator telah diterapkan dalam patch ini.
- **SEO/share:** OG image masih `og-placeholder.png`; `description` generik; canonical membutuhkan domain nyata; `noindex` sesuai mode invite-only tetapi perlu keputusan eksplisit. Tes preview harus dilakukan dari URL deploy, bukan localhost.
- **Responsive:** beberapa animasi memakai breakpoint media query saat init; semua breakpoint motion harus diuji saat resize/orientation change, bukan hanya reload.
- **Dependency:** `three` dan plugin GSAP menambah biaya. Cek apakah `Three.js` benar-benar hanya dipakai shader; lakukan dynamic import setelah section masuk viewport dan fallback tanpa WebGL.
- **Type safety:** hindari `any` dan casts DOM yang tidak diverifikasi; gunakan helper query/assert dan null guards. `astro check` wajib menjadi gate CI.
- **Observability:** belum ada error reporting ringan untuk kegagalan WebGL/video/animasi. Setidaknya `console.warn` yang terkontrol + fallback UI, tanpa analytics personal/cookie.

## Pemetaan arsitektur saat ini

- **Rendering:** Astro static output; data disimpan di JSON Content Collections.
- **Layout:** `BaseLayout` memasang metadata, splash, progress, cursor, dan script utama.
- **Sections:** Hero → MemberList → image sequence → Timeline → StackCards → Marquee → VideoClip → HorizontalGallery → Closing.
- **Motion:** `main.ts` menjadi orchestrator; Lenis/GSAP/ScrollTrigger sinkron; initializer terpisah di `src/scripts/animations`.
- **Privasi:** `consent` wajib di schema dan `hidden` difilter saat page build; ini adalah kontrol publikasi, bukan penghapusan permanen.
- **Data:** 35 JSON entry terdeteksi; validator lama berhasil pada seed. Data/aset seed tetap harus diganti dan direview.

## Perubahan yang disertakan pada paket hasil

1. `scripts/validate-assets.mjs` diperkeras:
   - path aset lokal harus berada dalam direktori yang diizinkan (anti path traversal);
   - foto/poster yang didefinisikan wajib benar-benar ada;
   - `sourceReady` memerlukan sumber valid dan file lokal/HTTPS;
   - HTTP video remote ditolak;
   - slug dalam koleksi yang sama harus unik;
   - order harus positif;
   - `placeholder` yang belum eksplisit memberi warning.
2. Dokumen audit ini menjadi backlog dan release checklist, bukan klaim semua isu sudah diperbaiki.

## Release gate yang disarankan

- [ ] `npm ci` bersih dan `npm run build` sukses.
- [ ] `PUBLIC_SITE_URL` domain deploy valid; mode `noindex`/indexing dipilih secara sadar.
- [ ] Semua placeholder diganti atau tetap jelas ditandai; persetujuan tiap orang tercatat.
- [ ] `sourceReady` hanya true jika file video, poster, caption/transkrip, dan izin lengkap.
- [ ] Lighthouse mobile: LCP ≤2,5 s, CLS ≤0,05, INP ≤200 ms (target), tanpa long task besar.
- [ ] Android menengah: FPS shader/scroll diukur; tidak ada context loss; fallback WebGL berfungsi.
- [ ] Keyboard-only: nav, anggota, timeline, gallery, dialogs, video, share, motion toggle.
- [ ] Reduced motion OS + manual: tidak ada scroll lock, elemen tidak tersembunyi, dialog tetap berfungsi.
- [ ] iOS Safari + Chrome Android + WhatsApp WebView: scroll, pinned sections, video, hash, share.
- [ ] Uji hash valid/tidak valid, refresh di dialog, back/forward, resize melewati breakpoint, dan load lambat.
- [ ] Preview OG WhatsApp/Telegram sesuai; link invite-only tidak bocor melalui sitemap/index.
- [ ] Prosedur penghapusan: remove dari source, rebuild, purge cache, audit git history dan salinan eksternal.

## Urutan peningkatan paling efektif

1. **Reliability & privacy gate** (validator, env, consent, content release).
2. **Runtime budget** (shader/WebGL, lazy loading, dynamic import Three, no-motion path).
3. **Responsive correctness** (timeline, resize, scroll restoration, hash/dialog).
4. **Accessibility** (semantic alternatives, focus, contrast, keyboard, reduced-motion).
5. **Performance QA** (Lighthouse, Android profiling, WebView).
6. **Editorial polish** (materi asli, font berlisensi, OG, copywriting, pacing animasi).

Kesimpulan: Just Friend sudah memiliki fondasi teknis dan art direction yang kuat. Peningkatan paling bernilai saat ini adalah mengubah fondasi tersebut menjadi sistem yang aman, terukur, dan tahan kondisi nyata—bukan menambah efek animasi baru.

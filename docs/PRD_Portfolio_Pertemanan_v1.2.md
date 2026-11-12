# PRD: Portfolio Pertemanan

*Versi 1.2 · Product Requirements Document · Arsip kenangan interaktif gelap-sinematik dengan animasi GSAP, Lenis, CSS scroll-driven, dan video*

## 0. Catatan Revisi dan Keputusan

### 0.1 Perubahan dari v1.1

| Area | Perubahan |
| --- | --- |
| Arah visual | **D1 diputuskan: gelap-sinematik, nostalgia-reflektif**, mengacu pada situs referensi Karangdukuh. Dasar `#050505`, kartu kertas krem yang sedikit miring, tipografi editorial raksasa. Palet, tempo, dan token diganti (5.1, 5.3, 5.4). |
| Aturan cahaya | Tema gelap rawan jatuh ke glow, blob blur, dan gradien warna-warni. Cahaya kini wajib punya sumber; hal-hal tersebut dilarang kecuali pengecualian terdaftar (5.3). |
| Tipografi | Sistem editorial: kata hantu raksasa, label vertikal, label kapital kecil; batas ukuran dan kontras minimum (5.3, 9.2). |
| Splash | Splash di HTML awal dengan CSS kritis inline, tampil minimum 900 ms pada kunjungan pertama, keluar 1,35 s, lalu dihapus dari DOM (6.0, 8.13). |
| Hero | Lapisan parallax dari foto tempat nyata, objek hero opsional, kandidat LCP diperbarui (6.1). |
| Video (baru) | Bagian 6.9: klip ambient dan video cerita, anggaran, fallback, aksesibilitas, pipeline ffmpeg, kontroler (8.12). |
| Berbagi | Meta OG, description, theme-color, dan `noindex` wajib ada di HTML statis; uji pratinjau WhatsApp (FR-7.11). |
| CSS dasar | `overflow-x: clip` (bukan `hidden` ganda) agar `position: sticky` aman; `scrollbar-gutter: stable` (FR-7.12). |
| Font | WOFF2 yang di-subset, maksimum 2 file dipreload, lisensi diperiksa; efek kinetic hanya untuk font variable (FR-1.14). |
| Analitik | Analitik tanpa cookie (FR-7.13). |
| Rencana | 5,5–6,5 minggu (bagian 13). |

### 0.1b Riwayat v1.0 ke v1.1 (ringkas)

Perbaikan bug progress bar (`@supports`), stacking cards digerakkan timeline kartu berikutnya, judul kinetic lebar-stabil, `scrub: true` bersama Lenis, default GSAP penuh tanpa React/Motion, penambahan intro, Motion Language, busur narasi, dialog, toggle "kurangi gerak", privasi (EXIF, "hapus saya"), dan skema konten Zod. Semuanya tetap berlaku.

### 0.2 Keputusan

| # | Keputusan | Status / default | Dampak jika berubah |
| --- | --- | --- | --- |
| D1 | Mood | **Diputuskan:** gelap-sinematik, nostalgia-reflektif | Palet, tempo, rotasi, aturan cahaya |
| D2 | Stack animasi | **Opsi A** (GSAP penuh + Lenis + CSS scroll-driven). Referensi memakai React SPA; PRD tetap memakai HTML statis (Astro) karena meta berbagi dan LCP | Opsi B menambah React + Motion (sekitar 70 KB lebih berat) |
| D3 | Detail momen | Dialog dalam halaman dengan deep link `#momen-slug` | Halaman terpisah menuntut Lenis persisten dan pembersihan ScrollTrigger |
| D4 | Akses | Tautan tak terdaftar + `noindex`; proteksi sandi lewat fitur hosting bila perlu | Sandi sisi-klien bukan perlindungan nyata |
| D5 | Bahasa | Indonesia; label/tagline pendek berbahasa Inggris boleh bila disengaja | Dua bahasa penuh menambah skema konten dan memengaruhi tata letak |
| D6 | Video | 3–6 klip ambient (≤ 8 s, tanpa audio) + maksimal 3 video cerita klik-untuk-putar; di-host sendiri | Jumlah dan durasi menentukan anggaran data dan hosting |
| D7 | Objek hero | **Belum ditetapkan** (opsional) | Perlu objek bermakna bagi geng, dirakit dari bagian terpisah |
| D8 | Styling | CSS biasa dengan custom property; Tailwind v4 diperbolehkan | Tidak memengaruhi arsitektur animasi |

## 1. Ringkasan

Portfolio Pertemanan adalah website satu halaman yang merayakan sebuah geng atau lingkaran pertemanan. Bentuknya **arsip kenangan sinematik**: ruang gelap tempat kenangan menyala satu per satu, berupa cetakan foto krem yang sedikit miring di atas dasar hitam, tipografi editorial raksasa, tulisan tangan, kutipan grup chat, dan video singkat yang hidup. Animasi adalah cara bercerita: lapisan latar bergeser membuka cerita, foto "dijatuhkan" ke meja, tanda tangan anggota digambar ulang, garis kenangan tergambar mengikuti scroll, dan inside jokes berjalan sebagai marquee yang bereaksi terhadap kecepatan scroll.

**Pernyataan utama:** sinematik bukan berarti berlebihan. Tempo lambat dan terukur, **setiap cahaya punya sumber dan setiap gerak punya makna**. Jumlah gerak boleh banyak, asalkan semuanya berasal dari bahasa gerak yang sama (5.4) dan melayani busur cerita yang sama (5.5).

## 2. Latar Belakang dan Masalah

Kebanyakan website personal atau komunitas terlihat generik. Di tema terang bentuknya gradient ungu-biru dan fade-up di setiap blok. Di tema gelap bentuknya glow neon, blob blur, gradien warna-warni, dan kartu kaca (glassmorphism). Pertemanan itu personal, hangat, dan sedikit berantakan, sehingga bahasa visualnya harus lahir dari **materi asli kelompok itu**, bukan dari resep gaya.

**Masalah yang diselesaikan:**

- Kenangan bersama tersebar di galeri HP, grup chat, dan media sosial, tanpa satu tempat yang bercerita utuh.
- Template yang ada terasa korporat dan tidak memuat karakter kelompok.
- Animasi sering berlebihan atau terputus dari makna, sehingga mengganggu konten dan performa.
- Situs sinematik sering dibangun sebagai SPA yang kosong bagi crawler: pratinjau tautan di aplikasi chat kehilangan judul, deskripsi, dan gambar, padahal berbagi lewat tautan adalah tujuan utama.

## 3. Tujuan dan Non-Tujuan

### Tujuan

1. Menyajikan kenangan dan anggota geng dalam satu pengalaman berkarakter yang mudah dibagikan lewat tautan.
2. Memberi pengalaman beranimasi kaya, modern, dan sinematik: splash, koreografi intro, bahasa gerak konsisten, micro-interaction, dan video.
3. Berjalan mulus (target 60 fps) di laptop menengah dan ≥ 45 fps di HP Android kelas menengah.
4. Berfungsi penuh tanpa animasi bagi pengguna `prefers-reduced-motion` atau yang menyalakan toggle "kurangi gerak".
5. Mudah diperbarui: menambah foto, momen, atau video cukup lewat file konten, tanpa menyentuh kode animasi.
6. Memiliki busur emosional (pembukaan, perkenalan, perjalanan, puncak, tawa, penutup), bukan kumpulan demo teknik.
7. Pratinjau tautan yang benar di WhatsApp dan aplikasi chat lain, serta hemat data seluler.

### Non-Tujuan

- Bukan media sosial: tidak ada login, komentar publik, atau feed.
- Bukan CMS penuh: konten dikelola lewat file di repositori.
- Tidak memakai glow pada judul, aurora, blob blur, gradien warna-warni, atau glassmorphism (pengecualian terdaftar di 5.3).
- Tidak ada animasi 3D berat sepanjang halaman.
- Tidak ada audio yang berputar otomatis; suara hanya atas aksi pengguna.

## 4. Pengguna

| Persona | Deskripsi | Kebutuhan |
| --- | --- | --- |
| **Anggota geng** (utama, 5–15 orang) | Teman yang ada di dalam cerita | Merasa terwakili, menemukan foto dan jokes sendiri, bangga membagikannya |
| **Pengunjung baru** | Teman dari teman, keluarga, pasangan | Memahami siapa saja anggota dan seperti apa kelompoknya dalam 2 menit |
| **Kontributor / pembuat** | Satu atau dua orang yang merawat situs | Menambah konten dengan mudah dan tidak merusak animasi |

Konteks pembukaan: tautan hampir pasti dibagikan lewat WhatsApp, Instagram, atau aplikasi chat lain, sehingga banyak kunjungan terjadi di **browser dalam aplikasi (WebView)**. Itu bagian dari matriks uji (bagian 9.3).

Perkiraan: banyak pengunjung membuka tautan lewat data seluler, sehingga gambar dan video harus hemat (9.1, FR-V9).

## 5. Konsep Kreatif dan Arah Visual

### 5.1 Metafora dan Mood

**Metafora:** ruang gelap dengan satu lampu atau layar menyala. Kenangan muncul sebagai cetakan foto krem yang terang di atas dasar hitam, bersama kata-kata raksasa yang nyaris tak terlihat di latar.

**Mood:** nostalgia-reflektif ("mengingat kembali"): tenang, lambat, dan hangat, bukan jenaka.

| Parameter | Nilai |
| --- | --- |
| Dasar | `#050505` |
| Rotasi kartu foto | ±2–5° (bawaan ±3°), deterministik |
| Tempo | `--dur-base` 0,6 s; adegan besar 1,35–1,6 s |
| Aksen | satu: amber `#D9A21B`, hanya untuk sumber cahaya kecil dan penanda |
| Tulisan tangan | tipis, rapi, terang |
| Grain | tipis, statis |
| Jatuhnya foto | mendarat tenang, tanpa memantul |

### 5.2 Materi Asli (pembeda utama)

Pembeda dari situs generik adalah materi yang hanya dimiliki geng ini. Dokumen ini mewajibkan, bukan menganjurkan:

- **Foto tempat nyata** sebagai lapisan latar hero (FR-1.11).
- **Tulisan tangan anggota sungguhan.** Pindai tulisan tangan tiap anggota. Tanda tangan di-trace menjadi SVG (6.2); satu kalimat dijadikan font tulisan tangan lewat layanan pembuatan font dari scan, atau dipakai sebagai SVG untuk caption penting.
- **Ephemera nyata:** tiket, struk, stiker, catatan yang dipindai. Tekstur kertas pada kartu berasal dari scan kertas sungguhan, bukan generator.
- **Kutipan chat apa adanya** (dengan izin), termasuk salah ketik.
- **Video dokumenter singkat** dari momen sungguhan (6.9).
- **Detail spesifik:** setiap section memuat minimal satu hal yang hanya dimengerti orang dalam.

### 5.3 Palet, Tipografi, Tekstur, Cahaya

**Palet (token):**

| Token | Nilai | Pemakaian |
| --- | --- | --- |
| `--bg` | `#050505` | Dasar halaman |
| `--bg-raise` | `#0B0B0C` | Permukaan terangkat |
| `--ink` | `#EDE8DD` | Teks (kontras ≈ 16:1 di atas `--bg`) |
| `--paper` | `#F2EBDD` | Kartu foto/cerita |
| `--paper-ink` | `#1B1A17` | Teks di atas kartu kertas |
| `--accent` | `#D9A21B` | Sumber cahaya kecil, penanda aktif |

**Tipografi (sistem editorial):**

- **Display:** font dengan karakter untuk judul dan kata hantu. Bila font display tidak variable (mis. script display statis), FR-1.14 berlaku.
- **Badan:** sans netral, dipilih dengan sengaja (bukan sekadar bawaan).
- **Caption:** tulisan tangan (5.2).
- **Skala:** judul berbasis `clamp()` dan satuan vw; bagian berukuran besar memakai `svh`/`dvh` agar aman di layar seluler.
- **Kata hantu:** teks 18–30vw dengan opacity 2–4% dan garis tepi 1px sekitar 3%; `aria-hidden`, `pointer-events: none`, tidak memuat informasi, maksimal dua per viewport; dikecualikan dari aturan kontras karena dekoratif.
- **Label vertikal:** `writing-mode: vertical-rl` untuk penanda section.
- **Label kapital kecil:** jarak huruf 0,22–0,45em, ukuran ≥ 11 px, kontras ≥ 4,5:1.
- **Batas minimum:** teks informatif ≥ 12 px dan kontras ≥ 4,5:1 (praktisnya `--ink` dengan opacity ≥ 60% di atas `--bg`).
- **Berkas font:** WOFF2 yang di-subset, total ≤ 120 KB, maksimum 2 file dipreload, `font-display: swap` dengan fallback ber-`size-adjust`. Periksa lisensi setiap font, terutama font display.

**Tekstur:**

- **Grain:** tile PNG kecil berulang (opacity 3–5%) pada lapisan fixed, statis. Tanpa `mix-blend-mode` pada lapisan layar penuh (mahal di HP).
- **Vignette:** `radial-gradient` dari transparan di tengah ke `--bg` di tepi, untuk memusatkan perhatian.
- **Titik-grid latar** (`radial-gradient` 1 px, jarak 32 px) boleh dipakai secara hemat.
- **Kartu kertas:** serat dari scan, bayangan jatuh gelap (mis. `0 18px 45px rgba(0,0,0,.35)`).

**Aturan cahaya (anti-slop untuk tema gelap):**

1. **Satu sumber cahaya per section** (lampu meja, layar, jendela) dengan arah yang konsisten.
2. Cahaya diwujudkan lewat vignette/spotlight berpusat jelas dan bayangan jatuh gelap pada kartu terang, bukan lewat glow.
3. **Dilarang:** `text-shadow`/`drop-shadow` glow pada judul, blob blur besar (`blur` ≥ 40 px) sebagai dekorasi, gradien warna-warni pada teks atau latar, kartu `backdrop-filter`.
4. **Pengecualian:** titik penanda kecil (≤ 8 px) yang "menyala" (mis. titik timeline aktif) dengan glow aksen, maksimal satu per viewport.

### 5.4 Motion Language

Semua animasi memakai token berikut, didefinisikan di `tokens.css` dan `motion.ts`.

| Token | Nilai | Dipakai untuk |
| --- | --- | --- |
| `--dur-fast` | 0,25 s | Hover, press, perubahan kecil |
| `--dur-base` | 0,6 s | Reveal, buka/tutup |
| `--dur-slow` | 1,1 s | Elemen besar, transisi section |
| `--dur-scene` | 1,35–1,6 s | Splash keluar, transisi besar, momen puncak |
| Jarak gerak | 12 / 32 / 96 px | Kecil / sedang / besar |
| Stagger | 20–30 ms per huruf, 60–90 ms per elemen | Teks / benda |
| Easing `signature` | `cubic-bezier(0.22, 1, 0.36, 1)` (`CustomEase`) | Gerak terarah |
| Easing `cinema` | `cubic-bezier(0.77, 0, 0.175, 1)` (`CustomEase`) | Adegan masuk-keluar: splash, penutup besar |
| Easing `drop` | `CustomBounce` kekuatan sangat rendah (≈0,1) | Benda mendarat tenang |
| Scrub | `none` (linear), `scrub: true` | Gerak terikat scroll |

**Aturan:**

1. Satu gerak utama di layar pada satu waktu; gerak sekunder amplitudo ≤ 30% dari yang utama.
2. Animasi masuk diputar **sekali** (`once: true`), tidak diulang saat scroll balik, kecuali yang memang terikat scrub.
3. Gerak mengikuti metafora (benda fisik: dijatuhkan, ditempel, digambar, distempel; cahaya: menyala, meredup); tidak ada gerak yang tak punya padanan fisik.
4. Satu elemen hanya dimiliki **satu** sistem animasi.
5. Tempo lambat tidak boleh menunda umpan balik: respons hover dan press ≤ 100 ms (`--dur-fast`).

### 5.5 Busur Narasi

| Babak | Section | Perasaan | Gerak utama |
| --- | --- | --- | --- |
| 1. Datang | Splash + Hero | "Kembali ke sini." | Splash terbuka, lapisan parallax bergeser, foto dijatuhkan |
| 2. Kenal | Anggota | "Ini kita." | Tanda tangan tergambar, foto candid muncul |
| 3. Jalan | Timeline | "Begini awalnya." | Garis tergambar mengikuti scroll |
| 4. Puncak | Momen terbaik | "Yang paling kita ingat." | Cetakan menumpuk, video cerita |
| 5. Tawa | Inside jokes | "Cuma kita yang ngerti." | Marquee reaktif |
| 6. Pulang | Penutup | "Sampai ketemu lagi." | Foto dijemur memanjang ke samping |

Uji busur: tiap section harus bisa menjawab "apa yang penonton rasakan di sini, dan gerak mana yang menyampaikannya?". Section yang tidak bisa menjawab ditinjau ulang.

### 5.6 Uji Anti-Template

Setiap animasi atau efek baru harus lolos empat pertanyaan sebelum masuk:

1. Apa yang gerak ini katakan tentang geng ini, atau tentang benda fisiknya?
2. Kalau dihapus, apakah ada makna yang hilang (bukan hanya "kurang keren")?
3. Apakah efek yang sama muncul di banyak situs portofolio tanpa penyesuaian? Jika ya, apa penyesuaiannya?
4. Untuk cahaya dan bayangan: apa sumbernya?

## 6. Struktur Halaman dan Kebutuhan Fungsional

### 6.0 Splash dan Intro

**Deskripsi:** Splash adalah momen merek pertama dan sudah ada di HTML awal sehingga layar tidak pernah kosong. Sesudahnya, koreografi intro membuka hero.

- FR-0.1: Splash berada di **HTML statis dengan CSS kritis inline** (bukan dirender oleh JS) dan memuat: label kapital kecil, judul besar, tagline, tahun, dan bar loader.
- FR-0.2: Bar loader boleh tak-tentu (indeterminate) tetapi **tidak boleh menampilkan angka persentase palsu**. Splash selesai saat aset kritis siap (font display dan lapisan latar hero ter-decode).
- FR-0.3: Durasi tampil: kunjungan pertama minimum 900 ms (agar komposisi terbaca) dan maksimum 2,2 s (dipaksa keluar); kunjungan berikutnya dalam sesi (`sessionStorage`) minimum 300 ms.
- FR-0.4: Keluar: opacity 1 → 0 dan skala isi 1 → 1,025 selama 1,35 s dengan easing `cinema`; setelah selesai, elemen **dihapus dari DOM** (tidak menyisakan fokus atau area klik). Penutupan hanya dipicu `transitionend` milik splash sendiri pada properti `opacity` (bukan anak-anaknya), dengan failsafe waktu.
- FR-0.5: Koreografi hero tumpang tindih dengan keluarnya splash (mulai ≈ 0,6 s): lapisan latar (skala 1,08 → 1) → judul naik per huruf dengan mask → foto dijatuhkan berurutan → isyarat scroll berupa **panah tulisan tangan yang digambar** (DrawSVG), bukan `animate-bounce` bawaan.
- FR-0.6: Scroll dikunci hanya selama splash dan intro (≤ 2,5 s) lewat `lenis.stop()`, dan dapat dilewati oleh interaksi pertama.
- FR-0.7: Reduced motion atau toggle "kurangi gerak": bar tidak bergerak, tanpa koreografi; splash memudar singkat (≤ 300 ms) atau dilewati; konten langsung tampil.
- FR-0.8: Teks splash terbaca pembaca layar sekali (`role="status"`) lalu dihapus bersama elemennya.

### 6.1 Hero (Parallax Berlapis, Judul Kinetic, Polaroid Draggable)

**Deskripsi:** Nama geng berukuran besar. Weight judul naik saat kursor mendekat. Di sekeliling judul tersebar 6–10 polaroid yang bisa diseret dan dilempar dengan inersia.

- FR-1.1: Judul dipecah per huruf **saat build** (elemen `h1` berlabel `aria-label`, huruf `aria-hidden`) agar tidak ada pergeseran saat muat. Pemecahan runtime hanya untuk teks lain, dan hanya setelah `document.fonts.ready`.
- FR-1.2: **Lebar stabil.** Perubahan weight tidak boleh menggeser posisi huruf atau membungkus ulang baris. Cara yang dipakai: sumbu width-neutral (mis. `GRAD`) atau slot lebar tetap per huruf (lebar pada weight maksimum, glyph di tengah). Lulus bila pergeseran horizontal baris = 0 px di seluruh rentang sumbu pada uji visual.
- FR-1.3: `font-variation-settings` per huruf diperbarui lewat custom property (`--w`), hanya untuk huruf dalam radius 200 px dari kursor, dengan **baca layout lebih dulu, tulis sesudahnya** dalam satu frame, dan interpolasi (lerp ≈ 0,15). Aktif hanya pada `(hover: hover) and (pointer: fine)`.
- FR-1.4: Polaroid dapat diseret memakai **GSAP Draggable + InertiaPlugin** (`type: "x,y"`, `bounds` = kontainer hero, `inertia: true`).
- FR-1.5: Saat dilepas, polaroid melaju dengan inersia dan berhenti. Rotasi bergeser mengikuti kecepatan horizontal (dibatasi ±6°) lalu kembali ke rotasi dasar.
- FR-1.6: Polaroid yang disentuh naik ke atas (`zIndexBoost` bawaan Draggable) dan skala 1,04. Saat hover (non-drag), polaroid miring meluruskan diri ke 0° (kembali saat hover berakhir).
- FR-1.7: Intro "jatuh" (easing `drop`, stagger 60–90 ms) satu kali. **Elemen tetap terlihat di HTML awal.** Keadaan awal tersembunyi diterapkan lewat kelas `has-intro` yang dipasang skrip inline di `<head>` hanya bila JS aktif dan gerak diizinkan, dengan failsafe: kelas dilepas otomatis setelah 3 s.
- FR-1.8: **Efek "berkembang":** tiap foto polaroid dimulai dengan lapisan overlay krem (opacity 1) yang memudar ke 0 saat landing, ditambah skala gambar 1,04 → 1. Hanya `opacity` dan `transform`.
- FR-1.9: Kandidat LCP adalah lapisan latar hero atau judul (mana yang lebih besar); keduanya harus siap ≤ 2,5 s. Lapisan latar utama dipreload (`fetchpriority="high"`, AVIF/WebP, varian mobile ≤ 150 KB) dan judul adalah teks yang langsung terlihat. Hanya polaroid yang terlihat di viewport awal memakai `loading="eager"`; sisanya `lazy`, `decoding="async"`, lebar ≤ 480 px.
- FR-1.10: Perangkat sentuh: drag tetap aktif, judul berubah weight berdasarkan scroll (scrub). Sisakan zona bebas-polaroid di tepi layar agar scroll vertikal tidak terhalang. Uji di perangkat nyata.
- FR-1.11: **Lapisan parallax:** 3–5 lapisan WebP/AVIF dari foto tempat nyata (latar, tengah, depan) bergerak dengan faktor kedalaman berbeda mengikuti pointer (desktop pointer halus) atau scroll (sentuh). Hanya `transform`; lapisan selain latar utama dimuat setelah LCP; reduced motion: statis.
- FR-1.12: **Objek hero (opsional, D7):** objek yang bermakna bagi geng dirakit dari bagian-bagian terpisah (mis. dua sayap dan badan sebagai tiga gambar) dengan `perspective` dan transform. Berhenti saat di luar viewport dan saat tab tidak aktif; reduced motion: pose statis.
- FR-1.13: Di mobile, gerak lapisan tengah dibatasi ≤ 24 px agar tidak mengganggu keterbacaan dan performa.
- FR-1.14: Judul kinetic (FR-1.1 sampai FR-1.3) hanya dipakai bila font display **variable**. Bila font display statis, efek diganti gerak halus per huruf (naik/bergeser kecil mengikuti kursor, hanya `transform`) atau dinonaktifkan.

### 6.2 Daftar Anggota (Hover List, Image Reveal, Tanda Tangan)

**Deskripsi:** Nama-nama anggota ditulis sangat besar. Saat di-hover atau difokus, foto candid mengikuti kursor dan tanda tangan anggota tergambar.

- FR-2.1: Posisi gambar mengikuti kursor memakai `gsap.quickTo` (x, y).
- FR-2.2: Rotasi gambar dari kecepatan horizontal kursor (dibatasi ±8°).
- FR-2.3: Reveal memakai `clip-path` (0,5 s, easing `signature`). `clip-path` diperbolehkan karena elemennya kecil dan tunggal (pengecualian aturan 9.1).
- FR-2.4: **Mobile:** tap-to-expand memakai **GSAP Flip** (transisi berbasis transform, tanpa menganimasikan width/height). Kartu menampilkan foto, panggilan, satu fakta singkat.
- FR-2.5: Item dapat difokus keyboard dan menampilkan reveal yang sama pada `:focus-visible`.
- FR-2.6: **Tanda tangan:** SVG path tulisan tangan tiap anggota (5.2) digambar dengan DrawSVG (≈0,8 s) saat hover/fokus/expand. Fallback statis penuh untuk reduced-motion.
- FR-2.7: Nama, panggilan, dan fakta singkat selalu tersedia sebagai teks (tidak hanya lewat hover).

### 6.3 Timeline Kenangan (SVG Path Drawing)

**Deskripsi:** Garis gambar tangan yang tergambar mengikuti scroll dan menghubungkan momen.

- FR-3.1: **Dua** path SVG organik hasil gambar tangan: lebar untuk desktop dan vertikal untuk mobile (< 640 px), dipilih lewat `matchMedia`. Atribut `pathLength="1"` dan `vector-effect: non-scaling-stroke` dipakai agar dasharray sederhana dan tebal garis konsisten.
- FR-3.2: Penggambaran memakai `stroke-dasharray: 1` / `stroke-dashoffset` dengan **GSAP ScrollTrigger** (`scrub: true`).
- FR-3.3: Posisi tiap titik momen dipetakan ke fraksi panjang path saat init (pencarian titik terdekat dengan `getPointAtLength`, di-cache, dihitung ulang saat resize). Titik muncul saat progres garis melewati fraksinya.
- FR-3.4: Klik/tap/Enter pada titik membuka dialog cerita (6.8). Deep link `#momen-<slug>` membuka dialog langsung.
- FR-3.5: Fallback statis (garis penuh) untuk reduced-motion.
- FR-3.6: Saat dialog terbuka, tanggal "distempel": skala 1,4 → 1 dengan rotasi kecil (`signature`), sekali.

### 6.4 Momen Terbaik (Sticky Stacking Cards)

**Deskripsi:** 5–7 kartu foto/cerita menumpuk seperti tumpukan cetakan.

- FR-4.1: Tiap kartu `position: sticky; top: calc(var(--stack-top) + var(--i) * 24px)`.
- FR-4.2: Kartu yang tertutup mengecil (skala 1 → 0,94) dan meredup (opacity 1 → 0,7). Penggerak adalah **timeline `view()` milik kartu berikutnya** (fase *entry*), karena kartu sticky sendiri tidak "keluar" sampai section selesai (bagian 8.8). Kartu terakhir tidak berubah.
- FR-4.3: Rotasi statis (`--rot`, deterministik) dipasang pada **wrapper**; gerak mengecil pada **elemen dalam**, sehingga properti `rotate` dan `scale` tidak pernah bertabrakan.
- FR-4.4: **Fallback GSAP wajib** di browser tanpa dukungan `animation-timeline` (ScrollTrigger per kartu dengan trigger kartu berikutnya).
- FR-4.5: Klik kartu membuka dialog (6.8) bila momen punya cerita lengkap.
- FR-4.6: **Spike Fase 1:** validasi pola 8.8 di Chrome, Safari 26, dan satu perangkat iOS lama (fallback). Hasil spike menentukan versi final FR-4.2.

### 6.5 Inside Jokes (Marquee Reaktif Scroll)

**Deskripsi:** Dua baris kutipan berjalan berlawanan arah. Kecepatan naik saat scroll cepat dan melambat saat hover.

- FR-5.1: Loop dengan `gsap.to` pada `xPercent: -50` dan `repeat: -1`; konten diduplikasi.
- FR-5.2: Kecepatan scroll dari event `scroll` Lenis (`velocity`) memodulasi `timeScale` melalui interpolasi di ticker (bagian 8.9), dengan pemulihan perlahan ke 1 dan batas boost ≤ 4×.
- FR-5.3: Arah marquee mengikuti arah scroll; baris kedua berlawanan.
- FR-5.4: Hover menurunkan `timeScale` ke 0,2 dengan transisi halus.
- FR-5.5: Teks nyata (dapat dipilih, dibaca screen reader sekali; duplikat `aria-hidden`).
- FR-5.6: Tombol jeda; marquee juga dijeda otomatis saat di luar viewport (hemat CPU).
- FR-5.7: Reduced motion: marquee berhenti dan tampil sebagai daftar statis.

### 6.6 Penutup (Galeri Horizontal, "Jemuran Foto")

**Deskripsi:** Satu-satunya section dengan scroll ke samping: foto dijepit pada seutas tali yang memanjang, diakhiri ucapan penutup.

- FR-6.1: Section di-pin dan digeser horizontal dengan **GSAP ScrollTrigger** (`pin: true`, `scrub: true`, `end` dihitung dari lebar track, `invalidateOnRefresh: true`, `anticipatePin: 1`).
- FR-6.2: Gambar memakai `containerAnimation` untuk parallax kecil (10–15%).
- FR-6.3: Aktif hanya ≥ 1024 px **dan** `pointer: fine`. Di bawahnya: carousel `scroll-snap` native.
- FR-6.4: Indikator progres (garis tipis) mengikuti posisi horizontal.
- FR-6.5: **Fokus keyboard:** saat elemen di track menerima fokus, `scrollLeft` kontainer di-reset ke 0 dan posisi scroll vertikal dipetakan ke elemen itu (bagian 8.6), agar browser tidak menggeser kontainer `overflow: hidden`.
- FR-6.6 (opsional, Fase 3): foto bergoyang kecil (≤ 3°) mengikuti kecepatan scroll, ditahan dengan `quickTo`.
- FR-6.7: Semua gambar memiliki `width`/`height` eksplisit; `ScrollTrigger.refresh()` dipanggil setelah gambar termuat.

### 6.7 Elemen Global

- FR-7.1: **Progress bar** scroll dengan CSS `animation-timeline: scroll(root)` di dalam `@supports`; fallback GSAP bila tidak didukung (8.8).
- FR-7.2: **Smooth scroll** global dengan Lenis, aktif hanya saat gerak diizinkan; `syncTouch` tetap bawaan (nonaktif); scroller dalam (dialog, carousel) diberi `data-lenis-prevent`.
- FR-7.3: **Easter egg:** klik 5 kali pada foto tertentu memunculkan catatan rahasia. Elemennya `<button>` (dapat dioperasikan keyboard); animasi dengan GSAP, pegas kecil lewat easing `drop`.
- FR-7.4: **Detail momen:** dialog dalam halaman (6.8) dengan deep link; tanpa halaman terpisah (keputusan D3).
- FR-7.5: **Navigasi minimal:** penanda section (titik/label tulisan tangan di tepi), toggle "kurangi gerak", tautan "hapus saya" di footer.
- FR-7.6: **Kursor berlabel** (hanya `(hover: hover) and (pointer: fine)`): titik kecil yang mengikuti kursor dan menampilkan label fungsional ("seret", "buka", "jeda"). Kursor sistem tetap terlihat; kursor kustom hanya pelengkap.
- FR-7.7: **Sistem reveal teks:** atribut `data-reveal="lines"` memakai SplitText per baris dengan mask, dipicu ScrollTrigger `once: true`. Satu implementasi untuk seluruh situs, bukan efek per section.
- FR-7.8: **Transisi antar-section:** tepi kertas sobek (`clip-path: polygon` statis) dengan parallax kecil antar lapisan, bukan animasi baru yang berdiri sendiri.
- FR-7.9: **Micro-interaction:** garis bawah tautan digambar (`scaleX`, origin kiri), tombol menyusut ke 0,97 saat ditekan, kartu miring meluruskan diri saat hover. Semua memakai `--dur-fast` dan `signature`.
- FR-7.10: **Toggle "kurangi gerak"** manual, independen dari pengaturan OS. Satu fungsi `motionAllowed()` menggabungkan keduanya; mengubah toggle membangun ulang animasi lewat `matchMedia`/context.
- FR-7.11: **Meta berbagi** (di HTML statis, bukan dari JS): `<title>`, `description`, `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `twitter:card`, `theme-color` `#050505`, `color-scheme` `dark`, dan `robots` `noindex,nofollow`. Gambar OG 1200×630, ≤ 300 KB. Diuji dengan mengirim tautan ke WhatsApp dan satu aplikasi chat lain.
- FR-7.12: **CSS dasar:** `html { scrollbar-gutter: stable; overflow-x: clip }` dan `body { overflow-x: clip }`; **jangan** memakai `overflow-x: hidden` pada keduanya sekaligus karena dapat merusak `position: sticky`. `::selection` diberi warna sesuai palet.
- FR-7.13: **Analitik** tanpa cookie (mis. Cloudflare Web Analytics atau Plausible), dimuat setelah idle dan tidak memengaruhi LCP.
- FR-7.14: Favicon dengan `type` yang sesuai isi file, ditambah `apple-touch-icon`.

### 6.8 Dialog Cerita (Spesifikasi)

- Elemen `<dialog>` asli dengan `showModal()` (fokus terperangkap, latar `inert`, Esc menutup).
- Saat dibuka: `lenis.stop()`; saat ditutup: `lenis.start()` dan fokus kembali ke pemicu.
- Konten yang bisa menggulir di dalam dialog diberi `data-lenis-prevent`.
- Judul dialog adalah `aria-labelledby`; foto memiliki `alt` bermakna.
- Animasi buka/tutup: transform + opacity, `--dur-base`; reduced motion: tanpa animasi.
- Deep link `#momen-<slug>` membuka dialog saat muat dan memperbarui hash saat dibuka/tutup.
- Video cerita di dalam dialog dijeda dan dilepas saat dialog ditutup (lihat 6.9).

### 6.9 Video

**Deskripsi:** Video membuat arsip terasa hidup. Ada dua jenis: **klip ambient** (pendek, berulang, tanpa suara, sebagai latar atau aksen) dan **video cerita** (diputar atas pilihan pengguna, boleh bersuara).

- FR-V1: Setiap video didefinisikan di koleksi `videos` (8.3) dengan jenis (`ambient` atau `story`), poster, sumber, rasio aspek, dan bidang persetujuan.
- FR-V2: **Klip ambient:** `<video muted loop playsinline preload="none" poster>` tanpa trek audio. Sumber baru dipasang saat klip mendekati viewport (IntersectionObserver, margin ≈ 200 px), diputar saat terlihat, dan dijeda saat keluar viewport atau tab tidak aktif. Tidak ada video yang dimuat sebelum LCP.
- FR-V3: **Format:** MP4 H.264 (kompatibilitas) dan WebM VP9 (opsional); 720p untuk mobile dan sampai 1080p untuk desktop lewat `<source media>`. Target awal klip ambient ≤ 1,2 MB per klip untuk mobile (≈ 8 detik); disetel saat QA.
- FR-V4: **Poster:** setiap video punya poster WebP ≤ 60 KB. Poster tampil sebelum video siap dan menjadi fallback.
- FR-V5: **Fallback:** reduced motion, mode hemat data (`navigator.connection.saveData`), autoplay diblokir (mis. iOS Low Power Mode atau sebagian WebView), atau `play()` ditolak: tampilkan poster saja tanpa error. Video cerita menampilkan tombol putar.
- FR-V6: **Batas bersamaan:** maksimal 2 klip ambient diputar bersamaan di desktop dan 1 di mobile; klip tertua dijeda saat batas terlampaui.
- FR-V7: **Video cerita:** kontrol dapat dioperasikan keyboard (native atau kustom yang aksesibel); suara hanya dimulai oleh aksi pengguna; caption (`<track>`) atau transkrip tersedia bila ada ucapan; `preload="metadata"` hanya setelah pengguna membuka dialog atau section-nya.
- FR-V8: Video di dalam dialog dijeda dan dilepas saat dialog ditutup. Semua video punya `width`/`height` atau `aspect-ratio` eksplisit (tanpa CLS).
- FR-V9: **Anggaran:** total byte video yang dimuat otomatis per kunjungan mobile ≤ 4 MB; video cerita dimuat hanya atas permintaan. Byte video tidak dihitung dalam batas halaman 2,5 MB tetapi dihitung dalam anggaran ini.
- FR-V10: **Hosting:** periksa batas ukuran file di hosting statis; bila terlalu kecil, gunakan penyimpanan objek/CDN yang mendukung range request.
- FR-V11: **Privasi:** metadata video (termasuk lokasi) dihapus saat encode; persetujuan mencakup wajah dan suara.

**Pipeline encode (contoh, disetel saat QA):**

```bash
# Klip ambient: tanpa audio, tanpa metadata, 720p
ffmpeg -i in.mov -an -map_metadata -1 -vf "scale=-2:720,fps=24" \
  -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart out-720.mp4
ffmpeg -i in.mov -an -map_metadata -1 -vf "scale=-2:720,fps=24" \
  -c:v libvpx-vp9 -crf 36 -b:v 0 out-720.webm
```

## 7. Pembagian Tanggung Jawab Teknologi

| Kebutuhan | Teknologi (Opsi A, default) | Alasan |
| --- | --- | --- |
| Timeline SVG, pin, horizontal scroll, marquee, reveal teks | **GSAP + ScrollTrigger, SplitText, DrawSVG** | Kontrol timeline, scrub, dan pin paling matang |
| Drag polaroid, inersia | **GSAP Draggable + InertiaPlugin** | Satu sistem untuk seluruh transform elemen |
| Transisi layout (expand) | **GSAP Flip** | Menghindari animasi width/height |
| Easing khusus | **CustomEase, CustomBounce** | Easing `signature` dan `drop` |
| Smooth scroll global | **Lenis** | Ringan, kompatibel dengan ScrollTrigger |
| Progress bar, sinking cards, reveal ringan | **CSS scroll-driven animation** (+ fallback GSAP) | Tanpa JS bila didukung |
| Video ambient dan cerita | **`<video>` native + IntersectionObserver** (tanpa library) | Kontrol penuh atas muat, jeda, batas bersamaan, dan fallback |

**Catatan lisensi:** GSAP kini gratis termasuk seluruh plugin, termasuk untuk penggunaan komersial; semua tersedia dari paket npm `gsap`. Verifikasi syarat terbaru di situs resmi GSAP sebelum rilis.

**Opsi B:** menambah `react`, `react-dom`, dan `motion` untuk drag dan pegas hero serta easter egg. Dipilih hanya bila fisika pegas sejati dianggap penting; konsekuensinya anggaran JS naik, hero harus dihidrasi di atas lipatan (`client:load`, bukan `client:visible`), dan aturan satu-elemen-satu-sistem harus dijaga dengan wrapper terpisah.

**Aturan emas:** satu elemen hanya dianimasikan oleh **satu** sistem. Rotasi statis di wrapper, gerak dinamis di elemen dalam.

**Catatan referensi:** situs referensi dibangun sebagai SPA React dengan Tailwind. PRD ini sengaja tetap memakai HTML statis (Astro) karena meta berbagi, splash inline, dan LCP bergantung pada konten yang sudah ada di HTML awal.

## 8. Arsitektur Teknis

### 8.1 Stack

- **Framework:** Astro (halaman statis). Opsi A: tanpa island framework; semua animasi dari skrip modul. Opsi B: React island hanya untuk hero dan easter egg.
- **Bahasa:** TypeScript.
- **Styling:** CSS biasa dengan custom property (D8). Tailwind v4 diperbolehkan; animasi utama tetap lewat GSAP/CSS khusus, bukan utilitas `animate-*` bawaan.
- **Rendering:** HTML statis sehingga meta, splash, dan konten kritis ada di HTML awal; hindari SPA sisi-klien murni.
- **Konten:** Astro Content Collections (JSON/Markdown) dengan skema Zod di `/src/content`.
- **Hosting:** Vercel, Netlify, atau Cloudflare Pages (pilih sesuai kebutuhan proteksi akses, D4).
- **Paket (Opsi A):** `gsap`, `lenis`.
- **Gambar:** komponen gambar Astro (AVIF/WebP, `srcset`, ukuran eksplisit).

### 8.2 Struktur Folder

```
src/
  content.config.ts        (skema Zod)
  content/
    members/*.json
    moments/*.json
    jokes.json
  components/
    Intro.astro
    Hero.astro
    MemberList.astro
    Timeline.astro
    StackCards.astro
    Marquee.astro
    HorizontalGallery.astro
    StoryDialog.astro
    Splash.astro
    HeroParallax.astro
    VideoClip.astro
  scripts/
    motion.ts              (token, CustomEase/CustomBounce, motionAllowed())
    smooth-scroll.ts       (Lenis + sinkronisasi GSAP)
    seeded-random.ts
    splash.ts              (splash: tunggu aset kritis, keluar)
    video.ts               (video ambient: muat, jeda, batas)
    fallbacks.ts           (progress bar, stacking cards)
    animations/
      intro.ts
      hero.ts
      kinetic-title.ts
      member-reveal.ts
      timeline.ts
      stack-cards.ts
      marquee.ts
      horizontal.ts
      reveal-text.ts
      cursor.ts
      hero-parallax.ts
  styles/
    tokens.css
    scroll-driven.css
```

### 8.3 Skema Konten

```ts
// src/content.config.ts  (sketsa; sesuaikan dengan versi Astro yang dipakai)
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const members = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/members' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      nickname: z.string(),
      fact: z.string().max(120),
      photo: image(),
      alt: z.string().min(5),
      signature: z.string().optional(),   // path SVG tanda tangan
      consent: z.literal(true),           // build gagal bila belum ada persetujuan
      hidden: z.boolean().default(false), // "hapus saya": sembunyikan tanpa mengubah kode
    }),
})

const moments = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/moments' }),
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      date: z.string(),
      title: z.string(),
      story: z.string().max(600),
      photo: image(),
      alt: z.string().min(5),
      featured: z.boolean().default(false), // tampil di stacking cards
      consent: z.literal(true),
      hidden: z.boolean().default(false),
    }),
})

const videos = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/videos' }),
  schema: ({ image }) =>
    z
      .object({
        slug: z.string(),
        title: z.string(),
        kind: z.enum(['ambient', 'story']),
        poster: image(),
        mp4: z.string(),
        webm: z.string().optional(),
        aspect: z.string().default('16/9'),
        hasSpeech: z.boolean().default(false),
        transcript: z.string().optional(),
        consent: z.literal(true),
        hidden: z.boolean().default(false),
      })
      .refine((v) => !v.hasSpeech || !!v.transcript, 'transkrip wajib bila ada ucapan'),
})

export const collections = { members, moments, videos }
```

### 8.4 Sinkronisasi Lenis dengan GSAP ScrollTrigger

Titik integrasi paling rawan bug. Lenis hanya hidup saat gerak diizinkan.

```ts
// scripts/smooth-scroll.ts
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export let lenis: Lenis | null = null

export function initSmoothScroll() {
  const mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    lenis = new Lenis({ autoRaf: false })
    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => lenis!.raf(time * 1000)
    gsap.ticker.add(tick)           // satu ticker untuk semuanya
    gsap.ticker.lagSmoothing(0)

    return () => {                  // dibersihkan otomatis saat kondisi berubah
      gsap.ticker.remove(tick)
      lenis?.destroy()
      lenis = null
    }
  })
}
```

Catatan: jangan menjalankan `requestAnimationFrame` Lenis terpisah. Karena Lenis sudah menghaluskan, ScrollTrigger memakai `scrub: true` (bukan angka) agar tidak terjadi penghalusan ganda yang terasa seperti karet. Untuk toggle "kurangi gerak" manual, `motionAllowed()` (scripts/motion.ts) ikut dipertimbangkan oleh kondisi `matchMedia` yang sama.

### 8.5 Pembungkus Responsif dan Reduced Motion

```ts
const mm = gsap.matchMedia()

mm.add(
  {
    desktop: '(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    motionOK: '(prefers-reduced-motion: no-preference)',
    finePointer: '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
  },
  (ctx) => {
    const { desktop, motionOK, finePointer } = ctx.conditions!
    if (motionOK && motionAllowed()) { initIntro(); initTimeline(); initRevealText(); initMarquee() }
    if (finePointer) { initKineticTitle(); initCursor(); initMemberHover() }
    if (desktop) initHorizontalGallery()
    // semua animasi dibuat di dalam context ini sehingga dibersihkan otomatis
  }
)
```

### 8.6 Horizontal Scroll dengan Pemetaan Fokus

```ts
function initHorizontalGallery() {
  const section = document.querySelector<HTMLElement>('.gallery')!
  const track = section.querySelector<HTMLElement>('.gallery-track')!
  const distance = () => track.scrollWidth - window.innerWidth

  const scrollTween = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      pin: true,
      scrub: true,
      anticipatePin: 1,
      end: () => '+=' + distance(),
      invalidateOnRefresh: true,
    },
  })
  const st = scrollTween.scrollTrigger!

  // Parallax gambar di dalam track
  gsap.utils.toArray<HTMLElement>('.gallery img').forEach((img) => {
    gsap.to(img, {
      xPercent: -12,
      ease: 'none',
      scrollTrigger: {
        trigger: img,
        containerAnimation: scrollTween,
        start: 'left right',
        end: 'right left',
        scrub: true,
      },
    })
  })

  // Fokus keyboard: petakan elemen yang difokus ke posisi scroll (sketsa)
  section.addEventListener('focusin', (e) => {
    const item = (e.target as HTMLElement).closest<HTMLElement>('.gallery-item')
    if (!item) return
    section.scrollLeft = 0                              // cegah browser menggeser overflow
    const ratio = gsap.utils.clamp(0, 1, (item.offsetLeft - window.innerWidth * 0.1) / distance())
    const y = st.start + ratio * (st.end - st.start)
    lenis ? lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y)
  })
}
```

### 8.7 Drag Polaroid dengan GSAP Draggable (Opsi A)

```ts
import { gsap } from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
gsap.registerPlugin(Draggable, InertiaPlugin)

export function initPolaroids(hero: HTMLElement) {
  const photos = gsap.utils.toArray<HTMLElement>('.polaroid', hero)

  photos.forEach((el) => {
    const base = Number(el.dataset.rot ?? 0)     // rotasi dasar deterministik
    gsap.set(el, { rotation: base })

    const settle = () =>
      gsap.to(el, { rotation: base, scale: 1, duration: 0.5, ease: 'signature', overwrite: 'auto' })

    const tilt = () => {
      const vx = InertiaPlugin.getVelocity(el, 'x')
      gsap.to(el, {
        rotation: base + gsap.utils.clamp(-6, 6, vx / 250),
        duration: 0.4, ease: 'signature', overwrite: 'auto',
      })
    }

    Draggable.create(el, {
      type: 'x,y',
      bounds: hero,
      inertia: true,                // zIndexBoost bawaan menaikkan elemen yang disentuh
      onPress() { gsap.to(el, { scale: 1.04, duration: 0.2, ease: 'signature' }) },
      onDrag: tilt,
      onThrowUpdate: tilt,
      onRelease: settle,
      onThrowComplete: settle,
    })
  })
}
```

### 8.8 CSS Scroll-Driven Animation (dengan Fallback)

```css
/* Progress bar: hanya aktif bila didukung, selain itu disembunyikan */
.progress {
  position: fixed; inset: 0 0 auto 0; height: 3px;
  background: var(--accent);
  transform-origin: left;
  transform: scaleX(0);
  display: none;
}
@supports (animation-timeline: scroll()) {
  .progress {
    display: block;
    animation: grow linear both;
    animation-timeline: scroll(root);
  }
  @keyframes grow { to { transform: scaleX(1) } }
}
```

```html
<!-- Stacking cards: wrapper = sticky + rotasi statis, elemen dalam = gerak -->
<ol class="stack">
  <li class="stack-card" style="--i:0; --rot:-1.4deg; view-timeline-name:--c0; --next-tl:--c1">
    <div class="stack-card__inner has-next">...</div>
  </li>
  <li class="stack-card" style="--i:1; --rot:1.1deg; view-timeline-name:--c1; --next-tl:--c2">
    <div class="stack-card__inner has-next">...</div>
  </li>
  <!-- kartu terakhir: tanpa --next-tl dan tanpa .has-next -->
</ol>
```

```css
.stack-card {
  position: sticky;
  top: calc(var(--stack-top, 12vh) + var(--i) * 24px);
  rotate: var(--rot);
}

@supports (animation-timeline: view()) {
  /* timeline-scope di leluhur bersama; daftar mencakup jumlah kartu maksimum */
  .stack { timeline-scope: --c0, --c1, --c2, --c3, --c4, --c5, --c6, --c7; }

  .stack-card__inner.has-next {
    animation: sink linear both;
    animation-timeline: var(--next-tl);       /* timeline kartu BERIKUTNYA */
    animation-range: entry 0% entry 100%;     /* disetel di spike Fase 1 */
  }
  @keyframes sink { to { scale: 0.94; opacity: 0.7 } }
}

@media (prefers-reduced-motion: reduce) {
  .progress, .stack-card__inner { animation: none }
}
```

```ts
// scripts/fallbacks.ts: hanya dijalankan bila CSS scroll-driven tidak didukung
export function initScrollFallbacks() {
  if (CSS.supports('animation-timeline: scroll()')) return

  gsap.to('.progress', {
    scaleX: 1, ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: true },
  })
  const cards = gsap.utils.toArray<HTMLElement>('.stack-card')
  cards.forEach((card, i) => {
    const next = cards[i + 1]
    if (!next) return
    gsap.to(card.querySelector('.stack-card__inner'), {
      scale: 0.94, opacity: 0.7, ease: 'none',
      scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 40%', scrub: true },
    })
  })
}
```

Catatan: pola `animation-timeline` dari kartu berikutnya adalah usulan yang **wajib divalidasi** di spike Fase 1 (FR-4.6); nilai `animation-range` dan `end` fallback disetel di sana. Dukungan browser per akhir 2026: Chrome/Edge sejak 115, Safari sejak 26, dan sumber terbaru menyebut Firefox 159 (Oktober 2026) sudah mendukung. Karena target mencakup iOS 16+ dan WebView lama, fallback tetap wajib.

### 8.9 Marquee Reaktif Scroll

```ts
function initMarquee() {
  document.querySelectorAll<HTMLElement>('.marquee').forEach((row) => {
    const inner = row.querySelector<HTMLElement>('.marquee-inner')!
    const reverse = row.dataset.reverse === 'true' ? -1 : 1
    const tl = gsap.to(inner, { xPercent: -50, ease: 'none', duration: 30, repeat: -1 })

    let dir = 1, boost = 1, hover = false
    row.addEventListener('pointerenter', () => (hover = true))
    row.addEventListener('pointerleave', () => (hover = false))

    lenis?.on('scroll', ({ velocity }: { velocity: number }) => {
      if (Math.abs(velocity) > 0.2) dir = Math.sign(velocity)
      boost = Math.min(4, 1 + Math.abs(velocity) * 0.2)
    })

    gsap.ticker.add(() => {
      boost += (1 - boost) * 0.05                       // pulih perlahan ke 1
      const goal = reverse * dir * boost * (hover ? 0.2 : 1)
      tl.timeScale(gsap.utils.interpolate(tl.timeScale(), goal, 0.12))
    })
  })
}
```

Catatan: verifikasi perilaku `repeat: -1` dengan `timeScale` negatif di prototipe; jeda saat di luar viewport memakai `ScrollTrigger` (`onToggle`) atau `IntersectionObserver`.

### 8.10 Acak Deterministik

```ts
// scripts/seeded-random.ts
export function seededRandom(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) }
  return () => {
    h += 0x6d2b79f5
    let t = Math.imul(h ^ (h >>> 15), 1 | h)
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
// Dipanggil saat BUILD (Astro): rotasi = (rand() * 2 - 1) * MAX_ROT_MOOD, ditulis ke --rot / data-rot
```

### 8.11 Judul Kinetic (Sketsa)

```css
.letter { display: inline-block; font-variation-settings: 'GRAD' var(--w, 0); } /* sumbu width-neutral; sesuaikan dengan font terpilih */
```

```ts
function initKineticTitle() {
  const hero = document.querySelector<HTMLElement>('.hero')!
  const letters = [...hero.querySelectorAll<HTMLElement>('.letter')]
  const RADIUS = 200, MIN = 0, MAX = 100
  const current = letters.map(() => MIN)
  let mx = -9999, my = -9999, active = false

  hero.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; active = true })
  hero.addEventListener('pointerleave', () => { mx = my = -9999 })

  gsap.ticker.add(() => {
    if (!active) return
    const rects = letters.map((l) => l.getBoundingClientRect())          // baca dulu
    rects.forEach((r, i) => {                                            // tulis sesudahnya
      const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2))
      const t = 1 - Math.min(d / RADIUS, 1)
      const target = MIN + (MAX - MIN) * t * t
      current[i] += (target - current[i]) * 0.15                         // lerp
      letters[i].style.setProperty('--w', current[i].toFixed(1))
    })
  })
}
```

### 8.12 Kontroler Video Ambient (Sketsa)

```html
<video data-ambient muted loop playsinline preload="none"
       poster="/v/malam.webp" width="1280" height="720" aria-hidden="true">
  <source data-src="/v/malam-720.webm" type="video/webm">
  <source data-src="/v/malam-720.mp4" type="video/mp4">
</video>
```

```ts
// scripts/video.ts
const MAX_AMBIENT = matchMedia('(max-width: 1023px)').matches ? 1 : 2
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const saveData = (navigator as any).connection?.saveData === true
const playing = new Set<HTMLVideoElement>()

function stop(v: HTMLVideoElement) { v.pause(); playing.delete(v) }

function start(v: HTMLVideoElement) {
  if (!v.dataset.loaded) {
    v.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((s) => { s.src = s.dataset.src! })
    v.load()
    v.dataset.loaded = '1'
  }
  if (playing.size >= MAX_AMBIENT) stop([...playing][0])    // klip tertua dijeda
  v.play().then(() => playing.add(v)).catch(() => { /* autoplay diblokir: tetap poster */ })
}

export function initAmbientVideos() {
  if (reduced || saveData) return                            // poster saja
  const videos = document.querySelectorAll<HTMLVideoElement>('video[data-ambient]')
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => (e.isIntersecting ? start(e.target as HTMLVideoElement) : stop(e.target as HTMLVideoElement))),
    { rootMargin: '200px 0px', threshold: 0.25 },
  )
  videos.forEach((v) => io.observe(v))
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) playing.forEach(stop)
  })
}
```

### 8.13 Head Statis dan Splash Inline (Sketsa)

```html
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>…</title>
  <meta name="description" content="…">
  <meta name="theme-color" content="#050505">
  <meta name="color-scheme" content="dark">
  <meta name="robots" content="noindex,nofollow">
  <meta property="og:type" content="website">
  <meta property="og:title" content="…">
  <meta property="og:description" content="…">
  <meta property="og:image" content="https://domain/og.jpg">
  <meta property="og:url" content="https://domain/">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preload" as="image" href="/img/hero-bg-mobile.avif" type="image/avif"
        fetchpriority="high" media="(max-width: 767px)">
  <link rel="preload" as="font" href="/fonts/display.woff2" type="font/woff2" crossorigin>
  <style>
    html { background:#050505; color:#EDE8DD; scrollbar-gutter:stable; overflow-x:clip }
    body { overflow-x:clip }
    #splash { position:fixed; inset:0; z-index:9999; display:grid; place-items:center; background:#050505;
      transition: opacity 1.35s cubic-bezier(.77,0,.175,1), visibility 1.35s }
    #splash.is-exit { opacity:0; visibility:hidden; pointer-events:none }
    .splash-content { text-align:center;
      transition: transform 1.35s cubic-bezier(.77,0,.175,1), opacity .9s }
    #splash.is-exit .splash-content { opacity:0; transform:scale(1.025) }
    .splash-bar { transform-origin:left; animation: splash-bar 2.2s cubic-bezier(.65,0,.35,1) infinite }
    @keyframes splash-bar { 0%{transform:scaleX(0)} 60%{transform:scaleX(.8)} 100%{transform:scaleX(1)} }
    @media (prefers-reduced-motion: reduce) {
      #splash, .splash-content { transition-duration:.2s }
      .splash-bar { animation:none; transform:scaleX(1) }
    }
  </style>
</head>
```

```ts
// scripts/splash.ts
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const decoded = (sel: string) =>
  Promise.all([...document.querySelectorAll<HTMLImageElement>(sel)].map((i) => i.decode().catch(() => {})))

export async function runSplash(): Promise<void> {
  const splash = document.getElementById('splash')
  if (!splash) return
  let seen = false
  try { seen = sessionStorage.getItem('splash-seen') === '1' } catch {}     // mode privat bisa menolak
  const critical = Promise.all([document.fonts.ready, decoded('[data-critical]')])

  await Promise.race([Promise.all([critical, wait(seen ? 300 : 900)]), wait(2200)])
  try { sessionStorage.setItem('splash-seen', '1') } catch {}

  splash.classList.add('is-exit')
  await new Promise<void>((resolve) => {
    splash.addEventListener('transitionend', (e) => {
      if (e.target === splash && (e as TransitionEvent).propertyName === 'opacity') resolve()
    })
    setTimeout(resolve, 1600)                                              // failsafe
  })
  splash.remove()
}
```

## 9. Persyaratan Non-Fungsional

### 9.1 Performa

| Metrik | Target |
| --- | --- |
| LCP | ≤ 2,5 detik (4G, Android menengah); kandidat LCP = lapisan latar hero atau judul |
| CLS | ≤ 0,05 (termasuk saat weight judul berubah dan gambar termuat) |
| INP | ≤ 200 ms |
| Frame rate animasi | 60 fps laptop menengah, ≥ 45 fps HP menengah |
| JS awal (gzip) | Opsi A ≤ 120 KB; Opsi B ≤ 170 KB. Angka perkiraan: validasi dengan bundle analyzer di Fase 1; plugin di bawah lipatan dimuat dinamis (`import()`) |
| Berat halaman | ≤ 2,5 MB sebelum galeri lazy-load (tidak termasuk video; lihat FR-V9) |
| Font | total ≤ 120 KB (WOFF2 subset), maksimum 2 file dipreload |
| Video otomatis (mobile) | ≤ 4 MB per kunjungan; tidak ada sebelum LCP |
| Long task saat scroll | tidak ada > 50 ms berulang |

**Aturan:**

- Utamakan `transform` dan `opacity`. Hindari animasi `width`, `height`, `top`, `left`.
- **Pengecualian terdaftar:** `clip-path` pada elemen kecil tunggal (FR-2.3); `font-variation-settings` hanya pada judul hero dengan batas radius dan jumlah huruf (FR-1.3); transisi layout memakai Flip (berbasis transform).
- `will-change` seperlunya dan dilepas setelah selesai.
- Gambar AVIF/WebP dengan `srcset`, `width`/`height` eksplisit, `loading="lazy"` di luar viewport awal, `decoding="async"`.
- `ScrollTrigger.refresh()` setelah font dan gambar galeri termuat.
- Variable font di-subset dan dipreload; fallback dengan `size-adjust` agar tidak bergeser.
- Tanpa `mix-blend-mode` pada lapisan layar penuh; grain berupa tile kecil.
- Batas praktis: ≤ ~30 ScrollTrigger aktif bersamaan; pantau saat Fase 5.
- Pengukuran: panel Performance pada **perangkat Android menengah nyata**, bukan hanya emulasi.
- Lapisan parallax dan objek hero hanya memakai `transform`/`opacity`; jumlah lapisan dibatasi (FR-1.11).
- Video tidak dimuat sebelum LCP dan dibatasi jumlah yang diputar bersamaan (FR-V2, FR-V6).

### 9.2 Aksesibilitas

- Mode `prefers-reduced-motion: reduce` **atau** toggle "kurangi gerak": Lenis nonaktif, intro dilewati, marquee jadi daftar statis, timeline tampil penuh, polaroid tampil tanpa animasi jatuh, horizontal scroll jadi galeri biasa, dialog tanpa animasi.
- Semua gambar punya `alt` bermakna (atau `alt=""` bila dekoratif); `lang="id"` pada dokumen.
- Seluruh fungsi interaktif dapat dioperasikan keyboard dengan fokus yang jelas dan gaya `:focus-visible` yang dirancang (bukan bawaan peramban yang tertimpa).
- Judul yang dipecah per huruf memakai `aria-label` pada induk dan `aria-hidden` pada huruf.
- Dialog memakai `<dialog>` asli (fokus terperangkap, `inert` latar, Esc).
- Kontras teks minimal WCAG AA (4,5:1).
- Tidak ada konten kunci yang hanya muncul lewat hover (FR-2.7).
- Tombol jeda untuk marquee; tidak ada kedipan cepat (> 3 kali per detik).
- Teks informatif ≥ 12 px dengan kontras ≥ 4,5:1 di atas `--bg` (praktisnya `--ink` dengan opacity ≥ 60%); label kapital kecil ≥ 11 px dengan kontras yang sama; teks dekoratif (kata hantu) `aria-hidden` dan dikecualikan.
- Video: klip ambient tanpa audio dan `aria-hidden`; video cerita memiliki kontrol yang dapat dioperasikan keyboard, caption atau transkrip bila ada ucapan, dan tidak pernah berbunyi tanpa aksi pengguna.
- Splash memakai `role="status"` dan dihapus dari DOM setelah selesai.

### 9.3 Kompatibilitas Browser

- Target: dua versi terbaru Chrome, Safari, Firefox, Edge; Safari iOS 16+.
- **Browser dalam aplikasi (WebView WhatsApp, Instagram, dan sejenisnya)** masuk matriks uji karena tautan dibagikan lewat chat.
- CSS scroll-driven animation: peningkatan progresif **dengan fallback GSAP wajib** (8.8).
- Uji khusus iOS Safari untuk pin dan horizontal scroll (perilaku address bar). `ScrollTrigger.normalizeScroll` hanya bila terbukti perlu.
- Autoplay video: iOS Low Power Mode dan sebagian WebView memblokir autoplay; kegagalan `play()` harus jatuh ke poster tanpa error (FR-V5).

### 9.4 Responsif

| Section | ≥ 1024 px (pointer halus) | 640–1023 px | < 640 px |
| --- | --- | --- | --- |
| Hero | Pengalaman penuh, 8–10 polaroid, judul kursor | 6–8 polaroid, judul berbasis scroll | 5–6 polaroid, judul berbasis scroll, zona bebas scroll |
| Anggota | Hover list + foto mengikuti kursor | Tap-to-expand (Flip) | Tap-to-expand, satu kolom |
| Timeline | Path lebar | Path lebar yang disederhanakan | **Path vertikal** terpisah |
| Momen terbaik | Stacking cards penuh | Stacking cards (offset lebih kecil) | Stacking cards, offset 16 px |
| Inside jokes | Dua baris, reaktif scroll | Dua baris | Dua baris, ukuran teks lebih kecil, tombol jeda terlihat |
| Penutup | Horizontal pinned | Carousel `scroll-snap` | Carousel `scroll-snap` |
| Kursor berlabel | Aktif | Nonaktif | Nonaktif |
| Hero parallax | 4–5 lapisan, mengikuti pointer | 3–4 lapisan, mengikuti scroll | 3 lapisan, mengikuti scroll |
| Video ambient | ≤ 2 bersamaan | 1 | 1; poster saja bila mode hemat data |

### 9.5 Privasi

- Foto dan kutipan diunggah hanya dengan persetujuan masing-masing anggota; bidang `consent: true` pada skema membuat build gagal bila tidak ada.
- **EXIF (termasuk lokasi) harus dibersihkan sebelum file masuk repositori**, bukan hanya saat build. File asli yang di-commit tetap membawa metadata dan dapat diunduh dari repositori publik. Gunakan repositori privat atau skrip pembersih pra-commit.
- **"Hapus saya":** tautan di footer; prosedur: set `hidden: true` pada entri, build ulang, deploy (target ≤ 24 jam). Bila file perlu hilang sepenuhnya, hapus juga dari riwayat git (history rewrite) dan dari cache CDN.
- **Akses:** `noindex` (meta dan `robots.txt`) dan tautan tak terdaftar. Sandi sisi-klien di hosting statis bukan perlindungan nyata karena URL gambar tetap dapat diakses; bila perlindungan sungguhan dibutuhkan, pakai fitur proteksi dari hosting (D4).
- Tanpa pelacak pihak ketiga; bila memakai analitik, pilih yang ringan dan tanpa cookie.
- Video: metadata (termasuk lokasi) dihapus saat encode (`-map_metadata -1`); persetujuan mencakup wajah dan suara; "hapus saya" berlaku untuk video juga.

## 10. Konten dan Aset

| Aset | Jumlah | Catatan |
| --- | --- | --- |
| Foto anggota (candid) | 1–2 per orang | Rasio 4:5, minimal 1200 px sisi panjang |
| Foto momen | 15–25 | Campuran landscape dan portrait |
| Kutipan inside joke | 12–20 | Maksimal 80 karakter, minta izin pemilik kutipan |
| Momen timeline | 6–10 | Tanggal, judul, 2–4 kalimat (maks. 600 karakter) |
| **Scan tulisan tangan** | 1 per anggota | Untuk tanda tangan SVG dan/atau font tulisan tangan |
| **Ephemera nyata** | 5–10 | Tiket, struk, catatan, stiker yang dipindai |
| Tekstur kertas dan grain | 2–3 | Dari scan kertas sungguhan; grain sebagai tile kecil |
| Font | 3 | Judul (variable, width-neutral), tulisan tangan, badan; lisensi diperiksa |
| SVG garis timeline | 2 | Gambar tangan: versi lebar dan vertikal, `pathLength="1"` |
| SVG tanda tangan | 1 per anggota | Trace dari scan |
| Foto latar tempat nyata | 1 (dipisah 3–5 lapisan) | AVIF/WebP; varian mobile lapisan utama ≤ 150 KB |
| Bagian objek hero | 2–4 gambar (opsional, D7) | WebP/PNG transparan |
| Klip ambient | 3–6 | ≤ 8 detik, tanpa audio, 720p, MP4 + WebM, poster WebP ≤ 60 KB |
| Video cerita | 0–3 | Klik-untuk-putar, caption/transkrip bila ada ucapan, poster |
| Gambar OG | 1 | 1200×630, ≤ 300 KB |

## 11. Metrik Keberhasilan

- **Kualitatif:** ≥ 80% anggota geng menyatakan situs "terasa seperti kita". Pertanyaan tambahan: "bagian mana yang paling kamu ingat?" (menguji busur narasi).
- **Engagement:** rata-rata durasi kunjungan ≥ 2 menit; ≥ 60% pengunjung mencapai section penutup.
- **Berbagi:** tautan dibagikan ke minimal 3 grup/tempat berbeda dalam minggu pertama.
- **Teknis:** Lighthouse Performance ≥ 90 (mobile), Accessibility ≥ 95.
- **Kualitas animasi:** nol laporan patah-patah pada matriks perangkat uji, termasuk WebView aplikasi chat.
- **Pratinjau tautan:** tautan menampilkan judul, deskripsi, dan gambar yang benar di WhatsApp dan satu aplikasi chat lain.
- **Video:** nol laporan video gagal main di perangkat uji, termasuk iOS Low Power Mode.

## 12. Kriteria Penerimaan

1. Lenis dan ScrollTrigger tersinkron: pin dan scrub tidak melompat, bergetar, atau terasa "karet" saat scroll cepat.
2. Polaroid dapat diseret, dilempar dengan inersia, dan tidak keluar dari kontainer hero; rotasi mengikuti kecepatan lalu kembali.
3. Judul kinetic tidak menggeser baris sama sekali pada seluruh rentang sumbu; CLS ≤ 0,05.
4. Garis timeline tergambar tepat mengikuti scroll, titik tersinkron dengan posisi garis, dan tiap titik dapat dibuka dengan keyboard; mobile memakai path vertikal.
5. Stacking cards mengecil benar di Chrome, Safari 26, dan lewat fallback di perangkat tanpa dukungan; kartu terakhir tidak mengecil.
6. Progress bar tidak pernah tampil penuh di browser tanpa dukungan.
7. Marquee bereaksi terhadap kecepatan dan arah scroll, melambat saat hover, dan berhenti dengan tombol jeda.
8. Horizontal scroll hanya berjalan di desktop pointer halus; di layar kecil menjadi carousel native tanpa celah kosong; fokus keyboard memetakan posisi dengan benar.
9. Dialog: fokus terperangkap, Esc menutup, fokus kembali ke pemicu, deep link bekerja, Lenis berhenti saat dibuka.
10. Dengan `prefers-reduced-motion: reduce` atau toggle "kurangi gerak", seluruh konten tetap dapat diakses dan terbaca tanpa gerakan.
11. Splash dan intro tidak pernah menahan konten lebih dari 2,5 detik, dapat dilewati, dan splash dihapus dari DOM setelah keluar.
12. Foto tanpa persetujuan tidak dapat lolos build; entri `hidden: true` tidak muncul di HTML.
13. Repositori tidak memuat EXIF/lokasi pada file asli yang dapat diunduh publik.
14. Ukuran dan skor performa memenuhi tabel 9.1.
15. Pratinjau tautan (judul, deskripsi, gambar) muncul benar di WhatsApp dan satu aplikasi chat lain; HTML statis memuat meta tanpa menjalankan JS.
16. Video ambient dimuat hanya saat mendekati viewport, dijeda saat keluar, tidak melebihi batas bersamaan, dan jatuh ke poster pada reduced-motion, mode hemat data, atau autoplay diblokir.
17. Video cerita tidak pernah berbunyi tanpa aksi pengguna dan memiliki caption atau transkrip bila ada ucapan.
18. Kontras dan ukuran teks informatif memenuhi 9.2; tidak ada glow, blob, atau gradien warna-warni di luar pengecualian aturan cahaya (5.3).
19. `position: sticky` berfungsi di semua browser target (tidak ada `overflow-x: hidden` ganda pada `html` dan `body`).
20. Lapisan parallax hero tetap ≥ 45 fps di HP menengah dan tidak mendorong LCP melewati 2,5 detik.

## 13. Rencana Pengerjaan

| Fase | Durasi | Hasil |
| --- | --- | --- |
| **0. Persiapan** | 5–6 hari | Keputusan D1–D8, kumpulkan foto, kutipan, scan tulisan tangan dan ephemera, foto tempat nyata (pisah lapisan), video (encode, poster, hapus metadata), izin anggota, font dan palet gelap, wireframe, storyboard splash dan intro |
| **1. Fondasi dan spike** | 4–5 hari | Setup Astro, token (5.3, 5.4), meta berbagi dan splash inline, CSS dasar (`overflow-x: clip`), Lenis + GSAP, tata letak statis semua section. **Spike:** stacking cards (FR-4.6), Lenis + pin di iOS Safari, pengukuran bundle |
| **2. Animasi inti** | 1–1,5 minggu | Hero (parallax + Draggable), judul kinetic stabil, timeline, hover list + tanda tangan, stacking cards + fallback, marquee |
| **3. Intro dan momen signature** | 1–1,5 minggu | Koreografi intro (tumpang tindih dengan splash), komponen video, horizontal gallery, dialog cerita, reveal teks, transisi section, kursor berlabel, micro-interaction, easter egg, penyempurnaan easing |
| **4. Responsif dan aksesibilitas** | 4–5 hari | Varian mobile, reduced motion + toggle, uji keyboard dan screen reader, uji kontras |
| **5. Performa dan QA** | 4–6 hari | Optimasi gambar dan video, audit Lighthouse, uji perangkat nyata dan WebView aplikasi chat, uji autoplay iOS Low Power Mode, uji pratinjau WhatsApp, pembersihan EXIF |
| **6. Rilis** | 1–2 hari | Deploy, domain, pratinjau Open Graph, `noindex`, pengumuman ke geng |

Total estimasi: **5,5–6,5 minggu** untuk satu pengembang paruh waktu (naik dari 5–6 minggu karena video, parallax hero, dan splash inline).

## 14. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Konflik Lenis dan ScrollTrigger (pin bergetar, terasa karet) | Tinggi | Satu ticker GSAP, `lagSmoothing(0)`, `scrub: true`, uji dini di Fase 1 |
| Pola stacking cards via timeline kartu berikutnya tidak bekerja | Sedang | Spike Fase 1; fallback GSAP sudah tersedia |
| Judul kinetic menggeser baris atau memicu layout mahal | Sedang | Sumbu width-neutral/slot tetap, batas radius, baca-lalu-tulis per frame |
| Hero memperlambat LCP | Tinggi | Konten terlihat di HTML, judul sebagai LCP, polaroid lazy, failsafe 3 s |
| Dua sistem animasi menimpa `transform` (khusus Opsi B) | Sedang | Wrapper terpisah, aturan satu elemen satu sistem |
| Horizontal scroll bermasalah di iOS Safari atau fokus keyboard | Sedang | Nonaktif di layar kecil, pemetaan fokus (8.6), uji perangkat nyata |
| Berat gambar menurunkan performa | Tinggi | AVIF/WebP, lazy-load, batas ukuran per foto |
| Pengunjung memakai WebView lama tanpa scroll-driven CSS | Sedang | Fallback GSAP wajib, matriks uji WebView |
| Kebocoran lokasi lewat EXIF di repositori | Tinggi | Repo privat atau pembersih pra-commit, kriteria penerimaan 13 |
| Anggota keberatan fotonya tampil | Sedang | `consent` di skema, "hapus saya" dengan target ≤ 24 jam, hapus dari riwayat git |
| Tampilan terasa generik meski tanpa glow | Sedang | Materi asli (5.2), uji anti-template (5.6) |
| Terlalu banyak efek, kehilangan fokus | Sedang | Motion Language (5.4), busur narasi (5.5), tinjauan di setiap fase |
| Lisensi font (variable/tulisan tangan) | Sedang | Periksa lisensi sebelum Fase 2; utamakan font terbuka atau buatan sendiri dari scan |
| Tema gelap tergelincir ke glow, blob, atau gradien generik | Sedang | Aturan cahaya (5.3), uji anti-template (5.6) |
| Video berat atau autoplay diblokir | Tinggi | Anggaran FR-V9, poster fallback, uji iOS Low Power Mode, mode hemat data |
| Lapisan parallax atau objek hero menurunkan fps | Sedang | Batas lapisan, hanya transform, jeda di luar viewport |
| Pratinjau tautan kosong (konten hanya dirender JS) | Tinggi | HTML statis dengan meta; uji WhatsApp |
| Teks redup gagal kontras | Sedang | Batas ukuran dan opacity (9.2) |
| `overflow-x: hidden` ganda merusak sticky | Sedang | `overflow-x: clip` (FR-7.12) |
| Font display statis membuat efek kinetic mustahil | Rendah | FR-1.14 (efek `transform` atau nonaktif) |

## 15. Pertanyaan Terbuka

Keputusan D1–D8 ada di bagian 0.2. Pertanyaan yang tersisa:

1. Berapa jumlah anggota dan siapa yang menjadi "kurator" konten?
2. Objek apa yang bermakna bagi geng untuk hero (D7), atau tanpa objek?
3. Berapa klip video, berapa durasinya, dan apakah ada ucapan (menentukan caption/transkrip dan anggaran, D6)?
4. Apakah ada momen khusus (ulang tahun, kelulusan) yang perlu animasi penutup tersendiri?
5. Apakah geng bersedia melakukan sesi pemindaian tulisan tangan dan ephemera bersama?
6. Apakah ada batasan anggaran untuk proteksi akses di hosting (D4)?
7. Di mana video akan di-host (batas ukuran file di hosting statis)?

## 16. Lampiran: Ringkasan Parameter Animasi

| Animasi | Library | Durasi / Parameter | Easing |
| --- | --- | --- | --- |
| Splash keluar | CSS transition | 1,35 s; min. tampil 900 ms (pertama), maks. 2,2 s | `cinema` |
| Intro (koreografi) | GSAP timeline | mulai ≈ 0,6 s saat splash keluar; total ≤ 2,5 s | `cinema` / `signature` / `drop` |
| Polaroid jatuh | GSAP | stagger 60–90 ms | `drop` (CustomBounce ≈0,1) |
| Drag polaroid | GSAP Draggable + Inertia | rotasi ±6° dari velocity | `signature` |
| Efek "berkembang" | GSAP | opacity overlay 1 → 0 + skala 1,04 → 1 | `signature` |
| Judul kinetic | JS + variable font | lerp 0,15; radius 200 px; hanya fine pointer | Linear (mengikuti kursor) |
| Image reveal anggota | GSAP | `quickTo` 0,4 s; clip-path 0,5 s | `signature` |
| Tanda tangan | GSAP DrawSVG | ≈0,8 s | `signature` |
| Tap-to-expand | GSAP Flip | `--dur-base` | `signature` |
| Timeline SVG | GSAP ScrollTrigger | `scrub: true` | none |
| Stamp tanggal | GSAP | skala 1,4 → 1, `--dur-fast` | `signature` |
| Stacking cards | CSS scroll-driven (+ fallback GSAP) | `entry 0%–100%` kartu berikutnya | linear |
| Marquee | GSAP + Lenis velocity | `timeScale` 1 → 0,2 saat hover; boost ≤ 4× | none |
| Horizontal gallery | GSAP ScrollTrigger | pin, `scrub: true` | none |
| Reveal teks | GSAP SplitText | `--dur-base`, stagger 20–30 ms, `once: true` | `signature` |
| Progress bar | CSS scroll-driven (+ fallback GSAP) | `scroll(root)` | linear |
| Dialog buka/tutup | GSAP | `--dur-base` | `signature` |
| Easter egg | GSAP | `--dur-fast` | `drop` |
| Hero parallax | GSAP (`quickTo`) | faktor kedalaman per lapisan; hanya transform | `signature` |
| Objek hero (opsional) | GSAP | loop transform; jeda di luar viewport | `signature` |
| Video ambient | `<video>` + IntersectionObserver | muat ≈ 200 px sebelum viewport; jeda saat keluar | n/a |

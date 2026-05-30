# FAQ System dengan AI - Solusi Customer Support

Sistem manajemen FAQ berbasis AI yang memanfaatkan Gemini API dari Google untuk secara otomatis menghasilkan draft jawaban untuk pertanyaan pelanggan, sehingga memungkinkan waktu respons yang lebih cepat dengan pengawasan manusia.

---

## Daftar Isi
- [Setup & Menjalankan](#setup--menjalankan)
- [Tech Stack](#tech-stack)
- [Tools AI yang Digunakan](#tools-ai-yang-digunakan-dalam-pengembangan)
- [Peningkatan Masa Depan](#peningkatan-masa-depan)
- [Tantangan & Solusi](#tantangan--solusi)

---

## Setup & Menjalankan

### Prasyarat
- **Node.js** 18+ (diuji dengan v24.13.0)
- **npm** atau package manager setara
- **Gemini API Key** dari [Google AI](https://ai.google.dev)

### Instalasi & Pengembangan Lokal

1. **Clone atau download** proyek ke mesin lokal Anda

2. **Install dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi environment variables:**
   - Copy `.env.local` dan atur `GEMINI_API_KEY`:
   ```
   GEMINI_API_KEY=api-key-anda
   ```

4. **Jalankan development server:**
   ```bash
   npm run dev
   ```
   Aplikasi akan tersedia di `http://localhost:3000` secara default.

5. **Build untuk production:**
   ```bash
   npm run build
   npm start
   ```

### Struktur Proyek
```
faq-system-dengan-ai/
├── src/
│   ├── components/
│   │   ├── LandingPage.tsx      # Form pengiriman pertanyaan pelanggan
│   │   ├── DetailPage.tsx        # Editor jawaban admin dengan draft AI
│   │   ├── DashboardPage.tsx     # Dashboard admin (daftar pertanyaan)
│   │   └── LoginPage.tsx         # Autentikasi admin
│   ├── App.tsx                   # Router aplikasi utama & loader
│   ├── main.tsx                  # React entry point
│   ├── types.ts                  # Interface TypeScript
│   └── index.css                 # Import Tailwind CSS & variabel tema
├── server.ts                     # Server API Express.js
├── vite.config.ts                # Konfigurasi Vite build
├── tsconfig.json                 # Konfigurasi TypeScript
├── package.json                  # Dependensi & script
└── README.md                     # File ini
```

---

## Tech Stack

### Frontend
- **React 19** – Library UI modern dengan fitur terbaru
  - *Alasan:* Peningkatan terbaru untuk concurrent rendering & pengalaman developer yang lebih baik
- **TypeScript** – Pengembangan yang type-safe
  - *Alasan:* Menangkap error saat compile time, meningkatkan maintainability kode
- **Vite** – Build tool dengan kecepatan luar biasa
  - *Alasan:* HMR (<100ms), bundling teroptimasi, jauh lebih cepat dari Webpack
- **Tailwind CSS v4** – Framework CSS utility-first
  - *Alasan:* Pengembangan UI yang cepat dengan custom color tokens, minimal CSS bloat
- **Framer Motion** – Library animasi React
  - *Alasan:* Transisi smooth & animasi feedback tanpa dependensi berat

### Backend
- **Express.js** – Framework Node.js yang ringan
  - *Alasan:* Minimal overhead, battle-tested, sempurna untuk API server
- **tsx** – Eksekusi TypeScript untuk Node.js
  - *Alasan:* Jalankan file TypeScript langsung tanpa step kompilasi terpisah

### AI & APIs
- **Google Gemini API** – Model AI untuk generate draft
  - *Alasan:* Reasoning state-of-the-art, inference cepat, pemahaman konteks excellent
- **Lucide Icons** – Library icon
  - *Alasan:* Icon SVG yang indah, konsisten, dengan support TypeScript yang bagus

### UI Components
- **Headless components** dengan styling Tailwind
  - *Alasan:* Kontrol penuh atas styling, tidak ada library component yang bloated
- **Custom color tokens** (CSS variables)
  - *Alasan:* Branding konsisten, update tema yang mudah

---

## Tools AI yang Digunakan dalam Pengembangan

### 1. **GitHub Copilot** (Asisten Pengembangan Utama)
   - **Tujuan:** Generate kode, scaffolding component, definisi tipe TypeScript
   - **Tugas:** Struktur component React, saran Tailwind class, implementasi endpoint API
   - **Dampak:** Mempercepat implementasi component awal ~40%

### 2. **Tailwind CSS IntelliSense** (Ekstensi VS Code)
   - **Tujuan:** Validasi class real-time, saran class canonical
   - **Tugas:** Memperbaiki non-canonical Tailwind class, mendeteksi class conflict, warning utility deprecated
   - **Dampak:** Menangkap dan memperbaiki 30+ Tailwind class issues, memastikan konsistensi

### 3. **TypeScript Language Server**
   - **Tujuan:** Type checking, validasi interface
   - **Tugas:** Enforcing type safety, menangkap runtime errors sebelum eksekusi
   - **Dampak:** Mencegah multiple bugs saat component composition

### 4. **ESLint + Prettier**
   - **Tujuan:** Code linting dan formatting
   - **Tugas:** Enforcing code standards, automatic formatting
   - **Dampak:** Mempertahankan code style konsisten di semua component

### 5. **Gemini API** (AI In-App)
   - **Tujuan:** Generate draft response AI untuk FAQ pelanggan
   - **Tugas:** Menganalisis pertanyaan pelanggan dan menghasilkan draft jawaban kontekstual
   - **Dampak:** Memungkinkan customer support human-in-the-loop, ~70% lebih cepat dalam drafting response

---

## Peningkatan Masa Depan

### 1. **Integrasi Database**
   - Ganti in-memory storage dengan persistent database (PostgreSQL / MongoDB)
   - Aktifkan multi-user sessions dan question history

### 2. **Advanced Search & Filtering**
   - Full-text search untuk pertanyaan
   - Filter berdasarkan status, tanggal, kategori, atau prioritas
   - Export Q&A data ke CSV/PDF

### 3. **Analytics Dashboard**
   - Metrik response time
   - AI draft acceptance rate
   - Customer satisfaction ratings
   - Kategori pertanyaan populer

### 4. **Multi-language Support**
   - Lokalisasi untuk pasar berbeda
   - Auto-detect bahasa pelanggan dan respond accordingly
   - Terjemahkan AI draft real-time

### 5. **Email Integration**
   - Auto-send response langsung ke email pelanggan
   - Email notification untuk pertanyaan baru
   - Fungsi reply-to-email

### 6. **Advanced AI Features**
   - Fine-tuning Gemini model dengan company-specific knowledge base
   - Automatic question categorization
   - Sentiment analysis pada customer inquiries
   - Saran follow-up questions

### 7. **Accessibility & Performance**
   - WCAG 2.1 AA compliance
   - Optimasi page speed (target <2s Lighthouse)
   - Mobile-first responsive design enhancement
   - Dark mode support

### 8. **Admin Features**
   - Role-based access control (RBAC)
   - Audit logging untuk semua changes
   - Bulk question import dari sumber eksternal
   - Custom response templates

---

## Tantangan & Solusi

### Tantangan 1: Tailwind CSS Class Conflicts
**Masalah:** IntelliSense melaporkan duplicate/conflicting Tailwind class seperti `transition-all transition-transform`, dan banyak custom `var(...)` class tidak dikenali.

**Solusi:**
- Normalize semua custom color token ke canonical class names: `text-[var(--color-brand-green)]` → `text-brand-green`
- Hapus redundant transition class, keep hanya `transition-all`
- Tambahkan CSS variable mappings di `src/index.css` untuk Tailwind recognition

### Tantangan 2: Build & Runtime Errors dengan TypeScript React
**Masalah:** TypeScript missing React type declarations, menyebabkan JSX error seperti `React is not defined` dan `JSX.IntrinsicElements not found`.

**Solusi:**
- Tambahkan `@types/react` dan `@types/react-dom` ke `devDependencies`
- Update `tsconfig.json` untuk menggunakan `react-jsx` transformer
- Reinstall dependensi untuk resolve stale `node_modules` state

### Tantangan 3: Port Conflicts Saat Pengembangan
**Masalah:** Multiple Node process mencoba bind ke port 3000 prevent dev server startup.

**Solusi:**
- Identify conflicting process menggunakan `lsof -i :3000`
- Kill orphaned Node processes
- Restart dev server dengan clean terminal state

### Tantangan 4: CSS Import Order Issues
**Masalah:** Tailwind CSS tidak applied consistently karena custom CSS variables dideklarasikan after Tailwind imports.

**Solusi:**
- Reorder imports di `src/index.css`:
  1. First: Custom CSS variables (`:root {}`)
  2. Second: `@import url(...)` untuk custom fonts
  3. Third: `@import "tailwindcss"`
- Ini ensures Tailwind punya access ke CSS variables untuk theming

### Tantangan 5: Component State Management Complexity
**Masalah:** Managing AI draft generation, save state, dan validation across multiple async operations error-prone.

**Solusi:**
- Gunakan React hooks (`useState`, `useEffect`) dengan clear state separation
- Implement loading states (`isRegenerating`, `isSavingDraft`, `isFinalizing`)
- Tambahkan error feedback messages dengan motion animations
- Gunakan promise-based handlers dengan try-catch untuk API resilience

### Tantangan 6: Performance dengan Motion Animations
**Masalah:** Framer Motion animations causing layout thrashing di admin dashboard.

**Solusi:**
- Gunakan `AnimatePresence` untuk conditional rendering animations
- Apply `transform` dan `opacity` animations (GPU-accelerated)
- Keep animation durations under 300ms untuk responsiveness

---

## API Endpoints

### Questions API
- `GET /api/questions` – Fetch semua customer questions
- `POST /api/questions` – Submit customer question baru
- `PATCH /api/questions/:id` – Update question status atau human answer
- `DELETE /api/questions/:id` – Delete question

### AI Draft API
- `POST /api/generate-draft` – Generate AI draft untuk specific question

### Admin Auth
- `POST /api/login` – Authenticate admin user (hardcoded: admin/admin)

---

## Catatan Pengembangan

- **Belum ada database:** Questions disimpan in-memory (hilang saat server restart)
- **Auth hardcoded:** Gunakan `admin` / `admin` untuk login (implement real auth di production)
- **Gemini API rate limits:** Monitor usage untuk avoid quota overages
- **TypeScript strict mode:** Saat ini disabled; consider enabling untuk stricter type checking

---

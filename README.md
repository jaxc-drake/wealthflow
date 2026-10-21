# 💰 WealthFlow

Aplikasi pencatatan keuangan pribadi berbasis mobile-first dengan desain **Neo-Brutalism**.

Built with: **Next.js 14 (App Router) · Supabase · TailwindCSS · Recharts · SheetJS**

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd wealthflow
npm install
```

### 2. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** → paste & jalankan isi file `supabase-schema.sql`
3. Copy **Project URL** dan **anon public key** dari Settings → API

### 3. Environment Variables

```bash
cp .env.local.example .env.local
```

Isi file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4. Jalankan Dev Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 📁 Struktur Project

```
wealthflow/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx          # Form login
│   │   ├── register/page.tsx       # Form registrasi
│   │   ├── callback/route.ts       # Auth callback
│   │   └── layout.tsx
│   ├── dashboard/
│   │   ├── page.tsx                # Dashboard utama
│   │   ├── transactions/page.tsx   # Daftar transaksi
│   │   ├── budget/page.tsx         # Budget control
│   │   ├── export/page.tsx         # Export Excel
│   │   ├── settings/page.tsx       # Profil & pengaturan
│   │   └── layout.tsx              # Layout + bottom nav
│   ├── globals.css                 # Neo-brutalism styles
│   ├── layout.tsx
│   └── page.tsx                    # Redirect handler
│
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx
│   │   └── BottomNav.tsx
│   ├── dashboard/
│   │   ├── DashboardClient.tsx     # Dashboard logic
│   │   ├── StatusCard.tsx          # Stat card
│   │   ├── BudgetBar.tsx           # Progress bar budget
│   │   ├── BreakdownList.tsx       # Category breakdown
│   │   └── RecentTransactions.tsx
│   ├── transactions/
│   │   ├── TransactionModal.tsx    # Form add/edit
│   │   ├── TransactionsClient.tsx  # List + CRUD
│   │   └── QuickAddButton.tsx      # FAB buttons
│   ├── charts/
│   │   ├── MonthlyChart.tsx        # Bar chart bulan ini
│   │   └── YearlyChart.tsx         # Line chart 12 bulan
│   ├── budget/
│   │   └── BudgetClient.tsx        # Budget management
│   ├── export/
│   │   └── ExportClient.tsx        # Excel export
│   └── settings/
│       └── SettingsClient.tsx
│
├── lib/
│   └── supabase/
│       ├── client.ts               # Browser client
│       ├── server.ts               # Server client
│       └── types.ts                # TypeScript types
│
├── services/
│   ├── transactions.ts             # CRUD transactions
│   └── profile.ts                  # Profile & export log
│
├── utils/
│   ├── finance.ts                  # Business logic keuangan
│   └── export.ts                   # Excel export logic
│
├── middleware.ts                   # Route protection
├── supabase-schema.sql             # Database schema
└── tailwind.config.ts              # Neo-brutalism theme
```

---

## 🎨 Design System (Neo-Brutalism)

### Warna Utama
| Token | Warna | Hex |
|---|---|---|
| `brand-yellow` | Kuning utama | `#FFE347` |
| `brand-green` | Pemasukan | `#B8FF4F` |
| `brand-pink` | Pengeluaran | `#FF6B9D` |
| `brand-blue` | Info/Edit | `#4ECBFF` |
| `brand-red` | Alert/Hapus | `#FF4444` |

### CSS Classes
```css
.neo-card        /* card dengan border hitam tebal + shadow keras */
.neo-btn         /* tombol neo-brutal */
.neo-btn-yellow  /* tombol kuning */
.neo-btn-green   /* tombol hijau */
.neo-btn-pink    /* tombol pink */
.neo-btn-black   /* tombol hitam (CTA utama) */
.neo-input       /* input field */
.neo-badge       /* badge/tag */
```

---

## 💡 Fitur Utama

### ✅ Auth System
- Login / Register dengan Supabase Auth
- Protected routes via middleware
- Auto-create profil saat signup

### 💰 Budget Control
- Set limit bulanan
- Progress bar real-time
- Status: ✅ Sehat / ⚠️ Peringatan / 🚨 Over Budget / ❌ Defisit

### 📊 Dashboard
- Total income, expense, balance bulan ini
- Status finansial otomatis
- Navigasi bulan maju/mundur
- Grafik bulanan & tahunan

### 🔄 CRUD Transaksi
- Tambah income/expense (< 3 klik)
- Edit & hapus transaksi
- Filter by type, bulan, pencarian
- Grouping by tanggal

### 📤 Export Excel
- 1x per tahun per user (dibatasi DB)
- 3 sheet: Transaksi, Ringkasan, Kategori
- Download otomatis .xlsx

---

## 🗄️ Database Schema

```sql
profiles         -- profil user + monthly_budget
transactions     -- semua transaksi (income/expense)
export_logs      -- log export, unique(user_id, export_year)
```

RLS diaktifkan — setiap user hanya bisa akses data sendiri.

---

## 🏗️ Deploy ke Vercel

```bash
npm run build   # cek tidak ada error
vercel deploy   # atau push ke GitHub + connect Vercel
```

Tambahkan environment variables di Vercel Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📱 Mobile-First

- Bottom navigation bar
- Modal slide-up untuk form transaksi
- Touch-optimized button sizes (min 44px)
- Safe area insets untuk notch/home indicator
- Input numeric keyboard untuk jumlah uang

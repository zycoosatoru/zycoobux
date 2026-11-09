# ZYCOOBUX - Premium Robux Store. Beyond Ordinary.

Website top-up Robux full-stack premium dengan tema visual **"Luxury Gaming Technology"** (Midnight Black `#09090D`, Metallic Silver `#C0C0C0`, Platinum `#E5E4E2`, aksen Neon Purple `#9B5CFF` ke Electric Blue `#368BFF`).

---

## 🔗 Akses Link Terpisah

Portal admin dipisahkan sepenuhnya dari toko publik pelanggan:

1. **🌐 Link Publikasi (Toko Pelanggan)**:
   - Root URL: `/` (Beranda Top-Up Robux)
   - Lacak Pesanan: `/check-order`
   - Nota Digital: `/invoice/:id`
   - *Bebas dari tombol admin apa pun untuk kenyamanan dan privasi pembeli.*

2. **🔒 Link Khusus Admin (Pemilik / Owner ZYCOO)**:
   - Login Admin: `/admin/login`
   - Dashboard Manajemen Pesanan: `/admin/dashboard`
   - *Kredensial Default:* Username: `zycoo` | Password: `Gua.azky.277` *(dapat diubah via `.env`)*

---

## ⚡ Fitur Utama
1. **Verifikasi Akun Roblox Real-Time**:
   - Terhubung langsung ke official API Roblox (`users.roblox.com` & `thumbnails.roblox.com`).
   - Pencocokan username eksak dan display name case-insensitive.
   - Menampilkan foto avatar + badge perak-hijau **VERIFIED**.
   - **Zero Password & OTP**: Tidak pernah meminta kata sandi pengguna.
2. **Kalkulator & Paket Robux Instan**:
   - Paket populer: 50, 100, 250 (Popular), 500, 1000 (Popular), 2000, 3000, 5000 Robux.
   - Jumlah custom kelipatan 50 (minimal 50 s.d. 5.000 Robux).
   - Rate resmi: **Rp 165 per Robux**, dihitung ulang dan diverifikasi ketat di sisi server.
3. **Pilihan Pembayaran Lengkap (Dropdown & Live Preview)**:
   - **QRIS**: Merchant "zycoo store", NMID `ID1026511358586` (dapat discan m-Banking & semua E-Wallet). Maks. 2.500 R$.
   - **DANA**: `081288872390` a.n. romlah.
   - **GoPay**: `081288872390` a.n. Muhammad Azky Alfarizi.
   - **ShopeePay**: `081288872390` a.n. Muhammad Azky Alfarizi.
   - **SeaBank**: `901621421075` a.n. Muhammad Azky Alfarizi.
4. **Keamanan & Validasi Server-Side**:
   - Dua konfirmasi wajib: Verifikasi usia 18+ dan pengecekan limit akun Roblox.
   - ID Transaksi acak `ZYC` + 8 digit (crypto-secure).
   - Server tidak mempercayai status atau harga dari client.
5. **Nota Digital & Cek Pesanan**:
   - Lacak status transaksi (`/check-order`) dan nota digital transaksi (`/invoice/:id`).
   - Fitur upload bukti transfer dan status `PAID`.
   - Bantuan WhatsApp CS hanya jika pesanan > 1 jam belum diproses.
6. **Portal Admin Terpisah (/admin/login & /admin/dashboard)**:
   - Validasi kredensial timing-safe dengan cookie sesi bertanda tangan HMAC (kedaluwarsa 8 jam).
   - 3 Kartu Metrik: Total Pendapatan Sukses (COMPLETED), Antrean Pending, dan Total Pesanan Berhasil.
   - Tabel manajemen pesanan dengan aksi "Proses", "Selesaikan", "Batalkan" (dengan konfirmasi modal), dan auto-refresh 15 detik.
7. **Real-Time Robux Stock Engine**:
   - Ticker stok live di Beranda pelanggan (`STOK ROBUX TERSEDIA: XX.XXX R$`).
   - Admin dapat menambah/mengatur stok dengan tombol cepat (`+1.000`, `+2.500`, `+5.000`, `+10.000`) atau input custom di Dashboard Admin.
   - **Otomatis Berkurang**: Stok langsung berkurang saat pesanan diubah ke status `COMPLETED` (Selesai).
   - **Otomatis Dikembalikan**: Jika pesanan `COMPLETED` dibatalkan (`CANCELLED`), stok otomatis dikembalikan ke etalase.
   - Validasi checkout: Pembeli tidak bisa memesan melebihi sisa stok yang tersedia.

---

## 🗄️ Setup Database Supabase PostgreSQL

Jalankan query SQL berikut di **Supabase SQL Editor**:

```sql
-- Buat tabel orders
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR PRIMARY KEY,
  roblox_username VARCHAR NOT NULL,
  roblox_display_name VARCHAR NOT NULL,
  roblox_user_id VARCHAR NOT NULL,
  robux_amount INT NOT NULL CHECK (robux_amount > 0),
  price_paid INT NOT NULL CHECK (price_paid > 0),
  payment_method VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED')),
  payment_proof TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Aktifkan Row Level Security (RLS) tanpa policy publik
-- Semua akses membaca & menulis dilakukan aman melalui service role key di backend
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
```

---

## ⚙️ Konfigurasi Environment (.env)

Salin `.env.example` ke `.env`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-secret-key"

# Admin Authentication
ADMIN_USERNAME="zycoo"
ADMIN_PASSWORD="Gua.azky.277"

# Admin Session Secret (Minimal 32 karakter acak untuk HMAC token)
ADMIN_SESSION_SECRET="zycoobux-ultra-secure-admin-session-secret-32chars!"
```

---

## 🚀 Menjalankan Project

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Server Development
```bash
npm run dev
```
Aplikasi berjalan di `http://localhost:3000`.

### 3. Build & Production / Vercel Deploy
```bash
npm run build
npm start
```
Untuk deploy ke Vercel atau Next.js hosting, seluruh struktur folder `/app`, `/components`, dan `/lib` sudah tersedia secara native.

---

## 📱 Kontak & Komunitas Resmi
- **WhatsApp CS**: 0812-8887-2390
- **Saluran WhatsApp**: [https://whatsapp.com/channel/0029VbEy14z0AgWBwk9sdm03](https://whatsapp.com/channel/0029VbEy14z0AgWBwk9sdm03)
- **Komunitas ZYCOOBUX**: [https://whatsapp.com/channel/0029VbEy14z0AgWBwk9sdm03/135](https://whatsapp.com/channel/0029VbEy14z0AgWBwk9sdm03/135)

---

## ⚖️ Disclaimer
ZYCOOBUX adalah toko independen dan tidak berafiliasi, disponsori, atau didukung oleh Roblox Corporation. Roblox dan merek dagangnya merupakan milik pemiliknya masing-masing.


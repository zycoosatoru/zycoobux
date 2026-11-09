export const PRICE_PER_ROBUX = 165; // Rp 165 per Robux

export const ROBUX_PACKAGES = [
  { amount: 50, popular: false },
  { amount: 100, popular: false },
  { amount: 250, popular: true },
  { amount: 500, popular: false },
  { amount: 1000, popular: true },
  { amount: 2000, popular: false },
  { amount: 3000, popular: false },
  { amount: 5000, popular: false },
] as const;

export const CUSTOM_MIN_ROBUX = 50;
export const CUSTOM_MAX_ROBUX = 5000;
export const CUSTOM_STEP = 50;
export const QRIS_MAX_ROBUX = 2500; // Maksimal transaksi pembayaran via QRIS

export interface PaymentMethodInfo {
  id: string;
  name: string;
  type: 'qris' | 'ewallet' | 'bank';
  accountNumber?: string;
  accountName?: string;
  instructions: string;
  image?: string;
  maxRobux?: number;
}

export const PAYMENT_METHODS: PaymentMethodInfo[] = [
  {
    id: 'QRIS',
    name: 'QRIS (Semua Pembayaran)',
    type: 'qris',
    accountName: 'zycoo store',
    maxRobux: QRIS_MAX_ROBUX,
    instructions: 'Scan kode QRIS resmi ZYCOO STORE menggunakan m-Banking (BCA, Mandiri, BRI, BNI) atau e-Wallet (DANA, GoPay, OVO, ShopeePay). NMID: ID1026511358586. Maksimal transaksi 2.500 Robux.',
    image: '/images/qris-zycoo-store.png',
  },
  {
    id: 'DANA',
    name: 'DANA',
    type: 'ewallet',
    accountNumber: '081288872390',
    accountName: 'romlah',
    instructions: 'Buka aplikasi DANA > Kirim > Masukkan nomor 081288872390 a.n. romlah > Masukkan nominal sesuai tagihan.',
  },
  {
    id: 'GOPAY',
    name: 'GoPay',
    type: 'ewallet',
    accountNumber: '081288872390',
    accountName: 'Muhammad Azky Alfarizi',
    instructions: 'Buka GoPay > Transfer > Masukkan nomor 081288872390 a.n. Muhammad Azky Alfarizi.',
  },
  {
    id: 'SHOPEEPAY',
    name: 'ShopeePay',
    type: 'ewallet',
    accountNumber: '081288872390',
    accountName: 'Muhammad Azky Alfarizi',
    instructions: 'Buka Shopee > ShopeePay > Transfer ke Kontak 081288872390 a.n. Muhammad Azky Alfarizi.',
  },
  {
    id: 'SEABANK',
    name: 'SeaBank (Bank Transfer)',
    type: 'bank',
    accountNumber: '901621421075',
    accountName: 'Muhammad Azky Alfarizi',
    instructions: 'Transfer antar bank ke Bank SeaBank (Kode 535) No. Rekening 901621421075 a.n. Muhammad Azky Alfarizi.',
  },
];

export const BRAND = {
  name: 'ZYCOOBUX',
  tagline: 'Premium Robux Store. Beyond Ordinary.',
  whatsappPhone: '0812-8887-2390',
  whatsappRaw: '6281288872390',
  whatsappChannel: 'https://whatsapp.com/channel/0029VbEy14z0AgWBwk9sdm03',
  whatsappCommunity: 'https://whatsapp.com/channel/0029VbEy14z0AgWBwk9sdm03/135',
  disclaimer:
    'ZYCOOBUX adalah toko independen dan tidak berafiliasi, disponsori, atau didukung oleh Roblox Corporation. Roblox dan merek dagangnya merupakan milik pemiliknya masing-masing.',
};

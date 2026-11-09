import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  ArrowRight,
  Flame,
  CreditCard,
  QrCode,
  Check,
  UserCheck,
  Users,
  MessageCircle,
  ExternalLink,
  Bell,
  Layers,
} from 'lucide-react';
import {
  PRICE_PER_ROBUX,
  ROBUX_PACKAGES,
  CUSTOM_MIN_ROBUX,
  CUSTOM_MAX_ROBUX,
  CUSTOM_STEP,
  QRIS_MAX_ROBUX,
  PAYMENT_METHODS,
  BRAND,
} from '../../lib/config';

interface HomePageProps {
  navigate: (path: string) => void;
}

interface VerifiedUser {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  // Real-time Available Robux Stock
  const [availableStock, setAvailableStock] = useState<number>(48500);
  const [isStockLoading, setIsStockLoading] = useState<boolean>(true);

  // Step 1: Verification State
  const [usernameInput, setUsernameInput] = useState('');
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'IDLE' | 'VERIFIED' | 'FAILED' | 'NOT FOUND'>('IDLE');
  const [verifyMessage, setVerifyMessage] = useState('');
  const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(null);

  // Step 2: Robux Package & Custom Selection
  const [selectedPackage, setSelectedPackage] = useState<number | 'custom'>(250);
  const [customAmount, setCustomAmount] = useState<number | ''>(250);
  const [customError, setCustomError] = useState('');

  // Step 3: Payment & Agreements
  const [paymentMethod, setPaymentMethod] = useState<string>('QRIS');
  const [agreedAge, setAgreedAge] = useState(false);
  const [agreedLimit, setAgreedLimit] = useState(false);

  // Checkout submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Fetch real-time available stock
  const fetchStock = async () => {
    try {
      const res = await fetch('/api/stock');
      const data = await res.json();
      if (data.success && typeof data.stock === 'number') {
        setAvailableStock(data.stock);
      }
    } catch {
      // Fallback to current
    } finally {
      setIsStockLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
    const interval = setInterval(fetchStock, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculate current selected Robux amount
  const currentRobuxAmount =
    selectedPackage === 'custom'
      ? typeof customAmount === 'number'
        ? customAmount
        : 0
      : selectedPackage;

  // Real-time price calculation: Rp 165 per Robux
  const totalPrice = currentRobuxAmount * PRICE_PER_ROBUX;

  // Validate custom amount
  const handleCustomChange = (valStr: string) => {
    setSelectedPackage('custom');
    if (valStr === '') {
      setCustomAmount('');
      setCustomError('Jumlah Robux wajib diisi.');
      return;
    }

    const val = parseInt(valStr, 10);
    setCustomAmount(val);

    if (isNaN(val)) {
      setCustomError('Masukkan angka yang valid.');
    } else if (val < CUSTOM_MIN_ROBUX) {
      setCustomError(`Minimal pemesanan adalah ${CUSTOM_MIN_ROBUX} Robux.`);
    } else if (val > CUSTOM_MAX_ROBUX) {
      setCustomError(`Maksimal pemesanan adalah ${CUSTOM_MAX_ROBUX.toLocaleString('id-ID')} Robux.`);
    } else if (val % CUSTOM_STEP !== 0) {
      setCustomError(`Jumlah Robux harus kelipatan ${CUSTOM_STEP} (contoh: 50, 100, 150, 200).`);
    } else {
      setCustomError('');
    }
  };

  // Step 1: Verify Roblox account
  const handleVerifyAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = usernameInput.trim();
    const cleanDisplay = displayNameInput.trim();

    if (!cleanUser || !cleanDisplay) {
      setVerifyStatus('FAILED');
      setVerifyMessage('Silakan lengkapi Username dan Display Name Roblox Anda.');
      return;
    }

    // Regex check ^[A-Za-z0-9_]{3,20}$
    if (!/^[A-Za-z0-9_]{3,20}$/.test(cleanUser)) {
      setVerifyStatus('FAILED');
      setVerifyMessage('Format username tidak valid (hanya 3-20 karakter alfanumerik & garis bawah).');
      return;
    }

    setIsVerifying(true);
    setVerifyMessage('');

    try {
      const res = await fetch('/api/roblox-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, displayName: cleanDisplay }),
      });

      const data = await res.json();

      if (data.status === 'VERIFIED' && data.user) {
        setVerifyStatus('VERIFIED');
        setVerifiedUser(data.user);
        setVerifyMessage(data.message || 'Akun berhasil diverifikasi!');
      } else if (data.status === 'NOT FOUND') {
        setVerifyStatus('NOT FOUND');
        setVerifiedUser(null);
        setVerifyMessage(data.message || `Username "${cleanUser}" tidak ditemukan di Roblox.`);
      } else {
        setVerifyStatus('FAILED');
        setVerifiedUser(null);
        setVerifyMessage(data.message || 'Display Name tidak cocok dengan akun Roblox.');
      }
    } catch {
      setVerifyStatus('FAILED');
      setVerifyMessage('Gagal menghubungi server verifikasi. Periksa koneksi internet Anda.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Step 3: Checkout validation & submission
  const isQrisLimitExceeded = paymentMethod === 'QRIS' && currentRobuxAmount > QRIS_MAX_ROBUX;
  const isOutOfStock = currentRobuxAmount > availableStock;

  const isFormValid =
    verifyStatus === 'VERIFIED' &&
    verifiedUser !== null &&
    currentRobuxAmount >= CUSTOM_MIN_ROBUX &&
    currentRobuxAmount <= CUSTOM_MAX_ROBUX &&
    currentRobuxAmount % CUSTOM_STEP === 0 &&
    !customError &&
    !isOutOfStock &&
    paymentMethod &&
    !isQrisLimitExceeded &&
    agreedAge &&
    agreedLimit;

  const handleCheckout = async () => {
    if (!isFormValid || !verifiedUser) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: verifiedUser.username,
          displayName: verifiedUser.displayName,
          robuxAmount: currentRobuxAmount,
          paymentMethod,
          agreedAge,
          agreedLimit,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSubmitError(data.message || 'Gagal memproses pesanan. Silakan periksa kembali data Anda.');
        setIsSubmitting(false);
        return;
      }

      // Navigate to digital invoice page
      navigate(`/invoice/${data.orderId}`);
    } catch (err: any) {
      setSubmitError('Terjadi gangguan jaringan saat memproses pesanan.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* ================= HERO SECTION ================= */}
      <section className="relative text-center pt-8 sm:pt-14 pb-8 overflow-hidden">
        {/* Soft Purple Ambient Radial Glow behind logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-r from-[#9B5CFF]/25 to-[#368BFF]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-6">
          {/* Large Logo in luxury metallic frame with soft purple glow */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              {/* Soft Purple Ambient Radial Glow behind logo */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#9B5CFF] via-[#7B42F6] to-[#368BFF] rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition-all duration-500" />
              
              {/* Luxury Metallic Silver & Platinum Frame */}
              <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-3xl p-[2.5px] bg-gradient-to-br from-white via-[#C0C0C0] to-[#71717A] shadow-2xl shadow-[#9B5CFF]/30">
                <div className="w-full h-full bg-[#09090D] rounded-[22px] flex items-center justify-center overflow-hidden p-1.5 group-hover:scale-[1.02] transition-transform duration-300">
                  <img
                    src="/images/logo-zycoo.png"
                    alt="ZYCOOBUX Luxury Mascot Logo"
                    className="w-full h-full object-cover rounded-[18px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-[#C0C0C0] font-semibold tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#9B5CFF]" />
            Official Luxury Robux Provider
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-white via-[#C0C0C0] to-[#368BFF] bg-clip-text text-transparent drop-shadow-sm">
              TOPUP ROBUX VIA USERNAME
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-[#C0C0C0] max-w-2xl mx-auto font-medium leading-relaxed">
            Top Up Robux dengan mudah, cepat, dan nyaman bersama ZYCOOBUX.
          </p>

          {/* Real-time Available Robux Stock Display */}
          <div className="flex justify-center pt-2">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0F0F16] via-[#141420] to-[#0F0F16] border border-emerald-500/40 text-xs shadow-2xl shadow-emerald-500/10">
              <span className="flex items-center gap-2 font-bold text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[#C0C0C0] uppercase tracking-wider text-[11px]">Stok Robux Tersedia:</span>
              </span>
              <span className="font-mono font-black text-emerald-400 text-base sm:text-lg tracking-wide">
                {availableStock.toLocaleString('id-ID')} R$
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                READY
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-[#A1A1AA]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Tanpa Password / OTP
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Harga Resmi Rp 165/R$
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Verifikasi Official API
            </span>
          </div>

          {/* Quick WhatsApp Channels & Community Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <a
              href={BRAND.whatsappChannel}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-emerald-300 text-xs font-bold transition-all shadow-lg shadow-[#25D366]/10 group cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-[#25D366] animate-bounce" />
              <span>📢 Saluran WhatsApp ZYCOOBUX</span>
              <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
            </a>

            <a
              href={BRAND.whatsappCommunity}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#368BFF]/15 hover:bg-[#368BFF]/25 border border-[#368BFF]/40 text-[#368BFF] text-xs font-bold transition-all shadow-lg shadow-[#368BFF]/10 group cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>👥 Grup Komunitas Robux</span>
              <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
            </a>
          </div>
        </div>
      </section>

      {/* ================= ORDER STEPS CONTAINER ================= */}
      <div className="max-w-4xl mx-auto space-y-10 px-4 sm:px-6">
        {/* ================= STEP 1: VERIFIKASI AKUN ================= */}
        <section
          id="step-verification"
          className="relative bg-gradient-to-b from-[#0F0F16]/90 to-[#09090D]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6"
        >
          {/* Step header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#9B5CFF] to-[#368BFF] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-[#9B5CFF]/30">
                1
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  Verifikasi Akun Roblox
                </h2>
                <p className="text-xs text-[#A1A1AA]">
                  Pastikan akun Anda aktif untuk pengiriman Robux tanpa kendala
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-400/90 font-medium bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">100% Aman Tanpa Password</span>
            </div>
          </div>

          <form onSubmit={handleVerifyAccount} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#C0C0C0] uppercase tracking-wider mb-2">
                  Roblox Username <span className="text-[#9B5CFF]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Builderman"
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    if (verifyStatus !== 'IDLE') setVerifyStatus('IDLE');
                  }}
                  className="w-full bg-[#09090D] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-[#9B5CFF] focus:ring-1 focus:ring-[#9B5CFF] transition-all font-mono"
                />
                <span className="text-[10px] text-[#71717A] mt-1 block">
                  3-20 karakter, huruf, angka, garis bawah
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C0C0C0] uppercase tracking-wider mb-2">
                  Roblox Display Name <span className="text-[#368BFF]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: David"
                  value={displayNameInput}
                  onChange={(e) => {
                    setDisplayNameInput(e.target.value);
                    if (verifyStatus !== 'IDLE') setVerifyStatus('IDLE');
                  }}
                  className="w-full bg-[#09090D] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-[#368BFF] focus:ring-1 focus:ring-[#368BFF] transition-all font-mono"
                />
                <span className="text-[10px] text-[#71717A] mt-1 block">
                  Nama tampilan yang tertera di profil Roblox Anda
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="submit"
                disabled={isVerifying}
                className={`w-full sm:w-auto px-7 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isVerifying
                    ? 'bg-white/10 text-white/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#9B5CFF] to-[#368BFF] hover:from-[#8B4CF0] hover:to-[#257BEF] text-white shadow-lg shadow-[#9B5CFF]/25 hover:scale-[1.02]'
                }`}
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>MEMERIKSA API ROBLOX...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>VERIFIKASI AKUN</span>
                  </>
                )}
              </button>

              <span className="text-xs text-[#71717A] text-center sm:text-right">
                Pencocokan persis via official server Roblox
              </span>
            </div>
          </form>

          {/* Verification Status Card */}
          {verifyStatus === 'VERIFIED' && verifiedUser && (
            <div className="p-4 rounded-2xl bg-[#09090D] border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-xl">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl p-[1.5px] bg-gradient-to-br from-emerald-400 to-[#368BFF] overflow-hidden shrink-0 shadow-lg">
                  <img
                    src={verifiedUser.avatarUrl}
                    alt={verifiedUser.username}
                    className="w-full h-full object-cover bg-slate-900 rounded-[14px]"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-white">{verifiedUser.displayName}</span>
                    <span className="text-xs text-[#A1A1AA] font-mono">(@{verifiedUser.username})</span>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                    ID Roblox: {verifiedUser.userId}
                  </p>
                </div>
              </div>

              {/* Perak-Hijau VERIFIED Badge */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 via-[#C0C0C0]/20 to-emerald-500/20 border border-emerald-400/50 shadow-md">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-black tracking-widest text-emerald-300 uppercase">
                  VERIFIED
                </span>
              </div>
            </div>
          )}

          {verifyStatus === 'FAILED' && (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 flex items-start gap-3 text-xs text-rose-300">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider block mb-0.5 text-rose-400">
                  FAILED - GAGAL VERIFIKASI
                </span>
                <p>{verifyMessage}</p>
              </div>
            </div>
          )}

          {verifyStatus === 'NOT FOUND' && (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-start gap-3 text-xs text-amber-300">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider block mb-0.5 text-amber-400">
                  NOT FOUND - AKUN TIDAK DITEMUKAN
                </span>
                <p>{verifyMessage}</p>
              </div>
            </div>
          )}
        </section>

        {/* ================= STEP 2: PILIH JUMLAH ROBUX ================= */}
        <section className="bg-gradient-to-b from-[#0F0F16]/90 to-[#09090D]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#9B5CFF] to-[#368BFF] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-[#9B5CFF]/30">
                2
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  Pilih Paket Robux
                </h2>
                <p className="text-xs text-[#A1A1AA]">
                  Rate termurah resmi: <span className="text-[#368BFF] font-bold">Rp 165 / Robux</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Stok: {availableStock.toLocaleString('id-ID')} R$</span>
              </span>
              <span className="text-xs font-mono font-bold text-[#C0C0C0] bg-white/5 px-3 py-1 rounded-full border border-white/10 hidden sm:inline-block">
                Maks. 5.000 R$
              </span>
            </div>
          </div>

          {/* Out of Stock Warning */}
          {isOutOfStock && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-3 text-xs text-rose-300 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider block mb-0.5 text-rose-400">
                  STOK ROBUX TIDAK MENCUKUPI
                </span>
                <p>
                  Pilihan Anda ({currentRobuxAmount.toLocaleString('id-ID')} Robux) melebihi sisa stok yang tersedia saat ini ({availableStock.toLocaleString('id-ID')} Robux). Silakan pilih jumlah yang lebih kecil atau hubungi admin.
                </p>
              </div>
            </div>
          )}

          {/* Package Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {ROBUX_PACKAGES.map((pkg) => {
              const isSelected = selectedPackage === pkg.amount;
              const price = pkg.amount * PRICE_PER_ROBUX;

              return (
                <div
                  key={pkg.amount}
                  onClick={() => {
                    setSelectedPackage(pkg.amount);
                    setCustomError('');
                  }}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#9B5CFF]/25 to-[#368BFF]/25 border-[#9B5CFF] shadow-lg shadow-[#9B5CFF]/20 scale-[1.02]'
                      : 'bg-[#09090D] border-white/5 hover:border-white/20 hover:bg-white/[0.03]'
                  }`}
                >
                  {/* POPULAR badge */}
                  {pkg.popular && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5 fill-white" /> POPULAR
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-1 text-[#C0C0C0] text-xs font-semibold">
                      <span>Robux</span>
                    </div>
                    <div className="text-2xl font-black text-white font-mono mt-1">
                      {pkg.amount.toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">
                      Rp {price.toLocaleString('id-ID')}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#9B5CFF]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Robux Amount Input */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-[#C0C0C0] uppercase tracking-wider mb-2">
              Atau Masukkan Jumlah Custom (Kelipatan 50):
            </label>
            <div className="relative">
              <input
                type="number"
                step="50"
                min="50"
                max="5000"
                placeholder="Contoh: 150, 750, 1500, 4500..."
                value={selectedPackage === 'custom' ? customAmount : ''}
                onChange={(e) => handleCustomChange(e.target.value)}
                onFocus={() => setSelectedPackage('custom')}
                className="w-full bg-[#09090D] border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder-[#71717A] focus:outline-none focus:border-[#9B5CFF] focus:ring-1 focus:ring-[#9B5CFF] font-mono font-bold"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#A1A1AA]">
                ROBUX
              </span>
            </div>

            {customError ? (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {customError}
              </p>
            ) : (
              <p className="text-[11px] text-[#71717A] mt-1.5">
                Aturan: Bilangan bulat kelipatan 50, minimal 50, maksimal 5.000 Robux.
              </p>
            )}
          </div>
        </section>

        {/* ================= STEP 3: PEMBAYARAN & CHECKOUT ================= */}
        <section className="bg-gradient-to-b from-[#0F0F16]/90 to-[#09090D]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#9B5CFF] to-[#368BFF] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-[#9B5CFF]/30">
                3
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  Metode Pembayaran &amp; Persetujuan
                </h2>
                <p className="text-xs text-[#A1A1AA]">
                  Pilih channel pembayaran resmi dan konfirmasi persyaratan akun
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method Selector (Dropdown) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#C0C0C0] uppercase tracking-wider">
                Pilih Metode Pembayaran (Dropdown)
              </label>
              <span className="text-[11px] text-[#A1A1AA]">
                QRIS limit: <strong className="text-emerald-400 font-mono">2.500 R$</strong>
              </span>
            </div>

            {/* Dropdown Select Menu */}
            <div className="relative">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-[#09090D] border border-white/10 rounded-xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-[#9B5CFF] focus:ring-1 focus:ring-[#9B5CFF] transition-all cursor-pointer appearance-none"
              >
                {PAYMENT_METHODS.map((m) => {
                  const isQrisDisabled = m.id === 'QRIS' && currentRobuxAmount > QRIS_MAX_ROBUX;
                  return (
                    <option
                      key={m.id}
                      value={m.id}
                      disabled={isQrisDisabled}
                      className="bg-[#09090D] text-white py-2"
                    >
                      {m.name} {m.accountNumber ? `(${m.accountNumber} a.n. ${m.accountName})` : ''} {isQrisDisabled ? '— [Maks. 2.500 R$]' : ''}
                    </option>
                  );
                })}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#A1A1AA] text-xs">
                ▼
              </div>
            </div>

            {/* Quick-Select Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {PAYMENT_METHODS.map((m) => {
                const isSelected = paymentMethod === m.id;
                const isQrisDisabled = m.id === 'QRIS' && currentRobuxAmount > QRIS_MAX_ROBUX;

                return (
                  <button
                    key={m.id}
                    type="button"
                    disabled={isQrisDisabled}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isQrisDisabled
                        ? 'opacity-40 bg-white/[0.01] border-white/5 cursor-not-allowed text-[#71717A]'
                        : isSelected
                        ? 'bg-gradient-to-r from-[#9B5CFF]/25 to-[#368BFF]/25 border-[#9B5CFF] text-white shadow-md'
                        : 'bg-[#09090D] border-white/5 text-[#A1A1AA] hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span>{m.id}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Payment Detail Preview Box */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              {paymentMethod === 'QRIS' ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-xl p-1.5 shrink-0 shadow-lg border border-white/20">
                    <img
                      src="/images/qris-zycoo-store.png"
                      alt="QRIS ZYCOO STORE"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="text-xs space-y-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="font-bold text-white text-sm">QRIS Instant Pay</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Auto Check
                      </span>
                    </div>
                    <p className="text-[#C0C0C0]">Merchant: <strong className="text-white">zycoo store</strong></p>
                    <p className="text-[#A1A1AA] font-mono">NMID: ID1026511358586</p>
                    <p className="text-[11px] text-[#71717A]">
                      Bisa di-scan dari BCA, Mandiri, BRI, BNI, DANA, GoPay, OVO, ShopeePay dll.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[#71717A] uppercase tracking-wider block font-semibold mb-0.5">
                      Tujuan Transfer {paymentMethod}:
                    </span>
                    <span className="text-lg font-black text-white font-mono tracking-wider block">
                      {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.accountNumber}
                    </span>
                    <span className="text-xs text-[#C0C0C0]">
                      Atas Nama:{' '}
                      <strong className="text-white">
                        {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.accountName}
                      </strong>
                    </span>
                  </div>
                  <div className="text-xs text-[#A1A1AA] max-w-xs text-left sm:text-right">
                    {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.instructions}
                  </div>
                </div>
              )}
            </div>

            {isQrisLimitExceeded && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Maksimal pembayaran melalui QRIS adalah <strong>2.500 Robux</strong> (Rp{' '}
                  {(QRIS_MAX_ROBUX * PRICE_PER_ROBUX).toLocaleString('id-ID')}). Silakan pilih metode DANA,
                  GoPay, ShopeePay, atau SeaBank untuk pesanan ini.
                </span>
              </div>
            )}
          </div>

          {/* EXACTLY TWO MANDATORY CHECKBOXES */}
          <div className="p-4 rounded-2xl bg-[#09090D] border border-white/5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C0C0C0] block">
              Konfirmasi Wajib (Centang Keduanya):
            </span>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedAge}
                onChange={(e) => setAgreedAge(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-slate-900 text-[#9B5CFF] focus:ring-[#9B5CFF] accent-[#9B5CFF]"
              />
              <span className="text-xs text-[#C0C0C0] leading-relaxed">
                Akun Roblox saya sudah terverifikasi usia 18+.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedLimit}
                onChange={(e) => setAgreedLimit(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-slate-900 text-[#9B5CFF] focus:ring-[#9B5CFF] accent-[#9B5CFF]"
              />
              <span className="text-xs text-[#C0C0C0] leading-relaxed">
                Limit akun Roblox saya sudah dicek.
              </span>
            </label>
          </div>

          {/* Total & Checkout Button */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div>
                <span className="text-xs text-[#71717A] uppercase tracking-wider font-semibold">
                  Ringkasan Pesanan
                </span>
                <div className="text-sm font-semibold text-white mt-0.5">
                  {currentRobuxAmount.toLocaleString('id-ID')} Robux (@ Rp 165)
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-[#71717A] uppercase tracking-wider font-semibold block">
                  Total Tagihan
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {submitError && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Pay Now Button (Disabled until ALL conditions met) */}
            <button
              type="button"
              disabled={!isFormValid || isSubmitting}
              onClick={handleCheckout}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-2xl ${
                isFormValid && !isSubmitting
                  ? 'bg-gradient-to-r from-[#9B5CFF] via-[#7B42F6] to-[#368BFF] hover:from-[#8B4CF0] hover:to-[#257BEF] text-white shadow-[#9B5CFF]/30 cursor-pointer hover:scale-[1.01]'
                  : 'bg-white/5 text-[#71717A] border border-white/5 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>MEMPROSES PESANAN...</span>
                </>
              ) : (
                <>
                  <span>BAYAR SEKARANG</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {!isFormValid && (
              <p className="text-[11px] text-[#71717A] text-center">
                {verifyStatus !== 'VERIFIED'
                  ? '⚠️ Lengkapi Verifikasi Akun Roblox di Langkah 1 terlebih dahulu.'
                  : isOutOfStock
                  ? `⚠️ Jumlah Robux melebihi stok yang tersedia saat ini (${availableStock.toLocaleString('id-ID')} R$).`
                  : isQrisLimitExceeded
                  ? '⚠️ Maksimal pembayaran via QRIS adalah 2.500 Robux. Silakan pilih DANA, GoPay, ShopeePay, atau SeaBank.'
                  : !agreedAge || !agreedLimit
                  ? '⚠️ Centang kedua konfirmasi wajib (usia 18+ dan limit akun) untuk melanjutkan.'
                  : '⚠️ Periksa kembali jumlah Robux dan metode pembayaran Anda.'}
              </p>
            )}
          </div>
        </section>

        {/* ================= SALURAN WHATSAPP & GRUP ROBUX SHOWCASE ================= */}
        <section className="bg-gradient-to-b from-[#0F0F16] to-[#09090D] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5 gap-2">
            <div>
              <span className="text-xs text-[#9B5CFF] font-black uppercase tracking-wider block">
                Komunitas Resmi &amp; Update Stok
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Saluran WhatsApp &amp; Grup Robux ZYCOOBUX
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#C0C0C0] bg-white/5 px-3 py-1.5 rounded-full border border-white/5 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Real-Time Restock Info</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Saluran WhatsApp Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#25D366]/10 via-transparent to-transparent border border-[#25D366]/30 flex flex-col justify-between space-y-4 hover:border-[#25D366]/60 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 text-[#25D366] flex items-center justify-center font-bold">
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30">
                    Official Channel
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">Saluran WhatsApp ZYCOOBUX</h3>
                <p className="text-xs text-[#C0C0C0] leading-relaxed">
                  Dapatkan notifikasi restock Robux instan, informasi rate termurah, promo flash sale, dan pengumuman pemeliharaan sistem langsung di WhatsApp Anda.
                </p>
              </div>

              <a
                href={BRAND.whatsappChannel}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all cursor-pointer"
              >
                <span>Ikuti Saluran WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Grup Komunitas Robux Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#368BFF]/10 via-transparent to-transparent border border-[#368BFF]/30 flex flex-col justify-between space-y-4 hover:border-[#368BFF]/60 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#368BFF]/20 text-[#368BFF] flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#368BFF]/20 text-[#368BFF] border border-[#368BFF]/30">
                    Roblox Community
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">Grup Komunitas Robux</h3>
                <p className="text-xs text-[#C0C0C0] leading-relaxed">
                  Gabung forum sesama player Roblox Indonesia. Sharing tips verifikasi akun 18+, mabar game populer, giveaway Robux bulanan, dan interaksi langsung.
                </p>
              </div>

              <a
                href={BRAND.whatsappCommunity}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#368BFF] hover:bg-[#287be8] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#368BFF]/20 transition-all cursor-pointer"
              >
                <span>Gabung Grup Robux</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

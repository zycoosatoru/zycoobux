import React, { useState, useEffect, useCallback } from 'react';
import {
  Copy,
  Check,
  CheckCircle2,
  Clock,
  XCircle,
  Shield,
  RotateCw,
  MessageCircle,
  AlertCircle,
  Sparkles,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  ShieldAlert,
  Eye,
} from 'lucide-react';
import { OrderRecord } from '../../lib/supabase';
import { PAYMENT_METHODS, BRAND } from '../../lib/config';

interface InvoicePageProps {
  orderId: string;
  navigate: (path: string) => void;
}

export const InvoicePage: React.FC<InvoicePageProps> = ({ orderId, navigate }) => {
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Upload proof of payment state
  const [previewProof, setPreviewProof] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [uploadErrorMsg, setUploadErrorMsg] = useState('');
  const [showProofModal, setShowProofModal] = useState(false);

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();

      if (!res.ok || !data.success || !data.order) {
        setErrorMsg(data.message || `Pesanan ${orderId} tidak ditemukan.`);
      } else {
        setOrder(data.order);
        setErrorMsg('');
      }
    } catch {
      setErrorMsg('Gagal memuat nota pesanan.');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    // Auto-refresh order status every 12 seconds
    const interval = setInterval(fetchOrder, 12000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadErrorMsg('File harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadErrorMsg('Ukuran file maksimal 8MB.');
      return;
    }

    setUploadErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewProof(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadProof = async () => {
    if (!previewProof || !order) return;
    setIsUploadingProof(true);
    setUploadErrorMsg('');
    setUploadSuccessMsg('');

    try {
      const res = await fetch(`/api/orders/${order.id}/proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofImage: previewProof }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setUploadErrorMsg(data.message || 'Gagal mengunggah bukti bayar.');
      } else {
        setUploadSuccessMsg('Bukti pembayaran berhasil diunggah! Status pesanan kini PAID.');
        setOrder(data.order);
        setPreviewProof(null);
      }
    } catch {
      setUploadErrorMsg('Terjadi kesalahan koneksi saat mengunggah bukti.');
    } finally {
      setIsUploadingProof(false);
    }
  };

  const methodInfo = PAYMENT_METHODS.find((m) => m.id === order?.payment_method);

  const getStatusBadge = (status: OrderRecord['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4" /> COMPLETED (BERHASIL)
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase bg-[#368BFF]/20 text-[#368BFF] border border-[#368BFF]/40 flex items-center gap-1.5 shadow-sm">
            <Clock className="w-4 h-4 animate-spin" /> PROCESSING (DIPROSES)
          </span>
        );
      case 'PAID':
        return (
          <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase bg-[#9B5CFF]/20 text-[#9B5CFF] border border-[#9B5CFF]/40 flex items-center gap-1.5 shadow-sm">
            <Shield className="w-4 h-4" /> PAID (SUDAH DIBAYAR)
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 shadow-sm">
            <XCircle className="w-4 h-4" /> CANCELLED (DIBATALKAN)
          </span>
        );
      default:
        return (
          <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-sm">
            <Clock className="w-4 h-4" /> PENDING (MENUNGGU PEMBAYARAN)
          </span>
        );
    }
  };

  if (isLoading && !order) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#9B5CFF]/30 border-t-[#9B5CFF] rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[#A1A1AA]">Memuat nota digital transaksi...</p>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Pesanan Tidak Ditemukan</h2>
        <p className="text-xs text-[#A1A1AA]">{errorMsg}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs uppercase"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  // Pre-filled WhatsApp message ONLY for case > 1 hour unprocessed
  const waUnprocessedText = encodeURIComponent(
    `Halo Admin ZYCOOBUX, pesanan saya dengan ID ${order.id} belum diproses setelah 1 jam.\n` +
      `Roblox Username: ${order.roblox_username}\n` +
      `Jumlah Robux: ${order.robux_amount.toLocaleString('id-ID')} R$\n` +
      `Total Bayar: Rp ${order.price_paid.toLocaleString('id-ID')}\n` +
      `Mohon bantuannya untuk pengecekan ya min. Terima kasih!`
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Top Banner & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-[#71717A] uppercase tracking-wider font-semibold">
            Nota Digital Resmi
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-white flex items-center gap-2">
            <span>Transaksi #{order.id}</span>
          </h1>
        </div>

        <button
          onClick={fetchOrder}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#C0C0C0] hover:text-white transition-all border border-white/5 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          title="Segarkan Status"
        >
          <RotateCw className="w-4 h-4 text-[#9B5CFF]" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Luxury Digital Invoice Card */}
      <div className="bg-gradient-to-b from-[#0F0F16] to-[#09090D] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Soft Ambient Corner Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#9B5CFF]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/5 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl p-[1.5px] bg-gradient-to-br from-white via-[#C0C0C0] to-[#71717A]">
              <div className="w-full h-full bg-[#09090D] rounded-[14px] flex items-center justify-center">
                <img
                  src="/images/logo-zycoo.png"
                  alt="ZYCOOBUX"
                  className="w-full h-full object-cover rounded-[12px]"
                />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-widest text-white">{BRAND.name}</span>
              <p className="text-[11px] text-[#A1A1AA]">{BRAND.tagline}</p>
            </div>
          </div>

          <div>{getStatusBadge(order.status)}</div>
        </div>

        {/* Key Transaction Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[#71717A] uppercase tracking-wider font-semibold block">
              ID Transaksi
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-white text-base">{order.id}</span>
              <button
                onClick={() => copyToClipboard(order.id, setCopiedId)}
                className="p-1 rounded hover:bg-white/10 text-[#A1A1AA] hover:text-white"
                title="Salin ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[#71717A] uppercase tracking-wider font-semibold block">
              Waktu Pemesanan
            </span>
            <span className="font-bold text-white text-sm block">
              {order.created_at ? new Date(order.created_at).toLocaleString('id-ID') : 'Baru saja'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[#71717A] uppercase tracking-wider font-semibold block">
              Akun Roblox Tujuan
            </span>
            <span className="font-bold text-white text-sm block">{order.roblox_display_name}</span>
            <span className="text-[#A1A1AA] font-mono">@{order.roblox_username} (ID: {order.roblox_user_id})</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[#71717A] uppercase tracking-wider font-semibold block">
              Paket Pesanan
            </span>
            <span className="text-xl font-black text-emerald-400 font-mono block">
              {order.robux_amount.toLocaleString('id-ID')} Robux
            </span>
          </div>
        </div>

        {/* Total Price Callout */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#9B5CFF]/15 to-[#368BFF]/15 border border-[#9B5CFF]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#C0C0C0] uppercase tracking-wider block">
              Total yang Harus Dibayar
            </span>
            <span className="text-xs text-[#A1A1AA]">
              Pastikan nominal transfer sesuai persis hingga digit terakhir
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-3xl font-black text-white font-mono">
              Rp {order.price_paid.toLocaleString('id-ID')}
            </div>
            <button
              onClick={() => copyToClipboard(String(order.price_paid), setCopiedAmount)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#C0C0C0] hover:text-white transition-colors"
              title="Salin Nominal"
            >
              {copiedAmount ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Payment Instructions & Details */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#9B5CFF]" />
            <h3 className="font-bold text-white text-sm">
              Instruksi Pembayaran: {order.payment_method}
            </h3>
          </div>

          {order.payment_method === 'QRIS' ? (
            /* QRIS view with official graphic */
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white text-slate-900 border border-slate-200 space-y-4">
              <div className="max-w-xs w-full">
                <img
                  src="/images/qris-zycoo-store.png"
                  alt="QRIS ZYCOO STORE"
                  className="w-full rounded-xl shadow-lg border border-slate-300"
                />
              </div>

              <div className="text-center text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-900">Merchant: ZYCOO STORE</p>
                <p>NMID: ID1026511358586</p>
                <p className="text-[11px] text-slate-500">
                  Dapat discan melalui BCA, Mandiri, BRI, BNI, DANA, GoPay, OVO, ShopeePay dll.
                </p>
              </div>
            </div>
          ) : (
            /* Transfer / E-Wallet info view */
            <div className="p-6 rounded-2xl bg-[#09090D] border border-white/10 space-y-4">
              <div className="space-y-2">
                <span className="text-xs text-[#71717A] uppercase tracking-wider block">
                  Nomor Rekening / E-Wallet Tujuan:
                </span>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div>
                    <span className="text-xl font-black text-white font-mono tracking-wider block">
                      {methodInfo?.accountNumber || '081288872390'}
                    </span>
                    <span className="text-xs text-[#C0C0C0]">
                      Atas Nama: <strong className="text-white">{methodInfo?.accountName}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      copyToClipboard(methodInfo?.accountNumber || '081288872390', setCopiedAccount)
                    }
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#C0C0C0] hover:text-white"
                  >
                    {copiedAccount ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                {methodInfo?.instructions}
              </p>
            </div>
          )}
        </div>

        {/* ================= UPLOAD BUKTI BAYAR SECTION ================= */}
        <div className="p-6 rounded-2xl bg-[#09090D] border border-[#9B5CFF]/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#9B5CFF]" />
              <h3 className="font-bold text-white text-sm">Upload Bukti Pembayaran</h3>
            </div>
            {order.payment_proof && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Bukti Terunggah
              </span>
            )}
          </div>

          <p className="text-xs text-[#A1A1AA]">
            Unggah foto/screenshot struk transfer Anda untuk mempercepat verifikasi otomatis pesanan.
          </p>

          {uploadSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{uploadSuccessMsg}</span>
            </div>
          )}

          {uploadErrorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{uploadErrorMsg}</span>
            </div>
          )}

          {/* If already has uploaded payment proof */}
          {order.payment_proof && !previewProof && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-black border border-white/10 overflow-hidden flex items-center justify-center">
                  <img
                    src={order.payment_proof}
                    alt="Bukti Bayar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Bukti Pembayaran Terverifikasi</span>
                  <span className="text-[11px] text-[#A1A1AA]">Struk berhasil dikirim ke antrean Admin</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowProofModal(true)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#C0C0C0] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#368BFF]" />
                <span>Lihat Foto</span>
              </button>
            </div>
          )}

          {/* Upload input & Preview */}
          <div className="space-y-3">
            {previewProof ? (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-[#9B5CFF]/50 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-black overflow-hidden border border-white/10 shrink-0">
                    <img
                      src={previewProof}
                      alt="Preview Bukti"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-white block">Foto Siap Diunggah</span>
                    <span className="text-[11px] text-[#A1A1AA]">
                      Klik tombol di bawah untuk mengirim ke sistem
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleUploadProof}
                    disabled={isUploadingProof}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#9B5CFF] to-[#368BFF] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {isUploadingProof ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>MENGUNGGAH...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Kirim Bukti Pembayaran</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewProof(null)}
                    disabled={isUploadingProof}
                    className="px-3 py-2.5 rounded-xl bg-white/5 text-[#A1A1AA] hover:text-white text-xs font-semibold"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="flex flex-col items-center justify-center p-5 rounded-xl border border-dashed border-white/15 hover:border-[#9B5CFF]/50 bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-[#9B5CFF]/20 flex items-center justify-center text-[#C0C0C0] group-hover:text-white transition-colors mb-2">
                    <ImageIcon className="w-5 h-5 text-[#9B5CFF]" />
                  </div>
                  <span className="text-xs font-bold text-white">
                    {order.payment_proof ? 'Ganti / Unggah Ulang Bukti Bayar' : 'Pilih Foto / Screenshot Bukti Bayar'}
                  </span>
                  <span className="text-[11px] text-[#71717A] mt-0.5">
                    Mendukung JPG, PNG, WEBP (Maksimal 8MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* ================= NOTES PENTING (BUKAN LANGSUNG KE WA) ================= */}
        <div className="p-5 rounded-2xl bg-[#0F0F16] border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Catatan Penting Pengiriman Robux
            </h4>
          </div>

          <div className="space-y-2 text-xs text-[#C0C0C0] leading-relaxed">
            <p>
              &bull; Pesanan Robux Anda diproses secara otomatis oleh sistem ZYCOOBUX dengan estimasi{' '}
              <strong className="text-white">5 - 15 menit</strong> setelah pembayaran terdeteksi.
            </p>
            <p className="text-amber-300/90 font-medium bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
              📌 <strong>PENTING:</strong> Anda tidak perlu langsung menghubungi WhatsApp. Silakan{' '}
              <strong>Chat Admin di WhatsApp HANYA JIKA pemesanan belum diproses setelah 1 jam</strong>.
            </p>
          </div>

          {/* Optional WhatsApp Support Button (Only if > 1 hour) */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5">
            <span className="text-[11px] text-[#71717A]">
              Lebih dari 1 jam belum masuk? Klik tombol di samping:
            </span>
            <a
              href={`https://wa.me/${BRAND.whatsappRaw}?text=${waUnprocessedText}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chat Admin WhatsApp (Jika &gt; 1 Jam Belum Diproses)</span>
            </a>
          </div>
        </div>

        {/* Action Buttons: Home & Re-order */}
        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/5 cursor-pointer"
          >
            Pesan Lagi / Beranda
          </button>

          <button
            onClick={() => navigate('/check-order')}
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-gradient-to-r from-[#9B5CFF]/20 to-[#368BFF]/20 hover:from-[#9B5CFF]/30 hover:to-[#368BFF]/30 text-white font-bold text-xs uppercase tracking-wider transition-all border border-[#9B5CFF]/30 cursor-pointer"
          >
            Lacak Pesanan Lain
          </button>
        </div>
      </div>

      {/* Proof Preview Modal */}
      {showProofModal && order.payment_proof && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0F0F16] border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-white">Bukti Pembayaran Transaksi #{order.id}</h3>
              <button
                onClick={() => setShowProofModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-[#A1A1AA] hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto rounded-xl border border-white/10 flex items-center justify-center bg-black">
              <img
                src={order.payment_proof}
                alt="Struk Bukti Bayar"
                className="max-h-[58vh] w-auto object-contain rounded-lg"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowProofModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase cursor-pointer"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

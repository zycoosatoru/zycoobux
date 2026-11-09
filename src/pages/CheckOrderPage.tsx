import React, { useState } from 'react';
import { Search, AlertCircle, Clock, CheckCircle2, XCircle, ArrowRight, Shield } from 'lucide-react';
import { OrderRecord } from '../../lib/supabase';

interface CheckOrderPageProps {
  navigate: (path: string) => void;
}

export const CheckOrderPage: React.FC<CheckOrderPageProps> = ({ navigate }) => {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderResult, setOrderResult] = useState<OrderRecord | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = orderIdInput.trim().toUpperCase();

    if (!cleanId) {
      setErrorMsg('Masukkan nomor ID Pesanan Anda.');
      return;
    }

    if (!/^ZYC\d{8}$/.test(cleanId)) {
      setErrorMsg('Format ID pesanan harus diawali ZYC diikuti 8 digit angka (contoh: ZYC83921045).');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setOrderResult(null);

    try {
      const res = await fetch(`/api/orders/${cleanId}`);
      const data = await res.json();

      if (!res.ok || !data.success || !data.order) {
        setErrorMsg(data.message || `Pesanan dengan ID "${cleanId}" tidak ditemukan.`);
      } else {
        setOrderResult(data.order);
      }
    } catch {
      setErrorMsg('Gagal mengambil data pesanan. Periksa koneksi internet Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: OrderRecord['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> SUKSES (COMPLETED)
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#368BFF]/20 text-[#368BFF] border border-[#368BFF]/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> DIPROSES (PROCESSING)
          </span>
        );
      case 'PAID':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#9B5CFF]/20 text-[#9B5CFF] border border-[#9B5CFF]/30 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> DIBAYAR (PAID)
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" /> DIBATALKAN (CANCELLED)
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> MENUNGGU PEMBAYARAN (PENDING)
          </span>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-wide">
          Lacak Status Pesanan
        </h1>
        <p className="text-sm text-[#A1A1AA]">
          Masukkan ID pesanan Anda untuk memantau status pengiriman Robux secara real-time.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-gradient-to-b from-[#0F0F16]/90 to-[#09090D]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <form onSubmit={handleSearch} className="space-y-4">
          <label className="block text-xs font-semibold text-[#C0C0C0] uppercase tracking-wider">
            ID Pesanan Transaksi
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                required
                placeholder="Contoh: ZYC83921045"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value.toUpperCase())}
                className="w-full bg-[#09090D] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-base text-white placeholder-[#71717A] focus:outline-none focus:border-[#9B5CFF] focus:ring-1 focus:ring-[#9B5CFF] font-mono font-bold tracking-wider uppercase"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isLoading
                  ? 'bg-white/10 text-white/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#9B5CFF] to-[#368BFF] hover:from-[#8B4CF0] hover:to-[#257BEF] text-white shadow-lg shadow-[#9B5CFF]/30'
              }`}
            >
              {isLoading ? 'MENCARI...' : 'LACAK STATUS'}
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="mt-4 p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Result Card */}
      {orderResult && (
        <div className="bg-[#09090D] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/5 gap-4">
            <div>
              <span className="text-xs text-[#71717A] uppercase tracking-wider font-semibold">
                ID Pesanan
              </span>
              <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-wider">
                {orderResult.id}
              </div>
            </div>

            <div>{getStatusBadge(orderResult.status)}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-xs text-[#71717A] block mb-1">Penerima Roblox</span>
              <span className="font-bold text-white block">{orderResult.roblox_display_name}</span>
              <span className="text-xs text-[#A1A1AA] font-mono">@{orderResult.roblox_username}</span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-xs text-[#71717A] block mb-1">Pesanan Robux</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {orderResult.robux_amount.toLocaleString('id-ID')} Robux
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-xs text-[#71717A] block mb-1">Metode Pembayaran</span>
              <span className="font-bold text-white block">{orderResult.payment_method}</span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-xs text-[#71717A] block mb-1">Total Tagihan</span>
              <span className="text-xl font-black text-white font-mono">
                Rp {orderResult.price_paid.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => navigate(`/invoice/${orderResult.id}`)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#9B5CFF] to-[#368BFF] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-[#9B5CFF]/20 cursor-pointer"
            >
              <span>Buka Nota Digital Lengkap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

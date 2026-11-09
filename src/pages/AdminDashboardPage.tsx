import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCw,
  Search,
  Filter,
  LogOut,
  ExternalLink,
  Shield,
  AlertTriangle,
  Eye,
  Image as ImageIcon,
  Database,
  Plus,
  Check,
  Sparkles,
} from 'lucide-react';
import { OrderRecord } from '../../lib/supabase';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
}

interface StatsData {
  totalRevenue: number;
  pendingCount: number;
  completedCount: number;
  totalOrdersCount: number;
  totalRobuxDelivered: number;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate }) => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalRevenue: 0,
    pendingCount: 0,
    completedCount: 0,
    totalOrdersCount: 0,
    totalRobuxDelivered: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Real-time Stock Management State
  const [currentStock, setCurrentStock] = useState<number>(48500);
  const [stockInput, setStockInput] = useState<string>('');
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const [stockMessage, setStockMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Cancel Confirmation Modal State
  const [orderToCancel, setOrderToCancel] = useState<OrderRecord | null>(null);
  // View Payment Proof Modal State
  const [selectedProofOrder, setSelectedProofOrder] = useState<OrderRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch real-time available stock
  const fetchStock = useCallback(async () => {
    try {
      const res = await fetch('/api/stock');
      const data = await res.json();
      if (data.success && typeof data.stock === 'number') {
        setCurrentStock(data.stock);
      }
    } catch {
      // Fallback
    }
  }, []);

  const handleUpdateStock = async (amount: number, mode: 'add' | 'set') => {
    if (isNaN(amount) || amount <= 0) return;
    setIsUpdatingStock(true);
    setStockMessage(null);
    try {
      const res = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, mode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentStock(data.stock);
        setStockMessage({ text: data.message, type: 'success' });
        setStockInput('');
        setTimeout(() => setStockMessage(null), 4500);
      } else {
        setStockMessage({ text: data.message || 'Gagal memperbarui stok.', type: 'error' });
      }
    } catch {
      setStockMessage({ text: 'Terjadi kesalahan koneksi server.', type: 'error' });
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const fetchAdminOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.status === 401) {
        navigate('/admin/login');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        if (data.stats) setStats(data.stats);
      }
    } catch {
      // Handle network error
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchAdminOrders();
    fetchStock();
    // Auto-refresh every 12 seconds
    const interval = setInterval(() => {
      fetchAdminOrders();
      fetchStock();
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchAdminOrders, fetchStock]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderRecord['status']) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await Promise.all([fetchAdminOrders(), fetchStock()]);
      }
    } catch {
      // Error
    } finally {
      setIsUpdating(false);
      setOrderToCancel(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      navigate('/admin/login');
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchQuery =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.roblox_username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.roblox_display_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#9B5CFF]/20 text-[#9B5CFF] border border-[#9B5CFF]/30">
              Admin Area
            </span>
            <span className="text-xs text-[#71717A]">Auto-refresh 15s</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Manajemen Transaksi ZYCOOBUX
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminOrders}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5 flex items-center gap-2 text-xs font-semibold cursor-pointer"
            title="Refresh Data"
          >
            <RotateCw className={`w-4 h-4 text-[#368BFF] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 transition-colors border border-rose-500/30 flex items-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* REAL-TIME ROBUX STOCK CONTROL PANEL */}
      <div className="bg-gradient-to-br from-[#0F0F16] to-[#09090D] border border-[#9B5CFF]/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#9B5CFF]/10 to-[#368BFF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-[#9B5CFF] uppercase tracking-wider">
                Real-Time Stock Engine
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Otomatis Sync
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Kelola Stok Robux Tersedia
            </h2>
            <p className="text-xs text-[#A1A1AA] max-w-xl">
              Stok ini tampil langsung di toko publik pembeli. Sistem secara <strong>otomatis memotong stok</strong> saat Anda menyelesaikan pesanan (<span className="text-emerald-400 font-bold">COMPLETED</span>), dan mengembalikan stok jika pesanan dibatalkan.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#71717A] tracking-wider block">
                Sisa Stok Saat Ini
              </span>
              <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight mt-0.5">
                {currentStock.toLocaleString('id-ID')} <span className="text-sm font-semibold text-white">R$</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Toast Feedback */}
        {stockMessage && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 animate-fade-in ${
              stockMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{stockMessage.text}</span>
          </div>
        )}

        {/* Quick Add Buttons & Custom Amount Input */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Quick Buttons */}
          <div className="lg:col-span-6 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C0C0C0] block">
              Restock Cepat:
            </span>
            <div className="flex flex-wrap gap-2">
              {[1000, 2500, 5000, 10000, 25000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  disabled={isUpdatingStock}
                  onClick={() => handleUpdateStock(amt, 'add')}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono font-bold text-xs border border-white/10 hover:border-[#9B5CFF]/50 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02]"
                >
                  <Plus className="w-3.5 h-3.5 text-[#9B5CFF]" />
                  <span>+{amt.toLocaleString('id-ID')} R$</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <div className="lg:col-span-6 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C0C0C0] block">
              Atau Input Jumlah Khusus:
            </span>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Contoh: 15000"
                value={stockInput}
                onChange={(e) => setStockInput(e.target.value)}
                className="flex-1 bg-[#09090D] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white placeholder-[#71717A] focus:outline-none focus:border-[#9B5CFF]"
              />
              <button
                type="button"
                disabled={isUpdatingStock || !stockInput || Number(stockInput) <= 0}
                onClick={() => handleUpdateStock(Number(stockInput), 'add')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9B5CFF] to-[#368BFF] text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah (+)</span>
              </button>
              <button
                type="button"
                disabled={isUpdatingStock || !stockInput || Number(stockInput) < 0}
                onClick={() => handleUpdateStock(Number(stockInput), 'set')}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#C0C0C0] hover:text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer border border-white/10"
                title="Atur stok total menjadi nilai ini"
              >
                Setel Total (=)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3 STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Pendapatan Sukses (COMPLETED) */}
        <div className="bg-gradient-to-br from-[#0F0F16] to-[#09090D] border border-emerald-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
              Total Pendapatan Sukses
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-3">
            Rp {stats.totalRevenue.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-[#71717A] mt-1">
            Dari seluruh pesanan dengan status COMPLETED
          </p>
        </div>

        {/* Card 2: Antrean Pending */}
        <div className="bg-gradient-to-br from-[#0F0F16] to-[#09090D] border border-amber-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
              Antrean Perlu Diproses
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono mt-3">
            {stats.pendingCount} <span className="text-base font-normal text-slate-400">Pesanan</span>
          </div>
          <p className="text-[11px] text-[#71717A] mt-1">
            Menunggu konfirmasi pembayaran atau transfer Robux
          </p>
        </div>

        {/* Card 3: Total Pesanan Berhasil */}
        <div className="bg-gradient-to-br from-[#0F0F16] to-[#09090D] border border-[#368BFF]/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#368BFF]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
              Total Pesanan Berhasil
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#368BFF]/20 text-[#368BFF] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#368BFF] font-mono mt-3">
            {stats.completedCount} <span className="text-base font-normal text-slate-400">Pesanan</span>
          </div>
          <p className="text-[11px] text-[#71717A] mt-1">
            Total {stats.totalRobuxDelivered.toLocaleString('id-ID')} Robux berhasil dikirim
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-[#0F0F16] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID pesanan, username..."
            className="w-full bg-[#09090D] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#9B5CFF]"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {['ALL', 'PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-gradient-to-r from-[#9B5CFF] to-[#368BFF] text-white shadow-md'
                  : 'bg-white/5 text-[#A1A1AA] hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#09090D] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F0F16] border-b border-white/5 text-[#71717A] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-4 px-4 sm:px-6">ID Transaksi</th>
                <th className="py-4 px-4">Waktu</th>
                <th className="py-4 px-4">Penerima Roblox</th>
                <th className="py-4 px-4">Jumlah Robux</th>
                <th className="py-4 px-4">Total Rupiah</th>
                <th className="py-4 px-4">Metode</th>
                <th className="py-4 px-4">Bukti Bayar</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 sm:px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#71717A]">
                    Tidak ada pesanan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-white">
                      <button
                        onClick={() => navigate(`/invoice/${ord.id}`)}
                        className="hover:text-[#368BFF] flex items-center gap-1 text-left"
                      >
                        <span>{ord.id}</span>
                        <ExternalLink className="w-3 h-3 text-[#71717A]" />
                      </button>
                    </td>

                    <td className="py-4 px-4 text-[#A1A1AA]">
                      {ord.created_at
                        ? new Date(ord.created_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          }) +
                          ', ' +
                          new Date(ord.created_at).toLocaleDateString('id-ID')
                        : '-'}
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-white block">{ord.roblox_display_name}</span>
                      <span className="text-[11px] text-[#A1A1AA] font-mono">@{ord.roblox_username}</span>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-emerald-400">
                      {ord.robux_amount.toLocaleString('id-ID')} R$
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-white">
                      Rp {ord.price_paid.toLocaleString('id-ID')}
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-400">
                      {ord.payment_method}
                    </td>

                    {/* Bukti Bayar column */}
                    <td className="py-4 px-4">
                      {ord.payment_proof ? (
                        <button
                          type="button"
                          onClick={() => setSelectedProofOrder(ord)}
                          className="px-2.5 py-1 rounded-lg bg-[#9B5CFF]/20 hover:bg-[#9B5CFF]/35 text-[#9B5CFF] border border-[#9B5CFF]/30 flex items-center gap-1.5 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Struk</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#71717A]">Belum Ada</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-block ${
                          ord.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : ord.status === 'PROCESSING'
                            ? 'bg-[#368BFF]/20 text-[#368BFF] border border-[#368BFF]/30'
                            : ord.status === 'PAID'
                            ? 'bg-[#9B5CFF]/20 text-[#9B5CFF] border border-[#9B5CFF]/30'
                            : ord.status === 'CANCELLED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {ord.status !== 'PROCESSING' && ord.status !== 'COMPLETED' && ord.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, 'PROCESSING')}
                            disabled={isUpdating}
                            className="px-2.5 py-1.5 rounded-lg bg-[#368BFF]/20 hover:bg-[#368BFF]/30 text-[#368BFF] font-bold text-[11px] border border-[#368BFF]/30 transition-colors cursor-pointer"
                          >
                            Proses
                          </button>
                        )}

                        {ord.status !== 'COMPLETED' && ord.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, 'COMPLETED')}
                            disabled={isUpdating}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors shadow-sm cursor-pointer"
                          >
                            Selesaikan
                          </button>
                        )}

                        {ord.status !== 'CANCELLED' && (
                          <button
                            onClick={() => setOrderToCancel(ord)}
                            disabled={isUpdating}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-[11px] transition-colors border border-rose-500/30 cursor-pointer"
                          >
                            Batalkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0F0F16] border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Konfirmasi Pembatalan Pesanan</h3>
              <p className="text-xs text-[#A1A1AA]">
                Apakah Anda yakin ingin membatalkan pesanan <strong>{orderToCancel.id}</strong> (
                {orderToCancel.robux_amount} R$)?
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs"
              >
                Kembali
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus(orderToCancel.id, 'CANCELLED')}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Proof of Payment Modal */}
      {selectedProofOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0F0F16] border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Struk Pembayaran #{selectedProofOrder.id}</span>
                </h3>
                <span className="text-[11px] text-[#A1A1AA]">
                  {selectedProofOrder.roblox_display_name} (@{selectedProofOrder.roblox_username}) &bull;{' '}
                  {selectedProofOrder.robux_amount} R$ (Rp {selectedProofOrder.price_paid.toLocaleString('id-ID')})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProofOrder(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-[#A1A1AA] hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-auto rounded-xl border border-white/10 flex items-center justify-center bg-black p-2">
              <img
                src={selectedProofOrder.payment_proof}
                alt={`Bukti bayar ${selectedProofOrder.id}`}
                className="max-h-[50vh] w-auto object-contain rounded-lg"
              />
            </div>

            {/* Quick Actions inside proof modal */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] uppercase font-bold text-[#71717A] tracking-wider block">
                Ubah Status Pesanan:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await handleUpdateStatus(selectedProofOrder.id, 'PROCESSING');
                    setSelectedProofOrder(null);
                  }}
                  className="py-2 rounded-xl bg-[#368BFF]/20 hover:bg-[#368BFF]/35 text-[#368BFF] font-bold text-xs border border-[#368BFF]/30 transition-colors"
                >
                  Sedang Proses
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleUpdateStatus(selectedProofOrder.id, 'COMPLETED');
                    setSelectedProofOrder(null);
                  }}
                  className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md"
                >
                  Selesaikan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrderToCancel(selectedProofOrder);
                    setSelectedProofOrder(null);
                  }}
                  className="py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs border border-rose-500/30 transition-colors"
                >
                  Batalkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

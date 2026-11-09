import React, { useState, useEffect } from 'react';
import { Shield, Lock, AlertCircle, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import { BRAND } from '../../lib/config';

interface AdminLoginPageProps {
  navigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ navigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Check if admin is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        if (data.authenticated) {
          navigate('/admin/dashboard');
          return;
        }
      } catch {
        // Ignore
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleQuickFill = () => {
    setUsername('zycoo');
    setPassword('Gua.azky.277');
    setErrorMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Username atau password admin salah.');
      } else {
        navigate('/admin/dashboard');
      }
    } catch {
      setErrorMsg('Gagal menghubungi server admin.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#9B5CFF]/30 border-t-[#9B5CFF] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-gradient-to-b from-[#0F0F16] to-[#09090D] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#9B5CFF] to-[#368BFF] flex items-center justify-center mx-auto text-white shadow-lg shadow-[#9B5CFF]/30 mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">Portal Admin ZYCOOBUX</h1>
          <p className="text-xs text-[#A1A1AA]">
            Akses khusus pemilik (owner) untuk manajemen transaksi dan verifikasi struk
          </p>
        </div>

        {/* Quick Owner Fill Helper */}
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#9B5CFF]" />
            <span className="text-[#C0C0C0]">Akun Pemilik (zycoo)</span>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            className="px-2.5 py-1 rounded-lg bg-[#9B5CFF]/20 hover:bg-[#9B5CFF]/30 text-white font-bold text-[11px] border border-[#9B5CFF]/40 transition-colors cursor-pointer"
          >
            Isi Kredensial
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#C0C0C0] uppercase tracking-wider mb-1.5">
              Admin Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username admin"
              className="w-full bg-[#09090D] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-[#9B5CFF] focus:ring-1 focus:ring-[#9B5CFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#C0C0C0] uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#09090D] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-[#9B5CFF] focus:ring-1 focus:ring-[#9B5CFF]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              isLoading
                ? 'bg-white/10 text-white/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#9B5CFF] to-[#368BFF] hover:from-[#8B4CF0] hover:to-[#257BEF] text-white shadow-[#9B5CFF]/30'
            }`}
          >
            {isLoading ? (
              'MEMVERIFIKASI...'
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>MASUK KE DASHBOARD</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-[#71717A] hover:text-white transition-colors"
          >
            &larr; Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
};

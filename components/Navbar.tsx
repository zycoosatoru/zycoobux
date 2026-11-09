import React from 'react';
import { Shield, Search, Zap } from 'lucide-react';
import { BRAND } from '../lib/config';

interface NavbarProps {
  currentPath?: string;
  navigate?: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath = '/', navigate }) => {
  const handleNav = (path: string) => {
    if (navigate) {
      navigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#09090D]/85 backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Name */}
          <div
            onClick={() => handleNav('/')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            {/* Logo with metallic silver frame + soft purple glow */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[#9B5CFF]/30 rounded-xl blur-md group-hover:bg-[#9B5CFF]/50 transition-all duration-300" />
              <div className="relative w-11 h-11 rounded-xl p-[1.5px] bg-gradient-to-br from-white via-[#C0C0C0] to-[#71717A] shadow-lg shadow-black/60">
                <div className="w-full h-full bg-[#09090D] rounded-[10px] flex items-center justify-center overflow-hidden">
                  <img
                    src="/images/logo-zycoo.png"
                    alt="ZYCOOBUX Logo"
                    className="w-full h-full object-cover rounded-[8px]"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-widest bg-gradient-to-r from-white via-[#E5E4E2] to-[#C0C0C0] bg-clip-text text-transparent group-hover:from-white group-hover:to-[#368BFF] transition-all">
                  {BRAND.name}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-gradient-to-r from-[#9B5CFF]/20 to-[#368BFF]/20 text-[#C0C0C0] border border-[#9B5CFF]/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] hidden sm:block font-medium tracking-wide">
                {BRAND.tagline}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => handleNav('/')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentPath === '/'
                  ? 'bg-gradient-to-r from-[#9B5CFF]/20 to-[#368BFF]/20 text-white border border-[#9B5CFF]/40 shadow-sm shadow-[#9B5CFF]/20'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => {
                handleNav('/');
                setTimeout(() => {
                  const el = document.getElementById('step-verification');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-[#9B5CFF]" />
              <span className="hidden xs:inline">Top Up</span>
            </button>

            <button
              onClick={() => handleNav('/check-order')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentPath === '/check-order'
                  ? 'bg-gradient-to-r from-[#9B5CFF]/20 to-[#368BFF]/20 text-white border border-[#9B5CFF]/40 shadow-sm shadow-[#9B5CFF]/20'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-[#368BFF]" />
              <span className="hidden sm:inline">Cek Pesanan</span>
            </button>

            {/* Saluran & Grup WA Header Link */}
            <a
              href={BRAND.whatsappChannel}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-[#25D366] hover:bg-[#25D366]/10 border border-[#25D366]/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#25D366]/10"
              title="Saluran & Komunitas WhatsApp Resmi"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
              <span>Saluran WA</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

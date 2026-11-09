import React from 'react';
import { MessageCircle, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';
import { BRAND } from '../lib/config';

interface FooterProps {
  navigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const handleNav = (path: string) => {
    if (navigate) {
      navigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  return (
    <footer className="bg-[#09090D] border-t border-white/5 pt-14 pb-10 text-xs text-[#A1A1AA] relative overflow-hidden">
      {/* Background Soft Purple/Blue Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-[#9B5CFF]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl p-[1.5px] bg-gradient-to-br from-white via-[#C0C0C0] to-[#71717A]">
                <div className="w-full h-full bg-[#09090D] rounded-[10px] flex items-center justify-center overflow-hidden">
                  <img
                    src="/images/logo-zycoo.png"
                    alt="ZYCOOBUX"
                    className="w-full h-full object-cover rounded-[8px]"
                  />
                </div>
              </div>
              <span className="text-xl font-black tracking-widest bg-gradient-to-r from-white via-[#E5E4E2] to-[#C0C0C0] bg-clip-text text-transparent">
                {BRAND.name}
              </span>
            </div>

            <p className="text-sm text-[#C0C0C0] font-medium max-w-sm">
              {BRAND.tagline}
            </p>
            <p className="text-xs text-[#71717A] max-w-md leading-relaxed">
              Platform top up Robux terpercaya dengan verifikasi akun instan via official API Roblox, keamanan terjamin, dan proses otomatis.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#9B5CFF]" />
              Navigasi Cepat
            </span>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNav('/')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Top Up Robux Instan
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/check-order')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Cek Status Pesanan
                </button>
              </li>
            </ul>
          </div>

          {/* WhatsApp Support & Community */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-[#368BFF]" />
              Bantuan &amp; Komunitas Resmi
            </span>
            <div className="space-y-2.5">
              <a
                href={`https://wa.me/${BRAND.whatsappRaw}?text=Halo%20Admin%20ZYCOOBUX,%20saya%20butuh%20bantuan`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all text-white group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold">WhatsApp CS: {BRAND.whatsappPhone}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-white" />
              </a>

              <a
                href={BRAND.whatsappChannel}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all text-white group"
              >
                <span className="text-xs font-semibold">📢 Saluran WhatsApp ZYCOOBUX</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-white" />
              </a>

              <a
                href={BRAND.whatsappCommunity}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all text-white group"
              >
                <span className="text-xs font-semibold">👥 Komunitas &amp; Info Restock Robux</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* Mandatory Roblox Disclaimer */}
        <div className="p-4 rounded-xl bg-[#0F0F16] border border-white/5 flex items-start gap-3 text-xs leading-relaxed text-[#71717A]">
          <ShieldAlert className="w-4 h-4 text-[#9B5CFF] shrink-0 mt-0.5" />
          <p>{BRAND.disclaimer}</p>
        </div>

        {/* Bottom copyright */}
        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#71717A]">
          <p>&copy; {new Date().getFullYear()} {BRAND.name}. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4">
            <span>Privasi &amp; Keamanan</span>
            <span>&bull;</span>
            <span>Syarat &amp; Ketentuan</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

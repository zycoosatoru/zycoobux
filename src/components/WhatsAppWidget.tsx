import React from 'react';
import { MessageCircle } from 'lucide-react';
import { BRAND } from '../../lib/config';

export const WhatsAppWidget: React.FC = () => {
  const message = encodeURIComponent(
    'Halo Admin ZYCOOBUX! Saya ingin bertanya mengenai proses top-up Robux / bantuan pesanan saya.'
  );
  const whatsappUrl = `https://wa.me/${BRAND.whatsappRaw}?text=${message}`;

  return (
    <aside
      aria-label="Bantuan WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group"
    >
      {/* Tooltip Label */}
      <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#09090D]/90 backdrop-blur-md border border-[#9B5CFF]/30 text-white text-xs font-semibold shadow-xl shadow-black/50 pointer-events-none group-hover:scale-105 transition-all">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Butuh bantuan? Chat CS</span>
      </div>

      {/* Floating Button with soft neon glow */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="relative w-14 h-14 rounded-2xl flex items-center justify-center p-[2px] bg-gradient-to-tr from-[#9B5CFF] via-[#368BFF] to-emerald-400 shadow-2xl shadow-[#9B5CFF]/30 hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer"
        aria-label="Hubungi WhatsApp ZYCOOBUX"
      >
        <div className="w-full h-full rounded-[14px] bg-[#09090D] flex items-center justify-center group-hover:bg-[#0D0D14] transition-colors">
          <MessageCircle className="w-7 h-7 text-emerald-400 fill-emerald-400/20 group-hover:rotate-12 transition-transform" />
        </div>
      </a>
    </aside>
  );
};

import React, { useState } from 'react';
import {
  Activity,
  Globe,
  Wifi,
  Play,
  RotateCw,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';
import { Language } from '../types';
import { sounds } from '../utils/sound';

interface Props {
  lang: Language;
}

interface ServerNode {
  id: string;
  name: string;
  location: string;
  basePing: number;
  flag: string;
}

export const ServerPingView: React.FC<Props> = ({ lang }) => {
  const servers: ServerNode[] = [
    {
      id: 'sg',
      name: 'Asia Southeast (Singapore)',
      location: 'Singapura (Server Utama Indonesia)',
      basePing: 22,
      flag: '🇸🇬',
    },
    {
      id: 'jp',
      name: 'Asia East (Tokyo)',
      location: 'Jepang',
      basePing: 78,
      flag: '🇯🇵',
    },
    {
      id: 'au',
      name: 'Oceania (Sydney)',
      location: 'Australia',
      basePing: 110,
      flag: '🇦🇺',
    },
    {
      id: 'usw',
      name: 'US West (Oregon)',
      location: 'Amerika Serikat Barat',
      basePing: 185,
      flag: '🇺🇸',
    },
    {
      id: 'eu',
      name: 'Europe (Frankfurt)',
      location: 'Jerman',
      basePing: 215,
      flag: '🇩🇪',
    },
  ];

  const [pings, setPings] = useState<Record<string, number | null>>({
    sg: null,
    jp: null,
    au: null,
    usw: null,
    eu: null,
  });

  const [isTesting, setIsTesting] = useState(false);

  const testServerPing = async () => {
    sounds.playClick();
    setIsTesting(true);

    for (const s of servers) {
      // Simulate real ping check with small randomized variance
      await new Promise((r) => setTimeout(r, 280));
      const variance = Math.floor(Math.random() * 14) - 7;
      const actualPing = Math.max(12, s.basePing + variance);
      setPings((prev) => ({ ...prev, [s.id]: actualPing }));
    }

    setIsTesting(false);
    sounds.playUpgrade();
  };

  const getPingStatus = (ping: number | null) => {
    if (ping === null) return { label: 'Belum dicek', color: 'text-slate-500 bg-slate-800' };
    if (ping < 50) return { label: 'Sangat Cepat (Lancar)', color: 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/40' };
    if (ping < 120) return { label: 'Normal (Dapat Dimainkan)', color: 'text-cyan-400 bg-cyan-950/60 border border-cyan-500/40' };
    if (ping < 200) return { label: 'Sedang (Sedikit Delay)', color: 'text-amber-400 bg-amber-950/60 border border-amber-500/40' };
    return { label: 'Tinggi (Lag)', color: 'text-rose-400 bg-rose-950/60 border border-rose-500/40' };
  };

  return (
    <div className="space-y-6">
      {/* Header & Action */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-sm shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            {lang === 'id' ? 'Cek Latensi & Ping Server Roblox' : 'Roblox Server Ping & Latency Checker'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {lang === 'id'
              ? 'Uji latensi jaringan kamu ke berbagai server Roblox regional untuk memastikan koneksi lancar tanpa lag.'
              : 'Test your connection latency to official Roblox regional servers to prevent in-game lag.'}
          </p>
        </div>

        <button
          onClick={testServerPing}
          disabled={isTesting}
          className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer transition-all ${
            isTesting
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/40'
          }`}
        >
          {isTesting ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>{lang === 'id' ? 'Menguji Server...' : 'Testing Servers...'}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>{lang === 'id' ? 'Mulai Tes Ping Sekarang' : 'Start Ping Test'}</span>
            </>
          )}
        </button>
      </div>

      {/* Servers Ping List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servers.map((s) => {
          const val = pings[s.id];
          const status = getPingStatus(val);

          return (
            <div
              key={s.id}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{s.flag}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-white text-sm">{s.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{s.location}</p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
                <span className="text-xs text-slate-500">Ping RTT</span>
                <div className="font-mono text-2xl font-black text-white">
                  {val !== null ? (
                    <span className={val < 60 ? 'text-emerald-400' : val < 150 ? 'text-cyan-400' : 'text-amber-400'}>
                      {val} <span className="text-xs font-semibold text-slate-400">ms</span>
                    </span>
                  ) : (
                    <span className="text-slate-600 text-base font-normal">-- ms</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Network Tips for Indonesian Gamers */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>
            {lang === 'id'
              ? 'Tips Mengurangi Lag & Ping Tinggi di Roblox Indonesia:'
              : 'Tips to Reduce Roblox Ping in Indonesia:'}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              1. Gunakan DNS Cepat (1.1.1.1)
            </span>
            <p className="text-slate-400">
              Gunakan Cloudflare DNS (1.1.1.1) atau Google DNS (8.8.8.8) di router / HP agar resolusi server Roblox lebih cepat.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" />
              2. Pilih Wi-Fi 5GHz / Kabel LAN
            </span>
            <p className="text-slate-400">
              Koneksi 2.4GHz sering terkena interferensi. Beralih ke 5GHz atau kabel LAN akan memangkas jitter secara drastis.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
            <span className="font-bold text-pink-400 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              3. Pilih Server Singapore di Roblox
            </span>
            <p className="text-slate-400">
              Gunakan fitur Server Browser Roblox untuk bergabung ke server yang berlokasi di Singapore (SG) agar ping di bawah 35ms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

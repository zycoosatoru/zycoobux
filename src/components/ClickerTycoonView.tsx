import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Pickaxe,
  Bot,
  Gamepad2,
  Server,
  Crown,
  Sparkles,
  RotateCcw,
  Award,
  Zap,
} from 'lucide-react';
import { Language, TycoonUpgrade } from '../types';
import { INITIAL_TYCOON_UPGRADES } from '../data/robloxData';
import { formatNumber } from '../utils/calculator';
import { sounds } from '../utils/sound';

interface Props {
  lang: Language;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
}

export const ClickerTycoonView: React.FC<Props> = ({ lang }) => {
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('robux_tycoon_balance');
    return saved ? Math.max(0, parseFloat(saved)) : 0;
  });

  const [totalEarned, setTotalEarned] = useState<number>(() => {
    const saved = localStorage.getItem('robux_tycoon_earned');
    return saved ? Math.max(0, parseFloat(saved)) : 0;
  });

  const [prestigeCount, setPrestigeCount] = useState<number>(() => {
    const saved = localStorage.getItem('robux_tycoon_prestige');
    return saved ? parseInt(saved) || 0 : 0;
  });

  const [upgrades, setUpgrades] = useState<TycoonUpgrade[]>(() => {
    const saved = localStorage.getItem('robux_tycoon_upgrades');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return INITIAL_TYCOON_UPGRADES.map((u) => {
          const match = parsed.find((p: TycoonUpgrade) => p.id === u.id);
          return match ? { ...u, owned: match.owned, cost: match.cost } : u;
        });
      } catch {}
    }
    return INITIAL_TYCOON_UPGRADES;
  });

  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isCoinPressed, setIsCoinPressed] = useState(false);
  const coinContainerRef = useRef<HTMLDivElement>(null);

  // Prestige multiplier (+15% per prestige level)
  const prestigeMultiplier = 1 + prestigeCount * 0.15;

  // Click power calculation (1 + bonus from upgrades/prestige)
  const clickPower = Math.max(1, Math.floor((1 + upgrades.reduce((acc, u) => acc + u.owned * 0.5, 0)) * prestigeMultiplier));

  // CPS (Coins Per Second)
  const totalCps = upgrades.reduce((acc, u) => acc + u.owned * u.cps, 0) * prestigeMultiplier;

  // Auto-mining tick (runs every 100ms for smooth counter)
  useEffect(() => {
    const interval = setInterval(() => {
      if (totalCps > 0) {
        const increment = totalCps / 10;
        setBalance((prev) => {
          const next = prev + increment;
          localStorage.setItem('robux_tycoon_balance', next.toString());
          return next;
        });
        setTotalEarned((prev) => {
          const next = prev + increment;
          localStorage.setItem('robux_tycoon_earned', next.toString());
          return next;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [totalCps]);

  // Click coin handler
  const handleCoinClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    sounds.playCoin();
    setIsCoinPressed(true);
    setTimeout(() => setIsCoinPressed(false), 120);

    const gain = clickPower;
    setBalance((prev) => {
      const next = prev + gain;
      localStorage.setItem('robux_tycoon_balance', next.toString());
      return next;
    });
    setTotalEarned((prev) => {
      const next = prev + gain;
      localStorage.setItem('robux_tycoon_earned', next.toString());
      return next;
    });

    // Floating text coordinates
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = Date.now() + Math.random();
    setFloatingTexts((prev) => [...prev, { id, x, y, text: `+${formatNumber(gain)}` }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 900);
  };

  // Buy upgrade handler
  const handleBuyUpgrade = (upgradeId: string) => {
    const target = upgrades.find((u) => u.id === upgradeId);
    if (!target || balance < target.cost) return;

    sounds.playUpgrade();
    setBalance((prev) => prev - target.cost);

    const updated = upgrades.map((u) => {
      if (u.id === upgradeId) {
        return {
          ...u,
          owned: u.owned + 1,
          cost: Math.round(u.cost * 1.25),
        };
      }
      return u;
    });

    setUpgrades(updated);
    localStorage.setItem('robux_tycoon_upgrades', JSON.stringify(updated));
  };

  // Prestige handler (50k robux required)
  const handlePrestige = () => {
    if (balance < 50000) return;
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    sounds.playUpgrade();

    setPrestigeCount((prev) => {
      const next = prev + 1;
      localStorage.setItem('robux_tycoon_prestige', next.toString());
      return next;
    });

    setBalance(0);
    const resetUpgrades = INITIAL_TYCOON_UPGRADES;
    setUpgrades(resetUpgrades);
    localStorage.setItem('robux_tycoon_upgrades', JSON.stringify(resetUpgrades));
    localStorage.setItem('robux_tycoon_balance', '0');
  };

  // Reset progress handler
  const handleReset = () => {
    if (window.confirm(lang === 'id' ? 'Yakin ingin mereset semua kemajuan Tycoon?' : 'Reset all Tycoon progress?')) {
      localStorage.removeItem('robux_tycoon_balance');
      localStorage.removeItem('robux_tycoon_earned');
      localStorage.removeItem('robux_tycoon_upgrades');
      localStorage.removeItem('robux_tycoon_prestige');
      setBalance(0);
      setTotalEarned(0);
      setPrestigeCount(0);
      setUpgrades(INITIAL_TYCOON_UPGRADES);
      sounds.playClick();
    }
  };

  const getUpgradeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Pickaxe':
        return <Pickaxe className="w-5 h-5 text-amber-400" />;
      case 'Bot':
        return <Bot className="w-5 h-5 text-blue-400" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-5 h-5 text-emerald-400" />;
      case 'Server':
        return <Server className="w-5 h-5 text-purple-400" />;
      case 'Crown':
        return <Crown className="w-5 h-5 text-yellow-300" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Tycoon Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-sm shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              Robux Clicker Tycoon
            </h1>
            {prestigeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Crown className="w-3 h-3" /> Prestige {prestigeCount}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {lang === 'id'
              ? 'Klik koin Robux untuk menambang, beli auto-miners, raih passive income miliaran!'
              : 'Click the Robux coin to mine, purchase automated miners, and build an empire!'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {balance >= 50000 && (
            <button
              onClick={handlePrestige}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer animate-pulse"
            >
              <Crown className="w-4 h-4" />
              <span>Prestige (+15% Multiplier)</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors border border-slate-700/60"
            title={lang === 'id' ? 'Reset Kemajuan' : 'Reset Progress'}
            aria-label="Reset Progress"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Game Grid: Clicker on Left, Shop on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Clicker & Stats */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-2xl">
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Current Robux Balance Display */}
          <div className="w-full space-y-1 z-10">
            <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
              {lang === 'id' ? 'Kekayaan Robux Kamu' : 'Your Robux Fortune'}
            </span>
            <div className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono tracking-tight flex items-center justify-center gap-2">
              <span>{formatNumber(balance)}</span>
              <span className="text-2xl text-emerald-500/80 font-bold">R$</span>
            </div>

            {/* Income Rate Details */}
            <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-300 pt-2">
              <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60">
                ⚡ +{formatNumber(clickPower)} / klik
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-cyan-300">
                ⏱ +{formatNumber(totalCps)} / detik
              </span>
            </div>
          </div>

          {/* Giant Clickable Robux Coin */}
          <div ref={coinContainerRef} className="my-8 relative select-none">
            {/* Floating click scores */}
            {floatingTexts.map((item) => (
              <span
                key={item.id}
                style={{ left: `${item.x}px`, top: `${item.y}px` }}
                className="absolute text-lg sm:text-xl font-black text-emerald-300 font-mono pointer-events-none -translate-x-1/2 -translate-y-8 animate-fade-up z-30 drop-shadow-md"
              >
                {item.text}
              </span>
            ))}

            <button
              onClick={handleCoinClick}
              className={`relative w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-400 to-emerald-200 p-2 shadow-2xl shadow-emerald-500/30 transition-transform duration-75 cursor-pointer outline-none focus:ring-4 focus:ring-emerald-400/50 ${
                isCoinPressed ? 'scale-90' : 'hover:scale-105'
              }`}
              aria-label="Click to mine Robux"
            >
              <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center border-4 border-emerald-400/80 shadow-inner group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center shadow-lg shadow-emerald-500/40 group-hover:rotate-6 transition-transform">
                  <span className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tighter">
                    R$
                  </span>
                </div>
                <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-emerald-400/80">
                  {lang === 'id' ? 'KLIK SAYA!' : 'CLICK ME!'}
                </span>
              </div>
            </button>
          </div>

          {/* Lifetime stats */}
          <div className="w-full pt-4 border-t border-slate-800/80 flex items-center justify-around text-xs text-slate-400 z-10">
            <div>
              <span className="block text-slate-500">{lang === 'id' ? 'Total Ditambang' : 'Total Mined'}</span>
              <span className="font-bold text-slate-200">{formatNumber(totalEarned)} R$</span>
            </div>
            <div>
              <span className="block text-slate-500">{lang === 'id' ? 'Multiplier' : 'Multiplier'}</span>
              <span className="font-bold text-amber-400">{prestigeMultiplier.toFixed(2)}x</span>
            </div>
          </div>
        </div>

        {/* Right Side: Upgrades Shop */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                {lang === 'id' ? 'Toko Auto-Miner & Upgrade' : 'Auto-Miner & Upgrade Shop'}
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              {upgrades.reduce((a, b) => a + b.owned, 0)} {lang === 'id' ? 'Dimiliki' : 'Owned'}
            </span>
          </div>

          <div className="space-y-3">
            {upgrades.map((item) => {
              const canAfford = balance >= item.cost;
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    canAfford
                      ? 'bg-slate-950/90 border-slate-700/80 hover:border-emerald-500/50'
                      : 'bg-slate-950/40 border-slate-800/50 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0">
                      {getUpgradeIcon(item.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{item.name[lang]}</span>
                        {item.owned > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                            Lv. {item.owned}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{item.description[lang]}</p>
                      <span className="text-[11px] font-semibold text-cyan-400 mt-1 block">
                        +{formatNumber(item.cps * prestigeMultiplier)} R$/detik
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBuyUpgrade(item.id)}
                    disabled={!canAfford}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shrink-0 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      canAfford
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>{formatNumber(item.cost)}</span>
                    <span className="font-mono">R$</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

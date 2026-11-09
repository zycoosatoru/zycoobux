import React, { useState } from 'react';
import {
  Coins,
  Percent,
  TrendingUp,
  DollarSign,
  Copy,
  Check,
  Info,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Language } from '../types';
import {
  calculateRobloxTax,
  calculateTargetPrice,
  calculateDevEx,
  formatIDR,
  formatNumber,
  DEFAULT_USD_TO_IDR,
  DEVEX_MIN_ROBUX,
} from '../utils/calculator';
import { sounds } from '../utils/sound';

interface Props {
  lang: Language;
}

export const RobuxCalculatorView: React.FC<Props> = ({ lang }) => {
  const [mode, setMode] = useState<'tax' | 'target' | 'devex'>('tax');
  const [salePrice, setSalePrice] = useState<number>(1000);
  const [desiredAmount, setDesiredAmount] = useState<number>(700);
  const [devexRobux, setDevexRobux] = useState<number>(50000);
  const [usdRate, setUsdRate] = useState<number>(DEFAULT_USD_TO_IDR);
  const [copied, setCopied] = useState(false);

  // Quick preset pills
  const presets = [100, 500, 1000, 5000, 10000, 50000];

  const taxResult = calculateRobloxTax(salePrice);
  const targetPriceResult = calculateTargetPrice(desiredAmount);
  const devexResult = calculateDevEx(devexRobux, usdRate);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    sounds.playCoin();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Coins className="w-6 h-6 text-amber-400" />
              {lang === 'id' ? 'Kalkulator Pajak Robux & DevEx' : 'Robux Tax & DevEx Calculator'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {lang === 'id'
                ? 'Hitung potongan 30% marketplace Roblox dan kurs konversi DevEx ke Rupiah secara akurat.'
                : 'Accurately calculate 30% Roblox tax cut and DevEx cashout value in IDR and USD.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => {
                setMode('tax');
                sounds.playClick();
              }}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                mode === 'tax'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'id' ? 'Hitung Payout (30% Tax)' : 'Calculate Payout'}
            </button>
            <button
              onClick={() => {
                setMode('target');
                sounds.playClick();
              }}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                mode === 'target'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'id' ? 'Hitung Target Harga' : 'Target Price'}
            </button>
            <button
              onClick={() => {
                setMode('devex');
                sounds.playClick();
              }}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                mode === 'devex'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              DevEx (IDR / USD)
            </button>
          </div>
        </div>

        {/* MODE 1: TAX CALCULATOR */}
        {mode === 'tax' && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <label className="block text-sm font-medium text-slate-300">
                {lang === 'id'
                  ? 'Harga Jual Gamepass / Baju / Item (Robux)'
                  : 'Listing Price for Gamepass / Item (Robux)'}
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={salePrice || ''}
                  onChange={(e) => setSalePrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  placeholder="1000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                  R$
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setSalePrice(preset);
                      sounds.playClick();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      salePrice === preset
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    +{formatNumber(preset)} R$
                  </button>
                ))}
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>{lang === 'id' ? 'Kebijakan Resmi Marketplace Roblox:' : 'Official Roblox Policy:'}</span>
                </div>
                <p>
                  {lang === 'id'
                    ? 'Roblox secara otomatis memotong 30% dari setiap penjualan gamepass, pakaian avatar, atau item aksesori.'
                    : 'Roblox automatically deducts a 30% fee from every gamepass, clothing, or accessory sale.'}
                </p>
              </div>
            </div>

            {/* Result Card */}
            <div className="lg:col-span-6 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {lang === 'id' ? 'Hasil Perhitungan' : 'Calculation Summary'}
                </span>

                <div className="mt-4 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                  <div className="text-xs text-emerald-300 font-semibold">
                    {lang === 'id' ? 'Yang Kamu Terima (70%)' : 'Net Received by You (70%)'}
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono mt-1 flex items-baseline gap-2">
                    <span>{formatNumber(taxResult.netReceived)}</span>
                    <span className="text-base text-emerald-500/80 font-bold">Robux</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/20">
                    <div className="text-xs text-rose-300">
                      {lang === 'id' ? 'Potongan Pajak (30%)' : 'Roblox Tax Fee (30%)'}
                    </div>
                    <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">
                      -{formatNumber(taxResult.taxDeducted)} R$
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/40">
                    <div className="text-xs text-slate-400">
                      {lang === 'id' ? 'Estimasi DevEx' : 'Est. DevEx Value'}
                    </div>
                    <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">
                      ${(taxResult.netReceived * 0.0035).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Visual Ratio Bar */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-emerald-400">70% Kamu: {formatNumber(taxResult.netReceived)} R$</span>
                    <span className="text-rose-400">30% Roblox: {formatNumber(taxResult.taxDeducted)} R$</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: '70%' }} />
                    <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: '30%' }} />
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  handleCopy(
                    `Harga Jual: ${salePrice} Robux | Diterima: ${taxResult.netReceived} Robux | Tax 30%: ${taxResult.taxDeducted} Robux (Via Zona Gamer Robux Hub)`
                  )
                }
                className="mt-5 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors border border-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'id' ? 'Tersalin ke Clipboard!' : 'Copied to Clipboard!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>{lang === 'id' ? 'Salin Hasil Lengkap' : 'Copy Full Summary'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: TARGET PRICE CALCULATOR */}
        {mode === 'target' && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <label className="block text-sm font-medium text-slate-300">
                {lang === 'id'
                  ? 'Berapa Robux Bersih yang Ingin Kamu Dapatkan?'
                  : 'How Many Net Robux Do You Want to Receive?'}
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={desiredAmount || ''}
                  onChange={(e) => setDesiredAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  placeholder="700"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                  R$
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setDesiredAmount(preset);
                      sounds.playClick();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      desiredAmount === preset
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    +{formatNumber(preset)} R$
                  </button>
                ))}
              </div>

              <p className="text-xs text-slate-400">
                {lang === 'id'
                  ? 'Fitur ini membalik perhitungan agar kamu tahu persis nominal harga jual yang harus dipasang di Roblox Studio / Gamepass.'
                  : 'This calculates the exact listing price required to offset the 30% commission and reach your target.'}
              </p>
            </div>

            <div className="lg:col-span-6 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {lang === 'id' ? 'Rekomendasi Pasang Harga' : 'Recommended Listing Price'}
                </span>

                <div className="mt-4 p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
                  <div className="text-xs text-cyan-300 font-semibold">
                    {lang === 'id' ? 'Pasang Harga Jual Sebesar:' : 'Set Your Sale Price To:'}
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono mt-1 flex items-baseline gap-2">
                    <span>{formatNumber(targetPriceResult)}</span>
                    <span className="text-base text-cyan-500/80 font-bold">Robux</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between">
                    <span>{lang === 'id' ? 'Target kamu:' : 'Your target:'}</span>
                    <span className="font-bold text-emerald-400">{formatNumber(desiredAmount)} R$</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{lang === 'id' ? 'Pajak Roblox (30%):' : 'Roblox Fee (30%):'}</span>
                    <span className="font-bold text-rose-400">
                      -{formatNumber(targetPriceResult - desiredAmount)} R$
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1 font-bold">
                    <span>{lang === 'id' ? 'Total Pembeli Bayar:' : 'Total Buyer Pays:'}</span>
                    <span className="text-cyan-400">{formatNumber(targetPriceResult)} R$</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  handleCopy(
                    `Untuk dapat ${desiredAmount} Robux, pasang harga ${targetPriceResult} Robux di Roblox (Tax 30%: ${targetPriceResult - desiredAmount} Robux)`
                  )
                }
                className="mt-5 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors border border-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'id' ? 'Tersalin ke Clipboard!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>{lang === 'id' ? 'Salin Hasil' : 'Copy Result'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* MODE 3: DEVEX CALCULATOR */}
        {mode === 'devex' && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  {lang === 'id' ? 'Jumlah Robux untuk DevEx' : 'Robux Amount for DevEx'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={devexRobux || ''}
                    onChange={(e) => setDevexRobux(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="50000"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                    R$
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setDevexRobux(50000)}
                    className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Min: 50k
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevexRobux(100000)}
                    className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    100k
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevexRobux(500000)}
                    className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    500k
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  {lang === 'id' ? 'Kurs USD ke IDR (Rupiah)' : 'USD to IDR Exchange Rate'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10000"
                    step="50"
                    value={usdRate}
                    onChange={(e) => setUsdRate(Math.max(1, parseInt(e.target.value) || DEFAULT_USD_TO_IDR))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                    IDR/$
                  </span>
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  {lang === 'id' ? 'Rate default: Rp 15.850 per USD' : 'Default: Rp 15,850 per USD'}
                </span>
              </div>
            </div>

            {/* DevEx Status & Output Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'id' ? 'Total Payout USD (Dolar AS)' : 'Total USD Payout'}</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono mt-2">
                  ${devexResult.usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  Rate resmi: $0.0035 / Robux
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-cyan-400" />
                  <span>{lang === 'id' ? 'Estimasi Bersih dalam Rupiah (IDR)' : 'Estimated Net in IDR'}</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono mt-2">
                  {formatIDR(devexResult.idrAmount)}
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  Berdasarkan kurs Rp {formatNumber(usdRate)} / $1 USD
                </span>
              </div>
            </div>

            {/* DevEx Requirements checklist */}
            <div
              className={`p-4 rounded-xl border ${
                devexResult.eligible
                  ? 'bg-emerald-950/30 border-emerald-500/30'
                  : 'bg-amber-950/30 border-amber-500/30'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm mb-2">
                {devexResult.eligible ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-300">
                      {lang === 'id'
                        ? 'Memenuhi Syarat Minimum DevEx (50.000 R$)'
                        : 'Eligible for DevEx Minimum (50,000 R$)'}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-300">
                      {lang === 'id'
                        ? `Belum memenuhi syarat minimum (${formatNumber(DEVEX_MIN_ROBUX - devexRobux)} R$ lagi)`
                        : `Below minimum requirement (${formatNumber(DEVEX_MIN_ROBUX - devexRobux)} R$ remaining)`}
                    </span>
                  </>
                )}
              </div>

              {/* Progress bar towards 50,000 */}
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    devexResult.eligible ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, (devexRobux / DEVEX_MIN_ROBUX) * 100)}%` }}
                />
              </div>

              <ul className="mt-3 text-xs text-slate-300 space-y-1 list-disc list-inside">
                <li>{lang === 'id' ? 'Robux harus diperoleh secara sah (earned Robux dari game/item).' : 'Robux must be earned legitimately through games/creations.'}</li>
                <li>{lang === 'id' ? 'Akun berumur minimal 13 tahun dengan email terverifikasi.' : 'Account must be 13+ with verified email address.'}</li>
                <li>{lang === 'id' ? 'Memiliki langganan Roblox Premium aktif dan akun Tipalti untuk pembayaran.' : 'Active Roblox Premium membership and Tipalti payout account.'}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Gift,
  Copy,
  Check,
  Search,
  ThumbsUp,
  Sparkles,
  PlusCircle,
  Tag,
} from 'lucide-react';
import { Language, RedeemCode } from '../types';
import { INITIAL_REDEEM_CODES, POPULAR_GAMES } from '../data/robloxData';
import { sounds } from '../utils/sound';

interface Props {
  lang: Language;
}

export const CodeVaultView: React.FC<Props> = ({ lang }) => {
  const [codes, setCodes] = useState<RedeemCode[]>(INITIAL_REDEEM_CODES);
  const [selectedGame, setSelectedGame] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New code submit state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGame, setNewGame] = useState('Blox Fruits');
  const [newCode, setNewCode] = useState('');
  const [newReward, setNewReward] = useState('');

  const handleCopy = (code: RedeemCode) => {
    navigator.clipboard.writeText(code.code);
    sounds.playCoin();
    setCopiedId(code.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLike = (id: string) => {
    sounds.playClick();
    setCodes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
    );
  };

  const handleAddCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newReward.trim()) return;

    const created: RedeemCode = {
      id: `user-${Date.now()}`,
      game: newGame,
      code: newCode.trim().toUpperCase(),
      reward: newReward.trim(),
      status: 'new',
      updatedAt: 'Baru saja',
      likes: 1,
    };

    sounds.playUpgrade();
    setCodes((prev) => [created, ...prev]);
    setNewCode('');
    setNewReward('');
    setShowAddModal(false);
  };

  // Filtered list
  const filteredCodes = codes.filter((c) => {
    const matchGame = selectedGame === 'All' || c.game === selectedGame;
    const matchSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.game.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reward.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGame && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Gift className="w-6 h-6 text-pink-400" />
              {lang === 'id' ? 'Gudang Kode Redeem Roblox Terkini' : 'Latest Roblox Redeem Codes'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {lang === 'id'
                ? 'Kumpulan kode promo aktif untuk Blox Fruits, Blade Ball, Pet Sim 99, dan game populer lainnya.'
                : 'Active promo codes for Blox Fruits, Blade Ball, Pet Sim 99, and top Roblox games.'}
            </p>
          </div>

          <button
            onClick={() => {
              setShowAddModal(true);
              sounds.playClick();
            }}
            className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-pink-900/30 cursor-pointer self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{lang === 'id' ? 'Bagikan Kode Baru' : 'Submit Code'}</span>
          </button>
        </div>

        {/* Search input */}
        <div className="mt-5 relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'id'
                ? 'Cari kode, nama game, atau hadiah (misal: Blox Fruits, EXP boost)...'
                : 'Search codes, game title, or rewards...'
            }
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pt-4 scrollbar-none">
          <button
            onClick={() => {
              setSelectedGame('All');
              sounds.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedGame === 'All'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {lang === 'id' ? 'Semua Game' : 'All Games'}
          </button>
          {POPULAR_GAMES.map((game) => (
            <button
              key={game}
              onClick={() => {
                setSelectedGame(game);
                sounds.playClick();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedGame === game
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {game}
            </button>
          ))}
        </div>
      </div>

      {/* Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCodes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm">
            {lang === 'id' ? 'Tidak ada kode yang cocok dengan pencarian.' : 'No codes matching search.'}
          </div>
        ) : (
          filteredCodes.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-pink-400" />
                    {item.game}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      item.status === 'new'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {item.status === 'new' ? 'BARU' : 'AKTIF'}
                  </span>
                </div>

                {/* The Code pill */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="font-mono font-black text-base text-yellow-400 tracking-wider">
                    {item.code}
                  </span>
                  <button
                    onClick={() => handleCopy(item)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title={lang === 'id' ? 'Salin Kode' : 'Copy Code'}
                    aria-label={`Copy code ${item.code}`}
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="mt-2.5">
                  <span className="text-xs text-slate-400 font-medium block">
                    {lang === 'id' ? 'Hadiah / Reward:' : 'Reward:'}
                  </span>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5">{item.reward}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>{item.updatedAt}</span>
                <button
                  onClick={() => handleLike(item.id)}
                  className="flex items-center gap-1 text-slate-400 hover:text-pink-400 transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{item.likes}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Code Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              {lang === 'id' ? 'Bagikan Kode Baru' : 'Submit a Promo Code'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              {lang === 'id'
                ? 'Punya info kode baru yang berhasil kamu coba di Roblox? Bagikan ke teman-teman di sini!'
                : 'Found a working code? Share it with fellow players here!'}
            </p>

            <form onSubmit={handleAddCode} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {lang === 'id' ? 'Pilih Game' : 'Game Title'}
                </label>
                <select
                  value={newGame}
                  onChange={(e) => setNewGame(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {POPULAR_GAMES.map((game) => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {lang === 'id' ? 'Kode (Huruf Kapital)' : 'Code (Uppercase)'}
                </label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="CONTOH: 2XEXPBONUS"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {lang === 'id' ? 'Hadiah / Reward' : 'Reward description'}
                </label>
                <input
                  type="text"
                  required
                  value={newReward}
                  onChange={(e) => setNewReward(e.target.value)}
                  placeholder="Contoh: 1,000 Diamonds & Boost"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  {lang === 'id' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition-colors shadow-md"
                >
                  {lang === 'id' ? 'Kirim Kode' : 'Submit Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

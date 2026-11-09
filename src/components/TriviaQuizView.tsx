import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { Language } from '../types';
import { TRIVIA_QUESTIONS } from '../data/robloxData';
import { sounds } from '../utils/sound';

interface Props {
  lang: Language;
}

export const TriviaQuizView: React.FC<Props> = ({ lang }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const question = TRIVIA_QUESTIONS[currentIndex];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === question.correctIndex;
    if (isCorrect) {
      sounds.playCoin();
      setScore((s) => s + 100 + streak * 20);
      setStreak((st) => st + 1);
    } else {
      sounds.playDefeat();
      setStreak(0);
    }
  };

  const handleNext = () => {
    sounds.playClick();
    if (currentIndex + 1 < TRIVIA_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      confetti({ particleCount: 120, spread: 70 });
    }
  };

  const restartQuiz = () => {
    sounds.playClick();
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setQuizFinished(false);
  };

  const getRank = (finalScore: number) => {
    if (finalScore >= 500) {
      return {
        title: lang === 'id' ? 'Master Robloxian Legend' : 'Legendary Master Robloxian',
        color: 'text-amber-400',
        badge: '👑 SSS Rank',
      };
    }
    if (finalScore >= 300) {
      return {
        title: lang === 'id' ? 'Pro Builder & Trader' : 'Pro Builder & Trader',
        color: 'text-emerald-400',
        badge: '⭐ Pro Rank',
      };
    }
    return {
      title: lang === 'id' ? 'Robloxian Explorer' : 'Robloxian Explorer',
      color: 'text-cyan-400',
      badge: '🎮 Explorer Rank',
    };
  };

  return (
    <div className="space-y-6">
      {/* Quiz Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-sm shadow-xl max-w-3xl mx-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-black text-white">
              {lang === 'id' ? 'Kuis Trivia Roblox Indonesia' : 'Roblox Trivia Challenge'}
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="text-slate-400">
              {currentIndex + 1} / {TRIVIA_QUESTIONS.length}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Skor: {score}
            </span>
            {streak > 1 && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                {streak}x
              </span>
            )}
          </div>
        </div>

        {!quizFinished ? (
          <div className="mt-6 space-y-6">
            {/* Progress bar */}
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / TRIVIA_QUESTIONS.length) * 100}%`,
                }}
              />
            </div>

            {/* Question Text */}
            <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {question.question[lang]}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {question.options[lang].map((opt, idx) => {
                let btnStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-indigo-500/50';

                if (isAnswered) {
                  if (idx === question.correctIndex) {
                    btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                  } else if (idx === selectedOption) {
                    btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                  } else {
                    btnStyle = 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelect(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all text-sm flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && idx === question.correctIndex && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && idx === selectedOption && idx !== question.correctIndex && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after answer */}
            {isAnswered && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                <span className="font-bold text-slate-300 block">
                  {lang === 'id' ? 'Penjelasan Fakta:' : 'Fact Explanation:'}
                </span>
                <p className="text-slate-400">{question.explanation[lang]}</p>
              </div>
            )}

            {/* Next button */}
            {isAnswered && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-900/40 cursor-pointer"
                >
                  <span>
                    {currentIndex + 1 === TRIVIA_QUESTIONS.length
                      ? lang === 'id'
                        ? 'Lihat Hasil Akhir'
                        : 'See Final Results'
                      : lang === 'id'
                      ? 'Pertanyaan Selanjutnya'
                      : 'Next Question'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Finished Screen */
          <div className="mt-8 text-center space-y-4 py-4">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              {lang === 'id' ? 'Kuis Selesai!' : 'Quiz Finished!'}
            </span>

            <div className="text-4xl sm:text-5xl font-black text-white font-mono">
              {score} <span className="text-lg text-indigo-400 font-bold">Poin</span>
            </div>

            <div className="inline-block px-4 py-1.5 rounded-full bg-slate-950 border border-slate-800">
              <span className={`text-sm font-black ${getRank(score).color}`}>
                {getRank(score).badge} - {getRank(score).title}
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {lang === 'id'
                ? 'Terima kasih sudah menguji wawasan Roblox kamu! Bagikan skor ini ke komunitas gamer kamu.'
                : 'Thanks for testing your Roblox knowledge! Share your score with your gaming friends.'}
            </p>

            <div className="pt-4">
              <button
                onClick={restartQuiz}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 mx-auto shadow-lg shadow-indigo-900/40 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{lang === 'id' ? 'Mainkan Kuis Lagi' : 'Play Again'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

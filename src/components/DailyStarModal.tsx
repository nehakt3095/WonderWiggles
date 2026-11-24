import React from 'react';
import { Flame, Sparkles, Star } from 'lucide-react';
import { getCharacterById } from '../data/characters';
import type { CharacterId } from '../types/game';

interface DailyStarModalProps {
  characterId: CharacterId;
  streakCount: number;
  totalDailyStars: number;
  reducedMotion: boolean;
  onCollect: () => void;
}

export const DailyStarModal: React.FC<DailyStarModalProps> = ({
  characterId,
  streakCount,
  totalDailyStars,
  reducedMotion,
  onCollect,
}) => {
  const char = getCharacterById(characterId);
  const isReturningStreak = streakCount > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-star-title"
    >
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-amber-200 text-center animate-soft-pop">
        {/* Animated Daily Star Emblem */}
        <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-tr from-amber-100 via-yellow-50 to-orange-100 border-2 border-dashed border-amber-300 ${
              reducedMotion ? '' : 'animate-daily-star-rays'
            }`}
            aria-hidden="true"
          />
          <div
            className={`relative w-20 h-20 rounded-3xl bg-gradient-to-b from-amber-300 to-amber-500 shadow-lg flex items-center justify-center ${
              reducedMotion ? '' : 'animate-daily-star-pop'
            }`}
          >
            <Star className="w-11 h-11 text-white fill-white drop-shadow-sm" />
          </div>
          <Sparkles
            className="absolute -top-1 -right-1 w-6 h-6 text-amber-500"
            aria-hidden="true"
          />
        </div>

        <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600">
          <Flame className="w-4 h-4 fill-amber-400 text-amber-500" />
          <span>
            Day {streakCount} Play Streak · {totalDailyStars} Daily {totalDailyStars === 1 ? 'Star' : 'Stars'}
          </span>
        </p>

        <h2 id="daily-star-title" className="font-display text-2xl sm:text-3xl font-bold text-slate-800 mt-1">
          Today’s Daily Star!
        </h2>

        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {isReturningStreak
            ? `${char.name} is cheering for you! You came back ${streakCount} days in a row!`
            : `Welcome back! ${char.name} saved a shiny Daily Star just for you today!`}
        </p>

        <button
          type="button"
          onClick={onCollect}
          className="mt-5 w-full min-h-[56px] rounded-2xl bg-[#FF8A4C] hover:bg-[#f57633] text-white font-display text-xl font-bold shadow-md inline-flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
        >
          <Star className="w-5 h-5 fill-white" />
          <span>Collect Daily Star</span>
        </button>
      </div>
    </div>
  );
};

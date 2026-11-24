import React from 'react';
import { ArrowLeft, CheckCircle2, Lock, Star } from 'lucide-react';
import { ACHIEVEMENTS } from '../../data/achievements';
import { getPlanetEnergyPercent, getTotalStars } from '../../services/saveSystem';
import type { SaveState } from '../../types/game';

interface RewardsScreenProps {
  saveState: SaveState;
  onBack: () => void;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({ saveState, onBack }) => {
  const totalStars = getTotalStars(saveState);
  const completedCount = Object.keys(saveState.completedLevels).length;
  const energyPct = getPlanetEnergyPercent(saveState);

  return (
    <div className="min-h-screen w-full bg-[#FAF8F2] flex flex-col">
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-slate-200/70 bg-white/80">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[48px] px-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-2 text-sm font-bold text-slate-700"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="font-display text-2xl font-bold text-slate-800">Star Book & Stickers</h1>
        <div className="w-20" />
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col gap-6">
        {/* Planet Restoration Summary */}
        <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-amber-600">WonderWiggles Starlight</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-800 mt-1 tabular-nums">
              {totalStars} Stars Collected · {completedCount} / 50 Puzzles
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Every puzzle helps Wobble light up the little puzzle planet ({energyPct}% restored).
            </p>
            <p className="text-xs font-bold text-slate-500 mt-2 tabular-nums">
              Daily Play Streak: {saveState.dailyStreak.currentStreak} {saveState.dailyStreak.currentStreak === 1 ? 'day' : 'days'} · Best Streak: {saveState.dailyStreak.bestStreak} · Daily Stars: {saveState.dailyStreak.totalDailyStars}
            </p>
          </div>
          <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center shrink-0">
            <Star className="w-8 h-8 text-amber-500 fill-amber-400" />
            <span className="font-display text-lg font-bold text-amber-700 tabular-nums">{energyPct}%</span>
          </div>
        </section>

        {/* Sticker Badges */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ACHIEVEMENTS.map((ach) => {
            const earned = saveState.unlockedBadges.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`rounded-3xl border p-5 flex flex-col justify-between transition-all ${
                  earned
                    ? 'bg-white border-emerald-300 shadow-sm'
                    : 'bg-slate-50/90 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                      earned ? 'bg-amber-50' : 'bg-slate-200/70 grayscale opacity-60'
                    }`}
                  >
                    {ach.emoji}
                  </span>
                  {earned ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                <div className="mt-4">
                  <h3 className={`font-display text-lg font-bold ${earned ? 'text-slate-800' : 'text-slate-500'}`}>
                    {ach.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{ach.description}</p>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
};

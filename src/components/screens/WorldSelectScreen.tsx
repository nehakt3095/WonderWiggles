import React, { useState } from 'react';
import { ArrowLeft, Lock, Play, Star } from 'lucide-react';
import { getWorldById, WORLDS } from '../../data/worlds';
import { getWorldCompletedCount, getWorldStars, isWorldUnlocked } from '../../services/saveSystem';
import type { SaveState, WorldId } from '../../types/game';
import { ThreeStage } from '../ThreeStage';

interface WorldSelectScreenProps {
  saveState: SaveState;
  activeWorldId: WorldId;
  onSelectWorld: (worldId: WorldId) => void;
  onRequestUnlock: () => void;
  onBack: () => void;
}

export const WorldSelectScreen: React.FC<WorldSelectScreenProps> = ({
  saveState,
  activeWorldId,
  onSelectWorld,
  onRequestUnlock,
  onBack,
}) => {
  const [focusedWorldId, setFocusedWorldId] = useState<WorldId>(activeWorldId);
  const focusedWorld = getWorldById(focusedWorldId);
  const focusedUnlocked = isWorldUnlocked(saveState, focusedWorldId);
  const needsPurchase = !focusedWorld.free && !saveState.isPremiumUnlocked;

  return (
    <div className="min-h-screen w-full bg-[#FAF8F2] flex flex-col">
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-slate-200/70 bg-white/80">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[48px] px-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-2 text-sm font-bold text-slate-700"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Menu</span>
        </button>
        <h1 className="font-display text-2xl font-bold text-slate-800">Choose a Magical Island</h1>
        <div className="w-20" />
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 3D Island Diorama Preview */}
        <section className="lg:col-span-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden flex flex-col min-h-[300px] sm:min-h-[400px]">
          <div className="flex-1 relative">
            <ThreeStage
              mode="island"
              characterId={saveState.selectedCharacterId}
              worldId={focusedWorldId}
              animState={focusedUnlocked ? 'wave' : 'idle'}
              reducedMotion={saveState.audioSettings.reducedMotion}
            />
          </div>

          <div className="p-5 border-t border-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-500">
                  World {focusedWorld.id} · {focusedWorld.free ? 'Free Adventure' : 'Full Planet Edition'}
                </p>
                <h2 className="font-display text-2xl font-bold text-slate-800">{focusedWorld.name}</h2>
              </div>
              <div className="text-right tabular-nums">
                <span className="inline-flex items-center gap-1 font-display text-lg font-bold text-amber-600">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                  {getWorldStars(saveState, focusedWorldId)} / 30
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-1.5">{focusedWorld.themeDescription}</p>
            <p className="text-xs text-slate-500 mt-2">
              Skills: {focusedWorld.skillsDeveloped.join(' · ')}
            </p>

            {focusedUnlocked ? (
              <button
                type="button"
                onClick={() => onSelectWorld(focusedWorldId)}
                className="mt-4 w-full min-h-[56px] rounded-2xl bg-[#FF8A4C] hover:bg-[#f57633] text-white font-display text-xl font-bold shadow-md inline-flex items-center justify-center gap-2.5"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Visit {focusedWorld.name}</span>
              </button>
            ) : needsPurchase ? (
              <button
                type="button"
                onClick={onRequestUnlock}
                className="mt-4 w-full min-h-[56px] rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-display text-lg font-bold shadow-md inline-flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                <span>Ask a Grown-Up to Unlock All 5 Worlds</span>
              </button>
            ) : (
              <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-center text-sm font-bold text-amber-800">
                Complete 2 puzzles in World {focusedWorldId - 1} to fly to this island!
              </div>
            )}
          </div>
        </section>

        {/* 5 World Selector List */}
        <section className="lg:col-span-6 flex flex-col gap-3">
          {WORLDS.map((w) => {
            const unlocked = isWorldUnlocked(saveState, w.id);
            const completed = getWorldCompletedCount(saveState, w.id);
            const stars = getWorldStars(saveState, w.id);
            const selected = focusedWorldId === w.id;

            return (
              <button
                key={w.id}
                type="button"
                onClick={() => setFocusedWorldId(w.id)}
                className={`min-h-[86px] rounded-3xl border-2 p-4 text-left flex items-center justify-between gap-4 transition-all ${
                  selected
                    ? 'border-amber-500 bg-white shadow-md'
                    : 'border-slate-200/80 bg-white/85 hover:border-sky-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-display text-xl font-bold text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: w.badgeColor }}
                  >
                    {w.id}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-800">{w.name}</h3>
                    <p className="text-xs text-slate-500">
                      {w.subtitle} · {completed}/10 puzzles
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 tabular-nums">
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-700">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    {stars}
                  </span>
                  {!unlocked && <Lock className="w-5 h-5 text-slate-400" />}
                </div>
              </button>
            );
          })}
        </section>
      </main>
    </div>
  );
};

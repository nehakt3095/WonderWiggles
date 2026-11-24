import React from 'react';
import { ArrowLeft, Lock, Play, Star } from 'lucide-react';
import { getLevelsByWorld } from '../../data/levels';
import { getWorldById } from '../../data/worlds';
import { getWorldStars, isLevelUnlocked } from '../../services/saveSystem';
import type { SaveState, WorldId } from '../../types/game';

interface LevelSelectScreenProps {
  saveState: SaveState;
  worldId: WorldId;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
  saveState,
  worldId,
  onSelectLevel,
  onBack,
}) => {
  const world = getWorldById(worldId);
  const levels = getLevelsByWorld(worldId);
  const worldStars = getWorldStars(saveState, worldId);

  return (
    <div className="min-h-screen w-full bg-[#FAF8F2] flex flex-col">
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-slate-200/70 bg-white/80">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[48px] px-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-2 text-sm font-bold text-slate-700"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Islands</span>
        </button>

        <div className="text-center">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-800">{world.name}</h1>
          <p className="text-xs text-slate-500">10 Puzzles · {worldStars} / 30 Stars</p>
        </div>

        <div className="w-20" />
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {levels.map((lvl) => {
            const unlocked = isLevelUnlocked(saveState, lvl.id);
            const record = saveState.completedLevels[lvl.id];
            const earnedStars = record?.stars ?? 0;

            return (
              <button
                key={lvl.id}
                type="button"
                disabled={!unlocked}
                onClick={() => onSelectLevel(lvl.id)}
                className={`min-h-[144px] rounded-3xl border-2 p-4 flex flex-col items-center justify-between text-center transition-all ${
                  unlocked
                    ? record
                      ? 'bg-white border-emerald-300 hover:border-emerald-400 shadow-sm hover:-translate-y-0.5'
                      : 'bg-white border-amber-400 hover:border-amber-500 shadow-md hover:-translate-y-0.5'
                    : 'bg-slate-100/80 border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <div className="w-full flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="capitalize">{lvl.difficulty}</span>
                  {!unlocked && <Lock className="w-4 h-4 text-slate-400" />}
                </div>

                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-display text-2xl font-bold text-white shadow-sm"
                  style={{ backgroundColor: unlocked ? world.badgeColor : '#94A3B8' }}
                >
                  {lvl.levelNumberInWorld}
                </div>

                <div>
                  <p className="font-display text-sm font-bold text-slate-800 line-clamp-1">
                    {lvl.title}
                  </p>
                  <div className="mt-1.5 flex items-center justify-center gap-1">
                    {[1, 2, 3].map((idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${
                          idx <= earnedStars
                            ? 'text-amber-500 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {unlocked && !record && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Play className="w-3.5 h-3.5 fill-current" /> Play
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

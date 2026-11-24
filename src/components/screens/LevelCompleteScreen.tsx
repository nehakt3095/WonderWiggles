import React from 'react';
import { ArrowRight, Map, RotateCcw, Star } from 'lucide-react';
import { getLevelById } from '../../data/levels';
import { getWorldById } from '../../data/worlds';
import { isLevelUnlocked } from '../../services/saveSystem';
import type { SaveState, WorldId } from '../../types/game';
import { ThreeStage } from '../ThreeStage';

interface LevelCompleteScreenProps {
  saveState: SaveState;
  levelId: number;
  earnedStars: 1 | 2 | 3;
  onReplay: () => void;
  onNextLevel: (nextLevelId: number) => void;
  onWorldMap: (worldId: WorldId) => void;
  onRequestUnlock: () => void;
}

export const LevelCompleteScreen: React.FC<LevelCompleteScreenProps> = ({
  saveState,
  levelId,
  earnedStars,
  onReplay,
  onNextLevel,
  onWorldMap,
  onRequestUnlock,
}) => {
  const level = getLevelById(levelId);
  const world = getWorldById(level.worldId);
  const hasNextInGame = levelId < 50;
  const nextLevel = hasNextInGame ? getLevelById(levelId + 1) : null;
  const nextUnlocked = nextLevel ? isLevelUnlocked(saveState, nextLevel.id) : false;

  const praiseLine =
    earnedStars === 3
      ? 'Super Starlight Sparkle! Three golden stars!'
      : earnedStars === 2
      ? 'Wonderful thinking! Two bright stars!'
      : 'Yay, you finished the puzzle! Great persistence!';

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-amber-50 to-[#FAF8F2] flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden animate-soft-pop">
        <div className="h-[240px] w-full relative">
          <ThreeStage
            mode="island"
            characterId={saveState.selectedCharacterId}
            worldId={level.worldId}
            animState="celebrate"
            reducedMotion={saveState.audioSettings.reducedMotion}
          />
        </div>

        <div className="p-6 text-center">
          <p className="text-xs font-bold text-amber-600">
            {world.name} · Level {level.levelNumberInWorld} Complete
          </p>
          <h1 className="font-display text-3xl font-bold text-slate-800 mt-1">{praiseLine}</h1>

          <div className="mt-4 flex items-center justify-center gap-3">
            {[1, 2, 3].map((idx) => (
              <Star
                key={idx}
                className={`w-12 h-12 transition-transform ${
                  idx <= earnedStars
                    ? 'text-amber-500 fill-amber-400 scale-105 drop-shadow-sm'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={onReplay}
              className="w-full sm:w-auto min-h-[54px] px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm inline-flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay</span>
            </button>

            <button
              type="button"
              onClick={() => onWorldMap(level.worldId)}
              className="w-full sm:w-auto min-h-[54px] px-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm inline-flex items-center justify-center gap-2"
            >
              <Map className="w-4 h-4" />
              <span>Levels</span>
            </button>

            {nextLevel && nextUnlocked ? (
              <button
                type="button"
                onClick={() => onNextLevel(nextLevel.id)}
                className="w-full sm:flex-1 min-h-[54px] px-6 rounded-2xl bg-[#FF8A4C] hover:bg-[#f57633] text-white font-display text-lg font-bold shadow-md inline-flex items-center justify-center gap-2"
              >
                <span>Next Puzzle</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : nextLevel && !saveState.isPremiumUnlocked ? (
              <button
                type="button"
                onClick={onRequestUnlock}
                className="w-full sm:flex-1 min-h-[54px] px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-display text-base font-bold shadow-md"
              >
                Unlock Worlds 2–5
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

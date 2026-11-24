import React from 'react';
import { Play, Settings, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import type { AudioSettings, CharacterId } from '../../types/game';
import { ThreeStage } from '../ThreeStage';

interface WelcomeScreenProps {
  characterId: CharacterId;
  audioSettings: AudioSettings;
  onToggleSound: () => void;
  onStart: () => void;
  onOpenSettings: () => void;
  onRequestParentSection: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  characterId,
  audioSettings,
  onToggleSound,
  onStart,
  onOpenSettings,
  onRequestParentSection,
}) => {
  const isMuted = !audioSettings.musicEnabled && !audioSettings.sfxEnabled;

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-gradient-to-b from-sky-100 to-[#FAF8F2]">
      {/* 3D Storybook Planet Stage */}
      <div className="absolute inset-0">
        <ThreeStage
          mode="planet"
          characterId={characterId}
          worldId={1}
          animState="wave"
          reducedMotion={audioSettings.reducedMotion}
          onCharacterTap={onStart}
        />
      </div>

      {/* Top Minimal Utility Bar */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 pt-4">
        <div className="bg-white/95 rounded-2xl px-4 py-2 border border-slate-200/80 shadow-sm">
          <span className="font-display text-lg sm:text-xl font-bold text-slate-800 whitespace-nowrap">
            WonderWiggles
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={isMuted ? 'Turn Sound On' : 'Turn Sound Off'}
            onClick={onToggleSound}
            className="w-12 h-12 rounded-2xl bg-white/95 border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
          </button>
          <button
            type="button"
            aria-label="Settings"
            onClick={onOpenSettings}
            className="w-12 h-12 rounded-2xl bg-white/95 border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onRequestParentSection}
            className="min-h-[48px] px-4 rounded-2xl bg-white/95 border border-slate-200/80 shadow-sm inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Parents</span>
          </button>
        </div>
      </header>

      {/* Center Spacer so 3D Planet + Wobble stay completely unobstructed */}
      <div className="flex-1 pointer-events-none" />

      {/* Bottom Storybook Welcome CTA */}
      <div className="relative z-10 pb-8 px-4 flex flex-col items-center text-center">
        <div className="bg-white/95 rounded-3xl px-6 py-5 border border-slate-200/80 shadow-lg max-w-md w-full">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-800">
            The Little Puzzle Planet
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Help Wobble bring back the planet’s starlight across five magical islands.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="mt-4 w-full min-h-[58px] rounded-2xl bg-[#FF8A4C] hover:bg-[#f57633] text-white font-display text-xl font-bold shadow-md inline-flex items-center justify-center gap-2.5 transition-transform active:scale-[0.98]"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>Play Adventure</span>
          </button>
        </div>
      </div>
    </div>
  );
};

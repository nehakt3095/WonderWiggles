import React from 'react';
import { Award, Compass, Lock, Settings, ShieldCheck, Smile, Star, Volume2 } from 'lucide-react';
import { getCharacterById } from '../../data/characters';
import { getPlanetEnergyPercent, getTotalStars } from '../../services/saveSystem';
import type { SaveState } from '../../types/game';
import { ThreeStage } from '../ThreeStage';

interface MainMenuScreenProps {
  saveState: SaveState;
  onExploreWorlds: () => void;
  onSelectCharacter: () => void;
  onOpenRewards: () => void;
  onOpenSettings: () => void;
  onRequestParentSection: () => void;
  onOpenPrivacy: () => void;
  onSpeakGreeting: () => void;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  saveState,
  onExploreWorlds,
  onSelectCharacter,
  onOpenRewards,
  onOpenSettings,
  onRequestParentSection,
  onOpenPrivacy,
  onSpeakGreeting,
}) => {
  const char = getCharacterById(saveState.selectedCharacterId);
  const totalStars = getTotalStars(saveState);
  const energyPct = getPlanetEnergyPercent(saveState);

  return (
    <div className="min-h-screen w-full bg-[#FAF8F2] flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between gap-4 px-4 sm:px-8 py-4 border-b border-slate-200/70 bg-white/80">
        <span className="font-display text-xl font-bold text-slate-800 whitespace-nowrap shrink-0">
          WonderWiggles
        </span>

        <div className="flex items-center gap-4 text-sm font-bold text-slate-600 tabular-nums">
          <span className="inline-flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            {totalStars} / 150 Stars
          </span>
          <span className="hidden sm:inline text-slate-300">·</span>
          <span className="hidden sm:inline">Day {saveState.dailyStreak.currentStreak} Streak</span>
          <span className="hidden md:inline text-slate-300">·</span>
          <span className="hidden md:inline">Planet Energy {energyPct}%</span>
        </div>

        <button
          type="button"
          onClick={onRequestParentSection}
          className="min-h-[44px] px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-bold text-slate-700 inline-flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Parent Zone</span>
        </button>
      </header>

      {/* Main Split Stage */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 3D Companion Spotlight */}
        <section className="lg:col-span-6 rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-sm flex flex-col min-h-[320px] sm:min-h-[420px]">
          <div className="relative flex-1">
            <ThreeStage
              mode="island"
              characterId={saveState.selectedCharacterId}
              worldId={1}
              animState="wave"
              reducedMotion={saveState.audioSettings.reducedMotion}
              onCharacterTap={onSpeakGreeting}
            />
            <button
              type="button"
              onClick={onSpeakGreeting}
              className="absolute bottom-3 right-3 min-h-[44px] px-3.5 rounded-2xl bg-white/95 border border-slate-200 shadow-sm inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Volume2 className="w-4 h-4 text-amber-500" />
              <span>Say Hi to {char.name}</span>
            </button>
          </div>
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-800">{char.name}</h2>
              <p className="text-xs text-slate-500">{char.role} · Tap {char.name} to wave!</p>
            </div>
            <button
              type="button"
              onClick={onSelectCharacter}
              className="min-h-[44px] px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 whitespace-nowrap"
            >
              Switch Friend
            </button>
          </div>
        </section>

        {/* Action Deck */}
        <section className="lg:col-span-6 flex flex-col justify-between gap-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <p className="text-xs font-bold text-amber-600">
              Think · Play · Discover
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-800 mt-1">
              Ready to explore?
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Travel across five colorful islands, collect golden stars, and wake up WonderWiggles!
            </p>

            <button
              type="button"
              onClick={onExploreWorlds}
              className="mt-5 w-full min-h-[64px] rounded-2xl bg-[#FF8A4C] hover:bg-[#f57633] text-white font-display text-2xl font-bold shadow-md inline-flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
            >
              <Compass className="w-7 h-7" />
              <span>Explore 5 Worlds</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={onSelectCharacter}
              className="min-h-[84px] rounded-3xl bg-white border border-slate-200/80 hover:border-sky-300 p-4 text-left shadow-sm flex items-center gap-3.5 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Smile className="w-6 h-6" />
              </div>
              <div>
                <p className="font-display text-lg font-bold text-slate-800">My Friends</p>
                <p className="text-xs text-slate-500">5 3D characters</p>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenRewards}
              className="min-h-[84px] rounded-3xl bg-white border border-slate-200/80 hover:border-amber-300 p-4 text-left shadow-sm flex items-center gap-3.5 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="font-display text-lg font-bold text-slate-800">Star Book</p>
                <p className="text-xs text-slate-500">{saveState.unlockedBadges.length} / 8 stickers</p>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="min-h-[84px] rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-300 p-4 text-left shadow-sm flex items-center gap-3.5 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <p className="font-display text-lg font-bold text-slate-800">Sound & Motion</p>
                <p className="text-xs text-slate-500">Music, voice & app install</p>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenPrivacy}
              className="min-h-[84px] rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-300 p-4 text-left shadow-sm flex items-center gap-3.5 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <p className="font-display text-lg font-bold text-slate-800">Child Safety</p>
                <p className="text-xs text-slate-500">Privacy & zero-ads promise</p>
              </div>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

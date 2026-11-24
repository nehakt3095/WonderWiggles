import React, { useState } from 'react';
import { ArrowLeft, Check, Lock, Sparkles } from 'lucide-react';
import { CHARACTERS, getCharacterById } from '../../data/characters';
import { audioEngine } from '../../services/audioEngine';
import { isCharacterUnlocked } from '../../services/saveSystem';
import type { CharacterAnimState, CharacterId, SaveState } from '../../types/game';
import { ThreeStage } from '../ThreeStage';

interface CharacterSelectScreenProps {
  saveState: SaveState;
  onSelectCharacter: (id: CharacterId) => void;
  onRequestUnlock: () => void;
  onBack: () => void;
}

export const CharacterSelectScreen: React.FC<CharacterSelectScreenProps> = ({
  saveState,
  onSelectCharacter,
  onRequestUnlock,
  onBack,
}) => {
  const [previewId, setPreviewId] = useState<CharacterId>(saveState.selectedCharacterId);
  const [animState, setAnimState] = useState<CharacterAnimState>('wave');

  const previewChar = getCharacterById(previewId);
  const unlocked = isCharacterUnlocked(saveState, previewId);
  const isSelected = saveState.selectedCharacterId === previewId;

  const triggerAnim = (anim: CharacterAnimState) => {
    setAnimState(anim);
    audioEngine.playCharacterVoiceChirp(previewId);
  };

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
        <h1 className="font-display text-2xl font-bold text-slate-800">Choose Your Friend</h1>
        <div className="w-20" />
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 3D Character Turntable */}
        <section className="lg:col-span-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden flex flex-col min-h-[340px]">
          <div className="flex-1 relative">
            <ThreeStage
              mode="character"
              characterId={previewId}
              worldId={1}
              animState={animState}
              reducedMotion={saveState.audioSettings.reducedMotion}
              onCharacterTap={() => {
                triggerAnim('celebrate');
                audioEngine.speakCue(previewChar.greetingLine, previewId);
              }}
            />
          </div>

          {/* Animation Test Buttons */}
          <div className="px-4 py-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 bg-slate-50/70">
            {(['idle', 'wave', 'walk', 'jump', 'celebrate'] as CharacterAnimState[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => triggerAnim(st)}
                className={`min-h-[40px] px-3.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                  animState === st
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </section>

        {/* Character Roster */}
        <section className="lg:col-span-6 flex flex-col justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CHARACTERS.map((ch) => {
              const charUnlocked = isCharacterUnlocked(saveState, ch.id);
              const active = previewId === ch.id;
              const chosen = saveState.selectedCharacterId === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setPreviewId(ch.id);
                    setAnimState('wave');
                    audioEngine.playCharacterVoiceChirp(ch.id);
                    audioEngine.speakCue(ch.greetingLine, ch.id);
                  }}
                  className={`min-h-[88px] rounded-2xl border-2 p-4 text-left flex items-center justify-between gap-3 transition-all ${
                    active
                      ? 'border-amber-500 bg-amber-50/60 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-11 h-11 rounded-2xl shrink-0 border border-white shadow-sm"
                      style={{ backgroundColor: ch.primaryColor }}
                    />
                    <div>
                      <p className="font-display text-lg font-bold text-slate-800">{ch.name}</p>
                      <p className="text-xs text-slate-500">
                        {ch.role} · {charUnlocked ? (chosen ? 'Active' : 'Ready') : 'Premium'}
                      </p>
                    </div>
                  </div>
                  {!charUnlocked ? (
                    <Lock className="w-5 h-5 text-slate-400 shrink-0" />
                  ) : chosen ? (
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-slate-800">{previewChar.name}</h2>
            <p className="text-sm text-slate-600 mt-1">{previewChar.description}</p>

            {unlocked ? (
              <button
                type="button"
                onClick={() => {
                  onSelectCharacter(previewId);
                  audioEngine.playSuccess();
                }}
                disabled={isSelected}
                className={`mt-4 w-full min-h-[56px] rounded-2xl font-display text-lg font-bold inline-flex items-center justify-center gap-2 transition-colors ${
                  isSelected
                    ? 'bg-emerald-100 text-emerald-800 cursor-default'
                    : 'bg-[#FF8A4C] hover:bg-[#f57633] text-white shadow-sm'
                }`}
              >
                {isSelected ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Playing as {previewChar.name}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Choose {previewChar.name}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onRequestUnlock}
                className="mt-4 w-full min-h-[56px] rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-display text-lg font-bold inline-flex items-center justify-center gap-2 shadow-sm"
              >
                <Lock className="w-5 h-5" />
                <span>Ask a Grown-Up to Unlock</span>
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Lightbulb, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { getLevelById } from '../../data/levels';
import { getWorldById } from '../../data/worlds';
import { audioEngine } from '../../services/audioEngine';
import type { CharacterAnimState, SaveState, WorldId } from '../../types/game';
import { PuzzleBoard } from '../PuzzleBoard';
import { ThreeStage, type MazeRuntimeState } from '../ThreeStage';

interface GameplayScreenProps {
  saveState: SaveState;
  levelId: number;
  onCompleteLevel: (levelId: number, stars: 1 | 2 | 3, timeMs: number, mistakes: number) => void;
  onToggleSound: () => void;
  onExitToLevels: (worldId: WorldId) => void;
}

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
  saveState,
  levelId,
  onCompleteLevel,
  onToggleSound,
  onExitToLevels,
}) => {
  const level = getLevelById(levelId);
  const world = getWorldById(level.worldId);

  const [paused, setPaused] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const [animState, setAnimState] = useState<CharacterAnimState>('idle');
  const [feedbackBanner, setFeedbackBanner] = useState<string>(level.spokenPrompt);
  const [showHintBox, setShowHintBox] = useState(false);
  const [mazeState, setMazeState] = useState<MazeRuntimeState | undefined>(undefined);
  const [externalMazeTap, setExternalMazeTap] = useState<{ x: number; y: number; seq: number } | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const isMuted = !saveState.audioSettings.musicEnabled && !saveState.audioSettings.sfxEnabled;

  useEffect(() => {
    startTimeRef.current = Date.now();
    setPaused(false);
    setAnimState('wave');
    setFeedbackBanner(level.spokenPrompt);
    setShowHintBox(false);
    audioEngine.startWorldMusic(level.worldId);
    audioEngine.speakCue(level.spokenPrompt, saveState.selectedCharacterId);

    const t = window.setTimeout(() => setAnimState('idle'), 1400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId, restartKey]);

  const handleRestart = () => {
    audioEngine.playTap();
    setRestartKey((k) => k + 1);
  };

  const handleStepSuccess = () => {
    audioEngine.playSuccess();
    setAnimState('jump');
    setFeedbackBanner('Awesome job! Keep going!');
    window.setTimeout(() => setAnimState('idle'), 900);
  };

  const handleStepWrong = (encouragement: string) => {
    setAnimState('oops');
    setFeedbackBanner(encouragement);
    audioEngine.speakCue(encouragement, saveState.selectedCharacterId);
    window.setTimeout(() => setAnimState('idle'), 900);
  };

  const handleSolved = (mistakes: number) => {
    setAnimState('celebrate');
    audioEngine.playLevelComplete();
    audioEngine.speakCue('Hooray! You did it!', saveState.selectedCharacterId);
    const elapsedMs = Date.now() - startTimeRef.current;
    const stars: 1 | 2 | 3 = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    onCompleteLevel(level.id, stars, elapsedMs, mistakes);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col bg-[#FAF8F2] overflow-hidden">
      {/* Top Kid-Friendly HUD */}
      <header className="relative z-20 flex items-center justify-between gap-2 px-3 sm:px-6 py-3 bg-white/90 border-b border-slate-200/70">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Back to Levels"
            onClick={() => onExitToLevels(level.worldId)}
            className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-[11px] font-bold text-slate-500">
              {world.name} · Level {level.levelNumberInWorld} of 10
            </p>
            <h1 className="font-display text-base sm:text-lg font-bold text-slate-800 leading-tight">
              {level.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Hear Instructions"
            onClick={() => audioEngine.speakCue(level.spokenPrompt, saveState.selectedCharacterId)}
            className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100 flex items-center justify-center text-amber-700"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Friendly Hint"
            onClick={() => {
              setShowHintBox((v) => !v);
              audioEngine.speakCue(level.hintText, saveState.selectedCharacterId);
            }}
            className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 hover:bg-sky-100 flex items-center justify-center text-sky-700"
          >
            <Lightbulb className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Restart Puzzle"
            onClick={handleRestart}
            className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label={isMuted ? 'Sound On' : 'Sound Off'}
            onClick={onToggleSound}
            className="hidden sm:flex w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 items-center justify-center text-slate-700"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
          </button>
          <button
            type="button"
            aria-label="Pause"
            onClick={() => setPaused(true)}
            className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Split: 3D Stage Top + Tactile Interactive Puzzle Deck Bottom */}
      <main className="flex-1 flex flex-col relative">
        {/* 3D Diorama / Maze Stage */}
        <div className="relative h-[220px] sm:h-[270px] lg:h-[300px] w-full shrink-0">
          <ThreeStage
            mode={level.mechanic === 'maze' ? 'maze' : 'island'}
            characterId={saveState.selectedCharacterId}
            worldId={level.worldId}
            animState={animState}
            reducedMotion={saveState.audioSettings.reducedMotion}
            mazeState={mazeState}
            onMazeTileClick={(x, y) =>
              setExternalMazeTap((prev) => ({ x, y, seq: (prev?.seq ?? 0) + 1 }))
            }
            onCharacterTap={() => {
              setAnimState('wave');
              audioEngine.playCharacterVoiceChirp(saveState.selectedCharacterId);
              audioEngine.speakCue(level.spokenPrompt, saveState.selectedCharacterId);
              window.setTimeout(() => setAnimState('idle'), 900);
            }}
          />

          {/* Spoken Encouragement Speech Bubble */}
          <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 w-[92%] max-w-xl flex justify-center">
            <div className="bg-white/95 rounded-2xl px-4 py-2 border border-slate-200/80 shadow-sm text-center">
              <p className="text-xs sm:text-sm font-bold text-slate-700">{feedbackBanner}</p>
              {showHintBox && (
                <p className="text-xs font-semibold text-sky-700 mt-0.5">
                  Tip: {level.hintText}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Puzzle Controls Area */}
        <section className="flex-1 px-4 sm:px-6 py-4 flex items-center justify-center">
          <PuzzleBoard
            key={`${level.id}-${restartKey}`}
            level={level}
            characterId={saveState.selectedCharacterId}
            difficultyOverride={saveState.difficultySetting}
            onStepSuccess={handleStepSuccess}
            onStepWrong={handleStepWrong}
            onSolved={handleSolved}
            onMazeStateChange={setMazeState}
            externalMazeTap={externalMazeTap}
          />
        </section>
      </main>

      {/* Pause Overlay */}
      {paused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 text-center animate-soft-pop">
            <h2 className="font-display text-2xl font-bold text-slate-800">Game Paused</h2>
            <p className="text-sm text-slate-500 mt-1">Take a cozy breather anytime!</p>

            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setPaused(false)}
                className="w-full min-h-[54px] rounded-2xl bg-[#FF8A4C] hover:bg-[#f57633] text-white font-display text-lg font-bold inline-flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Resume Play</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaused(false);
                  handleRestart();
                }}
                className="w-full min-h-[50px] rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm inline-flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart Level</span>
              </button>
              <button
                type="button"
                onClick={() => onExitToLevels(level.worldId)}
                className="w-full min-h-[50px] rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm"
              >
                Back to Level Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  Download,
  Lock,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Unlock,
  XCircle,
} from 'lucide-react';
import { runAutomatedQASuite } from '../../services/qaValidator';
import {
  downloadAllUnityAndDocsBundle,
  downloadTextArtifact,
  UNITY_AND_STORE_ARTIFACTS,
} from '../../services/unityExportPackage';
import type { DifficultySetting, QACheckItem, SaveState } from '../../types/game';

interface ParentSectionScreenProps {
  saveState: SaveState;
  onChangeDifficulty: (diff: DifficultySetting) => void;
  onTogglePremiumTestMode: (unlocked: boolean) => void;
  onResetProgress: () => void;
  onOpenPrivacy: () => void;
  onBack: () => void;
}

export const ParentSectionScreen: React.FC<ParentSectionScreenProps> = ({
  saveState,
  onChangeDifficulty,
  onTogglePremiumTestMode,
  onResetProgress,
  onOpenPrivacy,
  onBack,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [qaResults, setQaResults] = useState<QACheckItem[] | null>(null);
  const [testNotice, setTestNotice] = useState('');

  const handleRunQA = () => {
    const res = runAutomatedQASuite();
    setQaResults(res);
  };

  const passedCount = qaResults ? qaResults.filter((r) => r.passed).length : 0;

  return (
    <div className="min-h-screen w-full bg-[#FAF8F2] flex flex-col">
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-slate-200/70 bg-white">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[48px] px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 inline-flex items-center gap-2 text-sm font-bold text-slate-700"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Game</span>
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-800">Parent & Release Zone</h1>
        </div>
        <div className="w-24" />
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col gap-6">
        {/* 1. Freemium Test Mode Purchase Flow */}
        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-indigo-600">Test-Mode Billing Interface</p>
              <h2 className="font-display text-2xl font-bold text-slate-800 mt-1">
                Full Planet Unlock (Worlds 2–5 & 4 Characters)
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Suggested one-time family price: <strong>₹249</strong>. Free version includes World 1 (10 puzzles) and Wobble with zero ads. Because live Google Play Billing credentials are not attached in this web sandbox, this toggle runs in verified Test Mode without charging any card.
              </p>
            </div>
            <div className="shrink-0">
              {saveState.isPremiumUnlocked ? (
                <button
                  type="button"
                  onClick={() => {
                    onTogglePremiumTestMode(false);
                    setTestNotice('Reverted to Free Version (World 1 + Wobble) for QA testing.');
                  }}
                  className="min-h-[52px] px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm inline-flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Test Free Version</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onTogglePremiumTestMode(true);
                    setTestNotice('Test Mode Unlock activated! All 50 levels & 5 characters are now unlocked.');
                  }}
                  className="min-h-[54px] px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-display text-base font-bold shadow-md inline-flex items-center gap-2"
                >
                  <Unlock className="w-5 h-5" />
                  <span>Unlock Test Mode (₹249 Demo)</span>
                </button>
              )}
            </div>
          </div>
          {testNotice && (
            <p className="mt-3 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
              {testNotice}
            </p>
          )}
        </section>

        {/* 2. Difficulty Override & Progress Reset */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h2 className="font-display text-xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Difficulty Control</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Keep Auto progression or lock supportive visual hints for younger learners.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {(['auto', 'beginner', 'intermediate', 'advanced'] as DifficultySetting[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onChangeDifficulty(mode)}
                  className={`min-h-[48px] rounded-2xl border-2 font-bold text-sm capitalize transition-colors ${
                    saveState.difficultySetting === mode
                      ? 'border-amber-500 bg-amber-50 text-amber-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-800 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-slate-600" />
                <span>Local Save & Privacy</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                All progress stays strictly on this device. Resetting clears stars and unlocks cleanly.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="min-h-[48px] px-4 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-sm inline-flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Reset Local Progress</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onResetProgress();
                      setConfirmReset(false);
                      setTestNotice('Local progress cleared cleanly.');
                    }}
                    className="min-h-[48px] px-4 rounded-2xl bg-rose-600 text-white font-bold text-sm"
                  >
                    Confirm Erase
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="min-h-[48px] px-4 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={onOpenPrivacy}
                className="min-h-[48px] px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm"
              >
                Read Privacy Policy
              </button>
            </div>
          </div>
        </section>

        {/* 3. Automated QA Verification Suite */}
        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-800">
                Automated QA Test Suite (50 Levels & BFS Maze Solver)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verifies all 50 puzzle definitions, 10-level world distribution, BFS maze reachability, and localStorage round-trip.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRunQA}
              className="min-h-[48px] px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center gap-2 shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Run QA Suite Now</span>
            </button>
          </div>

          {qaResults && (
            <div className="mt-4">
              <p className="text-sm font-bold text-slate-800 mb-3 tabular-nums">
                Result: {passedCount} / {qaResults.length} checks passed
              </p>
              <div className="max-h-64 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100">
                {qaResults.map((item) => (
                  <div key={item.id} className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <span className="font-bold text-slate-800 truncate">{item.label}</span>
                    </div>
                    <span className="font-mono-code text-[11px] text-slate-500 shrink-0">{item.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 4. Unity URP C# & Google Play Store Release Package */}
        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-800 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-600" />
                <span>Unity C# Source & Google Play Release Package</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Download the modular Unity URP C# scripts, Google Play `.aab` release guide, Families Policy checklist, and Privacy Policy Markdown docs.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadAllUnityAndDocsBundle}
              className="min-h-[48px] px-5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm inline-flex items-center gap-2 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download Full Bundle</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {UNITY_AND_STORE_ARTIFACTS.map((art) => (
              <div
                key={art.filename}
                className="rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-3 bg-slate-50/70"
              >
                <div className="min-w-0">
                  <p className="font-mono-code text-xs font-bold text-slate-800 truncate">{art.filename}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{art.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadTextArtifact(art.filename, art.content)}
                  className="min-h-[40px] px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 shrink-0"
                >
                  Save
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

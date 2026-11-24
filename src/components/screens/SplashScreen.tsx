import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = window.setTimeout(onFinish, 1400);
    return () => window.clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      onClick={onFinish}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-sky-100 via-[#FAF8F2] to-amber-50 p-6 text-center cursor-pointer select-none"
    >
      <div className="w-28 h-28 rounded-3xl bg-white shadow-lg border border-amber-100 flex items-center justify-center animate-gentle-float">
        <span className="text-6xl" aria-hidden="true">🪐</span>
      </div>
      <h1 className="font-display text-4xl sm:text-5xl font-bold text-slate-800 mt-6 tracking-tight">
        WonderWiggles
      </h1>
      <p className="font-display text-lg text-amber-600 font-semibold mt-1">
        The Little Puzzle Planet
      </p>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span>Think · Play · Discover</span>
      </div>
    </div>
  );
};

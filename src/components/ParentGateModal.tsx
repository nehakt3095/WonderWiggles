import React, { useMemo, useState } from 'react';
import { Lock, ShieldCheck, X } from 'lucide-react';

interface ParentGateModalProps {
  title?: string;
  subtitle?: string;
  onUnlocked: () => void;
  onCancel: () => void;
}

export const ParentGateModal: React.FC<ParentGateModalProps> = ({
  title = 'Grown-Up Check',
  subtitle = 'Please solve this quick question to enter the Parent Section.',
  onUnlocked,
  onCancel,
}) => {
  const challenge = useMemo(() => {
    const a = 4 + Math.floor(Math.random() * 6); // 4..9
    const b = 3 + Math.floor(Math.random() * 6); // 3..8
    const ans = a * b;
    const options = Array.from(new Set([ans, ans + 4, ans - 3, ans + 7])).sort((x, y) => x - y);
    return { a, b, ans, options };
  }, []);

  const [errorMsg, setErrorMsg] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-soft-pop">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-800">{title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close Parent Gate"
            onClick={onCancel}
            className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 p-5 text-center">
          <p className="text-xs font-bold text-slate-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> For Parents & Guardians Only
          </p>
          <p className="font-display text-3xl font-bold text-slate-800 mt-2 tabular-nums">
            {challenge.a} × {challenge.b} = ?
          </p>
        </div>

        {errorMsg && (
          <p className="mt-3 text-center text-xs font-bold text-amber-700 bg-amber-50 rounded-xl py-2 px-3">
            {errorMsg}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          {challenge.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                if (opt === challenge.ans) {
                  onUnlocked();
                } else {
                  setErrorMsg('That answer was not quite right. Please try again.');
                }
              }}
              className="min-h-[52px] rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 font-display text-xl font-bold text-slate-800 tabular-nums transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>

        <p className="mt-4 text-[11px] text-slate-400 text-center">
          Kids are kept safely inside the game—no ads, no external links, and no unapproved purchases.
        </p>
      </div>
    </div>
  );
};

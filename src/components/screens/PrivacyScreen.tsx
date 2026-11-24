import React from 'react';
import { ArrowLeft, Check, ShieldCheck } from 'lucide-react';

interface PrivacyScreenProps {
  onBack: () => void;
}

export const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onBack }) => {
  const commitments = [
    'Zero advertisements or behavioral ad networks.',
    'Zero personal data collection (no names, emails, photos, or location).',
    'Zero chat, public profiles, or social media links accessible to children.',
    'All progress and audio settings stay locally on your device.',
    'Parent Gate protects purchase flows, resets, and documentation exports.',
    'Positive, gentle encouragement only—never shame for wrong answers.',
  ];

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
        <h1 className="font-display text-2xl font-bold text-slate-800">Child Safety & Privacy</h1>
        <div className="w-20" />
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-8 py-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-800">Our Promise to Families</h2>
              <p className="text-xs text-slate-500">Designed for ages 4–7 · Google Play Families Policy aligned</p>
            </div>
          </div>

          <ul className="mt-6 space-y-3">
            {commitments.map((line) => (
              <li key={line} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-500 leading-relaxed space-y-2">
            <p>
              <strong>Data Storage:</strong> WonderWiggles stores level completions, star counts, character selection, and sound preferences strictly inside local device storage (`localStorage` on web, `Application.persistentDataPath` in Unity). No data leaves the device.
            </p>
            <p>
              <strong>Compliance Notice:</strong> Before publishing a commercial Android `.aab` build to Google Play Store, developers should review the Google Play Console Families Policy questionnaire, COPPA / GDPR-K regional disclosures, and verify their own support email and hosted Privacy Policy URL.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

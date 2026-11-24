import React from 'react';
import { ArrowLeft, MessageSquare, Music, Sparkles, Volume2 } from 'lucide-react';
import type { AudioSettings } from '../../types/game';
import { PWAInstallButton } from '../PWAInstallButton';

interface SettingsScreenProps {
  audioSettings: AudioSettings;
  onUpdateAudio: (next: AudioSettings) => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  audioSettings,
  onUpdateAudio,
  onBack,
}) => {
  const toggle = (key: keyof AudioSettings) => {
    onUpdateAudio({ ...audioSettings, [key]: !audioSettings[key] });
  };

  const rows: {
    key: keyof AudioSettings;
    title: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'musicEnabled',
      title: 'Background Music',
      desc: 'Gentle pastel melodies tailored for each island world.',
      icon: <Music className="w-5 h-5 text-amber-600" />,
    },
    {
      key: 'sfxEnabled',
      title: 'Playful Sound Effects',
      desc: 'Marimba taps, celebration chimes, and character reactions.',
      icon: <Volume2 className="w-5 h-5 text-emerald-600" />,
    },
    {
      key: 'voiceEnabled',
      title: 'Spoken Voice Cues',
      desc: 'Friendly voice guidance so young kids do not need to read.',
      icon: <MessageSquare className="w-5 h-5 text-sky-600" />,
    },
    {
      key: 'reducedMotion',
      title: 'Calm Motion Mode',
      desc: 'Slows floating animations for sensitive eyes.',
      icon: <Sparkles className="w-5 h-5 text-violet-600" />,
    },
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
        <h1 className="font-display text-2xl font-bold text-slate-800">Sound & Settings</h1>
        <div className="w-20" />
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col gap-4">
        {rows.map((row) => {
          const active = audioSettings[row.key];
          return (
            <div
              key={row.key}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  {row.icon}
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-800">{row.title}</h2>
                  <p className="text-xs sm:text-sm text-slate-500">{row.desc}</p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={active}
                onClick={() => toggle(row.key)}
                className={`min-w-[76px] min-h-[44px] rounded-2xl px-4 font-bold text-xs transition-colors shrink-0 ${
                  active
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {active ? 'ON' : 'OFF'}
              </button>
            </div>
          );
        })}

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-800">Offline & Home Screen</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Install WonderWiggles as an offline web app on Android, iPad, or Desktop.
            </p>
          </div>
          <PWAInstallButton />
        </div>
      </main>
    </div>
  );
};

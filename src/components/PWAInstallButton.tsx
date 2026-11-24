import React, { useState } from 'react';
import { Download, WifiOff } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className="min-h-[48px] inline-flex items-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors whitespace-nowrap shrink-0"
      >
        <Download className="w-4 h-4" />
        Install Offline App
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="min-h-[48px] inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4" />
          Install on iPad / iPhone
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl border border-slate-100">
              <h3 className="font-display text-xl font-bold text-slate-800">Install WonderWiggles</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                1. Tap the <strong>Share</strong> icon in Safari.<br />
                2. Scroll down and choose <strong>Add to Home Screen</strong> to play offline anytime.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full min-h-[48px] rounded-2xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineNotice: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 z-40 inline-flex items-center gap-2 rounded-2xl bg-slate-800 text-white px-3.5 py-2 text-xs font-bold shadow-md">
      <WifiOff className="w-3.5 h-3.5 text-amber-300" />
      <span>Offline Mode Ready</span>
    </div>
  );
};

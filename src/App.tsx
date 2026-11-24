/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { DailyStarModal } from './components/DailyStarModal';
import { ParentGateModal } from './components/ParentGateModal';
import { OfflineNotice } from './components/PWAInstallButton';
import { CharacterSelectScreen } from './components/screens/CharacterSelectScreen';
import { GameplayScreen } from './components/screens/GameplayScreen';
import { LevelCompleteScreen } from './components/screens/LevelCompleteScreen';
import { LevelSelectScreen } from './components/screens/LevelSelectScreen';
import { MainMenuScreen } from './components/screens/MainMenuScreen';
import { ParentSectionScreen } from './components/screens/ParentSectionScreen';
import { PrivacyScreen } from './components/screens/PrivacyScreen';
import { RewardsScreen } from './components/screens/RewardsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { SplashScreen } from './components/screens/SplashScreen';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { WorldSelectScreen } from './components/screens/WorldSelectScreen';
import { getCharacterById } from './data/characters';
import { audioEngine } from './services/audioEngine';
import {
  clearSaveState,
  computeBadgesForState,
  evaluateDailyStar,
  loadSaveState,
  persistSaveState,
} from './services/saveSystem';
import type {
  AudioSettings,
  CharacterId,
  DifficultySetting,
  SaveState,
  ScreenId,
  WorldId,
} from './types/game';

export default function App() {
  const [saveState, setSaveState] = useState<SaveState>(() => loadSaveState());
  const [screen, setScreen] = useState<ScreenId>('splash');
  const [activeWorldId, setActiveWorldId] = useState<WorldId>(1);
  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const [lastEarnedStars, setLastEarnedStars] = useState<1 | 2 | 3>(3);
  const [previousScreenBeforeParent, setPreviousScreenBeforeParent] = useState<ScreenId>('menu');
  const [showParentGate, setShowParentGate] = useState(false);
  const [pendingDailyStar, setPendingDailyStar] = useState<{
    streakCount: number;
    totalDailyStars: number;
  } | null>(null);

  // Sync audio settings to engine
  useEffect(() => {
    audioEngine.updateSettings(saveState.audioSettings);
  }, [saveState.audioSettings]);

  // Pause background music if app is backgrounded / tab hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        audioEngine.stopMusic();
      } else if (saveState.audioSettings.musicEnabled) {
        audioEngine.startWorldMusic(activeWorldId);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [activeWorldId, saveState.audioSettings.musicEnabled]);

  const updateAndSave = useCallback((updater: (prev: SaveState) => SaveState) => {
    setSaveState((prev) => {
      const next = updater(prev);
      next.unlockedBadges = computeBadgesForState(next);
      persistSaveState(next);
      return next;
    });
  }, []);

  const handleToggleSound = () => {
    audioEngine.unlockAudio();
    const currentlyMuted = !saveState.audioSettings.musicEnabled && !saveState.audioSettings.sfxEnabled;
    const nextAudio: AudioSettings = {
      ...saveState.audioSettings,
      musicEnabled: currentlyMuted,
      sfxEnabled: currentlyMuted,
    };
    updateAndSave((prev) => ({ ...prev, audioSettings: nextAudio }));
  };

  const handleUpdateAudio = (nextAudio: AudioSettings) => {
    audioEngine.unlockAudio();
    updateAndSave((prev) => ({ ...prev, audioSettings: nextAudio }));
  };

  const handleSelectCharacter = (id: CharacterId) => {
    updateAndSave((prev) => ({ ...prev, selectedCharacterId: id }));
  };

  const handleCompleteLevel = (
    levelId: number,
    stars: 1 | 2 | 3,
    timeMs: number
  ) => {
    setLastEarnedStars(stars);
    updateAndSave((prev) => {
      const existing = prev.completedLevels[levelId];
      const bestStars = existing ? (Math.max(existing.stars, stars) as 1 | 2 | 3) : stars;
      const bestTimeMs = existing ? Math.min(existing.bestTimeMs, timeMs) : timeMs;
      return {
        ...prev,
        completedLevels: {
          ...prev.completedLevels,
          [levelId]: {
            stars: bestStars,
            bestTimeMs,
            attempts: (existing?.attempts ?? 0) + 1,
          },
        },
      };
    });
    setScreen('complete');
  };

  const openParentGateFrom = (origin: ScreenId) => {
    setPreviousScreenBeforeParent(origin);
    setShowParentGate(true);
  };

  const handleStartFromWelcome = () => {
    audioEngine.unlockAudio();
    audioEngine.playTap();
    const char = getCharacterById(saveState.selectedCharacterId);
    audioEngine.speakCue(char.greetingLine, char.id);
    setScreen('menu');
  };

  const handleFinishSplash = () => {
    setScreen('welcome');
    const result = evaluateDailyStar(saveState);
    if (result.shouldAward) {
      persistSaveState(result.nextState);
      setSaveState(result.nextState);
      setPendingDailyStar({
        streakCount: result.streakCount,
        totalDailyStars: result.nextState.dailyStreak.totalDailyStars,
      });
    }
  };

  return (
    <>
      {screen === 'splash' && <SplashScreen onFinish={handleFinishSplash} />}

      {screen === 'welcome' && (
        <WelcomeScreen
          characterId={saveState.selectedCharacterId}
          audioSettings={saveState.audioSettings}
          onToggleSound={handleToggleSound}
          onStart={handleStartFromWelcome}
          onOpenSettings={() => {
            audioEngine.unlockAudio();
            setScreen('settings');
          }}
          onRequestParentSection={() => openParentGateFrom('welcome')}
        />
      )}

      {screen === 'menu' && (
        <MainMenuScreen
          saveState={saveState}
          onExploreWorlds={() => {
            audioEngine.playTap();
            setScreen('worlds');
          }}
          onSelectCharacter={() => {
            audioEngine.playTap();
            setScreen('characters');
          }}
          onOpenRewards={() => {
            audioEngine.playTap();
            setScreen('rewards');
          }}
          onOpenSettings={() => {
            audioEngine.playTap();
            setScreen('settings');
          }}
          onRequestParentSection={() => openParentGateFrom('menu')}
          onOpenPrivacy={() => {
            audioEngine.playTap();
            setScreen('privacy');
          }}
          onSpeakGreeting={() => {
            const char = getCharacterById(saveState.selectedCharacterId);
            audioEngine.playCharacterVoiceChirp(char.id);
            audioEngine.speakCue(char.greetingLine, char.id);
          }}
        />
      )}

      {screen === 'characters' && (
        <CharacterSelectScreen
          saveState={saveState}
          onSelectCharacter={handleSelectCharacter}
          onRequestUnlock={() => openParentGateFrom('characters')}
          onBack={() => setScreen('menu')}
        />
      )}

      {screen === 'worlds' && (
        <WorldSelectScreen
          saveState={saveState}
          activeWorldId={activeWorldId}
          onSelectWorld={(wId) => {
            audioEngine.playTap();
            audioEngine.startWorldMusic(wId);
            setActiveWorldId(wId);
            setScreen('levels');
          }}
          onRequestUnlock={() => openParentGateFrom('worlds')}
          onBack={() => setScreen('menu')}
        />
      )}

      {screen === 'levels' && (
        <LevelSelectScreen
          saveState={saveState}
          worldId={activeWorldId}
          onSelectLevel={(lvlId) => {
            audioEngine.unlockAudio();
            audioEngine.playTap();
            setActiveLevelId(lvlId);
            setScreen('gameplay');
          }}
          onBack={() => setScreen('worlds')}
        />
      )}

      {screen === 'gameplay' && (
        <GameplayScreen
          saveState={saveState}
          levelId={activeLevelId}
          onCompleteLevel={handleCompleteLevel}
          onToggleSound={handleToggleSound}
          onExitToLevels={(wId) => {
            setActiveWorldId(wId);
            setScreen('levels');
          }}
        />
      )}

      {screen === 'complete' && (
        <LevelCompleteScreen
          saveState={saveState}
          levelId={activeLevelId}
          earnedStars={lastEarnedStars}
          onReplay={() => setScreen('gameplay')}
          onNextLevel={(nextId) => {
            const nextWorld = Math.ceil(nextId / 10) as WorldId;
            setActiveWorldId(nextWorld);
            setActiveLevelId(nextId);
            setScreen('gameplay');
          }}
          onWorldMap={(wId) => {
            setActiveWorldId(wId);
            setScreen('levels');
          }}
          onRequestUnlock={() => openParentGateFrom('complete')}
        />
      )}

      {screen === 'rewards' && (
        <RewardsScreen saveState={saveState} onBack={() => setScreen('menu')} />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          audioSettings={saveState.audioSettings}
          onUpdateAudio={handleUpdateAudio}
          onBack={() => setScreen('menu')}
        />
      )}

      {screen === 'parent' && (
        <ParentSectionScreen
          saveState={saveState}
          onChangeDifficulty={(diff: DifficultySetting) =>
            updateAndSave((prev) => ({ ...prev, difficultySetting: diff }))
          }
          onTogglePremiumTestMode={(unlocked) =>
            updateAndSave((prev) => ({ ...prev, isPremiumUnlocked: unlocked }))
          }
          onResetProgress={() => {
            const fresh = clearSaveState();
            setSaveState(fresh);
          }}
          onOpenPrivacy={() => setScreen('privacy')}
          onBack={() => setScreen(previousScreenBeforeParent === 'parent' ? 'menu' : previousScreenBeforeParent)}
        />
      )}

      {screen === 'privacy' && <PrivacyScreen onBack={() => setScreen('menu')} />}

      {showParentGate && (
        <ParentGateModal
          onUnlocked={() => {
            setShowParentGate(false);
            setScreen('parent');
          }}
          onCancel={() => setShowParentGate(false)}
        />
      )}

      {pendingDailyStar && (
        <DailyStarModal
          characterId={saveState.selectedCharacterId}
          streakCount={pendingDailyStar.streakCount}
          totalDailyStars={pendingDailyStar.totalDailyStars}
          reducedMotion={saveState.audioSettings.reducedMotion}
          onCollect={() => {
            audioEngine.unlockAudio();
            audioEngine.playLevelComplete();
            audioEngine.speakCue(
              `Yay! You earned your Day ${pendingDailyStar.streakCount} Daily Star!`,
              saveState.selectedCharacterId
            );
            setPendingDailyStar(null);
          }}
        />
      )}

      <OfflineNotice />
    </>
  );
}

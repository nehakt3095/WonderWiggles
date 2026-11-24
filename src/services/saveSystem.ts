import { LEVELS } from '../data/levels';
import type { AudioSettings, CharacterId, DifficultySetting, SaveState, WorldId } from '../types/game';

const STORAGE_KEY = 'wonderwiggles_save_v1';

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  musicEnabled: true,
  sfxEnabled: true,
  voiceEnabled: true,
  reducedMotion: false,
};

export function createInitialSaveState(): SaveState {
  return {
    version: 1,
    completedLevels: {},
    selectedCharacterId: 'wobble',
    isPremiumUnlocked: false,
    difficultySetting: 'auto',
    audioSettings: { ...DEFAULT_AUDIO_SETTINGS },
    unlockedBadges: [],
    dailyStreak: {
      currentStreak: 0,
      bestStreak: 0,
      lastClaimedDate: null,
      totalDailyStars: 0,
    },
  };
}

export function loadSaveState(): SaveState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialSaveState();
    const parsed = JSON.parse(raw) as Partial<SaveState>;
    const defaults = createInitialSaveState();
    return {
      ...defaults,
      ...parsed,
      audioSettings: {
        ...DEFAULT_AUDIO_SETTINGS,
        ...(parsed.audioSettings ?? {}),
      },
      completedLevels: parsed.completedLevels ?? {},
      unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
      dailyStreak: {
        ...defaults.dailyStreak,
        ...(parsed.dailyStreak ?? {}),
      },
    };
  } catch {
    return createInitialSaveState();
  }
}

export function persistSaveState(state: SaveState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors in private browsing
  }
}

export function clearSaveState(): SaveState {
  const fresh = createInitialSaveState();
  persistSaveState(fresh);
  return fresh;
}

export function getTotalStars(state: SaveState): number {
  return Object.values(state.completedLevels).reduce((sum, rec) => sum + rec.stars, 0);
}

export function getWorldStars(state: SaveState, worldId: WorldId): number {
  const worldLevels = LEVELS.filter((l) => l.worldId === worldId);
  return worldLevels.reduce((sum, lvl) => sum + (state.completedLevels[lvl.id]?.stars ?? 0), 0);
}

export function getWorldCompletedCount(state: SaveState, worldId: WorldId): number {
  const worldLevels = LEVELS.filter((l) => l.worldId === worldId);
  return worldLevels.filter((lvl) => Boolean(state.completedLevels[lvl.id])).length;
}

export function isWorldUnlocked(state: SaveState, worldId: WorldId): boolean {
  if (worldId === 1) return true;
  if (!state.isPremiumUnlocked) return false;
  if (worldId === 2) return true;
  // Once premium is unlocked, worlds unlock progressively OR if previous world has >= 3 levels completed (or user already unlocked a level in that world)
  const prevWorldCompleted = getWorldCompletedCount(state, (worldId - 1) as WorldId);
  const currentWorldStarted = getWorldCompletedCount(state, worldId) > 0;
  // Allow immediate exploration across worlds once premium is purchased so kids aren't frustrated, OR progressive?
  // Prompt says: "World unlocking" and "PREMIUM VERSION: All five worlds, At least 50 puzzles".
  // Let's unlock World 1 free, and when Premium is unlocked, World 2 opens immediately and Worlds 3-5 unlock as you complete >= 3 levels in the prior world (or complete level 10 of prior world)! Wait: let's make World 2 open right away on Premium and Worlds 3-5 unlock after completing 3 puzzles in previous world—plus a Parent toggle? Actually even better: let's unlock World N when previous world has >= 3 completed levels OR if `state.isPremiumUnlocked`? Wait: if QA/parents want to jump into World 5 right away after unlocking Premium, let's check! Let's unlock World 1 free, World 2 when World 1 has >= 1 completed level (or immediately on Premium), and Worlds 3/4/5 when prior world has >= 2 completed levels—OR let's allow unlocking via stars! Wait: let's make sure the user can play World 2..5 seamlessly once Premium is unlocked, while still showing world progression clearly:
  // World 1: Always unlocked.
  // World 2: Unlocked when Premium is unlocked.
  // World 3: Unlocked when Premium is unlocked AND (World 2 has >= 2 completed OR totalStars >= 10).
  // World 4: Unlocked when Premium is unlocked AND (World 3 has >= 2 completed OR totalStars >= 18).
  // World 5: Unlocked when Premium is unlocked AND (World 4 has >= 2 completed OR totalStars >= 25).
  const totalStars = getTotalStars(state);
  if (worldId === 3) return prevWorldCompleted >= 2 || totalStars >= 12 || currentWorldStarted;
  if (worldId === 4) return prevWorldCompleted >= 2 || totalStars >= 20 || currentWorldStarted;
  if (worldId === 5) return prevWorldCompleted >= 2 || totalStars >= 28 || currentWorldStarted;
  return true;
}

export function isLevelUnlocked(state: SaveState, levelId: number): boolean {
  const level = LEVELS.find((l) => l.id === levelId);
  if (!level) return false;
  if (!isWorldUnlocked(state, level.worldId)) return false;
  if (level.levelNumberInWorld === 1) return true;
  // Unlock next level in the world once the previous level in that world is completed
  const prevLevelId = levelId - 1;
  return Boolean(state.completedLevels[prevLevelId]);
}

export function computeBadgesForState(state: SaveState): string[] {
  const badges = new Set<string>(state.unlockedBadges);
  const completedIds = Object.keys(state.completedLevels).map(Number);
  if (completedIds.length >= 1) badges.add('first-spark');
  if (getTotalStars(state) >= 15) badges.add('star-collector-15');
  if (getWorldCompletedCount(state, 1) >= 10) badges.add('shape-master');
  if (getWorldCompletedCount(state, 2) >= 10) badges.add('memory-owl');
  if (getWorldCompletedCount(state, 3) >= 10) badges.add('maze-explorer');
  if (getWorldCompletedCount(state, 4) >= 10) badges.add('factory-whiz');
  if (getWorldCompletedCount(state, 5) >= 10) badges.add('cloud-dreamer');
  if (completedIds.length >= 50) badges.add('planet-restorer');
  return Array.from(badges);
}

export function getPlanetEnergyPercent(state: SaveState): number {
  const earned = getTotalStars(state);
  return Math.min(100, Math.round((earned / 150) * 100));
}

export function isCharacterUnlocked(state: SaveState, charId: CharacterId): boolean {
  if (charId === 'wobble') return true;
  return state.isPremiumUnlocked;
}

export function updateDifficulty(state: SaveState, difficultySetting: DifficultySetting): SaveState {
  const next = { ...state, difficultySetting };
  persistSaveState(next);
  return next;
}

export function getLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getPreviousDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const prev = new Date(y, m - 1, d - 1);
  return getLocalDateKey(prev);
}

export function evaluateDailyStar(
  state: SaveState,
  todayKey: string = getLocalDateKey()
): { shouldAward: boolean; nextState: SaveState; streakCount: number } {
  const streak = state.dailyStreak ?? {
    currentStreak: 0,
    bestStreak: 0,
    lastClaimedDate: null,
    totalDailyStars: 0,
  };

  if (streak.lastClaimedDate === todayKey) {
    return { shouldAward: false, nextState: state, streakCount: streak.currentStreak };
  }

  const yesterdayKey = getPreviousDateKey(todayKey);
  const nextCurrent = streak.lastClaimedDate === yesterdayKey ? streak.currentStreak + 1 : 1;
  const nextBest = Math.max(streak.bestStreak, nextCurrent);

  const nextState: SaveState = {
    ...state,
    dailyStreak: {
      currentStreak: nextCurrent,
      bestStreak: nextBest,
      lastClaimedDate: todayKey,
      totalDailyStars: streak.totalDailyStars + 1,
    },
  };

  return { shouldAward: true, nextState, streakCount: nextCurrent };
}

export type ScreenId =
  | 'splash'
  | 'welcome'
  | 'menu'
  | 'characters'
  | 'worlds'
  | 'levels'
  | 'gameplay'
  | 'complete'
  | 'rewards'
  | 'settings'
  | 'parent'
  | 'privacy';

export type CharacterId = 'wobble' | 'twinkle' | 'bubbles' | 'coco' | 'pip';

export type WorldId = 1 | 2 | 3 | 4 | 5;

export type DifficultyTier = 'beginner' | 'intermediate' | 'advanced';
export type DifficultySetting = 'auto' | DifficultyTier;

export type CharacterAnimState = 'idle' | 'walk' | 'jump' | 'wave' | 'celebrate' | 'oops';

export type ShapeKind = 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'hexagon' | 'diamond' | 'crescent';

export type TokenColor =
  | 'coral'
  | 'sky'
  | 'mint'
  | 'sunny'
  | 'lavender'
  | 'peach'
  | 'berry';

export type PuzzleMechanic =
  | 'match-slots'     // Drag or tap tokens into matching slots (shapes, colors, shadows, pairs)
  | 'pattern'         // Complete repeating visual sequence (ABAB, AABB, ABC, size, sky pattern)
  | 'memory-cards'    // Flip 3D-styled illustrated animal/object cards to find matching pairs
  | 'memory-sequence' // Watch glowing items/fireflies/mushrooms light up, then tap in order
  | 'memory-hide'     // Watch where Pip/critter hides or what swapped, then pick the right spot
  | 'maze'            // Guide Wobble/friend across 3D tile grid, collect stars, flip switches, avoid puddles
  | 'sort-bins'       // Drag or tap toys into matching color/shape/size bins
  | 'odd-one-out'     // Pick the item that doesn't belong (with clear friendly clue)
  | 'counting'        // Count floating clouds/sheep/raindrops and choose the number
  | 'picture-puzzle'  // Complete missing piece or 2x2 / 3x2 / 2x3 picture mural
  | 'clue-riddle';    // Combine 2 or 3 visual clues (color + shape + size) to unlock the reward

export interface PuzzleToken {
  id: string;
  label: string;
  shape: ShapeKind;
  color: TokenColor;
  emoji?: string;
  size?: 'sm' | 'md' | 'lg';
  weight?: number;
  category?: string;
}

export interface MazeCell {
  x: number;
  y: number;
  type: 'floor' | 'wall' | 'start' | 'goal' | 'star' | 'puddle' | 'switch' | 'bridge' | 'beetle';
  switchId?: string;
  bridgeForSwitchId?: string;
}

export interface MatchSlotTarget {
  slotId: string;
  acceptsTokenId: string;
  label: string;
  shape: ShapeKind;
  color: TokenColor;
  showColorHint: boolean;
  isShadowOnly?: boolean;
}

export interface SortBinDef {
  binId: string;
  label: string;
  accentColor: TokenColor;
  acceptsCategory: string;
}

export interface ClueSpec {
  icon: 'color' | 'shape' | 'size';
  label: string;
  color?: TokenColor;
  shape?: ShapeKind;
  size?: 'sm' | 'md' | 'lg';
}

export interface LevelDefinition {
  id: number; // 1..50
  worldId: WorldId;
  levelNumberInWorld: number; // 1..10
  title: string;
  spokenPrompt: string;
  hintText: string;
  mechanic: PuzzleMechanic;
  difficulty: DifficultyTier;
  // Mechanic-specific payloads
  matchData?: {
    slots: MatchSlotTarget[];
    tokens: PuzzleToken[];
    mode: 'shape' | 'color' | 'shadow' | 'pair' | 'missing';
  };
  patternData?: {
    sequence: (PuzzleToken | null)[]; // null marks the missing ? slot(s)
    choices: PuzzleToken[];
    expectedIds: string[];
  };
  memoryCardsData?: {
    pairs: { id: string; label: string; emoji: string; color: TokenColor }[];
  };
  memorySequenceData?: {
    pads: { id: string; label: string; emoji: string; color: TokenColor; noteHz: number }[];
    sequence: string[];
  };
  memoryHideData?: {
    mode: 'hide' | 'swap' | 'fog';
    spots: { id: string; label: string; emoji: string; color: TokenColor }[];
    targetIds: string[];
  };
  mazeData?: {
    cols: number;
    rows: number;
    cells: MazeCell[];
    requiredStars: number;
  };
  sortData?: {
    bins: SortBinDef[];
    items: (PuzzleToken & { targetCategory: string })[];
    orderSequenceIds?: string[]; // when sorting into ordered slots
  };
  oddOneData?: {
    items: PuzzleToken[];
    oddId: string;
  };
  countingData?: {
    targetCount: number;
    itemEmoji: string;
    itemLabel: string;
    color: TokenColor;
    choices: number[];
  };
  picturePuzzleData?: {
    cols: number;
    rows: number;
    themeLabel: string;
    tiles: { id: string; label: string; emoji: string; color: TokenColor; isMissing?: boolean }[];
    choices: { id: string; label: string; emoji: string; color: TokenColor }[];
  };
  clueRiddleData?: {
    clues: ClueSpec[];
    choices: PuzzleToken[];
    correctId: string;
  };
}

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  role: string;
  description: string;
  free: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  voicePitch: number;
  voiceRate: number;
  greetingLine: string;
}

export interface WorldDefinition {
  id: WorldId;
  name: string;
  subtitle: string;
  themeDescription: string;
  free: boolean;
  skyTop: string;
  skyBottom: string;
  islandColor: string;
  accentColor: string;
  badgeColor: string;
  ambientChordHz: number[];
  skillsDeveloped: string[];
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  isPremium?: boolean;
}

export interface CompletedLevelRecord {
  stars: 1 | 2 | 3;
  bestTimeMs: number;
  attempts: number;
}

export interface AudioSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  voiceEnabled: boolean;
  reducedMotion: boolean;
}

export interface DailyStreakState {
  currentStreak: number;
  bestStreak: number;
  lastClaimedDate: string | null;
  totalDailyStars: number;
}

export interface SaveState {
  version: number;
  completedLevels: Record<number, CompletedLevelRecord>;
  selectedCharacterId: CharacterId;
  isPremiumUnlocked: boolean;
  difficultySetting: DifficultySetting;
  audioSettings: AudioSettings;
  unlockedBadges: string[];
  dailyStreak: DailyStreakState;
}

export interface QACheckItem {
  id: string;
  category: string;
  label: string;
  passed: boolean;
  detail: string;
}

import type { WorldDefinition, WorldId } from '../types/game';

export const WORLDS: WorldDefinition[] = [
  {
    id: 1,
    name: 'Shape Island',
    subtitle: 'Sunny shores of shapes & colors',
    themeDescription: 'Match friendly shapes, rainbow crystals, and sunny beach patterns.',
    free: true,
    skyTop: '#BAE6FD',
    skyBottom: '#FAF8F2',
    islandColor: '#86EFAC',
    accentColor: '#FF8A4C',
    badgeColor: '#F97316',
    ambientChordHz: [261.63, 329.63, 392.0, 523.25], // C major gentle
    skillsDeveloped: ['Shape Recognition', 'Color Matching', 'Repeating Patterns', 'Observation'],
  },
  {
    id: 2,
    name: 'Memory Forest',
    subtitle: 'Whispering trees & critter trails',
    themeDescription: 'Peek behind cozy bushes, echo glowing mushrooms, and match forest pals.',
    free: false,
    skyTop: '#D9F99D',
    skyBottom: '#F5FBF4',
    islandColor: '#6EE7B7',
    accentColor: '#10B981',
    badgeColor: '#059669',
    ambientChordHz: [293.66, 369.99, 440.0, 587.33], // D major warm
    skillsDeveloped: ['Visual Memory', 'Sequence Recall', 'Spatial Awareness', 'Focus'],
  },
  {
    id: 3,
    name: "Wobble's Maze",
    subtitle: 'Garden paths & flower bridges',
    themeDescription: 'Steer around splashy puddles, press flower switches, and gather stars.',
    free: false,
    skyTop: '#FED7AA',
    skyBottom: '#FFFBF5',
    islandColor: '#FDBA74',
    accentColor: '#0EA5E9',
    badgeColor: '#0284C7',
    ambientChordHz: [329.63, 415.3, 493.88, 659.25], // E gentle
    skillsDeveloped: ['Pathfinding', 'Spatial Planning', 'Cause & Effect', 'Direction Sense'],
  },
  {
    id: 4,
    name: 'Magic Factory',
    subtitle: 'Spinning gears & toy chutes',
    themeDescription: 'Sort colorful toys, spot the silly odd one out, and line up sizes.',
    free: false,
    skyTop: '#FDE68A',
    skyBottom: '#FEFCE8',
    islandColor: '#93C5FD',
    accentColor: '#F59E0B',
    badgeColor: '#D97706',
    ambientChordHz: [349.23, 440.0, 523.25, 698.46], // F major playful
    skillsDeveloped: ['Categorization', 'Odd-One-Out Logic', 'Size Ordering', 'Sorting'],
  },
  {
    id: 5,
    name: 'Cloud Kingdom',
    subtitle: 'Fluffy skies & starlight puzzles',
    themeDescription: 'Count sleepy sheep, complete rainbow murals, and solve multi-clue riddles.',
    free: false,
    skyTop: '#DDD6FE',
    skyBottom: '#F8FAFC',
    islandColor: '#E0E7FF',
    accentColor: '#8B5CF6',
    badgeColor: '#7C3AED',
    ambientChordHz: [392.0, 493.88, 587.33, 783.99], // G major dreamy
    skillsDeveloped: ['Counting', 'Part-to-Whole', 'Multi-Clue Logic', 'Synthesis'],
  },
];

export function getWorldById(id: WorldId): WorldDefinition {
  return WORLDS.find((w) => w.id === id) ?? WORLDS[0];
}

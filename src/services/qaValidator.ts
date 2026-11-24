import { CHARACTERS } from '../data/characters';
import { LEVELS } from '../data/levels';
import { WORLDS } from '../data/worlds';
import type { LevelDefinition, QACheckItem } from '../types/game';
import {
  clearSaveState,
  createInitialSaveState,
  evaluateDailyStar,
  loadSaveState,
  persistSaveState,
} from './saveSystem';

function solveMazeBFS(level: LevelDefinition): { solvable: boolean; detail: string } {
  const maze = level.mazeData;
  if (!maze) return { solvable: false, detail: 'Missing mazeData' };
  const grid = new Map<string, (typeof maze.cells)[number]>();
  let start: { x: number; y: number } | null = null;
  let goal: { x: number; y: number } | null = null;
  const starKeys: string[] = [];

  for (const c of maze.cells) {
    grid.set(`${c.x},${c.y}`, c);
    if (c.type === 'start') start = { x: c.x, y: c.y };
    if (c.type === 'goal') goal = { x: c.x, y: c.y };
    if (c.type === 'star') starKeys.push(`${c.x},${c.y}`);
  }

  if (!start || !goal) {
    return { solvable: false, detail: 'Maze missing start or goal cell' };
  }

  interface State {
    x: number;
    y: number;
    starsMask: number;
    switchesMask: number;
  }

  const allStarsMask = (1 << starKeys.length) - 1;
  const starIdxMap = new Map<string, number>();
  starKeys.forEach((k, i) => starIdxMap.set(k, i));

  const switchIds = Array.from(
    new Set(maze.cells.filter((c) => c.type === 'switch' && c.switchId).map((c) => c.switchId!))
  );
  const switchIdxMap = new Map<string, number>();
  switchIds.forEach((id, i) => switchIdxMap.set(id, i));

  const encode = (s: State) => `${s.x},${s.y}|${s.starsMask}|${s.switchesMask}`;
  const queue: State[] = [{ x: start.x, y: start.y, starsMask: 0, switchesMask: 0 }];
  const visited = new Set<string>([encode(queue[0])]);
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur.x === goal.x && cur.y === goal.y && cur.starsMask === allStarsMask) {
      return {
        solvable: true,
        detail: `${maze.cols}x${maze.rows} grid, ${starKeys.length} stars & ${switchIds.length} switches reachable`,
      };
    }

    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      const cell = grid.get(`${nx},${ny}`);
      if (!cell) continue;
      if (cell.type === 'wall' || cell.type === 'puddle' || cell.type === 'beetle') continue;
      if (cell.type === 'bridge' && cell.bridgeForSwitchId) {
        const swIdx = switchIdxMap.get(cell.bridgeForSwitchId);
        if (swIdx !== undefined && (cur.switchesMask & (1 << swIdx)) === 0) continue;
      }

      let nextStars = cur.starsMask;
      const sIdx = starIdxMap.get(`${nx},${ny}`);
      if (sIdx !== undefined) nextStars |= 1 << sIdx;

      let nextSwitches = cur.switchesMask;
      if (cell.type === 'switch' && cell.switchId) {
        const swIdx = switchIdxMap.get(cell.switchId);
        if (swIdx !== undefined) nextSwitches |= 1 << swIdx;
      }

      const nextState: State = { x: nx, y: ny, starsMask: nextStars, switchesMask: nextSwitches };
      const key = encode(nextState);
      if (!visited.has(key)) {
        visited.add(key);
        queue.push(nextState);
      }
    }
  }

  return { solvable: false, detail: 'No valid path reaches all stars and goal' };
}

export function runAutomatedQASuite(): QACheckItem[] {
  const results: QACheckItem[] = [];

  // 1. Level count & uniqueness
  const uniqueIds = new Set(LEVELS.map((l) => l.id));
  results.push({
    id: 'qa-level-count',
    category: 'Curriculum',
    label: '50 Unique Levels Registered',
    passed: LEVELS.length === 50 && uniqueIds.size === 50,
    detail: `${LEVELS.length} total levels, ${uniqueIds.size} unique IDs`,
  });

  // 2. 10 levels per world across 5 worlds
  const worldCountsOk = WORLDS.every((w) => LEVELS.filter((l) => l.worldId === w.id).length === 10);
  results.push({
    id: 'qa-world-distribution',
    category: 'Worlds',
    label: '5 Worlds × 10 Levels Each',
    passed: WORLDS.length === 5 && worldCountsOk,
    detail: WORLDS.map((w) => `W${w.id}: ${LEVELS.filter((l) => l.worldId === w.id).length}`).join(' · '),
  });

  // 3. Characters & Freemium lock boundary
  results.push({
    id: 'qa-characters',
    category: 'Characters',
    label: '5 Original Characters (1 Free, 4 Premium)',
    passed:
      CHARACTERS.length === 5 &&
      CHARACTERS.filter((c) => c.free).length === 1 &&
      CHARACTERS.filter((c) => !c.free).length === 4,
    detail: CHARACTERS.map((c) => `${c.name} (${c.free ? 'Free' : 'Premium'})`).join(', '),
  });

  // 4. Validate every level payload & maze BFS solvability
  for (const level of LEVELS) {
    let passed = false;
    let detail = '';
    if (level.mechanic === 'match-slots' && level.matchData) {
      const tokenIds = new Set(level.matchData.tokens.map((t) => t.id));
      passed = level.matchData.slots.every((s) => tokenIds.has(s.acceptsTokenId));
      detail = `${level.matchData.slots.length} slots matched`;
    } else if (level.mechanic === 'pattern' && level.patternData) {
      const choiceIds = new Set(level.patternData.choices.map((c) => c.id));
      passed = level.patternData.expectedIds.every((id) => choiceIds.has(id));
      detail = `${level.patternData.sequence.length}-step pattern`;
    } else if (level.mechanic === 'memory-cards' && level.memoryCardsData) {
      passed = level.memoryCardsData.pairs.length >= 2;
      detail = `${level.memoryCardsData.pairs.length} pairs (${level.memoryCardsData.pairs.length * 2} cards)`;
    } else if (level.mechanic === 'memory-sequence' && level.memorySequenceData) {
      const padIds = new Set(level.memorySequenceData.pads.map((p) => p.id));
      passed = level.memorySequenceData.sequence.every((id) => padIds.has(id));
      detail = `${level.memorySequenceData.sequence.length}-step audio/visual sequence`;
    } else if (level.mechanic === 'memory-hide' && level.memoryHideData) {
      const spotIds = new Set(level.memoryHideData.spots.map((s) => s.id));
      passed = level.memoryHideData.targetIds.every((id) => spotIds.has(id));
      detail = `${level.memoryHideData.mode} challenge (${level.memoryHideData.spots.length} spots)`;
    } else if (level.mechanic === 'maze') {
      const bfs = solveMazeBFS(level);
      passed = bfs.solvable;
      detail = bfs.detail;
    } else if (level.mechanic === 'sort-bins' && level.sortData) {
      const cats = new Set(level.sortData.bins.map((b) => b.acceptsCategory));
      passed = level.sortData.items.every((i) => cats.has(i.targetCategory));
      detail = `${level.sortData.items.length} items across ${level.sortData.bins.length} chutes`;
    } else if (level.mechanic === 'odd-one-out' && level.oddOneData) {
      passed = level.oddOneData.items.some((i) => i.id === level.oddOneData!.oddId);
      detail = `${level.oddOneData.items.length} choices, odd target verified`;
    } else if (level.mechanic === 'counting' && level.countingData) {
      passed = level.countingData.choices.includes(level.countingData.targetCount);
      detail = `Target ${level.countingData.targetCount} inside choices`;
    } else if (level.mechanic === 'picture-puzzle' && level.picturePuzzleData) {
      const missingCount = level.picturePuzzleData.tiles.filter((t) => t.isMissing).length;
      passed = missingCount === 1 && level.picturePuzzleData.choices.length >= 3;
      detail = `${level.picturePuzzleData.cols}x${level.picturePuzzleData.rows} mosaic`;
    } else if (level.mechanic === 'clue-riddle' && level.clueRiddleData) {
      passed = level.clueRiddleData.choices.some((c) => c.id === level.clueRiddleData!.correctId);
      detail = `${level.clueRiddleData.clues.length} clues verified`;
    }

    results.push({
      id: `qa-lvl-${level.id}`,
      category: `World ${level.worldId}`,
      label: `L${level.id}: ${level.title}`,
      passed,
      detail,
    });
  }

  // 5. Save system round-trip integrity check (non-destructive snapshot restore)
  const snapshot = loadSaveState();
  const testState = createInitialSaveState();
  testState.completedLevels[1] = { stars: 3, bestTimeMs: 4200, attempts: 1 };
  persistSaveState(testState);
  const reloaded = loadSaveState();
  const saveOk = reloaded.completedLevels[1]?.stars === 3;
  clearSaveState();
  persistSaveState(snapshot);

  results.push({
    id: 'qa-save-roundtrip',
    category: 'Persistence',
    label: 'LocalStorage Save & Restore Integrity',
    passed: saveOk,
    detail: saveOk ? 'Write/read/restore verified cleanly' : 'LocalStorage unavailable',
  });

  // 6. Daily Streak & Daily Star once-per-day logic
  const day1 = evaluateDailyStar(createInitialSaveState(), '2026-11-20');
  const sameDay = evaluateDailyStar(day1.nextState, '2026-11-20');
  const day2 = evaluateDailyStar(day1.nextState, '2026-11-21');
  const afterGap = evaluateDailyStar(day2.nextState, '2026-11-24');
  const streakOk =
    day1.shouldAward &&
    day1.streakCount === 1 &&
    !sameDay.shouldAward &&
    day2.shouldAward &&
    day2.streakCount === 2 &&
    afterGap.shouldAward &&
    afterGap.streakCount === 1 &&
    afterGap.nextState.dailyStreak.bestStreak === 2 &&
    afterGap.nextState.dailyStreak.totalDailyStars === 3;

  results.push({
    id: 'qa-daily-streak',
    category: 'Engagement',
    label: 'Daily Star Once-Per-Day & Streak Progression',
    passed: streakOk,
    detail: streakOk ? 'Day1 -> SameDay(skip) -> Day2(+1) -> Gap(reset) verified' : 'Daily streak rule mismatch',
  });

  return results;
}

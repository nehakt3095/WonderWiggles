import type { LevelDefinition, MazeCell, PuzzleToken, ShapeKind, TokenColor } from '../types/game';

function tok(
  id: string,
  label: string,
  shape: ShapeKind,
  color: TokenColor,
  extra?: Partial<PuzzleToken>
): PuzzleToken {
  return { id, label, shape, color, ...extra };
}

function buildMaze(rows: string[]): { cols: number; rows: number; cells: MazeCell[]; requiredStars: number } {
  const rowCount = rows.length;
  const colCount = rows[0].length;
  const cells: MazeCell[] = [];
  let starCount = 0;

  for (let y = 0; y < rowCount; y++) {
    const line = rows[y];
    for (let x = 0; x < colCount; x++) {
      const ch = line[x];
      if (ch === '#') cells.push({ x, y, type: 'wall' });
      else if (ch === 'S') cells.push({ x, y, type: 'start' });
      else if (ch === 'G') cells.push({ x, y, type: 'goal' });
      else if (ch === '*') {
        starCount++;
        cells.push({ x, y, type: 'star' });
      } else if (ch === '~') cells.push({ x, y, type: 'puddle' });
      else if (ch === 'M') cells.push({ x, y, type: 'beetle' });
      else if (ch === 'A') cells.push({ x, y, type: 'switch', switchId: 'A' });
      else if (ch === 'a') cells.push({ x, y, type: 'bridge', bridgeForSwitchId: 'A' });
      else if (ch === 'B') cells.push({ x, y, type: 'switch', switchId: 'B' });
      else if (ch === 'b') cells.push({ x, y, type: 'bridge', bridgeForSwitchId: 'B' });
      else cells.push({ x, y, type: 'floor' });
    }
  }
  return { cols: colCount, rows: rowCount, cells, requiredStars: starCount };
}

export const LEVELS: LevelDefinition[] = [
  // ============================================================================
  // WORLD 1: SHAPE ISLAND (Levels 1-10, FREE)
  // ============================================================================
  {
    id: 1,
    worldId: 1,
    levelNumberInWorld: 1,
    title: 'Sunny Circle & Square',
    spokenPrompt: 'Drag or tap each bright shape into its cozy matching spot!',
    hintText: 'Match the round circle and four-sided square.',
    mechanic: 'match-slots',
    difficulty: 'beginner',
    matchData: {
      mode: 'shape',
      slots: [
        { slotId: 's1', acceptsTokenId: 't-circle', label: 'Circle', shape: 'circle', color: 'coral', showColorHint: true },
        { slotId: 's2', acceptsTokenId: 't-square', label: 'Square', shape: 'square', color: 'sky', showColorHint: true },
      ],
      tokens: [
        tok('t-square', 'Square', 'square', 'sky'),
        tok('t-circle', 'Circle', 'circle', 'coral'),
      ],
    },
  },
  {
    id: 2,
    worldId: 1,
    levelNumberInWorld: 2,
    title: 'Rainbow Crystal Trio',
    spokenPrompt: 'Match the three shiny beach crystals to their matching colors!',
    hintText: 'Look closely at red coral, sunny yellow, and mint green.',
    mechanic: 'match-slots',
    difficulty: 'beginner',
    matchData: {
      mode: 'color',
      slots: [
        { slotId: 'c1', acceptsTokenId: 'c-coral', label: 'Coral', shape: 'diamond', color: 'coral', showColorHint: true },
        { slotId: 'c2', acceptsTokenId: 'c-sunny', label: 'Sunny', shape: 'diamond', color: 'sunny', showColorHint: true },
        { slotId: 'c3', acceptsTokenId: 'c-mint', label: 'Mint', shape: 'diamond', color: 'mint', showColorHint: true },
      ],
      tokens: [
        tok('c-mint', 'Mint Gem', 'diamond', 'mint'),
        tok('c-coral', 'Coral Gem', 'diamond', 'coral'),
        tok('c-sunny', 'Sunny Gem', 'diamond', 'sunny'),
      ],
    },
  },
  {
    id: 3,
    worldId: 1,
    levelNumberInWorld: 3,
    title: 'Star, Heart & Triangle',
    spokenPrompt: 'Can you place the star, the heart, and the triangle home?',
    hintText: 'Count the points on the star and the three corners on the triangle!',
    mechanic: 'match-slots',
    difficulty: 'beginner',
    matchData: {
      mode: 'shape',
      slots: [
        { slotId: 'sh1', acceptsTokenId: 'tri', label: 'Triangle', shape: 'triangle', color: 'mint', showColorHint: true },
        { slotId: 'sh2', acceptsTokenId: 'star', label: 'Star', shape: 'star', color: 'sunny', showColorHint: true },
        { slotId: 'sh3', acceptsTokenId: 'heart', label: 'Heart', shape: 'heart', color: 'berry', showColorHint: true },
      ],
      tokens: [
        tok('heart', 'Heart', 'heart', 'berry'),
        tok('tri', 'Triangle', 'triangle', 'mint'),
        tok('star', 'Star', 'star', 'sunny'),
      ],
    },
  },
  {
    id: 4,
    worldId: 1,
    levelNumberInWorld: 4,
    title: 'Shell Train Pattern',
    spokenPrompt: 'What comes next in the sunny shell train? Pick the missing block!',
    hintText: 'Say it out loud: Coral, Sky, Coral, Sky, Coral... what comes next?',
    mechanic: 'pattern',
    difficulty: 'beginner',
    patternData: {
      sequence: [
        tok('p1', 'Coral', 'circle', 'coral'),
        tok('p2', 'Sky', 'circle', 'sky'),
        tok('p3', 'Coral', 'circle', 'coral'),
        tok('p4', 'Sky', 'circle', 'sky'),
        tok('p5', 'Coral', 'circle', 'coral'),
        null,
      ],
      choices: [
        tok('ans-sky', 'Sky Circle', 'circle', 'sky'),
        tok('ans-coral', 'Coral Circle', 'circle', 'coral'),
        tok('ans-sunny', 'Sunny Star', 'star', 'sunny'),
      ],
      expectedIds: ['ans-sky'],
    },
  },
  {
    id: 5,
    worldId: 1,
    levelNumberInWorld: 5,
    title: 'Missing Beach Toy',
    spokenPrompt: 'One special shape is missing from the picnic blanket. Which one fits?',
    hintText: 'Check the empty dotted spot carefully!',
    mechanic: 'match-slots',
    difficulty: 'beginner',
    matchData: {
      mode: 'missing',
      slots: [
        { slotId: 'm1', acceptsTokenId: 'm-hex', label: 'Hexagon', shape: 'hexagon', color: 'lavender', showColorHint: true },
      ],
      tokens: [
        tok('m-circle', 'Circle', 'circle', 'peach'),
        tok('m-hex', 'Hexagon', 'hexagon', 'lavender'),
        tok('m-tri', 'Triangle', 'triangle', 'mint'),
      ],
    },
  },
  {
    id: 6,
    worldId: 1,
    levelNumberInWorld: 6,
    title: 'Island Pair Picnic',
    spokenPrompt: 'Match all three twin shape-and-color pairs!',
    hintText: 'Check both the shape AND the color before dropping.',
    mechanic: 'match-slots',
    difficulty: 'intermediate',
    matchData: {
      mode: 'pair',
      slots: [
        { slotId: 'pr1', acceptsTokenId: 'pr-1', label: 'Mint Square', shape: 'square', color: 'mint', showColorHint: true },
        { slotId: 'pr2', acceptsTokenId: 'pr-2', label: 'Sunny Star', shape: 'star', color: 'sunny', showColorHint: true },
        { slotId: 'pr3', acceptsTokenId: 'pr-3', label: 'Coral Heart', shape: 'heart', color: 'coral', showColorHint: true },
      ],
      tokens: [
        tok('pr-3', 'Coral Heart', 'heart', 'coral'),
        tok('pr-x', 'Sky Heart', 'heart', 'sky'),
        tok('pr-1', 'Mint Square', 'square', 'mint'),
        tok('pr-2', 'Sunny Star', 'star', 'sunny'),
      ],
    },
  },
  {
    id: 7,
    worldId: 1,
    levelNumberInWorld: 7,
    title: 'Twin Pebble Pattern',
    spokenPrompt: 'Two squares, two stars, two squares... finish the pebble bridge!',
    hintText: 'Watch the pairs: Square, Square, Star, Star, Square, Square...',
    mechanic: 'pattern',
    difficulty: 'intermediate',
    patternData: {
      sequence: [
        tok('a1', 'Square', 'square', 'sky'),
        tok('a2', 'Square', 'square', 'sky'),
        tok('b1', 'Star', 'star', 'sunny'),
        tok('b2', 'Star', 'star', 'sunny'),
        tok('a3', 'Square', 'square', 'sky'),
        null,
      ],
      choices: [
        tok('ch-sq', 'Sky Square', 'square', 'sky'),
        tok('ch-st', 'Sunny Star', 'star', 'sunny'),
        tok('ch-cr', 'Coral Circle', 'circle', 'coral'),
      ],
      expectedIds: ['ch-sq'],
    },
  },
  {
    id: 8,
    worldId: 1,
    levelNumberInWorld: 8,
    title: 'Moonlight Shadow Match',
    spokenPrompt: 'Match each bright toy to its dark island shadow!',
    hintText: 'Only the outline shows—look at the edges of each shape.',
    mechanic: 'match-slots',
    difficulty: 'intermediate',
    matchData: {
      mode: 'shadow',
      slots: [
        { slotId: 'shd1', acceptsTokenId: 's-cres', label: 'Crescent', shape: 'crescent', color: 'sunny', showColorHint: false, isShadowOnly: true },
        { slotId: 'shd2', acceptsTokenId: 's-hex', label: 'Hexagon', shape: 'hexagon', color: 'lavender', showColorHint: false, isShadowOnly: true },
        { slotId: 'shd3', acceptsTokenId: 's-heart', label: 'Heart', shape: 'heart', color: 'berry', showColorHint: false, isShadowOnly: true },
      ],
      tokens: [
        tok('s-heart', 'Heart', 'heart', 'berry'),
        tok('s-cres', 'Crescent', 'crescent', 'sunny'),
        tok('s-hex', 'Hexagon', 'hexagon', 'lavender'),
      ],
    },
  },
  {
    id: 9,
    worldId: 1,
    levelNumberInWorld: 9,
    title: 'Three-Gem Necklace',
    spokenPrompt: 'Complete the three-step repeating gem necklace!',
    hintText: 'Triangle, Circle, Star, Triangle, Circle, ...?',
    mechanic: 'pattern',
    difficulty: 'advanced',
    patternData: {
      sequence: [
        tok('g1', 'Triangle', 'triangle', 'mint'),
        tok('g2', 'Circle', 'circle', 'coral'),
        tok('g3', 'Star', 'star', 'sunny'),
        tok('g4', 'Triangle', 'triangle', 'mint'),
        tok('g5', 'Circle', 'circle', 'coral'),
        null,
      ],
      choices: [
        tok('g-tri', 'Mint Triangle', 'triangle', 'mint'),
        tok('g-star', 'Sunny Star', 'star', 'sunny'),
        tok('g-sq', 'Sky Square', 'square', 'sky'),
        tok('g-hex', 'Lavender Hex', 'hexagon', 'lavender'),
      ],
      expectedIds: ['g-star'],
    },
  },
  {
    id: 10,
    worldId: 1,
    levelNumberInWorld: 10,
    title: 'Island Lighthouse Finale',
    spokenPrompt: 'Restore the Shape Lighthouse by fitting all four magic shapes!',
    hintText: 'Fit the Diamond, Crescent, Star, and Hexagon into the lighthouse!',
    mechanic: 'match-slots',
    difficulty: 'advanced',
    matchData: {
      mode: 'shadow',
      slots: [
        { slotId: 'lh1', acceptsTokenId: 'lh-dia', label: 'Diamond', shape: 'diamond', color: 'sky', showColorHint: true, isShadowOnly: true },
        { slotId: 'lh2', acceptsTokenId: 'lh-cres', label: 'Crescent', shape: 'crescent', color: 'peach', showColorHint: true, isShadowOnly: true },
        { slotId: 'lh3', acceptsTokenId: 'lh-star', label: 'Star', shape: 'star', color: 'sunny', showColorHint: true, isShadowOnly: true },
        { slotId: 'lh4', acceptsTokenId: 'lh-hex', label: 'Hexagon', shape: 'hexagon', color: 'mint', showColorHint: true, isShadowOnly: true },
      ],
      tokens: [
        tok('lh-star', 'Star', 'star', 'sunny'),
        tok('lh-hex', 'Hexagon', 'hexagon', 'mint'),
        tok('lh-dia', 'Diamond', 'diamond', 'sky'),
        tok('lh-cres', 'Crescent', 'crescent', 'peach'),
      ],
    },
  },

  // ============================================================================
  // WORLD 2: MEMORY FOREST (Levels 11-20)
  // ============================================================================
  {
    id: 11,
    worldId: 2,
    levelNumberInWorld: 1,
    title: 'Cozy Critter Pairs',
    spokenPrompt: 'Flip the leaf cards to find two cute animal pairs!',
    hintText: 'Tap two cards—remember where the frog and bunny are hiding!',
    mechanic: 'memory-cards',
    difficulty: 'beginner',
    memoryCardsData: {
      pairs: [
        { id: 'frog', label: 'Frog', emoji: '🐸', color: 'mint' },
        { id: 'bunny', label: 'Bunny', emoji: '🐰', color: 'peach' },
      ],
    },
  },
  {
    id: 12,
    worldId: 2,
    levelNumberInWorld: 2,
    title: 'Where Did Pip Hide?',
    spokenPrompt: 'Watch closely! Remember which berry bush Pip hops behind!',
    hintText: 'Keep your eyes on Pip before the bushes wiggle!',
    mechanic: 'memory-hide',
    difficulty: 'beginner',
    memoryHideData: {
      mode: 'hide',
      spots: [
        { id: 'b1', label: 'Sunny Bush', emoji: '🌼', color: 'sunny' },
        { id: 'b2', label: 'Berry Bush', emoji: '🍓', color: 'coral' },
        { id: 'b3', label: 'Clover Bush', emoji: '🍀', color: 'mint' },
      ],
      targetIds: ['b2'],
    },
  },
  {
    id: 13,
    worldId: 2,
    levelNumberInWorld: 3,
    title: 'Firefly Song Echo',
    spokenPrompt: 'Watch the fireflies glow, then tap them in the same order!',
    hintText: 'Listen to the notes and tap 1, then 2.',
    mechanic: 'memory-sequence',
    difficulty: 'beginner',
    memorySequenceData: {
      pads: [
        { id: 'f1', label: 'Sun Fly', emoji: '✨', color: 'sunny', noteHz: 392.0 },
        { id: 'f2', label: 'Mint Fly', emoji: '🌿', color: 'mint', noteHz: 523.25 },
        { id: 'f3', label: 'Sky Fly', emoji: '💧', color: 'sky', noteHz: 659.25 },
      ],
      sequence: ['f1', 'f3'],
    },
  },
  {
    id: 14,
    worldId: 2,
    levelNumberInWorld: 4,
    title: 'Woodland Friends Trio',
    spokenPrompt: 'Match three pairs of sleepy forest friends!',
    hintText: 'Take your time—every flip helps you remember!',
    mechanic: 'memory-cards',
    difficulty: 'intermediate',
    memoryCardsData: {
      pairs: [
        { id: 'fox', label: 'Fox', emoji: '🦊', color: 'coral' },
        { id: 'owl', label: 'Owl', emoji: '🦉', color: 'lavender' },
        { id: 'bear', label: 'Bear', emoji: '🐻', color: 'peach' },
      ],
    },
  },
  {
    id: 15,
    worldId: 2,
    levelNumberInWorld: 5,
    title: 'The Sneaky Squirrel Swap',
    spokenPrompt: 'Look at the forest treasures! After the breeze blows, find which spot changed!',
    hintText: 'Compare what is on the stump now with what was there before.',
    mechanic: 'memory-hide',
    difficulty: 'intermediate',
    memoryHideData: {
      mode: 'swap',
      spots: [
        { id: 'st1', label: 'Acorn', emoji: '🌰', color: 'peach' },
        { id: 'st2', label: 'Pinecone', emoji: '🌲', color: 'mint' },
        { id: 'st3', label: 'Mushroom', emoji: '🍄', color: 'coral' },
        { id: 'st4', label: 'Flower', emoji: '🌸', color: 'berry' },
      ],
      targetIds: ['st3'],
    },
  },
  {
    id: 16,
    worldId: 2,
    levelNumberInWorld: 6,
    title: 'Musical Mushroom Echo',
    spokenPrompt: 'Three magic mushrooms will sing! Play their three-note tune back!',
    hintText: 'Wait until the mushrooms finish glowing, then tap all three.',
    mechanic: 'memory-sequence',
    difficulty: 'intermediate',
    memorySequenceData: {
      pads: [
        { id: 'm1', label: 'Coral Cap', emoji: '🍄', color: 'coral', noteHz: 329.63 },
        { id: 'm2', label: 'Gold Cap', emoji: '🌟', color: 'sunny', noteHz: 440.0 },
        { id: 'm3', label: 'Aqua Cap', emoji: '🫧', color: 'sky', noteHz: 523.25 },
        { id: 'm4', label: 'Plum Cap', emoji: '🪻', color: 'lavender', noteHz: 659.25 },
      ],
      sequence: ['m2', 'm4', 'm1'],
    },
  },
  {
    id: 17,
    worldId: 2,
    levelNumberInWorld: 7,
    title: 'Leaf & Ladybug Match',
    spokenPrompt: 'Find all four matching forest nature pairs!',
    hintText: 'Remember corners first—that makes matching super easy!',
    mechanic: 'memory-cards',
    difficulty: 'intermediate',
    memoryCardsData: {
      pairs: [
        { id: 'lady', label: 'Ladybug', emoji: '🐞', color: 'coral' },
        { id: 'bee', label: 'Bumblebee', emoji: '🐝', color: 'sunny' },
        { id: 'leaf', label: 'Maple Leaf', emoji: '🍁', color: 'peach' },
        { id: 'snail', label: 'Snail', emoji: '🐌', color: 'mint' },
      ],
    },
  },
  {
    id: 18,
    worldId: 2,
    levelNumberInWorld: 8,
    title: 'Foggy Meadow Peek',
    spokenPrompt: 'Remember which two logs hold the golden acorns before the morning mist rolls in!',
    hintText: 'Watch the two glowing spots carefully!',
    mechanic: 'memory-hide',
    difficulty: 'advanced',
    memoryHideData: {
      mode: 'fog',
      spots: [
        { id: 'fg1', label: 'Moss Log', emoji: '🪵', color: 'mint' },
        { id: 'fg2', label: 'Fern Log', emoji: '🌿', color: 'sky' },
        { id: 'fg3', label: 'Sunny Log', emoji: '🌻', color: 'sunny' },
        { id: 'fg4', label: 'Berry Log', emoji: '🫐', color: 'lavender' },
      ],
      targetIds: ['fg1', 'fg4'],
    },
  },
  {
    id: 19,
    worldId: 2,
    levelNumberInWorld: 9,
    title: 'Lantern Trail Sequence',
    spokenPrompt: 'Light the four forest lanterns in the exact glowing order!',
    hintText: 'Say each color out loud as the lanterns blink.',
    mechanic: 'memory-sequence',
    difficulty: 'advanced',
    memorySequenceData: {
      pads: [
        { id: 'l1', label: 'Peach Glow', emoji: '🏮', color: 'peach', noteHz: 293.66 },
        { id: 'l2', label: 'Mint Glow', emoji: '🟢', color: 'mint', noteHz: 369.99 },
        { id: 'l3', label: 'Sky Glow', emoji: '🔵', color: 'sky', noteHz: 440.0 },
        { id: 'l4', label: 'Sunny Glow', emoji: '🟡', color: 'sunny', noteHz: 587.33 },
      ],
      sequence: ['l3', 'l1', 'l4', 'l2'],
    },
  },
  {
    id: 20,
    worldId: 2,
    levelNumberInWorld: 10,
    title: 'Grand Owl Memory Grove',
    spokenPrompt: 'Match all five woodland animal pairs to wake the Grand Starlight Owl!',
    hintText: 'Flip slowly and picture where each cute friend sits.',
    mechanic: 'memory-cards',
    difficulty: 'advanced',
    memoryCardsData: {
      pairs: [
        { id: 'deer', label: 'Fawn', emoji: '🦌', color: 'peach' },
        { id: 'hedg', label: 'Hedgehog', emoji: '🦔', color: 'coral' },
        { id: 'butt', label: 'Butterfly', emoji: '🦋', color: 'sky' },
        { id: 'frog2', label: 'Tree Frog', emoji: '🐸', color: 'mint' },
        { id: 'owl2', label: 'Star Owl', emoji: '🦉', color: 'lavender' },
      ],
    },
  },

  // ============================================================================
  // WORLD 3: WOBBLE'S MAZE (Levels 21-30)
  // ============================================================================
  {
    id: 21,
    worldId: 3,
    levelNumberInWorld: 1,
    title: 'Sunny Garden Walk',
    spokenPrompt: 'Guide your buddy down the path, grab the star, and reach the arch!',
    hintText: 'Tap the arrows or tap the next grassy tile to hop forward!',
    mechanic: 'maze',
    difficulty: 'beginner',
    mazeData: buildMaze([
      '#####',
      '#S*G#',
      '#####',
    ]),
  },
  {
    id: 22,
    worldId: 3,
    levelNumberInWorld: 2,
    title: 'Corner Clover Trail',
    spokenPrompt: 'Turn the corner to collect two golden stars on the way to the arch!',
    hintText: 'Walk right first, then hop down!',
    mechanic: 'maze',
    difficulty: 'beginner',
    mazeData: buildMaze([
      '#####',
      '#S*.#',
      '###*#',
      '###G#',
      '#####',
    ]),
  },
  {
    id: 23,
    worldId: 3,
    levelNumberInWorld: 3,
    title: 'Mossy Rock Winding Path',
    spokenPrompt: 'Zig-zag gently around the mossy rocks to reach the glowing gate!',
    hintText: 'Follow the open meadow tiles around each rock.',
    mechanic: 'maze',
    difficulty: 'beginner',
    mazeData: buildMaze([
      '######',
      '#S.#.#',
      '#.*..#',
      '###.##',
      '#G*..#',
      '######',
    ]),
  },
  {
    id: 24,
    worldId: 3,
    levelNumberInWorld: 4,
    title: 'Three-Star Meadow Loop',
    spokenPrompt: 'Gather all three stars before hopping into the finish arch!',
    hintText: 'Visit the little side loop to snag every star.',
    mechanic: 'maze',
    difficulty: 'intermediate',
    mazeData: buildMaze([
      '######',
      '#S*..#',
      '#.##*#',
      '#.*..#',
      '#.####',
      '#...G#',
      '######',
    ]),
  },
  {
    id: 25,
    worldId: 3,
    levelNumberInWorld: 5,
    title: 'Pink Flower Bridge',
    spokenPrompt: 'Step on the pink flower button to raise the magic bridge across the pond!',
    hintText: 'Hop to the flower button first, then cross the raised bridge!',
    mechanic: 'maze',
    difficulty: 'intermediate',
    mazeData: buildMaze([
      '#######',
      '#S..A.#',
      '####.##',
      '#G*a..#',
      '#######',
    ]),
  },
  {
    id: 26,
    worldId: 3,
    levelNumberInWorld: 6,
    title: 'Splashy Puddle Hop',
    spokenPrompt: 'Step carefully around the splashy blue puddles to stay dry!',
    hintText: 'Puddles are harmless, just splashy—take the dry grass path!',
    mechanic: 'maze',
    difficulty: 'intermediate',
    mazeData: buildMaze([
      '#######',
      '#S.~.*#',
      '#..~..#',
      '#*.#.~#',
      '#....G#',
      '#######',
    ]),
  },
  {
    id: 27,
    worldId: 3,
    levelNumberInWorld: 7,
    title: 'Twin Flower Gates',
    spokenPrompt: 'Press both flower switches so every bridge rises to the starlight gate!',
    hintText: 'Find Flower A first, cross bridge A, then find Flower B!',
    mechanic: 'maze',
    difficulty: 'intermediate',
    mazeData: buildMaze([
      '#######',
      '#S*A#G#',
      '###.#.#',
      '#B.a#b#',
      '#.*...#',
      '#######',
    ]),
  },
  {
    id: 28,
    worldId: 3,
    levelNumberInWorld: 8,
    title: 'Branching Forest Crossroads',
    spokenPrompt: 'Explore the sunny crossroads to pick up every star along both trails!',
    hintText: 'Grab the top-right star before heading down to the arch.',
    mechanic: 'maze',
    difficulty: 'advanced',
    mazeData: buildMaze([
      '#######',
      '#S.#.*#',
      '#..*..#',
      '##.#.##',
      '#.*..G#',
      '#######',
    ]),
  },
  {
    id: 29,
    worldId: 3,
    levelNumberInWorld: 9,
    title: 'Sleepy Beetle Detour',
    spokenPrompt: 'Tip-toe around the napping garden beetles so we do not wake them!',
    hintText: 'Press the flower button, cross the bridge, and avoid the beetles and puddle!',
    mechanic: 'maze',
    difficulty: 'advanced',
    mazeData: buildMaze([
      '#######',
      '#S.M~*#',
      '#.A#..#',
      '#.#..##',
      '#.*aM.#',
      '#....G#',
      '#######',
    ]),
  },
  {
    id: 30,
    worldId: 3,
    levelNumberInWorld: 10,
    title: 'Starlight Shrine Spiral',
    spokenPrompt: 'Follow the grand garden spiral, flip the flower switch, and collect all three stars!',
    hintText: 'Loop around the outside to reach the inner shrine!',
    mechanic: 'maze',
    difficulty: 'advanced',
    mazeData: buildMaze([
      '#######',
      '#S...*#',
      '#####.#',
      '#A*aG.#',
      '#.###.#',
      '#...*.#',
      '#######',
    ]),
  },

  // ============================================================================
  // WORLD 4: MAGIC FACTORY (Levels 31-40)
  // ============================================================================
  {
    id: 31,
    worldId: 4,
    levelNumberInWorld: 1,
    title: 'Two-Color Toy Chutes',
    spokenPrompt: 'Sort each bouncy toy into the Coral or Sky factory chute!',
    hintText: 'Red-orange coral toys go left; sky-blue toys go right!',
    mechanic: 'sort-bins',
    difficulty: 'beginner',
    sortData: {
      bins: [
        { binId: 'b-coral', label: 'Coral Chute', accentColor: 'coral', acceptsCategory: 'coral' },
        { binId: 'b-sky', label: 'Sky Chute', accentColor: 'sky', acceptsCategory: 'sky' },
      ],
      items: [
        { ...tok('i1', 'Coral Ball', 'circle', 'coral', { emoji: '🎈' }), targetCategory: 'coral' },
        { ...tok('i2', 'Sky Block', 'square', 'sky', { emoji: '🧊' }), targetCategory: 'sky' },
        { ...tok('i3', 'Coral Star', 'star', 'coral', { emoji: '🦊' }), targetCategory: 'coral' },
        { ...tok('i4', 'Sky Whale', 'circle', 'sky', { emoji: '🐳' }), targetCategory: 'sky' },
      ],
    },
  },
  {
    id: 32,
    worldId: 4,
    levelNumberInWorld: 2,
    title: 'Big & Tiny Block Sorter',
    spokenPrompt: 'Put the tiny blocks in the Little Box and giant blocks in the Big Box!',
    hintText: 'Compare how tall each block looks!',
    mechanic: 'sort-bins',
    difficulty: 'beginner',
    sortData: {
      bins: [
        { binId: 'b-sm', label: 'Tiny Box', accentColor: 'mint', acceptsCategory: 'sm' },
        { binId: 'b-lg', label: 'Big Box', accentColor: 'sunny', acceptsCategory: 'lg' },
      ],
      items: [
        { ...tok('sz1', 'Tiny Cube', 'square', 'mint', { size: 'sm' }), targetCategory: 'sm' },
        { ...tok('sz2', 'Giant Cube', 'square', 'sunny', { size: 'lg' }), targetCategory: 'lg' },
        { ...tok('sz3', 'Tiny Star', 'star', 'peach', { size: 'sm' }), targetCategory: 'sm' },
        { ...tok('sz4', 'Giant Star', 'star', 'coral', { size: 'lg' }), targetCategory: 'lg' },
      ],
    },
  },
  {
    id: 33,
    worldId: 4,
    levelNumberInWorld: 3,
    title: 'Silly Boot in the Fruit Bowl',
    spokenPrompt: 'Three things are yummy fruit, and one does not belong! Tap the silly one!',
    hintText: 'Can you eat a rainy-day boot? Tap what is not a fruit!',
    mechanic: 'odd-one-out',
    difficulty: 'beginner',
    oddOneData: {
      items: [
        tok('f1', 'Apple', 'circle', 'coral', { emoji: '🍎' }),
        tok('f2', 'Banana', 'crescent', 'sunny', { emoji: '🍌' }),
        tok('f3', 'Rain Boot', 'square', 'sky', { emoji: '🥾' }),
        tok('f4', 'Grapes', 'circle', 'lavender', { emoji: '🍇' }),
      ],
      oddId: 'f3',
    },
  },
  {
    id: 34,
    worldId: 4,
    levelNumberInWorld: 4,
    title: 'Round vs Pointy Shapes',
    spokenPrompt: 'Send smooth round shapes to the Bubble Bin and pointy shapes to the Spike Bin!',
    hintText: 'Circles and hearts are smooth; triangles and stars have corners!',
    mechanic: 'sort-bins',
    difficulty: 'intermediate',
    sortData: {
      bins: [
        { binId: 'b-round', label: 'Smooth & Round', accentColor: 'peach', acceptsCategory: 'round' },
        { binId: 'b-pointy', label: 'Pointy Corners', accentColor: 'lavender', acceptsCategory: 'pointy' },
      ],
      items: [
        { ...tok('rp1', 'Bubble Circle', 'circle', 'sky'), targetCategory: 'round' },
        { ...tok('rp2', 'Pointy Triangle', 'triangle', 'mint'), targetCategory: 'pointy' },
        { ...tok('rp3', 'Smooth Heart', 'heart', 'berry'), targetCategory: 'round' },
        { ...tok('rp4', 'Pointy Star', 'star', 'sunny'), targetCategory: 'pointy' },
      ],
    },
  },
  {
    id: 35,
    worldId: 4,
    levelNumberInWorld: 5,
    title: 'Growing Sprout Lineup',
    spokenPrompt: 'Line up the factory gears from Smallest to Biggest!',
    hintText: 'Start with the smallest size, then medium, then largest!',
    mechanic: 'pattern',
    difficulty: 'intermediate',
    patternData: {
      sequence: [
        tok('sz-1', 'Tiny Gear', 'hexagon', 'mint', { size: 'sm' }),
        tok('sz-2', 'Medium Gear', 'hexagon', 'sky', { size: 'md' }),
        null,
      ],
      choices: [
        tok('sz-big', 'Giant Gear', 'hexagon', 'sunny', { size: 'lg' }),
        tok('sz-tiny', 'Tiny Gear', 'hexagon', 'mint', { size: 'sm' }),
        tok('sz-med', 'Medium Gear', 'hexagon', 'sky', { size: 'md' }),
      ],
      expectedIds: ['sz-big'],
    },
  },
  {
    id: 36,
    worldId: 4,
    levelNumberInWorld: 6,
    title: 'Find the Odd Toy',
    spokenPrompt: 'Three toys are sunny yellow stars. Which one is different?',
    hintText: 'Look for the one with a different shape and color!',
    mechanic: 'odd-one-out',
    difficulty: 'intermediate',
    oddOneData: {
      items: [
        tok('od1', 'Sunny Star', 'star', 'sunny'),
        tok('od2', 'Sunny Star', 'star', 'sunny'),
        tok('od3', 'Mint Square', 'square', 'mint'),
        tok('od4', 'Sunny Star', 'star', 'sunny'),
      ],
      oddId: 'od3',
    },
  },
  {
    id: 37,
    worldId: 4,
    levelNumberInWorld: 7,
    title: 'Three-Bin Toy Express',
    spokenPrompt: 'Sort every toy into Food, Animals, or Vehicles!',
    hintText: 'Yummy snacks, furry friends, and rolling wheels each have a home.',
    mechanic: 'sort-bins',
    difficulty: 'intermediate',
    sortData: {
      bins: [
        { binId: 'cat-food', label: 'Yummy Food', accentColor: 'coral', acceptsCategory: 'food' },
        { binId: 'cat-ani', label: 'Cute Animals', accentColor: 'mint', acceptsCategory: 'animal' },
        { binId: 'cat-veh', label: 'Zoom Vehicles', accentColor: 'sky', acceptsCategory: 'vehicle' },
      ],
      items: [
        { ...tok('tf1', 'Strawberry', 'circle', 'coral', { emoji: '🍓' }), targetCategory: 'food' },
        { ...tok('tf2', 'Puppy', 'circle', 'peach', { emoji: '🐶' }), targetCategory: 'animal' },
        { ...tok('tf3', 'Train', 'square', 'sky', { emoji: '🚂' }), targetCategory: 'vehicle' },
        { ...tok('tf4', 'Cupcake', 'circle', 'berry', { emoji: '🧁' }), targetCategory: 'food' },
        { ...tok('tf5', 'Kitty', 'circle', 'sunny', { emoji: '🐱' }), targetCategory: 'animal' },
        { ...tok('tf6', 'Rocket', 'triangle', 'lavender', { emoji: '🚀' }), targetCategory: 'vehicle' },
      ],
    },
  },
  {
    id: 38,
    worldId: 4,
    levelNumberInWorld: 8,
    title: 'Conveyor Belt Fix',
    spokenPrompt: 'A piece fell off the factory belt! Put the right shape back in the middle!',
    hintText: 'Follow the rhythm: Heart, Diamond, Heart, Diamond, Heart, Diamond.',
    mechanic: 'pattern',
    difficulty: 'advanced',
    patternData: {
      sequence: [
        tok('cv1', 'Heart', 'heart', 'berry'),
        tok('cv2', 'Diamond', 'diamond', 'sky'),
        null,
        tok('cv4', 'Diamond', 'diamond', 'sky'),
        tok('cv5', 'Heart', 'heart', 'berry'),
        tok('cv6', 'Diamond', 'diamond', 'sky'),
      ],
      choices: [
        tok('cv-ans', 'Berry Heart', 'heart', 'berry'),
        tok('cv-w1', 'Sky Diamond', 'diamond', 'sky'),
        tok('cv-w2', 'Sunny Star', 'star', 'sunny'),
      ],
      expectedIds: ['cv-ans'],
    },
  },
  {
    id: 39,
    worldId: 4,
    levelNumberInWorld: 9,
    title: 'Which Toy Does Not Fly?',
    spokenPrompt: 'Three of these soar up in the sky! Tap the one that rolls on the ground!',
    hintText: 'Birds, planes, and butterflies have wings!',
    mechanic: 'odd-one-out',
    difficulty: 'advanced',
    oddOneData: {
      items: [
        tok('fl1', 'Airplane', 'triangle', 'sky', { emoji: '✈️' }),
        tok('fl2', 'Butterfly', 'star', 'lavender', { emoji: '🦋' }),
        tok('fl3', 'Bicycle', 'circle', 'coral', { emoji: '🚲' }),
        tok('fl4', 'Little Bird', 'circle', 'sunny', { emoji: '🐦' }),
      ],
      oddId: 'fl3',
    },
  },
  {
    id: 40,
    worldId: 4,
    levelNumberInWorld: 10,
    title: 'Master Toy-Packing Finale',
    spokenPrompt: 'Pack all six magic factory toys into their matching color-and-shape boxes!',
    hintText: 'Check the label on each chute—Coral, Mint, or Lavender!',
    mechanic: 'sort-bins',
    difficulty: 'advanced',
    sortData: {
      bins: [
        { binId: 'mf-c', label: 'Coral Stars', accentColor: 'coral', acceptsCategory: 'coral' },
        { binId: 'mf-m', label: 'Mint Cubes', accentColor: 'mint', acceptsCategory: 'mint' },
        { binId: 'mf-l', label: 'Lavender Hearts', accentColor: 'lavender', acceptsCategory: 'lavender' },
      ],
      items: [
        { ...tok('mf1', 'Coral Star', 'star', 'coral'), targetCategory: 'coral' },
        { ...tok('mf2', 'Mint Cube', 'square', 'mint'), targetCategory: 'mint' },
        { ...tok('mf3', 'Lavender Heart', 'heart', 'lavender'), targetCategory: 'lavender' },
        { ...tok('mf4', 'Coral Star', 'star', 'coral'), targetCategory: 'coral' },
        { ...tok('mf5', 'Mint Cube', 'square', 'mint'), targetCategory: 'mint' },
        { ...tok('mf6', 'Lavender Heart', 'heart', 'lavender'), targetCategory: 'lavender' },
      ],
    },
  },

  // ============================================================================
  // WORLD 5: CLOUD KINGDOM (Levels 41-50)
  // ============================================================================
  {
    id: 41,
    worldId: 5,
    levelNumberInWorld: 1,
    title: 'Count the Star-Clouds',
    spokenPrompt: 'Count the fluffy star-clouds floating in the sky and tap the right number!',
    hintText: 'Touch each cloud as you count: 1, 2, 3!',
    mechanic: 'counting',
    difficulty: 'beginner',
    countingData: {
      targetCount: 3,
      itemEmoji: '☁️',
      itemLabel: 'Fluffy Clouds',
      color: 'sky',
      choices: [2, 3, 4],
    },
  },
  {
    id: 42,
    worldId: 5,
    levelNumberInWorld: 2,
    title: 'Rainbow Bridge Corner',
    spokenPrompt: 'A piece of the rainbow picture is missing! Pick the piece that completes it!',
    hintText: 'Look at the rainbow arch—which corner has the sun?',
    mechanic: 'picture-puzzle',
    difficulty: 'beginner',
    picturePuzzleData: {
      cols: 2,
      rows: 2,
      themeLabel: 'Sunny Rainbow Meadow',
      tiles: [
        { id: 't1', label: 'Cloud', emoji: '☁️', color: 'sky' },
        { id: 't2', label: 'Missing Sun', emoji: '☀️', color: 'sunny', isMissing: true },
        { id: 't3', label: 'Rainbow', emoji: '🌈', color: 'peach' },
        { id: 't4', label: 'Flower', emoji: '🌷', color: 'mint' },
      ],
      choices: [
        { id: 'c-sun', label: 'Sunny Glow', emoji: '☀️', color: 'sunny' },
        { id: 'c-boot', label: 'Muddy Boot', emoji: '🥾', color: 'coral' },
        { id: 'c-rock', label: 'Gray Rock', emoji: '🪨', color: 'lavender' },
      ],
    },
  },
  {
    id: 43,
    worldId: 5,
    levelNumberInWorld: 3,
    title: 'Sun, Moon & Star Sky',
    spokenPrompt: 'Follow the sky dance: Sun, Moon, Star, Sun, Moon... what shines next?',
    hintText: 'Repeat the three sky buddies in order!',
    mechanic: 'pattern',
    difficulty: 'beginner',
    patternData: {
      sequence: [
        tok('sk1', 'Sun', 'circle', 'sunny', { emoji: '☀️' }),
        tok('sk2', 'Moon', 'crescent', 'lavender', { emoji: '🌙' }),
        tok('sk3', 'Star', 'star', 'sky', { emoji: '⭐' }),
        tok('sk4', 'Sun', 'circle', 'sunny', { emoji: '☀️' }),
        tok('sk5', 'Moon', 'crescent', 'lavender', { emoji: '🌙' }),
        null,
      ],
      choices: [
        tok('sk-star', 'Sky Star', 'star', 'sky', { emoji: '⭐' }),
        tok('sk-sun', 'Sunny Sun', 'circle', 'sunny', { emoji: '☀️' }),
        tok('sk-moon', 'Moon', 'crescent', 'lavender', { emoji: '🌙' }),
      ],
      expectedIds: ['sk-star'],
    },
  },
  {
    id: 44,
    worldId: 5,
    levelNumberInWorld: 4,
    title: 'Count the Sleepy Sheep',
    spokenPrompt: 'How many fluffy cloud sheep are bouncing in the sky?',
    hintText: 'Count slowly from left to right—one, two, three, four, five!',
    mechanic: 'counting',
    difficulty: 'intermediate',
    countingData: {
      targetCount: 5,
      itemEmoji: '🐑',
      itemLabel: 'Cloud Sheep',
      color: 'peach',
      choices: [4, 5, 6],
    },
  },
  {
    id: 45,
    worldId: 5,
    levelNumberInWorld: 5,
    title: 'Cloud Castle Mural',
    spokenPrompt: 'Find the missing magic sparkle banner for the Cloud Castle!',
    hintText: 'Look for the castle flag that matches the sky palace!',
    mechanic: 'picture-puzzle',
    difficulty: 'intermediate',
    picturePuzzleData: {
      cols: 2,
      rows: 2,
      themeLabel: 'Cloud Castle',
      tiles: [
        { id: 'cc1', label: 'Castle Tower', emoji: '🏰', color: 'lavender' },
        { id: 'cc2', label: 'Unicorn Flag', emoji: '🦄', color: 'berry', isMissing: true },
        { id: 'cc3', label: 'Fluffy Base', emoji: '☁️', color: 'sky' },
        { id: 'cc4', label: 'Star Gate', emoji: '🌟', color: 'sunny' },
      ],
      choices: [
        { id: 'c-uni', label: 'Unicorn Pal', emoji: '🦄', color: 'berry' },
        { id: 'c-car', label: 'Red Car', emoji: '🚗', color: 'coral' },
        { id: 'c-fish', label: 'Sea Fish', emoji: '🐟', color: 'mint' },
      ],
    },
  },
  {
    id: 46,
    worldId: 5,
    levelNumberInWorld: 6,
    title: 'Two-Clue Sky Key',
    spokenPrompt: 'Use BOTH clues to pick the secret sky key: it must be SKY BLUE and a STAR!',
    hintText: 'Check Clue 1 (Sky Blue) AND Clue 2 (Star shape)!',
    mechanic: 'clue-riddle',
    difficulty: 'intermediate',
    clueRiddleData: {
      clues: [
        { icon: 'color', label: 'Sky Blue', color: 'sky' },
        { icon: 'shape', label: 'Star Shape', shape: 'star' },
      ],
      choices: [
        tok('k1', 'Coral Star', 'star', 'coral'),
        tok('k2', 'Sky Square', 'square', 'sky'),
        tok('k3', 'Sky Star', 'star', 'sky'),
        tok('k4', 'Sunny Circle', 'circle', 'sunny'),
      ],
      correctId: 'k3',
    },
  },
  {
    id: 47,
    worldId: 5,
    levelNumberInWorld: 7,
    title: 'Crescent Moon Mosaic',
    spokenPrompt: 'One tile is missing in the night-sky mosaic! Pick the sleepy crescent moon!',
    hintText: 'Look at the middle sky square!',
    mechanic: 'picture-puzzle',
    difficulty: 'intermediate',
    picturePuzzleData: {
      cols: 3,
      rows: 2,
      themeLabel: 'Starry Lullaby Sky',
      tiles: [
        { id: 'cm1', label: 'Twinkle', emoji: '✨', color: 'sunny' },
        { id: 'cm2', label: 'Crescent Moon', emoji: '🌙', color: 'lavender', isMissing: true },
        { id: 'cm3', label: 'Comet', emoji: '☄️', color: 'peach' },
        { id: 'cm4', label: 'Cloud', emoji: '☁️', color: 'sky' },
        { id: 'cm5', label: 'Planet', emoji: '🪐', color: 'mint' },
        { id: 'cm6', label: 'Cloud', emoji: '☁️', color: 'sky' },
      ],
      choices: [
        { id: 'c-moon', label: 'Crescent Moon', emoji: '🌙', color: 'lavender' },
        { id: 'c-apple', label: 'Red Apple', emoji: '🍎', color: 'coral' },
        { id: 'c-drum', label: 'Toy Drum', emoji: '🥁', color: 'sunny' },
      ],
    },
  },
  {
    id: 48,
    worldId: 5,
    levelNumberInWorld: 8,
    title: 'Rainbow Raindrop Count',
    spokenPrompt: 'Count all the sparkly raindrops falling from the happy cloud!',
    hintText: 'Tap each raindrop while counting—there are more than five!',
    mechanic: 'counting',
    difficulty: 'advanced',
    countingData: {
      targetCount: 7,
      itemEmoji: '💧',
      itemLabel: 'Sparkly Raindrops',
      color: 'sky',
      choices: [6, 7, 8, 9],
    },
  },
  {
    id: 49,
    worldId: 5,
    levelNumberInWorld: 9,
    title: 'Three-Clue Treasure Chest',
    spokenPrompt: 'Combine ALL three clues to unlock the chest: BIG, CORAL, and HEART!',
    hintText: 'Make sure your pick is Big, Coral color, AND Heart shaped!',
    mechanic: 'clue-riddle',
    difficulty: 'advanced',
    clueRiddleData: {
      clues: [
        { icon: 'size', label: 'Big Size', size: 'lg' },
        { icon: 'color', label: 'Coral Color', color: 'coral' },
        { icon: 'shape', label: 'Heart Shape', shape: 'heart' },
      ],
      choices: [
        tok('tc1', 'Small Coral Heart', 'heart', 'coral', { size: 'sm' }),
        tok('tc2', 'Big Mint Heart', 'heart', 'mint', { size: 'lg' }),
        tok('tc3', 'Big Coral Star', 'star', 'coral', { size: 'lg' }),
        tok('tc4', 'Big Coral Heart', 'heart', 'coral', { size: 'lg' }),
      ],
      correctId: 'tc4',
    },
  },
  {
    id: 50,
    worldId: 5,
    levelNumberInWorld: 10,
    title: 'Planet Starlight Crown Finale',
    spokenPrompt: 'Final challenge! Use all three clues to choose the Crown Jewel and restore WonderWiggles!',
    hintText: 'Look for the BIG, SUNNY GOLD, DIAMOND jewel!',
    mechanic: 'clue-riddle',
    difficulty: 'advanced',
    clueRiddleData: {
      clues: [
        { icon: 'size', label: 'Giant Size', size: 'lg' },
        { icon: 'color', label: 'Sunny Gold', color: 'sunny' },
        { icon: 'shape', label: 'Diamond Shape', shape: 'diamond' },
      ],
      choices: [
        tok('fn1', 'Small Sunny Diamond', 'diamond', 'sunny', { size: 'sm' }),
        tok('fn2', 'Giant Sunny Diamond', 'diamond', 'sunny', { size: 'lg' }),
        tok('fn3', 'Giant Lavender Diamond', 'diamond', 'lavender', { size: 'lg' }),
        tok('fn4', 'Giant Sunny Hexagon', 'hexagon', 'sunny', { size: 'lg' }),
      ],
      correctId: 'fn2',
    },
  },
];

export function getLevelsByWorld(worldId: number): LevelDefinition[] {
  return LEVELS.filter((l) => l.worldId === worldId);
}

export function getLevelById(levelId: number): LevelDefinition {
  return LEVELS.find((l) => l.id === levelId) ?? LEVELS[0];
}

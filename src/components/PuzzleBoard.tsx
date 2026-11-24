import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, HelpCircle, Sparkles } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import type { CharacterId, DifficultySetting, LevelDefinition } from '../types/game';
import type { MazeRuntimeState } from './ThreeStage';
import { ShapeTokenVisual, getTokenPalette } from './ShapeTokenVisual';

interface PuzzleBoardProps {
  level: LevelDefinition;
  characterId: CharacterId;
  difficultyOverride: DifficultySetting;
  onStepSuccess: () => void;
  onStepWrong: (encouragement: string) => void;
  onSolved: (mistakes: number) => void;
  onMazeStateChange?: (state: MazeRuntimeState) => void;
  externalMazeTap?: { x: number; y: number; seq: number } | null;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  level,
  characterId,
  difficultyOverride,
  onStepSuccess,
  onStepWrong,
  onSolved,
  onMazeStateChange,
  externalMazeTap,
}) => {
  const [mistakes, setMistakes] = useState(0);
  const [nudgeId, setNudgeId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(difficultyOverride === 'beginner');
  const solvedRef = useRef(false);

  // Match-Slots state
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [matchedSlots, setMatchedSlots] = useState<Record<string, string>>({});

  // Pattern / Picture / Counting / Odd / Clue state
  const [pickedChoiceId, setPickedChoiceId] = useState<string | null>(null);

  // Memory Cards state
  const shuffledCards = useMemo(() => {
    if (!level.memoryCardsData) return [];
    const deck = level.memoryCardsData.pairs.flatMap((pair) => [
      { uid: `${pair.id}-a`, pairId: pair.id, label: pair.label, emoji: pair.emoji, color: pair.color },
      { uid: `${pair.id}-b`, pairId: pair.id, label: pair.label, emoji: pair.emoji, color: pair.color },
    ]);
    // Deterministic friendly shuffle based on level.id
    for (let i = deck.length - 1; i > 0; i--) {
      const j = (i * 7 + level.id * 3) % (i + 1);
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }, [level]);

  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const lockMemoryRef = useRef(false);

  // Memory Sequence state
  const [seqPhase, setSeqPhase] = useState<'watching' | 'playing'>('watching');
  const [litPadId, setLitPadId] = useState<string | null>(null);
  const [userSeq, setUserSeq] = useState<string[]>([]);

  // Memory Hide/Swap/Fog state
  const [hidePhase, setHidePhase] = useState<'peek' | 'guess'>('peek');
  const [foundHideIds, setFoundHideIds] = useState<string[]>([]);

  // Maze state
  const initialMaze = useMemo<MazeRuntimeState | null>(() => {
    if (!level.mazeData) return null;
    const start = level.mazeData.cells.find((c) => c.type === 'start') ?? { x: 1, y: 1 };
    return {
      cols: level.mazeData.cols,
      rows: level.mazeData.rows,
      cells: level.mazeData.cells,
      playerX: start.x,
      playerY: start.y,
      collectedStars: [],
      activeSwitches: [],
    };
  }, [level]);
  const [mazeState, setMazeState] = useState<MazeRuntimeState | null>(initialMaze);

  // Sort-Bins state
  const [selectedSortItemId, setSelectedSortItemId] = useState<string | null>(null);
  const [sortedItems, setSortedItems] = useState<Record<string, string>>({});

  // Reset all local state when level changes
  useEffect(() => {
    solvedRef.current = false;
    setMistakes(0);
    setNudgeId(null);
    setShowHint(difficultyOverride === 'beginner');
    setSelectedTokenId(null);
    setMatchedSlots({});
    setPickedChoiceId(null);
    setFlippedUids([]);
    setMatchedPairIds([]);
    lockMemoryRef.current = false;
    setSeqPhase('watching');
    setLitPadId(null);
    setUserSeq([]);
    setHidePhase('peek');
    setFoundHideIds([]);
    setMazeState(initialMaze);
    setSelectedSortItemId(null);
    setSortedItems({});
  }, [level.id, difficultyOverride, initialMaze]);

  // Sync maze state upwards to ThreeStage
  useEffect(() => {
    if (mazeState && onMazeStateChange) {
      onMazeStateChange(mazeState);
    }
  }, [mazeState, onMazeStateChange]);

  // Sequence playback for World 2 sequence levels
  const playSequenceDemo = () => {
    const seqData = level.memorySequenceData;
    if (!seqData) return;
    setSeqPhase('watching');
    setUserSeq([]);
    seqData.sequence.forEach((padId, idx) => {
      window.setTimeout(() => {
        setLitPadId(padId);
        const pad = seqData.pads.find((p) => p.id === padId);
        if (pad) audioEngine.playNote(pad.noteHz);
        window.setTimeout(() => setLitPadId(null), 460);
      }, 650 + idx * 720);
    });
    window.setTimeout(() => {
      setSeqPhase('playing');
    }, 650 + seqData.sequence.length * 720);
  };

  useEffect(() => {
    if (level.mechanic === 'memory-sequence') {
      playSequenceDemo();
    } else if (level.mechanic === 'memory-hide') {
      setHidePhase('peek');
      const timer = window.setTimeout(() => setHidePhase('guess'), 2400);
      return () => window.clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.id]);

  const triggerMistake = (id: string, msg: string) => {
    setMistakes((m) => m + 1);
    setNudgeId(id);
    window.setTimeout(() => setNudgeId(null), 450);
    audioEngine.playGentleTryAgain();
    onStepWrong(msg);
  };

  const triggerComplete = (finalMistakes = mistakes) => {
    if (solvedRef.current) return;
    solvedRef.current = true;
    window.setTimeout(() => onSolved(finalMistakes), 450);
  };

  // Maze movement handler (both D-pad & direct 3D tile tap)
  const moveMazeTo = (tx: number, ty: number) => {
    if (!mazeState || !level.mazeData || solvedRef.current) return;
    const dx = Math.abs(tx - mazeState.playerX);
    const dy = Math.abs(ty - mazeState.playerY);
    if (dx + dy !== 1) return; // only step 1 adjacent tile at a time

    const targetCell = mazeState.cells.find((c) => c.x === tx && c.y === ty);
    if (!targetCell) return;

    if (targetCell.type === 'wall') {
      triggerMistake(`wall-${tx}-${ty}`, 'Oops, a cozy bush is there! Try another open tile.');
      return;
    }
    if (targetCell.type === 'puddle') {
      triggerMistake(`puddle-${tx}-${ty}`, 'Splash! Let’s hop around the puddle to keep our toes dry!');
      return;
    }
    if (targetCell.type === 'beetle') {
      triggerMistake(`beetle-${tx}-${ty}`, 'Shh! A sleepy beetle is napping there. Go around gently!');
      return;
    }
    if (
      targetCell.type === 'bridge' &&
      targetCell.bridgeForSwitchId &&
      !mazeState.activeSwitches.includes(targetCell.bridgeForSwitchId)
    ) {
      triggerMistake(
        `bridge-${tx}-${ty}`,
        `Step on flower switch ${targetCell.bridgeForSwitchId} first to raise this bridge!`
      );
      return;
    }

    audioEngine.playTap();
    const starKey = `${tx},${ty}`;
    const collectedStars =
      targetCell.type === 'star' && !mazeState.collectedStars.includes(starKey)
        ? [...mazeState.collectedStars, starKey]
        : mazeState.collectedStars;

    if (collectedStars.length > mazeState.collectedStars.length) {
      onStepSuccess();
    }

    const activeSwitches =
      targetCell.type === 'switch' &&
      targetCell.switchId &&
      !mazeState.activeSwitches.includes(targetCell.switchId)
        ? [...mazeState.activeSwitches, targetCell.switchId]
        : mazeState.activeSwitches;

    if (activeSwitches.length > mazeState.activeSwitches.length) {
      audioEngine.playSuccess();
      audioEngine.speakCue('Yay! The magic bridge rose up!', characterId);
    }

    const nextState: MazeRuntimeState = {
      ...mazeState,
      playerX: tx,
      playerY: ty,
      collectedStars,
      activeSwitches,
    };
    setMazeState(nextState);

    if (targetCell.type === 'goal') {
      if (collectedStars.length < level.mazeData.requiredStars) {
        onStepWrong(
          `Almost there! Gather all ${level.mazeData.requiredStars} golden stars before finishing!`
        );
      } else {
        onStepSuccess();
        triggerComplete();
      }
    }
  };

  useEffect(() => {
    if (externalMazeTap) {
      moveMazeTo(externalMazeTap.x, externalMazeTap.y);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalMazeTap?.seq]);

  // ============================================================================
  // RENDER MECHANIC BOARDS
  // ============================================================================

  if (level.mechanic === 'match-slots' && level.matchData) {
    const { slots, tokens } = level.matchData;
    const placedTokenIds = new Set(Object.values(matchedSlots));

    const attemptPlace = (slotId: string, tokenId: string) => {
      const slot = slots.find((s) => s.slotId === slotId);
      if (!slot || matchedSlots[slotId]) return;
      if (slot.acceptsTokenId === tokenId) {
        const next = { ...matchedSlots, [slotId]: tokenId };
        setMatchedSlots(next);
        setSelectedTokenId(null);
        onStepSuccess();
        if (Object.keys(next).length === slots.length) {
          triggerComplete();
        }
      } else {
        setSelectedTokenId(null);
        triggerMistake(slotId, `Let’s try another spot! Look closely at the ${slot.label} outline.`);
      }
    };

    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
        {/* Target Slots */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
          {slots.map((slot) => {
            const matchedId = matchedSlots[slot.slotId];
            const matchedTok = tokens.find((t) => t.id === matchedId);
            const isHighlighted = showHint && selectedTokenId === slot.acceptsTokenId;

            return (
              <button
                key={slot.slotId}
                type="button"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedId = e.dataTransfer.getData('text/plain') || selectedTokenId;
                  if (droppedId) attemptPlace(slot.slotId, droppedId);
                }}
                onClick={() => {
                  if (selectedTokenId) attemptPlace(slot.slotId, selectedTokenId);
                }}
                className={`min-w-[104px] min-h-[104px] sm:min-w-[120px] sm:min-h-[120px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-3 transition-all ${
                  matchedTok
                    ? 'bg-emerald-50 border-emerald-400 scale-100 shadow-sm'
                    : isHighlighted
                    ? 'bg-amber-50 border-amber-400 scale-105 shadow-md'
                    : selectedTokenId
                    ? 'bg-white/95 border-sky-400 hover:scale-105 shadow-sm'
                    : 'bg-white/90 border-slate-300'
                } ${nudgeId === slot.slotId ? 'animate-wiggle-nudge' : ''}`}
              >
                {matchedTok ? (
                  <>
                    <ShapeTokenVisual shape={matchedTok.shape} color={matchedTok.color} emoji={matchedTok.emoji} size="md" />
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <Check className="w-3.5 h-3.5" /> {slot.label}
                    </span>
                  </>
                ) : (
                  <>
                    <ShapeTokenVisual
                      shape={slot.shape}
                      color={slot.color}
                      size="md"
                      shadowOnly={slot.isShadowOnly}
                      outlineOnly={!slot.isShadowOnly}
                    />
                    <span className="mt-1 text-xs font-bold text-slate-600">{slot.label}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Draggable / Tappable Token Tray */}
        <div className="bg-white/95 rounded-3xl p-3 sm:p-4 border border-slate-200/80 shadow-md flex flex-wrap items-center justify-center gap-3">
          {tokens.map((tok) => {
            const used = placedTokenIds.has(tok.id);
            const isSel = selectedTokenId === tok.id;
            return (
              <button
                key={tok.id}
                type="button"
                disabled={used}
                draggable={!used}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', tok.id);
                  setSelectedTokenId(tok.id);
                  audioEngine.playTap();
                }}
                onClick={() => {
                  audioEngine.playTap();
                  setSelectedTokenId(isSel ? null : tok.id);
                }}
                className={`min-w-[84px] min-h-[84px] rounded-2xl border-2 flex flex-col items-center justify-center p-2.5 transition-all ${
                  used
                    ? 'opacity-25 scale-90 border-slate-200 bg-slate-100 cursor-default'
                    : isSel
                    ? 'border-amber-500 bg-amber-50 -translate-y-1.5 shadow-lg ring-4 ring-amber-200'
                    : 'border-slate-200 bg-white hover:border-sky-300 hover:-translate-y-0.5 shadow-sm cursor-grab active:cursor-grabbing'
                }`}
              >
                <ShapeTokenVisual shape={tok.shape} color={tok.color} emoji={tok.emoji} size="md" />
                <span className="mt-1 text-xs font-bold text-slate-700 whitespace-nowrap">{tok.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (level.mechanic === 'pattern' && level.patternData) {
    const { sequence, choices, expectedIds } = level.patternData;
    const solvedToken = pickedChoiceId ? choices.find((c) => c.id === pickedChoiceId) : null;

    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
        <div className="bg-white/95 rounded-3xl p-4 border border-slate-200/80 shadow-md flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {sequence.map((item, idx) =>
            item ? (
              <div
                key={`${item.id}-${idx}`}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center"
              >
                <ShapeTokenVisual shape={item.shape} color={item.color} emoji={item.emoji} size={item.size ?? 'sm'} />
              </div>
            ) : (
              <div
                key={`missing-${idx}`}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all ${
                  solvedToken ? 'bg-emerald-50 border-emerald-400' : 'bg-amber-50 border-amber-400'
                }`}
              >
                {solvedToken ? (
                  <ShapeTokenVisual
                    shape={solvedToken.shape}
                    color={solvedToken.color}
                    emoji={solvedToken.emoji}
                    size={solvedToken.size ?? 'md'}
                  />
                ) : (
                  <HelpCircle className="w-7 h-7 text-amber-500" />
                )}
              </div>
            )
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {choices.map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => {
                if (expectedIds.includes(ch.id)) {
                  setPickedChoiceId(ch.id);
                  onStepSuccess();
                  triggerComplete();
                } else {
                  triggerMistake(ch.id, 'Close! Say the pattern rhythm out loud and try one more!');
                }
              }}
              className={`min-w-[96px] min-h-[92px] rounded-2xl bg-white border-2 border-slate-200 hover:border-amber-400 p-3 flex flex-col items-center justify-center shadow-sm transition-transform active:scale-95 ${
                nudgeId === ch.id ? 'animate-wiggle-nudge border-violet-300' : ''
              }`}
            >
              <ShapeTokenVisual shape={ch.shape} color={ch.color} emoji={ch.emoji} size={ch.size ?? 'md'} />
              <span className="mt-1 text-xs font-bold text-slate-700 whitespace-nowrap">{ch.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (level.mechanic === 'memory-cards') {
    const flipCard = (uid: string, pairId: string) => {
      if (lockMemoryRef.current || flippedUids.includes(uid) || matchedPairIds.includes(pairId)) return;
      audioEngine.playTap();
      const nextFlipped = [...flippedUids, uid];
      setFlippedUids(nextFlipped);

      if (nextFlipped.length === 2) {
        const [firstUid, secondUid] = nextFlipped;
        const c1 = shuffledCards.find((c) => c.uid === firstUid);
        const c2 = shuffledCards.find((c) => c.uid === secondUid);
        if (c1 && c2 && c1.pairId === c2.pairId) {
          const nextMatched = [...matchedPairIds, c1.pairId];
          setMatchedPairIds(nextMatched);
          setFlippedUids([]);
          onStepSuccess();
          if (nextMatched.length === (level.memoryCardsData?.pairs.length ?? 0)) {
            triggerComplete();
          }
        } else {
          lockMemoryRef.current = true;
          setMistakes((m) => m + 1);
          window.setTimeout(() => {
            setFlippedUids([]);
            lockMemoryRef.current = false;
          }, 850);
        }
      }
    };

    const cols = shuffledCards.length <= 4 ? 'grid-cols-2 max-w-xs' : shuffledCards.length <= 6 ? 'grid-cols-3 max-w-md' : shuffledCards.length <= 8 ? 'grid-cols-4 max-w-lg' : 'grid-cols-5 max-w-2xl';

    return (
      <div className={`w-full mx-auto grid ${cols} gap-2.5 sm:gap-3`}>
        {shuffledCards.map((card) => {
          const isOpen = flippedUids.includes(card.uid) || matchedPairIds.includes(card.pairId);
          const pal = getTokenPalette(card.color);
          return (
            <button
              key={card.uid}
              type="button"
              onClick={() => flipCard(card.uid, card.pairId)}
              style={isOpen ? { backgroundColor: pal.softBg, borderColor: pal.fill } : undefined}
              className={`min-h-[82px] sm:min-h-[96px] rounded-2xl border-2 flex flex-col items-center justify-center p-2 transition-all active:scale-95 ${
                isOpen
                  ? 'shadow-md'
                  : 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-600 text-white shadow-sm hover:-translate-y-0.5'
              }`}
            >
              {isOpen ? (
                <>
                  <span className="text-3xl sm:text-4xl leading-none">{card.emoji}</span>
                  <span className="mt-1 text-xs font-bold text-slate-700">{card.label}</span>
                </>
              ) : (
                <Sparkles className="w-7 h-7 text-emerald-50" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (level.mechanic === 'memory-sequence' && level.memorySequenceData) {
    const { pads, sequence } = level.memorySequenceData;
    return (
      <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-700 bg-white/90 px-4 py-1.5 rounded-xl border border-slate-200">
            {seqPhase === 'watching' ? 'Watch & listen...' : `Your turn! (${userSeq.length}/${sequence.length})`}
          </span>
          <button
            type="button"
            onClick={playSequenceDemo}
            className="min-h-[44px] px-4 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            Replay Glow
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {pads.map((pad) => {
            const isLit = litPadId === pad.id;
            const pal = getTokenPalette(pad.color);
            return (
              <button
                key={pad.id}
                type="button"
                disabled={seqPhase === 'watching'}
                onClick={() => {
                  audioEngine.playNote(pad.noteHz);
                  setLitPadId(pad.id);
                  window.setTimeout(() => setLitPadId(null), 260);
                  const expected = sequence[userSeq.length];
                  if (pad.id === expected) {
                    const next = [...userSeq, pad.id];
                    setUserSeq(next);
                    if (next.length === sequence.length) {
                      onStepSuccess();
                      triggerComplete();
                    }
                  } else {
                    setUserSeq([]);
                    triggerMistake(pad.id, 'Almost! Watch the glowing pattern again.');
                    window.setTimeout(playSequenceDemo, 650);
                  }
                }}
                style={{
                  backgroundColor: isLit ? pal.fill : pal.softBg,
                  borderColor: pal.stroke,
                }}
                className={`min-w-[100px] min-h-[100px] rounded-3xl border-2 flex flex-col items-center justify-center p-3 transition-transform ${
                  isLit ? 'scale-110 shadow-xl text-white' : 'hover:scale-105 shadow-sm text-slate-800'
                } ${nudgeId === pad.id ? 'animate-wiggle-nudge' : ''}`}
              >
                <span className="text-4xl leading-none">{pad.emoji}</span>
                <span className="mt-1.5 text-xs font-bold">{pad.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (level.mechanic === 'memory-hide' && level.memoryHideData) {
    const { mode, spots, targetIds } = level.memoryHideData;
    return (
      <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-700 bg-white/90 px-4 py-1.5 rounded-xl border border-slate-200">
            {hidePhase === 'peek'
              ? 'Look closely and remember!'
              : mode === 'swap'
              ? 'Which spot changed?'
              : 'Tap where the treasure hid!'}
          </span>
          <button
            type="button"
            onClick={() => {
              setHidePhase('peek');
              window.setTimeout(() => setHidePhase('guess'), 2000);
            }}
            className="min-h-[44px] px-4 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 shadow-sm"
          >
            Peek Again
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
          {spots.map((spot) => {
            const isTarget = targetIds.includes(spot.id);
            const isFound = foundHideIds.includes(spot.id);
            const pal = getTokenPalette(spot.color);

            let displayEmoji = spot.emoji;
            if (hidePhase === 'peek' && mode === 'hide' && isTarget) displayEmoji = '🐥';
            if (hidePhase === 'peek' && mode === 'fog' && isTarget) displayEmoji = '🌰';
            if (hidePhase === 'guess' && mode === 'swap' && isTarget) displayEmoji = '🎁';
            if (hidePhase === 'guess' && mode === 'fog' && !isFound) displayEmoji = '🌫️';

            return (
              <button
                key={spot.id}
                type="button"
                disabled={hidePhase === 'peek' || isFound}
                onClick={() => {
                  if (isTarget) {
                    const next = [...foundHideIds, spot.id];
                    setFoundHideIds(next);
                    onStepSuccess();
                    if (next.length === targetIds.length) {
                      triggerComplete();
                    }
                  } else {
                    triggerMistake(spot.id, 'Not behind that one! Try another cozy spot!');
                  }
                }}
                style={{ backgroundColor: isFound ? '#ECFDF5' : pal.softBg, borderColor: isFound ? '#10B981' : pal.stroke }}
                className={`min-h-[104px] rounded-3xl border-2 flex flex-col items-center justify-center p-3 transition-all ${
                  hidePhase === 'peek' && isTarget ? 'ring-4 ring-amber-300 scale-105' : 'hover:-translate-y-0.5'
                } ${nudgeId === spot.id ? 'animate-wiggle-nudge' : ''}`}
              >
                <span className="text-4xl leading-none">{isFound ? '🌟' : displayEmoji}</span>
                <span className="mt-1.5 text-xs font-bold text-slate-700">{spot.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (level.mechanic === 'maze' && mazeState && level.mazeData) {
    return (
      <div className="w-full max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Compact Touch/Mouse D-Pad */}
        <div className="bg-white/95 rounded-3xl p-3 border border-slate-200/80 shadow-md flex items-center gap-4">
          <div className="grid grid-cols-3 gap-1.5">
            <div />
            <button
              type="button"
              aria-label="Move Up"
              onClick={() => moveMazeTo(mazeState.playerX, mazeState.playerY - 1)}
              className="w-12 h-12 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center shadow-sm active:scale-95"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
            <div />
            <button
              type="button"
              aria-label="Move Left"
              onClick={() => moveMazeTo(mazeState.playerX - 1, mazeState.playerY)}
              className="w-12 h-12 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              aria-label="Move Down"
              onClick={() => moveMazeTo(mazeState.playerX, mazeState.playerY + 1)}
              className="w-12 h-12 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center shadow-sm active:scale-95"
            >
              <ArrowDown className="w-6 h-6" />
            </button>
            <button
              type="button"
              aria-label="Move Right"
              onClick={() => moveMazeTo(mazeState.playerX + 1, mazeState.playerY)}
              className="w-12 h-12 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center shadow-sm active:scale-95"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          <div className="text-left pr-2">
            <p className="font-display text-sm font-semibold text-slate-800">
              Stars: {mazeState.collectedStars.length} / {level.mazeData.requiredStars}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 max-w-[160px]">
              Tap arrows or tap any nearby 3D grass tile to hop!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (level.mechanic === 'sort-bins' && level.sortData) {
    const { bins, items } = level.sortData;
    const attemptSort = (binCategory: string, itemId: string) => {
      const item = items.find((i) => i.id === itemId);
      if (!item || sortedItems[itemId]) return;
      if (item.targetCategory === binCategory) {
        const next = { ...sortedItems, [itemId]: binCategory };
        setSortedItems(next);
        setSelectedSortItemId(null);
        onStepSuccess();
        if (Object.keys(next).length === items.length) {
          triggerComplete();
        }
      } else {
        setSelectedSortItemId(null);
        triggerMistake(binCategory, `Oops, ${item.label} belongs in a different box!`);
      }
    };

    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
        {/* Bins */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {bins.map((bin) => {
            const pal = getTokenPalette(bin.accentColor);
            const countInside = Object.values(sortedItems).filter((c) => c === bin.acceptsCategory).length;
            return (
              <button
                key={bin.binId}
                type="button"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData('text/plain') || selectedSortItemId;
                  if (id) attemptSort(bin.acceptsCategory, id);
                }}
                onClick={() => {
                  if (selectedSortItemId) attemptSort(bin.acceptsCategory, selectedSortItemId);
                }}
                style={{ backgroundColor: pal.softBg, borderColor: pal.stroke }}
                className={`min-h-[96px] rounded-3xl border-2 border-dashed p-3 flex flex-col items-center justify-center transition-all ${
                  selectedSortItemId ? 'hover:scale-105 shadow-md' : 'shadow-sm'
                } ${nudgeId === bin.acceptsCategory ? 'animate-wiggle-nudge' : ''}`}
              >
                <span className="font-display text-base font-bold text-slate-800">{bin.label}</span>
                <span className="text-xs font-bold text-slate-600 mt-1">{countInside} sorted</span>
              </button>
            );
          })}
        </div>

        {/* Unsorted Items */}
        <div className="bg-white/95 rounded-3xl p-3 border border-slate-200 shadow-md flex flex-wrap items-center justify-center gap-2.5">
          {items.map((item) => {
            const done = Boolean(sortedItems[item.id]);
            const isSel = selectedSortItemId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={done}
                draggable={!done}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', item.id);
                  setSelectedSortItemId(item.id);
                  audioEngine.playTap();
                }}
                onClick={() => {
                  audioEngine.playTap();
                  setSelectedSortItemId(isSel ? null : item.id);
                }}
                className={`min-w-[82px] min-h-[82px] rounded-2xl border-2 p-2 flex flex-col items-center justify-center transition-all ${
                  done
                    ? 'opacity-25 scale-90 bg-slate-100 border-slate-200'
                    : isSel
                    ? 'border-amber-500 bg-amber-50 -translate-y-1 shadow-lg ring-4 ring-amber-200'
                    : 'bg-white border-slate-200 hover:border-sky-300 shadow-sm'
                }`}
              >
                <ShapeTokenVisual shape={item.shape} color={item.color} emoji={item.emoji} size={item.size ?? 'md'} />
                <span className="mt-1 text-[11px] font-bold text-slate-700 whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (level.mechanic === 'odd-one-out' && level.oddOneData) {
    const { items, oddId } = level.oddOneData;
    return (
      <div className="w-full max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item) => {
          const picked = pickedChoiceId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === oddId) {
                  setPickedChoiceId(item.id);
                  onStepSuccess();
                  triggerComplete();
                } else {
                  triggerMistake(item.id, 'Look closely—three items share something special!');
                }
              }}
              className={`min-h-[116px] rounded-3xl border-2 p-3 flex flex-col items-center justify-center transition-all ${
                picked
                  ? 'bg-emerald-50 border-emerald-400 scale-105 shadow-md'
                  : 'bg-white border-slate-200 hover:border-amber-400 shadow-sm active:scale-95'
              } ${nudgeId === item.id ? 'animate-wiggle-nudge' : ''}`}
            >
              <ShapeTokenVisual shape={item.shape} color={item.color} emoji={item.emoji} size="md" />
              <span className="mt-2 text-xs font-bold text-slate-700">{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (level.mechanic === 'counting' && level.countingData) {
    const { targetCount, itemEmoji, itemLabel, choices } = level.countingData;
    return (
      <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
        <div className="bg-white/95 rounded-3xl p-4 border border-slate-200 shadow-md flex flex-wrap items-center justify-center gap-3">
          {Array.from({ length: targetCount }).map((_, idx) => (
            <span
              key={idx}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-3xl animate-gentle-float"
              style={{ animationDelay: `${idx * 0.15}s` }}
              aria-label={`${itemLabel} ${idx + 1}`}
            >
              {itemEmoji}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {choices.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => {
                if (num === targetCount) {
                  setPickedChoiceId(String(num));
                  onStepSuccess();
                  triggerComplete();
                } else {
                  triggerMistake(String(num), 'Let’s count each one together slowly!');
                }
              }}
              className={`min-w-[84px] min-h-[72px] rounded-2xl border-2 font-display text-3xl font-bold tabular-nums transition-all active:scale-95 ${
                pickedChoiceId === String(num)
                  ? 'bg-emerald-500 text-white border-emerald-600 scale-105'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-amber-400 shadow-sm'
              } ${nudgeId === String(num) ? 'animate-wiggle-nudge' : ''}`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (level.mechanic === 'picture-puzzle' && level.picturePuzzleData) {
    const { cols, tiles, choices } = level.picturePuzzleData;
    const missingTile = tiles.find((t) => t.isMissing);
    const solvedChoice = pickedChoiceId ? choices.find((c) => c.id === pickedChoiceId) : null;

    return (
      <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
        <div className={`grid ${cols === 3 ? 'grid-cols-3 max-w-md' : 'grid-cols-2 max-w-xs'} mx-auto gap-2 bg-white/95 p-3 rounded-3xl border border-slate-200 shadow-md w-full`}>
          {tiles.map((tile) => {
            const pal = getTokenPalette(tile.color);
            const filled = tile.isMissing && solvedChoice;
            return (
              <div
                key={tile.id}
                style={{ backgroundColor: tile.isMissing && !filled ? '#FEF3C7' : pal.softBg, borderColor: pal.stroke }}
                className={`h-20 sm:h-24 rounded-2xl border-2 flex flex-col items-center justify-center ${
                  tile.isMissing && !filled ? 'border-dashed' : ''
                }`}
              >
                <span className="text-3xl leading-none">
                  {tile.isMissing ? (filled ? solvedChoice.emoji : '❓') : tile.emoji}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {choices.map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => {
                const isCorrect = missingTile && ch.emoji === missingTile.emoji;
                if (isCorrect) {
                  setPickedChoiceId(ch.id);
                  onStepSuccess();
                  triggerComplete();
                } else {
                  triggerMistake(ch.id, 'Hmm, let’s pick the piece that fits the sky picture!');
                }
              }}
              className={`min-w-[100px] min-h-[84px] rounded-2xl bg-white border-2 border-slate-200 hover:border-amber-400 p-3 flex flex-col items-center justify-center shadow-sm active:scale-95 ${
                nudgeId === ch.id ? 'animate-wiggle-nudge' : ''
              }`}
            >
              <span className="text-3xl leading-none">{ch.emoji}</span>
              <span className="mt-1 text-xs font-bold text-slate-700">{ch.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (level.mechanic === 'clue-riddle' && level.clueRiddleData) {
    const { clues, choices, correctId } = level.clueRiddleData;
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
        <div className="bg-white/95 rounded-3xl p-3 border border-slate-200 shadow-md flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs font-bold text-slate-500">Clues:</span>
          {clues.map((clue, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-1.5"
            >
              {clue.color && <span className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: getTokenPalette(clue.color).fill }} />}
              <span className="text-xs sm:text-sm font-bold text-slate-800">{clue.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {choices.map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => {
                if (ch.id === correctId) {
                  setPickedChoiceId(ch.id);
                  onStepSuccess();
                  triggerComplete();
                } else {
                  triggerMistake(ch.id, 'Check ALL the clues at the top and try again!');
                }
              }}
              className={`min-h-[112px] rounded-3xl border-2 p-3 flex flex-col items-center justify-center transition-all active:scale-95 ${
                pickedChoiceId === ch.id
                  ? 'bg-emerald-50 border-emerald-400 scale-105 shadow-md'
                  : 'bg-white border-slate-200 hover:border-amber-400 shadow-sm'
              } ${nudgeId === ch.id ? 'animate-wiggle-nudge' : ''}`}
            >
              <ShapeTokenVisual shape={ch.shape} color={ch.color} emoji={ch.emoji} size={ch.size ?? 'md'} />
              <span className="mt-2 text-xs font-bold text-slate-700">{ch.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

using UnityEngine;

namespace WonderWiggles.Puzzles
{
    public enum PuzzleMechanicType
    {
        MatchSlots, Pattern, MemoryCards, MemorySequence, MemoryHide,
        Maze, SortBins, OddOneOut, Counting, PicturePuzzle, ClueRiddle
    }

    [CreateAssetMenu(fileName = "Level_01", menuName = "WonderWiggles/Puzzle Level Data")]
    public class PuzzleDataSO : ScriptableObject
    {
        public int levelId;
        public int worldId;
        public string levelTitle;
        public PuzzleMechanicType mechanic;
        public AudioClip spokenInstructionClip;
        [TextArea] public string gentleHintText;
    }
}

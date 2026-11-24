using UnityEngine;
using UnityEngine.SceneManagement;

namespace WonderWiggles.Managers
{
    public enum DifficultyMode { Auto, Beginner, Intermediate, Advanced }

    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("Active Selection")]
        public int CurrentWorldId = 1;
        public int CurrentLevelId = 1;
        public string SelectedCharacterId = "wobble";
        public DifficultyMode Difficulty = DifficultyMode.Auto;
        public bool IsPaused { get; private set; }

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Application.targetFrameRate = 60;
        }

        public void LoadLevel(int worldId, int levelId)
        {
            CurrentWorldId = worldId;
            CurrentLevelId = levelId;
            IsPaused = false;
            Time.timeScale = 1f;
            SceneManager.LoadScene("PuzzleGameplay");
        }

        public void SetPaused(bool paused)
        {
            IsPaused = paused;
            Time.timeScale = paused ? 0f : 1f;
        }
    }
}

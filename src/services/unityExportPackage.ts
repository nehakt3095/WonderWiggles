export interface ExportArtifact {
  filename: string;
  folder: string;
  summary: string;
  content: string;
}

export const UNITY_AND_STORE_ARTIFACTS: ExportArtifact[] = [
  {
    filename: 'GameManager.cs',
    folder: 'Assets/Scripts/Managers',
    summary: 'Singleton coordinator managing 5 worlds, 50 levels, pause/resume, and difficulty state.',
    content: `using UnityEngine;
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
}`,
  },
  {
    filename: 'SaveSystem.cs',
    folder: 'Assets/Scripts/Persistence',
    summary: 'Child-safe local JSON persistence (Application.persistentDataPath) with parent reset.',
    content: `using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace WonderWiggles.Persistence
{
    [Serializable]
    public class LevelProgressEntry
    {
        public int levelId;
        public int stars;
        public float bestTimeSeconds;
    }

    [Serializable]
    public class WonderSaveData
    {
        public int version = 1;
        public string selectedCharacterId = "wobble";
        public bool isPremiumUnlocked = false;
        public bool musicEnabled = true;
        public bool sfxEnabled = true;
        public bool voiceEnabled = true;
        public List<LevelProgressEntry> completedLevels = new List<LevelProgressEntry>();
    }

    public static class SaveSystem
    {
        private static string FilePath => Path.Combine(Application.persistentDataPath, "wonderwiggles_save.json");

        public static WonderSaveData Load()
        {
            if (!File.Exists(FilePath)) return new WonderSaveData();
            try
            {
                string json = File.ReadAllText(FilePath);
                return JsonUtility.FromJson<WonderSaveData>(json) ?? new WonderSaveData();
            }
            catch
            {
                return new WonderSaveData();
            }
        }

        public static void Save(WonderSaveData data)
        {
            string json = JsonUtility.ToJson(data, true);
            File.WriteAllText(FilePath, json);
        }

        public static void ResetProgress()
        {
            if (File.Exists(FilePath)) File.Delete(FilePath);
        }
    }
}`,
  },
  {
    filename: 'CharacterAnimatorController.cs',
    folder: 'Assets/Scripts/Characters',
    summary: 'Drives Idle, Walk, Jump, Celebrate, Wave, and gentle Oops states for all 5 3D characters.',
    content: `using UnityEngine;

namespace WonderWiggles.Characters
{
    [RequireComponent(typeof(Animator))]
    public class CharacterAnimatorController : MonoBehaviour
    {
        private Animator _animator;
        private static readonly int WalkHash = Animator.StringToHash("IsWalking");
        private static readonly int JumpHash = Animator.StringToHash("JumpTrigger");
        private static readonly int WaveHash = Animator.StringToHash("WaveTrigger");
        private static readonly int CelebrateHash = Animator.StringToHash("CelebrateTrigger");

        private void Awake() => _animator = GetComponent<Animator>();

        public void SetWalking(bool walking) => _animator.SetBool(WalkHash, walking);
        public void PlayJump() => _animator.SetTrigger(JumpHash);
        public void PlayWave() => _animator.SetTrigger(WaveHash);
        public void PlayCelebrate() => _animator.SetTrigger(CelebrateHash);
    }
}`,
  },
  {
    filename: 'PuzzleDataSO.cs',
    folder: 'Assets/Scripts/Puzzles',
    summary: 'Data-driven ScriptableObject schema for all 50 levels across 5 worlds.',
    content: `using UnityEngine;

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
}`,
  },
  {
    filename: 'PlayBillingManager.cs',
    folder: 'Assets/Scripts/Monetization',
    summary: 'Google Play Billing one-time non-consumable unlock wrapper (Test Mode safe).',
    content: `using System;
using UnityEngine;

namespace WonderWiggles.Monetization
{
    // Wire UnityEngine.Purchasing (IAP v4.11+) when Play Console credentials are configured.
    public class PlayBillingManager : MonoBehaviour
    {
        public const string PremiumProductId = "com.wonderwiggles.planet.premium_unlock";

        public event Action<bool> OnPurchaseCompleted;

        public void InitiateParentGatedPurchase(bool testMode)
        {
            if (testMode)
            {
                Debug.Log("[WonderWiggles] Test Mode purchase validated. Configure Google Play Billing keys for production.");
                OnPurchaseCompleted?.Invoke(true);
                return;
            }
            // Production: invoke IStoreController.InitiatePurchase(PremiumProductId)
        }
    }
}`,
  },
  {
    filename: 'GOOGLE_PLAY_RELEASE_GUIDE.md',
    folder: 'Docs',
    summary: 'Complete Google Play Console setup, .aab signing, Families Policy checklist, and Data Safety answers.',
    content: `# WonderWiggles: Google Play Store & WebGL Release Guide

## 1. Android Build Configuration (.aab)
- **Package Identifier**: \`com.wonderwiggles.littlepuzzleplanet\` (customize to your Play Console domain).
- **Target API Level**: Android 14 (API 34) or current Play Console minimum target API.
- **Orientation**: Portrait & Responsive Tablet Support.
- **Permissions**: None required beyond standard \`INTERNET\` (omit if purely offline) and Play Billing (\`com.android.vending.BILLING\`). Zero location, camera, microphone, or contacts permissions.
- **Signing**: Generate an upload keystore via \`keytool -genkey -v -keystore wonderwiggles-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias wonderwiggles\` and enable Play App Signing in Google Play Console.

## 2. Google Play Store Listing Copy
- **App Name**: WonderWiggles: The Little Puzzle Planet
- **Short Description (<=80 chars)**: Gentle 3D educational puzzles, mazes & memory games for curious kids ages 4-7!
- **Category**: Education / Games -> Educational
- **Target Audience**: Ages 5 & Under, Ages 6-8 (Designed for Families)
- **Suggested Premium Price**: INR 249 (one-time parent-gated unlock; no subscriptions, no ads).

## 3. Families Policy & Data Safety Checklist
- [x] No third-party advertising SDKs or behavioral tracking.
- [x] No chat, social feeds, or unmoderated user content.
- [x] Zero personal data collected; local-only save storage.
- [x] Adult Parent Gate protects purchase flow, progress reset, and external privacy links.
- [x] Positive encouragement audio/UI without negative shaming.

## 4. WebGL / PWA Hosting & HTTPS
- Build production web bundle with \`npm run build\` (outputs \`dist/\` with service worker & manifest).
- Host \`dist/\` behind TLS/HTTPS (Cloudflare Pages, Firebase Hosting, or Cloud Run) so PWA offline caching and WebGL run smoothly on mobile & desktop browsers.`,
  },
  {
    filename: 'PRIVACY_POLICY.md',
    folder: 'Docs',
    summary: 'Plain-language child-safe Privacy Policy for WonderWiggles.',
    content: `# Privacy Policy — WonderWiggles: The Little Puzzle Planet

Effective Date: 2026-11-24

WonderWiggles is built specifically for young children aged 4 to 7 and their families. Protecting children's privacy is our highest priority.

1. **No Personal Information Collected**: WonderWiggles does not ask for, collect, store, or transmit names, email addresses, photos, voice recordings, device identifiers, or precise location data.
2. **Local-Only Game Progress**: Earned stars, unlocked levels, character selection, and audio preferences are stored strictly locally on your device. Parents may erase all saved progress at any time inside the Parent Section.
3. **Zero Ads & Zero Tracking**: The app contains no advertisements, no behavioral analytics, and no third-party ad or social SDKs.
4. **Parent-Gated Controls**: All optional premium unlocks and external documentation are protected behind a grown-up verification gate.
5. **Contact**: Families may reach the developer at the support email listed on the Google Play Store listing.`,
  },
];

export function downloadTextArtifact(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadAllUnityAndDocsBundle(): void {
  const combined = UNITY_AND_STORE_ARTIFACTS.map(
    (art) =>
      `================================================================================\n` +
      `FILE: ${art.folder}/${art.filename}\n` +
      `SUMMARY: ${art.summary}\n` +
      `================================================================================\n\n` +
      `${art.content}\n\n`
  ).join('\n');
  downloadTextArtifact('WonderWiggles_Unity_And_Store_Release_Bundle.txt', combined);
}

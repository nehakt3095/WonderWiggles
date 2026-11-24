using System;
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
}

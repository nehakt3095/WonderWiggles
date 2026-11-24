# WonderWiggles: Unity URP & Google Play Release Documentation

## 1. Environment Note
This repository provides:
- **Playable 3D WebGL / PWA Game** (`src/`): Built with Three.js, React 19, TypeScript, Web Audio API, Web Speech API, and offline service worker caching.
- **Modular Unity URP C# Scripts** (`unity-package/`): Core C# managers, SaveSystem, CharacterAnimatorController, PuzzleDataSO, and PlayBillingManager ready to drop into Unity 2022.3 LTS / Unity 6 URP.
- **Release & Compliance Docs** (`docs/`): Google Play Store listing text, Families Policy & Data Safety guide, Privacy Policy, and QA checklist.

*(A compiled Android `.aab` binary requires running Unity Editor + Android Build Support + Gradle with your upload keystore locally.)*

## 2. Step-by-Step Android `.aab` Build & Google Play Publishing Guide
1. Create a new **Unity 2022.3 LTS (URP)** project and copy `unity-package/*.cs` into `Assets/Scripts/`.
2. Install **Unity Input System**, **TextMeshPro**, and **Unity In-App Purchasing** via Package Manager.
3. Configure **Player Settings -> Android**:
   - Package Name: `com.wonderwiggles.littlepuzzleplanet`
   - Orientation: Portrait (plus Responsive Tablet)
   - Minimum API Level: Android 8.0 (API 26)
   - Target API Level: Latest Play Console requirement (API 34+)
   - Scripting Backend: IL2CPP (ARMv7 + ARM64)
   - Enable **Build App Bundle (Google Play)** (`.aab`) and sign with your Upload Keystore.
4. Set up Google Play Console:
   - Upload signed `.aab` to Internal Testing first.
   - Complete **App Content -> Target Audience** (Ages 5 & Under, 6–8), **Families Policy**, **Data Safety** (No personal data collected), and **Content Rating** (IARC Everyone / PEGI 3).
   - Configure In-App Product `com.wonderwiggles.planet.premium_unlock` at ₹249.

## 3. Google Play Store Listing Materials
- **Title**: WonderWiggles: The Little Puzzle Planet
- **Short Description**: Gentle 3D educational puzzles, mazes & memory games for curious kids ages 4-7!
- **Full Description**:
  Join Wobble and friends on WonderWiggles, a peaceful 3D puzzle planet crafted for young learners ages 4–7. Explore 50 thoughtfully designed levels across 5 magical worlds—Shape Island, Memory Forest, Wobble's Maze, Magic Factory, and Cloud Kingdom.
  - Develops shape & color recognition, visual memory, spatial pathfinding, sorting, counting, and early logic.
  - Spoken audio cues and large touch controls designed for early readers.
  - Zero ads, zero tracking, zero chat, and a grown-up Parent Gate for full-planet unlocking.
- **Icon & Graphics**: `public/pwa-512x512.png` (512×512 store icon base) and `public/icon.svg`.

## 4. Web Production Hosting & HTTPS
1. Run `npm run build` to generate the static `dist/` bundle with PWA service worker and offline caching.
2. Deploy `dist/` to any HTTPS static host (Cloudflare Pages, Firebase Hosting, Netlify, or Cloud Run) with SPA fallback to `index.html`.

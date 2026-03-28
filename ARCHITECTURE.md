# Architecture: Auto-Update System

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   USER'S ANDROID DEVICE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐                                           │
│  │   React App      │                                           │
│  │   (Ionic/React)  │                                           │
│  └────────┬─────────┘                                           │
│           │                                                     │
│           │ (1) App Launches                                    │
│           ▼                                                     │
│  ┌────────────────────────────────────────┐                    │
│  │  App.tsx                               │                    │
│  │  ├─ useEffect hook                     │                    │
│  │  ├─ checkForUpdates() called           │                    │
│  │  └─ Axios POST to backend              │                    │
│  └────────┬─────────────────┬─────────────┘                    │
│           │                 │                                   │
│           │ (2)             │ (3) Fetch stored version         │
│           ▼                 ▼                                   │
│  ┌──────────────────────────────────────────┐                  │
│  │  updateService.ts                        │                  │
│  │  ├─ getCurrentVersion()                  │                  │
│  │  ├─ checkForUpdates()                    │                  │
│  │  ├─ compareVersions()                    │                  │
│  │  └─ localStorage management              │                  │
│  └────────┬────────────────────────────────┘                   │
│           │                                                     │
│           │ (4) HTTP POST Request                              │
│           ▼                                                     │
│  ┌──────────────────────────────────────────┐                  │
│  │  Network Layer (Capacitor)              │                  │
│  │  ├─ CORS enabled                         │                  │
│  │  ├─ SSL/TLS secure                       │                  │
│  │  └─ Timeout handling                     │                  │
│  └────────┬────────────────────────────────┘                   │
│           │                                                     │
└───────────┼─────────────────────────────────────────────────────┘
            │                          ┌─────────────────────────┐
            │                          │  Google Play Store      │
            │                          │                         │
            │                          │  • App versioning       │
            │                          │  • Download/Install     │
            │                          │  • Rollout tracking     │
            │                          └─────────────────────────┘
            │                                      ▲
            │                                      │
            │  (5) Network Request                │ (10) Opens Play Store
            ▼                                      │
┌───────────────────────────────────────────────────────────────┐
│              BACKEND SERVER (Python/FastAPI)                  │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  routers/version.py                                    │ │
│  │  ├─ POST /api/version/check                            │ │
│  │  ├─ Receives: currentVersion, platform                 │ │
│  │  └─ Returns: VersionCheckResponse                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│            │                                                  │
│  (6)        ▼                                                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  VERSION LOGIC                                         │ │
│  │  ├─ LATEST_APP_VERSION = "0.0.2"                       │ │
│  │  ├─ MIN_REQUIRED_VERSION = "0.0.1"                     │ │
│  │  ├─ VERSION_NOTES = {...}                              │ │
│  │  │                                                      │ │
│  │  ├─ if currentVersion < latestVersion:                 │ │
│  │  │    → isUpdateAvailable = true                       │ │
│  │  │                                                      │ │
│  │  ├─ if currentVersion < minRequiredVersion:            │ │
│  │  │    → isForceUpdate = true                           │ │
│  │  │                                                      │ │
│  │  └─ Return URLs for android/ios                        │ │
│  └──────────────────────────────────────────┬──────────────┘ │
│                                      (7)    │                 │
│  ┌──────────────────────────────────────────┘──────────────┐ │
│  │  Response JSON:                                         │ │
│  │  {                                                      │ │
│  │    "latestVersion": "0.0.2",                            │ │
│  │    "minRequiredVersion": "0.0.1",                       │ │
│  │    "updateUrl": "https://play.google.com/...",          │ │
│  │    "releaseNotes": "• New features...",                 │ │
│  │    "isForceUpdate": false                               │ │
│  │  }                                                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            │ (8) Response arrives
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                   USER'S ANDROID DEVICE                       │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  updateService.ts (continued)                         │  │
│  │  ├─ Parse response                                    │  │
│  │  ├─ Compare versions                                  │  │
│  │  └─ Return UpdateCheckResult                          │  │
│  └────────┬─────────────────────────────────────────────┘  │
│           │                                                 │
│           │ (9) setState() triggers re-render              │
│           ▼                                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  UpdateModal.tsx                                      │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ Update Available                               │  │  │
│  │  │                                                 │  │  │
│  │  │ Version 0.0.2                                  │  │  │
│  │  │                                                 │  │  │
│  │  │ Release Notes:                                  │  │  │
│  │  │ • New features                                  │  │  │
│  │  │ • Performance improvements                      │  │  │
│  │  │                                                 │  │  │
│  │  │  [ Later ]  [ Update Now ]                       │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  States (prop-controlled):                           │  │
│  │  ├─ isOpen: boolean                                 │  │
│  │  ├─ versionInfo: VersionInfo                        │  │
│  │  ├─ isForceUpdate: boolean                          │  │
│  │  └─ isLoading: boolean                              │  │
│  └────────┬────────────────────────────────────────────┘  │
│           │                                                 │
│           ├─────────────────┬──────────────────────┐       │
│           │                 │                      │       │
│    (11)   │ (12)            │ (13)                │       │
│  Update   │ Later           │ Dismiss             │       │
│  Now      │ (optional)      │ Dismissed           │       │
│    │      │                 │                     │       │
│    ▼      ▼                 ▼                     │       │
│  Open   Store app    localStorage.setItem(        │       │
│  Play   continues    'dismissedUpdateVersion',   │       │
│  Store  normally     '0.0.2')                    │       │
│         │                                         │       │
│         └─────────────────┬──────────────────────┘       │
│                          │                               │
│                        Next Launch                       │
│                          │                               │
│                     Check localStorage                 │
│                          │                               │
│                     No modal shown                      │
│                (until new version released)            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Component Interaction Map

```
┌──────────────────────────────────────────────────────────┐
│                      src/App.tsx                         │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ State Management                               │  │
│  │ ├─ updateModalOpen: boolean                    │  │
│  │ ├─ updateInfo: VersionInfo | null              │  │
│  │ ├─ isForceUpdate: boolean                      │  │
│  │ └─ isUpdating: boolean                         │  │
│  └──────────────────────────────────────────────────┘  │
│                      │                                   │
│                   calls                                 │
│                      │                                   │
│          ┌───────────┴────────────┐                     │
│          ▼                        ▼                     │
│  ┌──────────────────┐  ┌──────────────────────┐        │
│  │ updateService   │  │ UpdateModal Component │        │
│  │ - checkFor      │  │ - Beautiful UI        │        │
│  │   Updates()     │  │ - Release notes       │        │
│  │ - compare       │  │ - User actions       │        │
│  │   Versions()    │  │ - Responsive design  │        │
│  │ - localStorage  │  │                      │        │
│  │   management    │  │ Props:               │        │
│  └──────────────────┘  │ ├─ isOpen            │        │
│                        │ ├─ versionInfo       │        │
│                        │ ├─ isForceUpdate     │        │
│                        │ ├─ onUpdate          │        │
│                        │ ├─ onDismiss         │        │
│                        │ └─ isLoading         │        │
│                        └──────────────────────┘        │
└──────────────────────────────────────────────────────────┘
```

---

## Data Flow: From App Launch to Update Modal

```
PHASE 1: App Initialization
┌─────────────────────────┐
│  User opens app         │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  React renders App.tsx  │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  useEffect hook runs (on mount)         │
│  ├─ No dependencies specified           │
│  └─ Runs once on component mount        │
└────────────┬────────────────────────────┘
             │
PHASE 2: Version Checking
             ▼
┌─────────────────────────────────────────┐
│  checkForUpdates() called               │
│  (from updateService)                   │
└────────────┬────────────────────────────┘
             │
             ├─ Get current version from app
             │
             ├─ Fetch POST /api/version/check
             │
             └─ Receives VersionCheckResponse
                │
PHASE 3: Response Handling
                ▼
         ┌──────────────────┐
         │ Update Available?│
         └────────┬─────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
       YES                  NO
        │                   │
        ▼                   ▼
   ┌─────────┐          ┌──────────────┐
   │ Already │          │ Do Nothing   │
   │ Dismissed?         │ (silently)   │
   └────┬────┘          └──────────────┘
        │
    ┌───┴────┐
    │        │
   YES      NO
    │        │
    ▼        ▼
┌──────┐  ┌──────────────────────┐
│Skip  │  │ Show Update Modal    │
│Modal │  │                      │
└──────┘  │ setState({            │
           │   updateModalOpen:true
           │   updateInfo,
           │   isForceUpdate,
           │ })
           └──────────┬───────────┘
                      │
PHASE 4: User Interaction
                      ▼
              ┌──────────────────┐
              │ User sees Modal  │
              └────────┬─────────┘
                       │
           ┌───────────┼───────────┐
           │           │           │
        Update       Later      Force
        Now        (optional)   Update
           │           │       (can't dismiss)
           ▼           ▼           │
        ┌──────┐   ┌────────┐     │
        │Open  │   │Close & │     │
        │Play  │   │Never   │     │
        │Store │   │Show    │     │
        │      │   │Again   │     │
        └──────┘   └────────┘     │
                                  ▼
                           (can only update)
```

---

## Backend Version Management

```
backend/routers/version.py

┌────────────────────────────────────────┐
│ Version Constants (Easy to Update)    │
├────────────────────────────────────────┤
│                                        │
│ LATEST_APP_VERSION = "0.0.2"           │
│ (Update when new version ready)        │
│                                        │
│ MINIMUM_REQUIRED_VERSION = "0.0.1"     │
│ (Users below this must update)         │
│                                        │
└────────────────────────────────────────┘
             │
             ├─────────────────────────┐
             ▼                         ▼
┌──────────────────────────┐ ┌─────────────────────────────┐
│ VERSION_NOTES            │ │ URL Mapping                 │
│                          │ │                             │
│ {                        │ │ platform == "android"       │
│   "0.0.2": """           │ │   → Play Store URL          │
│     • Feature 1          │ │                             │
│     • Feature 2          │ │ platform == "ios"           │
│   """,                   │ │   → App Store URL           │
│   "0.0.1": """           │ │                             │
│     • Initial release    │ │ platform == "web"           │
│   """                    │ │   → (empty/custom)          │
│ }                        │ │                             │
│                          │ │                             │
└──────────────────────────┘ └─────────────────────────────┘

              │
              ▼

      API Endpoint Logic

┌────────────────────────────────────────┐
│ POST /api/version/check                │
│                                        │
│ Input: {                               │
│   currentVersion: string               │
│   platform: string                     │
│ }                                      │
│                                        │
│ Logic:                                 │
│ 1. Get LATEST_APP_VERSION              │
│ 2. Get MIN_REQUIRED_VERSION             │
│ 3. Compare versions                    │
│ 4. Determine update availability       │
│ 5. Determine forced update             │
│ 6. Get release notes                   │
│ 7. Return all info as JSON             │
│                                        │
│ Output: VersionCheckResponse {         │
│   latestVersion: "0.0.2"               │
│   minRequiredVersion: "0.0.1"          │
│   updateUrl: "https://play..."         │
│   releaseNotes: "• Feature 1\n..."     │
│   isForceUpdate: false                 │
│ }                                      │
└────────────────────────────────────────┘
```

---

## State Management Flow

```
App.tsx Component Lifecycle

Initial State
├─ updateModalOpen: false
├─ updateInfo: null
├─ isForceUpdate: false
└─ isUpdating: false

         │
         ├─ useEffect Hook (on mount)
         │
         ▼

checkForUpdates() Result
├─ updateAvailable: true
├─ isForceUpdate: false
└─ versionInfo: VersionInfo

         │
         ├─ setState Updates
         │
         ▼

New State
├─ updateModalOpen: true ✓
├─ updateInfo: VersionInfo ✓
├─ isForceUpdate: false ✓
└─ isUpdating: false

         │
         ├─ Re-render with new state
         │
         ▼

UpdateModal Props
├─ isOpen: true
├─ versionInfo: VersionInfo
├─ isForceUpdate: false
├─ onUpdate: handleUpdateClick
├─ onDismiss: handleDismiss
└─ isLoading: false

         │
         ├─ Modal Renders/Displays
         │
         ▼

User Interaction (onClick)
├─ handleUpdateClick()
│  └─ setIsUpdating(true)
│  └─ Open Play Store
│  └─ setUpdateModalOpen(false)
│
└─ handleDismiss()
   └─ setUpdateDismissed(version)
   └─ setUpdateModalOpen(false)
```

---

**This architecture ensures:**
- ✅ Separation of concerns
- ✅ Reusable components
- ✅ Easy version management
- ✅ Smooth user experience
- ✅ Scalable for future enhancements

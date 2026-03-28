# Quick Setup: Auto-Update Feature

## What's New ✨
✅ Auto-update checking on app launch
✅ Beautiful update notification modal
✅ Support for optional & forced updates
✅ Backend version management endpoint
✅ Play Store integration ready

---

## Quick Start (3 Steps)

### 1️⃣ Update Version Info
Edit `backend/routers/version.py`:
```python
LATEST_APP_VERSION = "0.0.2"  # Your new version

VERSION_NOTES = {
    "0.0.2": """• New Feature
• Improvements""",
}
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Build & Test
```bash
npm run build
npm run dev
```

Modal should appear automatically! ✓

---

## Before Pushing to Play Store

### Update App ID
File: `capacitor.config.ts`
```typescript
appId: 'com.your.company.appname',  // Your Play Store app ID
```

### Update Play Store URL
File: `backend/routers/version.py`
```python
update_url = "https://play.google.com/store/apps/details?id=com.your.company.appname"
```

### Build Release APK/AAB
```bash
npm run build
npx cap sync android
npx cap open android
# In Android Studio: Build > Generate Signed Bundle/APK
```

### Upload to Play Store
1. Go to [Google Play Console](https://play.google.com/console)
2. Create app (or use existing)
3. Upload signed AAB file
4. Add release notes
5. Submit for review

---

## Version Numbers

When updating app version:
- Update `package.json` version
- Update `LATEST_APP_VERSION` in `backend/routers/version.py`
- Increment Android versionCode by 1
- Create release notes in `VERSION_NOTES`

Example:
```
v0.0.1 → v0.0.2 (patch)
v0.1.0 → v0.2.0 (minor)
v1.0.0 → v2.0.0 (major)
```

---

## Features

| Feature | Details |
|---------|---------|
| **Auto-Check** | Runs on app launch |
| **Optional Update** | Users can dismiss |
| **Forced Update** | Set `isForceUpdate: true` |
| **Smart Checks** | Only checks once per 24 hours |
| **Release Notes** | Shows in modal |
| **Dismissal Memory** | Remembers dismissed versions |

---

## API Endpoints

### Check for Updates
```
POST /api/version/check
{
  "currentVersion": "0.0.1",
  "platform": "android"
}
```

### Get Version Info
```
GET /api/version/current
```

---

## Important Notes ⚠️

1. **App ID**: Must match your Play Store app ID
2. **API URL**: Ensure backend is accessible from client
3. **Version Matching**: Keep frontend & backend versions in sync
4. **Keystore**: Save your Android keystore file securely!
5. **Testing**: Test update feature before Play Store release

---

## Testing Locally

1. Start backend: `cd backend && python main.py`
2. Set newer version in `backend/routers/version.py`
3. Run: `npm run dev`
4. Open browser → Update modal should appear

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Modal not showing | Check API_BASE_URL in env, verify /api/version/check endpoint |
| Version check fails | Ensure backend is running, check CORS settings |
| Users not updating | Check Play Store rollout %, users may need to restart |

---

## Next Steps

1. ✏️ Update version in backend & frontend
2. 📦 Build: `npm run build`
3. 🧪 Test locally
4. 📱 Build APK/AAB for Play Store
5. 🚀 Upload to Play Store
6. 📊 Monitor downloads & issues

**Need full details?** See `DEPLOYMENT_GUIDE.md`

Good luck! 🎉

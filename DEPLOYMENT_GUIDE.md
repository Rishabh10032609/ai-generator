# App Update Feature & Play Store Deployment Guide

## Overview
Your app now has an auto-update feature that:
- Checks for new versions on app launch
- Shows a modal notifying users of available updates
- Supports both optional and forced updates
- Redirects users to Google Play Store for installation
- Respects user preferences (allows dismissing optional updates)

---

## Implementation Guide

### 1. Update Backend Version Info

Edit `backend/routers/version.py` when you release a new version:

```python
# Set the latest version
LATEST_APP_VERSION = "0.0.2"  # Increment this when releasing updates

# Add release notes
VERSION_NOTES = {
    "0.0.2": """• Added auto-update feature
• Improved performance
• Bug fixes and enhancements""",
    "0.0.1": """• Initial release""",
}
```

To **force users to update** (recommended for critical updates):
```python
isForceUpdate: True  # In the version check response
```

---

## 2. Update Frontend Version

Update the version in `package.json`:

```json
{
  "name": "ai-generator-app",
  "version": "0.0.2"  // Match backend version
}
```

Also update in `capacitor.config.ts` if needed for native builds.

---

## 3. Build for Play Store

### Step 1: Update Capacitor AndroidManifest
Update `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.your.company.appname"
    android:versionCode="2"
    android:versionName="0.0.2">
```

The version code should be an integer that increments with each release.

### Step 2: Generate Release APK/AAB

```bash
# Install dependencies
npm install

# Build web assets
npm run build

# Update native project
npx cap sync android

# Open in Android Studio
npx cap open android
```

In Android Studio:
1. Go to **Build > Generate Signed Bundle / APK**
2. Select "Android App Bundle" (AAB) - preferred for Play Store
3. Choose/Create keystore file (save it securely!)
4. Fill in keystore details
5. Select "Release" build variant
6. Build

### Step 3: Upload to Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Create publisher account if you haven't
3. Create new app
4. Fill in app details:
   - App name: "AI Generator" or your app name
   - Default language: English
   - App category: Productivity/Business
5. Set up app signing (use Play App Signing)
6. In **Release** section:
   - Create new release
   - Upload your signed AAB file
   - Fill in release notes
   - Set rollout (start with small percentage to test)
7. Submit for review

---

## 4. Update App ID in Config

Before building, update your actual Play Store app ID in `capacitor.config.ts`:

```typescript
// Change from:
appId: 'io.ionic.starter',

// To your actual app ID (e.g.):
appId: 'com.your.company.aigenerator',
```

Also update the URL in `backend/routers/version.py`:

```python
if platform == "android":
    update_url = "https://play.google.com/store/apps/details?id=com.your.company.aigenerator"
```

---

## 5. Environment Setup

Ensure your backend API URL is correctly configured:

Create `.env` file in your project root:

```
VITE_API_BASE_URL=https://your-api-domain.com/api
```

The app will use this to check for updates via: `POST /api/version/check`

---

## 6. API Endpoints

### Version Check Endpoint

**POST** `/api/version/check`

**Request:**
```json
{
  "currentVersion": "0.0.1",
  "platform": "android"
}
```

**Response:**
```json
{
  "latestVersion": "0.0.2",
  "minRequiredVersion": "0.0.1",
  "updateUrl": "https://play.google.com/store/apps/details?id=...",
  "releaseNotes": "• Feature 1\n• Feature 2",
  "isForceUpdate": false
}
```

### Get Current Version Endpoint

**GET** `/api/version/current`

Returns current app version info.

---

## 7. Testing the Update Feature

### Local Testing

1. Start your backend:
```bash
cd backend
python main.py
```

2. Set different version in `backend/routers/version.py`:
```python
LATEST_APP_VERSION = "0.0.2"  # Set higher than app version
```

3. Build and run:
```bash
npm run build
npm run dev
```

4. Check browser console - update modal should appear

### Testing in Android Emulator/Device

1. Build the app with Capacitor
2. Deploy to emulator/device
3. Backend must be accessible from device
4. Clear localStorage and relaunch app to check for updates

---

## 8. Release Checklist

Before each release to Play Store:

- [ ] Increment version in `package.json` and `capacitor.config.ts`
- [ ] Update `LATEST_APP_VERSION` and `VERSION_NOTES` in `backend/routers/version.py`
- [ ] Run tests: `npm run build && npm run test.unit`
- [ ] Update `android/app/src/main/AndroidManifest.xml` versionCode (increment by 1)
- [ ] Build signed APK/AAB
- [ ] Test on emulator/device
- [ ] Upload to Play Store
- [ ] Set rollout percentage (start with 5% for testing)
- [ ] Monitor for crash reports
- [ ] Gradually increase rollout to 100%

---

## 9. Update Strategy

### Optional Updates
Set `isForceUpdate: false` for:
- Minor features
- Improvements
- Non-critical bug fixes

Users can dismiss and continue using the app.

### Forced Updates
Set `isForceUpdate: true` for:
- Security vulnerabilities
- Critical bugs
- Major feature releases

Users MUST update to continue using the app.

---

## 10. Version Management Tips

- Use [Semantic Versioning](https://semver.org/): MAJOR.MINOR.PATCH
- Example: v1.2.3
  - 1 = Major version (breaking changes)
  - 2 = Minor version (new features)
  - 3 = Patch version (bug fixes)

- Keep detailed release notes for each version
- Test thoroughly before pushing to Play Store
- Use staged rollout (5% → 25% → 50% → 100%)

---

## 11. Troubleshooting

### Update Modal Not Showing
- Check network tab in DevTools - is `/api/version/check` being called?
- Verify backend is running and accessible
- Check browser console for errors
- Clear localStorage and reload

### Users Not Seeing Updates
- Verify Play Store shows new version as released
- Check rollout percentage settings
- Users may need to restart app or clear cache
- Play Store can take 30 mins+ to deploy to all regions

### Version Check Failing
- Verify API_BASE_URL is correct
- Check CORS settings in backend
- Ensure version endpoint is accessible
- Check browser console for errors

---

## 12. Commands Reference

```bash
# Frontend
npm install              # Install dependencies
npm run build           # Build for production
npm run dev             # Start dev server
npm run test.unit       # Run unit tests

# Capacitor
npx cap sync android    # Sync web assets to native
npx cap open android    # Open Android Studio
npx cap run android     # Run on connected device

# Backend
pip install -r requirements.txt  # Install Python dependencies
python main.py                   # Start backend server
```

---

## 13. File Structure

New files added for update feature:
- `src/components/UpdateModal.tsx` - Update notification UI
- `src/services/updateService.ts` - Version checking logic
- `backend/routers/version.py` - Version API endpoint

Modified files:
- `src/App.tsx` - Added update check on launch
- `capacitor.config.ts` - Added plugin configuration
- `package.json` - Added @capacitor/browser dependency
- `backend/main.py` - Added version router

---

## Next Steps

1. Update version information in backend
2. Install dependencies: `npm install`
3. Build the app: `npm run build`
4. Set up Play Store account if you haven't
5. Follow "Build for Play Store" section
6. Upload to Play Store

Good luck with your release! 🚀

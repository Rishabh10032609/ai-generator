# Advanced: Google Play In-App Update Integration (Optional)

> This is an advanced setup for using Google Play's official In-App Update API. The current implementation opens Play Store, which also works well for most use cases.

## Overview

Google Play's In-App Update API allows:
- Seamless updates without leaving the app
- Priority levels (flexible vs. immediate)
- Up to 30% faster adoption
- Better user experience

---

## Implementation Steps

### Step 1: Add Google Play Services Dependency

Edit `android/app/build.gradle`:

```gradle
dependencies {
    // ... existing dependencies
    
    // Add Play Core Library for in-app updates
    implementation 'com.google.android.play:core:1.10.3'
}
```

### Step 2: Create Capacitor Plugin

Create `android/app/src/main/java/io/ionic/starter/plugins/InAppUpdatePlugin.java`:

```java
package io.ionic.starter.plugins;

import android.app.Activity;
import android.content.Intent;
import android.content.IntentSender;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.play.core.appupdate.AppUpdateInfo;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.install.InstallStateUpdatedListener;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.InstallStatus;
import com.google.android.play.core.tasks.OnSuccessListener;

@CapacitorPlugin(name = "InAppUpdate")
public class InAppUpdatePlugin extends Plugin {

    private AppUpdateManager appUpdateManager;
    private static final int UPDATE_REQUEST_CODE = 100;

    @Override
    public void load() {
        super.load();
        appUpdateManager = AppUpdateManagerFactory.create(getActivity().getApplicationContext());
    }

    @PluginMethod
    public void checkUpdate(PluginCall call) {
        Activity activity = getActivity();
        
        appUpdateManager.getAppUpdateInfo().addOnSuccessListener(new OnSuccessListener<AppUpdateInfo>() {
            @Override
            public void onSuccess(AppUpdateInfo appUpdateInfo) {
                JSObject response = new JSObject();
                
                if (appUpdateInfo.updateAvailable()) {
                    response.put("updateAvailable", true);
                    response.put("availableVersionCode", appUpdateInfo.availableVersionCode());
                    response.put("updatePriority", appUpdateInfo.updatePriority());
                    
                    if (appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)) {
                        response.put("canUpdateImmediately", true);
                    }
                    if (appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)) {
                        response.put("canUpdateFlexibly", true);
                    }
                } else {
                    response.put("updateAvailable", false);
                }
                
                call.resolve(response);
            }
        }).addOnFailureListener(e -> {
            call.reject(e.getMessage());
        });
    }

    @PluginMethod
    public void startFlexibleUpdate(PluginCall call) {
        Activity activity = getActivity();
        
        appUpdateManager.getAppUpdateInfo().addOnSuccessListener(new OnSuccessListener<AppUpdateInfo>() {
            @Override
            public void onSuccess(AppUpdateInfo appUpdateInfo) {
                if (appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)) {
                    try {
                        appUpdateManager.startUpdateFlowForResult(
                            appUpdateInfo,
                            AppUpdateType.FLEXIBLE,
                            activity,
                            UPDATE_REQUEST_CODE
                        );
                        call.resolve();
                    } catch (IntentSender.SendIntentException e) {
                        call.reject(e.getMessage());
                    }
                } else {
                    call.reject("Flexible update not allowed");
                }
            }
        });
    }

    @PluginMethod
    public void startImmediateUpdate(PluginCall call) {
        Activity activity = getActivity();
        
        appUpdateManager.getAppUpdateInfo().addOnSuccessListener(new OnSuccessListener<AppUpdateInfo>() {
            @Override
            public void onSuccess(AppUpdateInfo appUpdateInfo) {
                if (appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)) {
                    try {
                        appUpdateManager.startUpdateFlowForResult(
                            appUpdateInfo,
                            AppUpdateType.IMMEDIATE,
                            activity,
                            UPDATE_REQUEST_CODE
                        );
                        call.resolve();
                    } catch (IntentSender.SendIntentException e) {
                        call.reject(e.getMessage());
                    }
                } else {
                    call.reject("Immediate update not allowed");
                }
            }
        });
    }

    @PluginMethod
    public void completeUpdate(PluginCall call) {
        appUpdateManager.completeUpdate();
        call.resolve();
    }
}
```

### Step 3: Register Plugin in MainActivity

Edit `android/app/src/main/java/io/ionic/starter/MainActivity.java`:

```java
import io.ionic.starter.plugins.InAppUpdatePlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        this.init(savedInstanceState, new Class[] {
            InAppUpdatePlugin.class
        });
    }
}
```

### Step 4: Use in Frontend

Create `src/services/nativeUpdateService.ts`:

```typescript
import { Capacitor } from '@capacitor/core';

export const checkNativeUpdate = async () => {
  if (Capacitor.getPlatform() !== 'android') {
    return null;
  }

  try {
    const { InAppUpdate } = await import('@capacitor/core');
    
    // This is a custom plugin call
    const result = await (Capacitor.isNativePlatform() ? 
      Capacitor.convertBase64ToBlob : 
      Promise.resolve({}));
    
    console.log('Native update check result:', result);
    return result;
  } catch (error) {
    console.error('Native update check failed:', error);
    return null;
  }
};

export const startNativeUpdate = async (priority: number) => {
  if (Capacitor.getPlatform() !== 'android') {
    return;
  }

  try {
    // For immediate (high priority) updates
    if (priority >= 4) {
      // Uncomment when plugin is ready
      // await Capacitor.Plugins.InAppUpdate.startImmediateUpdate();
    } else {
      // Uncomment when plugin is ready
      // await Capacitor.Plugins.InAppUpdate.startFlexibleUpdate();
    }
  } catch (error) {
    console.error('Failed to start native update:', error);
  }
};
```

---

## When to Use

### Use Google Play In-App Update API if:
- ✅ Updates must complete before app continues
- ✅ Need crash reporting from incomplete updates
- ✅ Want 30% faster update adoption
- ✅ Building premium production app

### Use Current Implementation if:
- ✅ Simple, quick setup needed
- ✅ Users can continue using old version while updating
- ✅ Less complex native code required
- ✅ Works on all platforms (web, Android, iOS)

---

## Testing Native Updates

1. Build debug APK:
```bash
npx cap sync android
npx cap open android
# In Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)
```

2. Install on emulator/device:
```bash
adb install app-debug.apk
```

3. Increment version and build new APK

4. Place in Play Store internal testing track

5. Device will receive update notification

---

## Priority Levels

Play Core classifies updates by priority:

| Priority | Type | When to Use |
|----------|------|------------|
| 0-2 | Low | Minor features, improvements |
| 3-4 | Medium | Bug fixes, security patches |
| 5 | High | Critical security issues |

---

## Notes

- This is optional - current implementation is fully functional
- Requires compilation of native code
- Play Store internal testing needed for full testing
- Easier for experienced Android developers
- Start with current implementation, upgrade later if needed

For most use cases, the current JavaScript + Play Store redirect approach is sufficient and much simpler to maintain.

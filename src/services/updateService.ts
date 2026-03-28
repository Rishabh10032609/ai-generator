import { App } from '@capacitor/app';

interface VersionInfo {
  latestVersion: string;
  minRequiredVersion: string;
  updateUrl: string;
  releaseNotes: string;
  isForceUpdate: boolean;
}

interface UpdateCheckResult {
  updateAvailable: boolean;
  isForceUpdate: boolean;
  versionInfo?: VersionInfo;
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Get current app version
 * Returns the version from package.json or local storage
 */
export const getCurrentVersion = async (): Promise<string> => {
  try {
    const appInfo = await App.getInfo();
    return appInfo.version;
  } catch (error) {
    // Fallback for web version - use the package.json version
    return localStorage.getItem('appVersion') || '0.0.2';
  }
};
// export const getCurrentVersion = async (): Promise<string> => {
//   return "0.0.1";  // 👈 force old version
// };

/**
 * Compare two semantic versions
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export const compareVersions = (v1: string, v2: string): number => {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }

  return 0;
};

/**
 * Check for available updates from backend
 */
export const checkForUpdates = async (): Promise<UpdateCheckResult> => {
  try {
    const currentVersion = await getCurrentVersion();

    // Fetch version info from backend
    const response = await fetch(`${API_BASE_URL}/version/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentVersion,
        platform: 'android', // or 'ios' or 'web'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.statusText}`);
    }

    const versionInfo: VersionInfo = await response.json();

    // Check if update is available
    const versionComparison = compareVersions(
      currentVersion,
      versionInfo.latestVersion
    );
    const updateAvailable = versionComparison < 0;

    // Check if it's a forced update
    const isForceUpdate =
      updateAvailable &&
      compareVersions(currentVersion, versionInfo.minRequiredVersion) < 0;
    
    return {
      updateAvailable,
      isForceUpdate,
      versionInfo: updateAvailable ? versionInfo : undefined,
    };
  } catch (error) {
    console.error('Error checking for updates:', error);
    return {
      updateAvailable: false,
      isForceUpdate: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Store when last update check was performed
 */
export const setLastUpdateCheck = (): void => {
  localStorage.setItem('lastUpdateCheck', new Date().toISOString());
};

/**
 * Get time since last update check in hours
 */
export const getHoursSinceLastCheck = (): number => {
  const lastCheck = localStorage.getItem('lastUpdateCheck');
  if (!lastCheck) return 24; // If never checked, return large number

  const lastCheckTime = new Date(lastCheck).getTime();
  const now = new Date().getTime();
  const hoursDiff = (now - lastCheckTime) / (1000 * 60 * 60);

  return hoursDiff;
};

/**
 * Check if we should show update notification
 * Only show once per 24 hours to avoid annoying users
 */
export const shouldCheckForUpdates = (): boolean => {
  const hoursSinceLastCheck = getHoursSinceLastCheck();
  return hoursSinceLastCheck >= 24;
};

/**
 * Store that user dismissed an optional update
 */
export const setUpdateDismissed = (version: string): void => {
  localStorage.setItem('dismissedUpdateVersion', version);
};

/**
 * Check if user has dismissed this version
 */
export const hasUserDismissedUpdate = (version: string): boolean => {
  const dismissedVersion = localStorage.getItem('dismissedUpdateVersion');
  return dismissedVersion === version;
};

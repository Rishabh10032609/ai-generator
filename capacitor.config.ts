import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter', // CHANGE THIS to your actual Play Store app ID (e.g., com.example.aigenerator)
  appName: 'ai-generator-app',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 3000,
    },
  },
};

export default config;

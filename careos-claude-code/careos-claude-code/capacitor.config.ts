import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'care.coop.app',
  appName: 'co-op.care',
  webDir: 'dist/client',
  server: {
    // In production, the app loads from the bundled files
    // For dev, uncomment the url below to use live reload:
    // url: 'http://192.168.1.X:5173',
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#faf8f4',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#faf8f4',
    },
  },
  ios: {
    contentInset: 'always',
    scheme: 'co-op.care',
  },
  android: {
    backgroundColor: '#faf8f4',
  },
};

export default config;

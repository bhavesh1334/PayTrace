import { ExpoConfig } from 'expo/config';

const config: any = {
  name: 'PayTrace',
  slug: 'paytrace',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash-icon.png',
    backgroundColor: '#F9F9FF',
  },
  ios: {
    bundleIdentifier: 'com.bhavesh.paytrace',
    supportsTablet: false,
    infoPlist: {
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: [process.env.EXPO_PUBLIC_REVERSED_CLIENT_ID || ''],
        },
      ],
    },
  },
  android: {
    package: 'com.bhavesh.paytrace',
    googleServicesFile: require('fs').existsSync('./google-services.json') ? './google-services.json' : undefined,
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundColor: '#1A56DB',
    },
  },
  plugins: [
    '@react-native-google-signin/google-signin',
    'expo-local-authentication',
    [
      'expo-font',
      {
        fonts: [
          './assets/fonts/Inter-Regular.ttf',
          './assets/fonts/Inter-SemiBold.ttf',
          './assets/fonts/Inter-Bold.ttf',
        ],
      },
    ],
  ],
  extra: {
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    eas: {
      projectId: '652a65ba-d6dd-47c9-97a9-933804406140', // We can update this when EAS is configured
    },
  },
};

export default config;

import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getAuth, getReactNativePersistence } from '@firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
};

// Initialize the Firebase app only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use initializeAuth with React Native AsyncStorage persistence to avoid
// "Component auth has not been registered yet" error in Expo Go / React Native.
// getAuth() internally uses a browser-specific persistence mechanism that is
// incompatible with React Native. initializeAuth with getReactNativePersistence
// sets the correct adapter on first launch; subsequent calls re-use the instance.
let auth: ReturnType<typeof getAuth>;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e: any) {
  // Auth is already initialized — safe to call getAuth() to retrieve the instance
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export const functions = getFunctions(app, 'asia-south1');
export const storage = getStorage(app);

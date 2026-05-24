import { useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential,
  User as FirebaseUser,
} from 'firebase/auth';
import { NativeModules, Alert } from 'react-native';
import { auth } from '../services/firebase';
import { useAppDispatch, useAppSelector } from '../store';
import {
  setAuthLoading,
  setAuthUser,
  setAuthError,
  clearAuth,
} from '../store/authSlice';
import { createUserProfile, getUserProfile } from '../services/userService';
import Constants from 'expo-constants';

let GoogleSignin: any = null;
let isGoogleSigninSupported = false;

try {
  if (NativeModules.RNGoogleSignin) {
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
    isGoogleSigninSupported = true;
  }
} catch (e) {
  console.log('Google Sign-In not supported in this environment.');
}

if (isGoogleSigninSupported && GoogleSignin) {
  GoogleSignin.configure({
    webClientId: Constants.expoConfig?.extra?.googleWebClientId || '',
  });
}

export const useAuthInit = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setAuthLoading());
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Check if profile exists in Firestore, otherwise wait or fetch
          let profile = await getUserProfile(firebaseUser.uid);
          if (!profile) {
            // First-time signup profile sync helper if auth succeeds but Firestore not updated yet
            await createUserProfile({
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL,
              provider: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
            });
            profile = await getUserProfile(firebaseUser.uid);
          }
          dispatch(setAuthUser(profile));
        } else {
          dispatch(clearAuth());
        }
      } catch (err: any) {
        dispatch(setAuthError(err.message || 'Failed to fetch user profile'));
      }
    });

    return unsubscribe;
  }, [dispatch]);
};

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, status, error } = useAppSelector((state) => state.auth);

  const signInWithEmail = async (email: string, password: string) => {
    dispatch(setAuthLoading());
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      dispatch(setAuthError(err.message || 'Login failed'));
      throw err;
    }
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    dispatch(setAuthLoading());
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Synchronize immediately to Firestore user record
      await createUserProfile({
        uid: userCredential.user.uid,
        displayName: name,
        email,
        photoURL: null,
        provider: 'email',
      });
      // Double check fetch
      const profile = await getUserProfile(userCredential.user.uid);
      dispatch(setAuthUser(profile));
    } catch (err: any) {
      dispatch(setAuthError(err.message || 'Sign up failed'));
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    if (!isGoogleSigninSupported || !GoogleSignin) {
      Alert.alert(
        'Expo Go Limitation',
        'Google Sign-In is not supported inside the standard Expo Go client.\n\nPlease sign in or sign up using your Email & Password to test, or build a custom development client using EAS to use Google Sign-In.',
        [{ text: 'OK' }]
      );
      return;
    }

    dispatch(setAuthLoading());
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.idToken;
      if (!idToken) {
        throw new Error('No ID token returned from Google Sign-In');
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);

      // Save user profile in Firestore
      await createUserProfile({
        uid: userCredential.user.uid,
        displayName: userCredential.user.displayName || 'Google User',
        email: userCredential.user.email || '',
        photoURL: userCredential.user.photoURL,
        provider: 'google',
      });

      const profile = await getUserProfile(userCredential.user.uid);
      dispatch(setAuthUser(profile));
    } catch (err: any) {
      dispatch(setAuthError(err.message || 'Google Sign-In failed'));
      throw err;
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      throw err;
    }
  };

  const signOut = async () => {
    dispatch(setAuthLoading());
    try {
      if (isGoogleSigninSupported && GoogleSignin) {
        await GoogleSignin.signOut().catch(() => {}); // Sign out Google if authenticated
      }
      await firebaseSignOut(auth);
      dispatch(clearAuth());
    } catch (err: any) {
      dispatch(setAuthError(err.message || 'Sign out failed'));
      throw err;
    }
  };

  return {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    error,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    signOut,
    isGoogleSigninSupported,
  };
};

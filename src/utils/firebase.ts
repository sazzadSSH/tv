import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Playlist, AppSettings, Channel } from '../types/sttv';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: pass firestoreDatabaseId per instructions
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);

// Test connection
export async function testFirebaseConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    // Attempt anonymous auth if not signed in
    if (!auth.currentUser) {
      await signInAnonymously(auth).catch(() => {});
    }
    await getDocFromServer(doc(db, 'test', 'connection'));
    return { connected: true };
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      return { connected: false, error: 'Offline mode / Waiting for connection' };
    }
    // Connected to server even if test doc does not exist
    return { connected: true };
  }
}

// Ensure auth user
export async function getOrSignInUser(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('Anonymous sign-in fallback:', err);
    return null;
  }
}

// Sync playlist to Cloud Firestore
export async function syncPlaylistToFirestore(playlist: Playlist): Promise<boolean> {
  try {
    const user = await getOrSignInUser();
    if (!user) return false;

    await setDoc(doc(db, 'users', user.uid, 'playlists', playlist.id), {
      id: playlist.id,
      name: playlist.name,
      url: playlist.url || '',
      channelCount: playlist.channelCount,
      lastUpdated: playlist.lastUpdated || Date.now()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore playlist sync:', err);
    return false;
  }
}

// Sync settings to Cloud Firestore
export async function syncSettingsToFirestore(settings: AppSettings): Promise<boolean> {
  try {
    const user = await getOrSignInUser();
    if (!user) return false;

    await setDoc(doc(db, 'users', user.uid, 'settings', 'main'), {
      language: settings.language,
      autoplay: settings.autoplay,
      aspectRatio: settings.aspectRatio,
      autoBypassInactive: settings.autoBypassInactive,
      updatedAt: Date.now()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore settings sync:', err);
    return false;
  }
}

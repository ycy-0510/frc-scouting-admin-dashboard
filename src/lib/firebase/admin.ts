import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0]!;
  }

  let serviceAccount;

  // Try to parse from environment variable first
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON);
    } catch (error) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY_JSON:', error);
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY_JSON format');
    }
  } else {
    // Fallback to local file (for development if not using env var)
    try {
      const serviceAccountPath = join(process.cwd(), 'firebase-account.json');
      serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
    } catch {
      // If neither exists (e.g. in build phase), we might skip or let it fail
      // For now, let's allow it to be undefined and let initializeApp handle it or fail
      console.warn('No firebase-account.json found and no FIREBASE_SERVICE_ACCOUNT_KEY_JSON set.');
    }
  }

  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
    });
  }

  return initializeApp(); // Fallback to default credentials (e.g. local emulator or GCloud env)
}

const app = initializeFirebaseAdmin();
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

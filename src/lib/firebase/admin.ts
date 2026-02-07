import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const serviceAccountPath = join(process.cwd(), 'firebase-account.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const app = initializeFirebaseAdmin();
const auth = admin.auth(app);
const db = admin.firestore(app);

export { admin, auth, db };

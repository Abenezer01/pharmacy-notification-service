import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

function initializeFirebaseAdmin() {
  if (admin.apps && admin.apps.length > 0) return;

  let serviceAccount: any | null = null;

  // Priority: JSON env var -> explicit path env var -> GOOGLE_APPLICATION_CREDENTIALS -> default project file
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e);
    }
  }

  const candidatePaths = [] as string[];
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) candidatePaths.push(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) candidatePaths.push(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  // fallback to repo root common filename
  candidatePaths.push(path.resolve(__dirname, '../../service-account-key.json'));

  if (!serviceAccount) {
    for (const p of candidatePaths) {
      try {
        if (p && fs.existsSync(p)) {
          const raw = fs.readFileSync(p, 'utf8');
          serviceAccount = JSON.parse(raw);
          break;
        }
      } catch (e) {
        // ignore and try next
      }
    }
  }

  try {
    if (serviceAccount) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      console.log('✅ Firebase Admin initialized using a service account.');
    } else {
      // Fall back to application default credentials
      admin.initializeApp();
      console.log('✅ Firebase Admin initialized using application default credentials.');
    }
  } catch (e) {
    console.warn('⚠️ Firebase Admin initialization failed:', e);
  }
}

initializeFirebaseAdmin();

export default admin;

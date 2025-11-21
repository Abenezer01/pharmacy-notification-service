import app from './app';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

// ============================================================================
// FIREBASE INITIALIZATION
// ============================================================================
const initializeFirebase = () => {
  try {
    // 1. Try using explicit Service Account JSON from ENV
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log(`✅ Firebase initialized with Service Account. Project ID: [${serviceAccount.project_id}]`);
      return;
    }

    // 2. Try standard Google Application Credentials (common in Cloud Run/GCP)
    if (admin.apps.length === 0) {
      const app = admin.initializeApp();
      // Attempt to resolve project ID from default creds (async, so we just log success)
      console.log(`✅ Firebase initialized with Default Credentials.`);
    }
  } catch (error) {
    console.error('⚠️ Firebase Initialization Failed:', error);
    console.log('ℹ️ App will run in MOCK MODE (Database operations will be simulated).');
  }
};

initializeFirebase();

// ============================================================================
// START SERVER
// ============================================================================
app.listen(PORT, () => {
  const isFirebaseActive = admin.apps.length > 0;
  
  console.log(`
🚀 Server is running!
--------------------------------------------------
📡 Mode:     ${isFirebaseActive ? 'LIVE (Firestore Connected)' : 'DEV (Mock Data)'}
🔌 Port:     ${PORT}
🔗 Local:    http://localhost:${PORT}
❤️  Health:   http://localhost:${PORT}/api/v1/health
--------------------------------------------------
  `);
});

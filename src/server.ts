import app from './app';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Initialize Firebase Admin (Mock check inside services ensures we don't crash if missing)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin Initialized');
  } catch (error) {
    console.error('⚠️ Failed to parse FIREBASE_SERVICE_ACCOUNT', error);
  }
} else {
  // Initialize with default app if in specific cloud envs or skip
  if (admin.apps.length === 0) {
    try {
      admin.initializeApp(); 
      console.log('✅ Firebase Admin Initialized (Default Credential)');
    } catch (e) {
      console.log('ℹ️ No Firebase credentials found. Running in Mock Mode.');
    }
  }
}

// Start Server
app.listen(PORT, () => {
  console.log(`
🚀 Server is running!
---------------------
Local:   http://localhost:${PORT}
Health:  http://localhost:${PORT}/api/v1/health
---------------------
  `);
});
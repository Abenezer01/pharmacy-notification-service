import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Initializes the Firebase Admin SDK.
 * Priority:
 * 1. 'service-account.json' file in the project root.
 * 2. Google Application Default Credentials (if running on GCP/Cloud Run).
 */
export const initializeFirebase = (): void => {
  try {
    // Prevent multiple initializations
    if (admin.apps.length > 0) {
      return;
    }

    // 1. Try to load service-account.json from project root
    const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');

    if (fs.existsSync(serviceAccountPath)) {
      try {
        const rawData = fs.readFileSync(serviceAccountPath, 'utf8');
        const serviceAccount = JSON.parse(rawData);

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log(`✅ [Config] Firebase initialized via service-account.json (Project: ${serviceAccount.project_id})`);
        return;
      } catch (parseError) {
        console.error('❌ [Config] Found service-account.json but failed to parse it:', parseError);
        // Do not throw here, allow fallback to default credentials or mock mode
      }
    } else {
      console.log('ℹ️ [Config] No service-account.json found in root directory.');
    }

    // 2. Try standard Google Application Credentials
    // This works automatically if GOOGLE_APPLICATION_CREDENTIALS env var is set
    // or if running inside Google Cloud Platform (Cloud Run, App Engine, Functions)
    admin.initializeApp();
    console.log(`✅ [Config] Firebase initialized with Default Credentials.`);

  } catch (error) {
    console.error('⚠️ [Config] Firebase Initialization Failed:', error);
    console.log('ℹ️ [Config] App will run in MOCK MODE (Database operations will be simulated).');
  }
};

/**
 * Helper to check if Firebase is actively connected.
 */
export const isFirebaseActive = (): boolean => {
  return admin.apps.length > 0;
};
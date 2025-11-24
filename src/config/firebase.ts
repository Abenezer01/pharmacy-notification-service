import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const initializeFirebase = (): void => {
  try {
    // Prevent multiple initializations
    if (admin.apps.length > 0) {
      return;
    }

    // 1. LOCAL MODE: service-account-key.json exists on local machine
    const localKeyPath = path.resolve(process.cwd(), 'service-account-key.json');

    if (fs.existsSync(localKeyPath)) {
      const raw = fs.readFileSync(localKeyPath, 'utf8');
      const localKey = JSON.parse(raw);

      admin.initializeApp({
        credential: admin.credential.cert(localKey),
      });

      console.log(`✅ Firebase initialized via local service-account-key.json`);
      return;
    }

    console.log('ℹ️ No local service-account-key.json found — falling back to environment variables.');

    // 2. PRODUCTION MODE (Vercel): load from env variable
    const serviceAccountEnv = process.env.SERVICE_ACCOUNT_KEY;

    if (!serviceAccountEnv) {
      throw new Error('SERVICE_ACCOUNT_KEY is missing from environment variables.');
    }

    const serviceAccount = JSON.parse(serviceAccountEnv);

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
      }),
    });

    console.log(`✅ Firebase initialized via environment variables (Vercel mode)`);

  } catch (error) {
    console.error('❌ Firebase Initialization Failed:', error);
    console.log('ℹ️ Running in MOCK MODE.');
  }
};

export const isFirebaseActive = (): boolean => {
  return admin.apps.length > 0;
};

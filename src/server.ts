import app from './app';
import dotenv from 'dotenv';
import { initializeFirebase, isFirebaseActive } from './config/firebase';

dotenv.config();

const PORT = process.env.PORT || 3000;

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize Firebase Config
initializeFirebase();

// ============================================================================
// START SERVER
// ============================================================================
app.listen(PORT, () => {
  console.log(`
🚀 Server is running!
--------------------------------------------------
📡 Mode:     ${isFirebaseActive() ? 'LIVE (Firestore Connected)' : 'DEV (Mock Data)'}
🔌 Port:     ${PORT}
🔗 Local:    http://localhost:${PORT}
❤️  Health:   http://localhost:${PORT}/api/v1/health
--------------------------------------------------
  `);
});

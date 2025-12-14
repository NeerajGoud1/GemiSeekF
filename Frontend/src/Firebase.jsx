import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "gemiseek-8a6e3.firebaseapp.com",
  projectId: "gemiseek-8a6e3",
  storageBucket: "gemiseek-8a6e3.firebasestorage.app",
  messagingSenderId: "850379850909",
  appId: "1:850379850909:web:c1e8238d6d04daffb88074",
  measurementId: "G-BPEWTYQLGR",
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

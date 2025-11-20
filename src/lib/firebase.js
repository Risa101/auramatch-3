// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDCXc8rAZKIerQMqIjwrkkGb1nAVsPGYqE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "auramatch1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "auramatch1",
  // ✅ storageBucket ควรลงท้ายด้วย .appspot.com
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "auramatch1.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1054272791911",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1054272791911:web:de67d6bbc3f909258b7bc2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-9VVXJ7BT4R",
};

// 🔹 Init Firebase
const app = initializeApp(firebaseConfig);

// 🔹 Export ใช้ในโปรเจกต์
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const storage = getStorage(app);
export const db = getFirestore(app); // ✅ Firestore เผื่อใช้เก็บคูปอง/ข้อมูล

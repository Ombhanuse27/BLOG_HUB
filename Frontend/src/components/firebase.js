import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCT5t5bzsmt8Z0CwJmfL-jEkHfJKTyG0Q4",
  authDomain: "login-auth-1a5de.firebaseapp.com",
  projectId: "login-auth-1a5de",
  storageBucket: "login-auth-1a5de.appspot.com",
  messagingSenderId: "1049999037571",
  appId: "1:1049999037571:web:3197a52118b93f02fa37b6",
  databaseURL: "https://login-auth-1a5de-default-rtdb.firebaseio.com" // Added Realtime Database URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app); // Auth service
export const db = getFirestore(app); // Firestore service
export const storage = getStorage(app); // Storage service
export const rtdb = getDatabase(app); // Realtime Database service

export default app;

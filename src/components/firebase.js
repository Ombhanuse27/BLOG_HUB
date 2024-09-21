// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCT5t5bzsmt8Z0CwJmfL-jEkHfJKTyG0Q4",
  authDomain: "login-auth-1a5de.firebaseapp.com",
  projectId: "login-auth-1a5de",
  storageBucket: "login-auth-1a5de.appspot.com",
  messagingSenderId: "1049999037571",
  appId: "1:1049999037571:web:3197a52118b93f02fa37b6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export const db=getFirestore(app);
export default app;

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Fix: Import getAuth from firebase/auth to provide authentication services
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB8NniErqwD_yeSIrDb2qLlxyPOMYVWBD0",
  authDomain: "edusupply-pos.firebaseapp.com",
  projectId: "edusupply-pos",
  storageBucket: "edusupply-pos.firebasestorage.app",
  messagingSenderId: "431112312925",
  appId: "1:431112312925:web:9e2fdaee64f435b033d5b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// Fix: Export the auth instance so it can be used by the Login component
export const auth = getAuth(app);

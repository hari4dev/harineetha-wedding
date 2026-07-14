import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDPWXkA2IN1hOSxpD7BRoBYdGicpo_sle4",
  authDomain: "harineethawedding.firebaseapp.com",
  projectId: "harineethawedding",
  storageBucket: "harineethawedding.firebasestorage.app",
  messagingSenderId: "840143339093",
  appId: "1:840143339093:web:c541914ca075de831e9edc",
  measurementId: "G-PTX4J6TDC4"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app, analytics };
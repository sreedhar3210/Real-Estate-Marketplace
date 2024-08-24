// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "estate-marketplace-3b50f.firebaseapp.com",
  projectId: "estate-marketplace-3b50f",
  storageBucket: "estate-marketplace-3b50f.appspot.com",
  messagingSenderId: "631216607869",
  appId: "1:631216607869:web:eaa4dd8097ca9a288bd714"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDWBV2wh91IVVUc_x2_pur_oGdaVhFqlh4",
  authDomain: "weboost-a27b2.firebaseapp.com",
  projectId: "weboost-a27b2",
  storageBucket: "weboost-a27b2.firebasestorage.app",
  messagingSenderId: "776921217597",
  appId: "1:776921217597:web:0ce5af72b1f9f72bdb8854",
  measurementId: "G-1Q9MDB8JJ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
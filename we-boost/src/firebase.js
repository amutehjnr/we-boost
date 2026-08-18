// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBWiBMCsjdGYWimL1K4J8v97Bu1NKhaFyM",
  authDomain: "we-boost.firebaseapp.com",
  projectId: "we-boost",
  storageBucket: "we-boost.firebasestorage.app",
  messagingSenderId: "44794001437",
  appId: "1:44794001437:web:ee0748fd10e279ee4a2ef4",
  measurementId: "G-P13CVHWBG8"
};

// Prevent duplicate initialization
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const auth = getAuth(app);

export { app, auth };
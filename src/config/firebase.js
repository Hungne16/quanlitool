import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB4gLMpZtDfiMajdXr7bb3_ogtNeSG8VoU",
  authDomain: "quanlitool.firebaseapp.com",
  projectId: "quanlitool",
  storageBucket: "quanlitool.firebasestorage.app",
  messagingSenderId: "561241317991",
  appId: "1:561241317991:web:554fed99c32e526fc26ac2",
  measurementId: "G-ZHJFL49J5L"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

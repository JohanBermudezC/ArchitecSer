// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC1dxL-Te2PElpSYJmS9BzqebNRnRp9yfo",
  authDomain: "reservalapp.firebaseapp.com",
  projectId: "reservalapp",
  storageBucket: "reservalapp.appspot.com",
  messagingSenderId: "1523161334933",
  appId: "1:1523161334933:web:ab9af429cc062cf2f4f83c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

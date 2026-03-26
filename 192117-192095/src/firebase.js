import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAAj1HKSKICAH8TLl-3aYcTwKKz5PezB78",
  authDomain: "canchaya-b0ea4.firebaseapp.com",
  projectId: "canchaya-b0ea4",
  storageBucket: "canchaya-b0ea4.firebasestorage.app",
  messagingSenderId: "42070250656",
  appId: "1:42070250656:web:cfff84be59c3745ad0e5c5"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export default app
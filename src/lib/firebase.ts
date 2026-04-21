import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Tus credenciales de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBf-9iAVqFTGnzjbODSDF-VQfyceAl8IC8",
  authDomain: "complianceguardai.firebaseapp.com",
  projectId: "complianceguardai",
  storageBucket: "complianceguardai.firebasestorage.app",
  messagingSenderId: "12567186833",
  appId: "1:12567186833:web:468a381acf94ac34a5e30"
};

// Inicializamos la App
const app = initializeApp(firebaseConfig);

// Exportamos los servicios para que App.tsx los pueda usar
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

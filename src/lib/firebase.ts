import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // LLAVE ORIGINAL DEL PROYECTO (Imagen bd8545)
  apiKey: "AIzaSyBf-9iAvQFTGnzjbODSDF-VQfyceAl8IC8",
  authDomain: "complianceguardai.firebaseapp.com",
  projectId: "complianceguardai",
  storageBucket: "complianceguardai.firebasestorage.app",
  messagingSenderId: "12567186833",
  appId: "1:12567186833:web:468a381acf94ac34a5e30"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const db = getFirestore(app);

(window as any).db = db;
export default app;

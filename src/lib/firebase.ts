import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // Esta es la llave que termina en fo8M que creamos hoy
  apiKey: "AIzaSyD4DFwYz_i_pHq01JKXeW__J_Bj4p7fo8M", 
  authDomain: "compliance-guard-ai.firebaseapp.com",
  projectId: "compliance-guard-ai",
  storageBucket: "compliance-guard-ai.appspot.com",
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

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// DATOS SACADOS DIRECTAMENTE DE TU PANTALLA BD8545
const firebaseConfig = {
  apiKey: "AIzaSyBf-9iAvQFTGnzjbODSDF-VQfyceAl8IC8",
  authDomain: "complianceguardai.firebaseapp.com",
  databaseURL: "https://complianceguardai-default-rtdb.firebaseio.com",
  projectId: "complianceguardai",
  storageBucket: "complianceguardai.firebasestorage.app",
  messagingSenderId: "12567186833",
  appId: "1:12567186833:web:468a381acf94ac34a5e30"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Forzar selección de cuenta para limpiar errores de sesión
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = getFirestore(app);

// Mantener el botón secreto funcionando
(window as any).db = db;

export default app;

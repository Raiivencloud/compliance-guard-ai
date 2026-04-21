import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD4DFwYz_i_pHq01JKXeW__J_Bj4p7fo8M",
  authDomain: "complianceguardai.firebaseapp.com",
  projectId: "complianceguardai",
  storageBucket: "complianceguardai.firebasestorage.app",
  messagingSenderId: "12567186833",
  appId: "1:12567186833:web:468a381acf94ac34a5e30"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios para usar en el resto de la app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;

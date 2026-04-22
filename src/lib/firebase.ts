import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot, addDoc, orderBy } from 'firebase/firestore';

// CONFIGURACIÓN FINAL 2026 - Usando los datos de tus capturas
const firebaseConfig = {
  apiKey: "AIzaSyDexjYxSXGhvPkyb92lIL0fjsx2DBsnjfk", // La llave que me pasaste
  authDomain: "compliance-guard-ai.firebaseapp.com",
  projectId: "compliance-guard-ai",
  storageBucket: "compliance-guard-ai.firebasestorage.app",
  messagingSenderId: "564812860703",
  appId: "1:564812860703:web:2ca774d30e6f8323c6b42a" // El ID de ComplianceGuard Pro
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Forzamos que Google siempre pida la cuenta para evitar sesiones "malformadas"
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { signInWithPopup, signOut, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot, addDoc, orderBy };

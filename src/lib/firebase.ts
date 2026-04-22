import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDexjYxSXGhvPkyb92lIL0fjsx2DBsnjfk",
  authDomain: "compliance-guard-ai.firebaseapp.com",
  projectId: "compliance-guard-ai",
  storageBucket: "compliance-guard-ai.firebasestorage.app",
  messagingSenderId: "564812860703",
  appId: "1:564812860703:web:2ca774d30e6f8323c6b42a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Esto limpia el error 401 forzando a elegir cuenta siempre
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { signInWithPopup, signOut, collection, addDoc, query, where, getDocs, doc, getDoc, setDoc, onSnapshot };

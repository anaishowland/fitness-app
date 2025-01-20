import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";


const firebaseConfig = {
   apiKey: "AIzaSyDkfPdNP840ZHu7jOExuYZMLRwD0b9ffzM",
   authDomain: "fitness-app-f1fc7.firebaseapp.com",
   projectId: "fitness-app-f1fc7",
   storageBucket: "fitness-app-f1fc7.firebasestorage.app",
   messagingSenderId: "724977705934",
   appId: "1:724977705934:web:65efc1ce379c55ee51c19f",
   measurementId: "G-5R39D6P10L"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


// Export Firestore
export const db = getFirestore(app);


console.log("Firebase initialized:", app);


// Set up authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

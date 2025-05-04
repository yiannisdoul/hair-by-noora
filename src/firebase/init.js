// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA85ae2a2lrF0cYySkyOUo6b871B7sBt7M",
  authDomain: "hair-by-noora.firebaseapp.com",
  projectId: "hair-by-noora",
  storageBucket: "hair-by-noora.firebasestorage.app",
  messagingSenderId: "372795756197",
  appId: "1:372795756197:web:59c8eb91f65f42f26bc74c"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
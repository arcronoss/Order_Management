import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyA-7hVtkKztLziAafS4DxInQoW9-9IljYM",
    authDomain: "ordermanagement-1a87c.firebaseapp.com",
    projectId: "ordermanagement-1a87c",
    storageBucket: "ordermanagement-1a87c.appspot.com", // Corrected typo in "firebasestorage.app"
    messagingSenderId: "663244899644",
    appId: "1:663244899644:web:ad54313c860781df7c0a39",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
// Initialize Firestore
const db = getFirestore(app);

// Export the app and db
export { app, db }; // Use named exports for clarity

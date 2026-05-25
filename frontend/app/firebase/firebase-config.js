// Import the functions you need from the SDKs you need
import {getApps, initializeApp} from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getDatabase, onValue, ref, set} from "firebase/database"; // Ensure you are importing these from "firebase/database"
import {getDownloadURL, getStorage, ref as storageRef, uploadBytesResumable} from "firebase/storage";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA77etxAHteIzO8Ufe7Yn6k0PTTpD7veq4",
    authDomain: "homehunters-92c76.firebaseapp.com",
    projectId: "homehunters-92c76",
    storageBucket: "homehunters-92c76.firebasestorage.app",
    messagingSenderId: "583961860857",
    appId: "1:583961860857:web:488989af5dd3b4d020e028"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()[0];

// Get a reference to the database
const database = getDatabase(app);

const storage = getStorage(app);

// Export database functions
export {database, ref, set, onValue, storage, storageRef, uploadBytesResumable, getDownloadURL};
export default app;
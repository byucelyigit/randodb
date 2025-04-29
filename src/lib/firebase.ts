import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {

};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);

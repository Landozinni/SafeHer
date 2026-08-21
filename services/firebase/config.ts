// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBEQSmtxTnqHzkB3cr8hWYxMtEQQFnF3OA",
  authDomain: "safeher-securityapp.firebaseapp.com",
  projectId: "safeher-securityapp",
  storageBucket: "safeher-securityapp.firebasestorage.app",
  messagingSenderId: "201106369007",
  appId: "1:201106369007:web:abeb8bedcb40aff8792e1a",
  measurementId: "G-8K14J9PF0C",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

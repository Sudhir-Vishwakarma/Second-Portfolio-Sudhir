// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnfv986pB89oIVF-7MYrhCms6rr1Zp1xo",
  authDomain: "sudhir-portfolio2.firebaseapp.com",
  projectId: "sudhir-portfolio2",
  storageBucket: "sudhir-portfolio2.firebasestorage.app",
  messagingSenderId: "378062849836",
  appId: "1:378062849836:web:dbaffd6a2f956501078e89",
  measurementId: "G-M8CBCPBF60"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if supported
let analytics: any = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, db, storage };
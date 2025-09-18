
const firebaseConfig = {
  apiKey: "AIzaSyAxXL2HIJNdBxjl6n0814SKPnuY8E10hJc",
  authDomain: "auraplan-ca0a7.firebaseapp.com",
  projectId: "auraplan-ca0a7",
  storageBucket: "auraplan-ca0a7.appspot.com",
  messagingSenderId: "61709105762",
  appId: "1:61709105762:web:a0fcdd59a899b116f96f3b",
  measurementId: "G-EHVLKKRHFC"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

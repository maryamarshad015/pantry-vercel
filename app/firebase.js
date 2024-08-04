// app/firebase.js

import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyANjo3mg6TnKjmTm6NC-a9CtTKjWx8JsfY",
  authDomain: "pantry-app-d3ec2.firebaseapp.com",
  projectId: "pantry-app-d3ec2",
  storageBucket: "pantry-app-d3ec2.appspot.com",
  messagingSenderId: "723149884923",
  appId: "1:723149884923:web:95c1e904a74dfaacf20f5e",
  measurementId: "G-NWJ7SX3PJ6"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export { firestore };

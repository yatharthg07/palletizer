// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyDK49S7R9f8md-9bvtMRJ3IZMmR-1dpVmk",
    authDomain: "palletizer-322e0.firebaseapp.com",
    databaseURL: "https://palletizer-322e0-default-rtdb.firebaseio.com",
    projectId: "palletizer-322e0",
    storageBucket: "palletizer-322e0.appspot.com",
    messagingSenderId: "317851958274",
    appId: "1:317851958274:web:5c3bd761fc70053efc3b1b",
    measurementId: "G-C918XCXRW1"
  };
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  
  export { database };
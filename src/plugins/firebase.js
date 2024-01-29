import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

/* ADD YOUR CREDENTIALS HERE */
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

const firebaseApp = initializeApp(firebaseConfig);

getDatabase(firebaseApp);
getAnalytics(firebaseApp);

export default firebaseApp
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy
} from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Add a new chore
export const addChore = async (chore) => {
  try {
    const docRef = await addDoc(collection(db, "chores"), chore);
    console.log("Chore added with ID: ", docRef.id);
    return { id: docRef.id, ...chore };
  } catch (e) {
    console.error("Error adding chore: ", e);
    throw e;
  }
};

// Get all chores from the database
export const getChores = async () => {
  try {
    const choresQuery = query(collection(db, "chores"), orderBy("createdAt", "desc"));
    const choresSnapshot = await getDocs(choresQuery);
    return choresSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (e) {
    console.error("Error getting chores: ", e);
    throw e;
  }
};

// Update a chore in the database
export const updateChore = async (id, chore) => {
  try {
    const choreRef = doc(db, "chores", id);
    await updateDoc(choreRef, chore);
    return { id, ...chore };
  } catch (e) {
    console.error("Error updating chore: ", e);
    throw e;
  }
};

// Delete a chore from the database
export const deleteChore = async (id) => {
  try {
    await deleteDoc(doc(db, "chores", id));
    return id;
  } catch (e) {
    console.error("Error deleting chore: ", e);
    throw e;
  }
};
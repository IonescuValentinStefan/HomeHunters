import {collection, deleteDoc, doc, getDocs, getFirestore} from "firebase/firestore";
import firebase_app from "../firebase/firebase-config";

// Initialize Firestore
const db = getFirestore(firebase_app);

export default async function deleteCollection(collectionName) {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);

    // Delete each document in the collection
    snapshot.forEach(async (docSnap) => {
        const docRef = doc(db, collectionName, docSnap.id);
        await deleteDoc(docRef);
        console.log(`Document with id ${docSnap.id} deleted.`);
    });
}

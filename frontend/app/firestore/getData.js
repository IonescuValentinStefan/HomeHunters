import firebase_app from "../firebase/firebase-config";
import {collection, doc, getDoc, getDocs, getFirestore} from "firebase/firestore";

const db = getFirestore(firebase_app)
export default async function getDocument(collection, id) {
    let docRef = doc(db, collection, id);

    let result = null;
    let error = null;

    try {
        result = await getDoc(docRef);
    } catch (e) {
        error = e;
    }

    return {result, error};
}

export async function getAllDocuments(collectionName) {
    const collectionRef = collection(db, collectionName);

    let result = null;
    let error = null;

    try {
        // Fetch all documents in the collection
        const querySnapshot = await getDocs(collectionRef);

        // Map the documents to an array with their id and data
        result = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    } catch (e) {
        error = e;
    }

    return {result, error};
}
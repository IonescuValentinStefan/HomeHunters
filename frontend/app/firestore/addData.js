import firebase_app from "../firebase/firebase-config";
import {doc, getFirestore, setDoc} from "firebase/firestore";

const db = getFirestore(firebase_app);

export default async function addData(collection, id, data) {
    let result = null;
    let error = null;

    console.log(`Writing document to Firestore at collection "${collection}" with ID "${id}"`, data);

    try {
        result = await setDoc(doc(db, collection, id), data, {
            merge: true,
        });
        console.log(`Document written to Firestore at collection "${collection}" with ID "${id}"`, data);
    } catch (e) {
        error = e;
        console.log("Error writing document to Firestore:", e.message);
    }

    return {result, error};
}

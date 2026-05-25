import firebase_app from "../firebase-config";
import {createUserWithEmailAndPassword, getAuth} from "firebase/auth";

const auth = getAuth(firebase_app);

export default async function signUp(email, password) {

    console.log("firebase/auth/signup.js: signUp: email: ", email, "password: ", password);

    let result = null,
        error = null;
    try {
        result = await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) {
        error = e;
    }

    return {result, error};
}
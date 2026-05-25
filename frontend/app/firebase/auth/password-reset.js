import {getAuth, sendPasswordResetEmail} from "firebase/auth";
import firebase_app from "../firebase-config";

export const sendResetEmail = async (email) => {
    const auth = getAuth(firebase_app);

    try {
        await sendPasswordResetEmail(auth, email);
        console.log("Password reset email sent!");
        return {success: true, message: "Password reset email sent!"};  // Return success result
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("Error sending password reset email:", errorCode, errorMessage);
        return {success: false, errorCode, errorMessage};  // Return error result
    }
};

import axios from "axios";

export const saveUserToFirestore = async (
    userId: string,
    email: string,
    name: string,
    password: string
) => {
    try {
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firestore/users`, {
            userId,
            email,
            name,
            password,
        });
    } catch (err) {
        console.error("Failed to save user to Firestore:", err);
    }
};
"use client"

import UnauthorizedWarning from "../components/unauthorized-warning"
import {useSearchParams} from "next/navigation";

// Define a default message
const defaultMessage = "Warning: You need to be logged in to continue. Please log in first."

interface HomeProps {
    message?: string;
}

export default function Home({message = defaultMessage}: HomeProps) {

    const searchParams = useSearchParams();
    const messageFromQuery = searchParams.get("messageFromQuery");

    return (
        <main className="bg-blue-50 min-h-screen flex items-center justify-center mx-auto py-10">
            <UnauthorizedWarning
                message={message ? message : messageFromQuery ? messageFromQuery.toString() : defaultMessage}
            />
        </main>
    )
}

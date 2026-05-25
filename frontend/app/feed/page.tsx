"use client";

import ApartmentFilter from "./apartment-filter/apartment-filter"
import {Navbar} from "./navbar"
import {useRouter} from "next/navigation";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import firebase_app from "@/firebase/firebase-config";
import React, {useEffect, useState} from "react";
import Loading from "@/components/loading";

export default function Home() {

    const router = useRouter();
    const auth = getAuth(firebase_app);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/unauthorized");
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [auth, router]);

    if (loading) {
        return <Loading/>;
    }

    return (
        <main className="bg-blue-200 min-h-screen">
            <Navbar/>
            <ApartmentFilter/>
        </main>
    )
}
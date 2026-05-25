"use client"

import React, {useEffect, useState} from "react"
import {Card, CardContent} from "@/components/ui/card"
import SellerForm from "@/components/seller-form"
import {getAuth, onAuthStateChanged} from "firebase/auth";
import firebase_app from "@/firebase/firebase-config";
import {useRouter} from "next/navigation";
import Loading from "@/components/loading";

export default function SellerDashboard() {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

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

    // if (!user) {
    //     return <UnauthorizedAccess
    //         message="Warning: You need to be logged in to submit a property listing. Please log in first."/>;
    // } else {
    //     console.log(user);
    // }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <h1 className="text-3xl font-bold">Property Listing Dashboard</h1>

            <Card>
                <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">List Your Property</h2>
                    <p className="text-muted-foreground mb-4">
                        Please fill out all required information to create your property listing.
                    </p>
                    <SellerForm location={location} setLocation={setLocation}/>
                </CardContent>
            </Card>
        </div>
    )
}

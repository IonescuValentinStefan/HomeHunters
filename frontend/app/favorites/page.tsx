"use client"

import React, {useEffect, useState} from "react"
import {ArrowLeft} from "lucide-react"
import {Button} from "@/components/ui/button"
import {useFavorites} from "@/favorites-context"
import {ApartmentCard} from "@/feed/apartment-filter/apartment-card"
import {Navbar} from "@/feed/navbar"
import Link from "next/link"
import {getProperties} from "@/firestore/getProperties";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import firebase_app from "@/firebase/firebase-config";
import {useRouter} from "next/navigation";
import Loading from "@/components/loading";

export default function FavoritesPage() {
    const {favorites} = useFavorites()
    const [favoriteApartments, setFavoriteApartments] = useState([])

    const [apartments, setApartments] = useState([]);
    const [userLoading, setUserLoading] = useState(true);
    const [favoritesLoading, setFavoritesLoading] = useState(true);
    const router = useRouter();

    const auth = getAuth(firebase_app);
    const user = auth.currentUser;

    // if (!user) {
    //     return <UnauthorizedAccess
    //         message="Warning: You need to be logged in to create a favourites list. Please log in first."/>;
    // } else {
    //     console.log(user);
    // }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/unauthorized");
            } else {
                setUserLoading(false);
            }
        });

        return () => unsubscribe();
    }, [auth, router]);

    useEffect(() => {
        const loadProperties = async () => {
            const data = await getProperties();
            setApartments(data);
        };

        loadProperties().then(() => console.log("Properties loaded"));
    }, []);

    useEffect(() => {
        if (apartments.length && favorites.length) {
            // Filter only favorite apartments
            const favApartments = apartments.filter((apartment) =>
                favorites.includes(apartment.id)
            );
            setFavoriteApartments(favApartments);
            setFavoritesLoading(false);
        } else {
            if (apartments.length) setFavoritesLoading(false);
        }
    }, [apartments, favorites]);

    if (userLoading || favoritesLoading) {
        return <Loading/>;
    }

    return (
        <main className="bg-blue-200 min-h-screen">
            <Navbar/>
            <div className="container mx-auto p-4 md:p-6">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/feed">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-white border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                            <ArrowLeft className="h-4 w-4"/>
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-blue-900">Your Favorite Listings</h1>
                </div>

                {favoriteApartments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoriteApartments.map((apartment) => {
                            return <ApartmentCard from={"favorites"} key={apartment.id} apartment={apartment}/>;
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-blue-200">
                        <h2 className="text-xl font-semibold mb-2 text-blue-900">No favorites yet</h2>
                        <p className="text-blue-700 mb-6">Start adding apartments to your favorites to see them
                            here.</p>
                        <Link href="/feed">
                            <Button className="bg-blue-600 hover:bg-blue-700">Browse Feed</Button>
                        </Link>
                    </div>
                )}
            </div>
        </main>
    )
}

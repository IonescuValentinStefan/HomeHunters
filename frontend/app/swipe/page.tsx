"use client"

import React, {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {ChevronLeft, ChevronRight, Heart, LayoutGrid, X} from "lucide-react"

import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {useFavorites} from "@/favorites-context"
import {Navbar} from "@/feed/navbar"
import {getProperties} from "@/firestore/getProperties";
import Link from "next/link";
import Loading from "@/components/loading";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import firebase_app from "@/firebase/firebase-config";

export default function SwipePage() {
    const router = useRouter()
    const {favorites, addFavorite, removeFavorite, isFavorite} = useFavorites()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState<string | null>(null)

    const [apartments, setApartments] = useState([]);
    const [filteredApartments, setFilteredApartments] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const [bgColor, setBgColor] = useState("bg-blue-200")
    const bgResetTimeoutRef = React.useRef<number | null>(null)
    const [loading, setLoading] = useState(true);

    const [initialFavorites, setInitialFavorites] = useState<string[]>([])

    const auth = getAuth(firebase_app);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.replace("/unauthorized");
            } else {
                setAuthChecked(true)
            }
        });

        return () => unsubscribe();
    }, [auth, router]);

    useEffect(() => {
        if (authChecked && favorites.length > 0 && initialFavorites.length === 0) {
            setInitialFavorites(favorites)
        }
    }, [authChecked, favorites, initialFavorites])

    useEffect(() => {
        const loadProperties = async () => {
            setLoading(true);
            try {
                const data = await getProperties();
                setApartments(data);
                setFilteredApartments(data);
            } catch (error) {
                console.error("Failed to load apartments", error);
            } finally {
                setLoading(false);
            }
        };

        void loadProperties();
    }, []);

    // Reset image index when moving to a new apartment
    useEffect(() => {
        setCurrentImageIndex(0)
    }, [currentIndex])

    const currentApartment = filteredApartments[currentIndex]

    // Update the handleSwipe function to check if we're on the last apartment before animating
    const handleSwipe = (dir: string) => {

        // Dacă există deja un timeout activ, îl ștergem
        if (bgResetTimeoutRef.current) {
            clearTimeout(bgResetTimeoutRef.current)
        }

        // Check if this is the last apartment
        const isLastApartment = currentIndex === filteredApartments.length - 1

        if (dir === "right") {

            if (!isFavorite(currentApartment.id)) {
                void addFavorite(currentApartment.id)
            }
            setBgColor("bg-green-200")
        } else if (dir === "left") {
            setBgColor("bg-red-200")
        }

        bgResetTimeoutRef.current = setTimeout(() => {
            setBgColor("bg-blue-200")
            bgResetTimeoutRef.current = null
        }, 1500)

        // If it's the last apartment, navigate immediately without animation
        if (isLastApartment) {
            router.push(`/swipe/end?initial=${initialFavorites.length}`)
            return
        }

        // Otherwise, proceed with animation
        setDirection(dir)

        // Move to the next apartment after animation completes
        setTimeout(() => {
            setCurrentIndex(currentIndex + 1)
            setDirection(null)
        }, 300)
    }

    useEffect(() => {
        return () => {
            if (bgResetTimeoutRef.current) {
                clearTimeout(bgResetTimeoutRef.current)
            }
        }
    }, [])

    const handleButtonSwipe = (dir: string) => {
        handleSwipe(dir)
    }

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent card click from triggering
        setCurrentImageIndex((prev) => (prev === 0 ? currentApartment.photoUrls.length - 1 : prev - 1))
    }

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent card click from triggering
        setCurrentImageIndex((prev) => (prev === currentApartment.photoUrls.length - 1 ? 0 : prev + 1))
    }

    if (!authChecked) return <Loading/>;

    if (loading) {
        return <Loading/>;
    }

    if (!currentApartment) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-2xl font-bold mb-4">No more apartments to show</h1>
                <Link href="/feed">
                    <Button>See All Properties</Button>
                </Link>
            </div>
        )
    }

    return (
        <main
            className={`min-h-screen transition-colors duration-500 ${bgColor}`}
        >

            <Navbar/>
            <div className="container mx-auto p-4 md:p-6 flex flex-col items-center h-[84vh]">
                <div className="w-full max-w-2xl flex flex-col items-center">
                    <div className="flex justify-between w-full mb-6">
                        <Link href="/feed">
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 bg-white border-blue-300 text-blue-700 hover:bg-blue-100"
                            >
                                <LayoutGrid className="h-4 w-4"/>
                                Back to Feed
                            </Button>
                        </Link>
                        <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                            {currentIndex + 1} of {filteredApartments.length}
                        </div>
                    </div>

                    <div className="relative w-[70vh] max-w-2xl h-[65vh] mb-8">
                        <Card className="w-full h-full overflow-hidden shadow-lg border-blue-200">
                            <div className="relative h-[60%] bg-gray-100">
                                <img
                                    src={currentApartment.photoUrls[currentImageIndex] || "/property_default.jpg"}
                                    alt={`${currentApartment.title} - Image ${currentImageIndex + 1}`}
                                    className="w-full h-full object-cover"
                                />

                                {/* Image navigation controls */}
                                {currentApartment.photoUrls.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePrevImage}
                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors z-10"
                                            aria-label="Previous image"
                                        >
                                            <ChevronLeft className="h-6 w-6 text-blue-700"/>
                                        </button>
                                        <button
                                            onClick={handleNextImage}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors z-10"
                                            aria-label="Next image"
                                        >
                                            <ChevronRight className="h-6 w-6 text-blue-700"/>
                                        </button>

                                        {/* Image counter */}
                                        <div
                                            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                                            {currentImageIndex + 1} / {currentApartment.photoUrls.length}
                                        </div>
                                    </>
                                )}

                                <Badge className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700">
                                    ${currentApartment.price}
                                    {currentApartment.listingType === "rent" ? "/mo" : ""}
                                </Badge>
                                <Badge className="absolute bottom-2 left-2 bg-blue-600 hover:bg-blue-700">
                                    {currentApartment.listingType === "rent" ? "For Rent" : "For Sale"}
                                </Badge>
                                {isFavorite(currentApartment.id) && (
                                    <div className="absolute top-2 left-2 bg-white/80 p-1.5 rounded-full">
                                        <Heart className="h-5 w-5 fill-red-500 text-red-500"/>
                                    </div>
                                )}
                            </div>
                            <CardContent className="p-6 h-[40%] flex flex-col overflow-y-auto bg-white">
                                <div className="flex-1 overflow-hidden flex flex-col">
                                    <h2 className="text-2xl font-bold truncate text-blue-900">{currentApartment.title}</h2>
                                    <p className="text-sm text-blue-600 mb-2">{currentApartment.address}</p>

                                    <div className="mb-3 overflow-hidden flex-1">
                                        <p className="text-base">
                                            {currentApartment.description
                                                .split(" ")
                                                .slice(0, 10)
                                                .join(" ")}
                                            {currentApartment.description.split(" ").length > 10 ? "..." : ""}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-1 mb-4">
                                        <Badge variant="outline"
                                               className="bg-blue-50 text-blue-700 border-blue-200">
                                            {currentApartment.rooms} {currentApartment.rooms === 1 ? "room" : "rooms"}
                                        </Badge>
                                        <Badge variant="outline"
                                               className="bg-blue-50 text-blue-700 border-blue-200">
                                            {currentApartment.bathrooms} {currentApartment.bathrooms === 1 ? "bath" : "baths"}
                                        </Badge>
                                        <Badge variant="outline"
                                               className="bg-blue-50 text-blue-700 border-blue-200">
                                            {currentApartment.surfaceArea} m²
                                        </Badge>
                                        <Badge variant="outline"
                                               className="bg-blue-50 text-blue-700 border-blue-200">
                                            {currentApartment.furnished === "furnished"
                                                ? "Furnished"
                                                : currentApartment.furnished === "partially-furnished"
                                                    ? "Partially Furnished"
                                                    : "Unfurnished"}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1 mt-auto">
                                    {currentApartment.amenities.slice(0, 4).map((amenity) => (
                                        <Badge key={amenity}
                                               className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                            {amenity}
                                        </Badge>
                                    ))}
                                    {currentApartment.amenities.length > 4 && (
                                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                            +{currentApartment.amenities.length - 4} more
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-center gap-6 w-full">
                        <Button
                            size="lg"
                            className="rounded-full h-20 w-20 flex items-center justify-center bg-red-100 text-red-500 border-2 border-red-300 hover:bg-red-200 hover:border-red-400 shadow-md"
                            onClick={() => handleButtonSwipe("left")}
                        >
                            <X className="h-10 w-10"/>
                        </Button>
                        <Button
                            size="lg"
                            className="rounded-full h-20 w-20 flex items-center justify-center bg-green-100 text-green-600 border-2 border-green-300 hover:bg-green-200 hover:border-green-400 shadow-md"
                            onClick={() => handleButtonSwipe("right")}
                        >
                            <Heart className="h-10 w-10"/>
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    )
}

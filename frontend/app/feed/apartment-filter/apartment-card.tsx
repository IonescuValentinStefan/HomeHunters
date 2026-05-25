"use client"

import type React from "react"
import {useState} from "react"
import {Heart} from "lucide-react"
import {useRouter} from "next/navigation"

import {Badge} from "@/components/ui/badge"
import {Card, CardContent} from "@/components/ui/card"
import {useFavorites} from "@/favorites-context"
import {getAuth} from "firebase/auth";
import firebase_app from "@/firebase/firebase-config";
import LoginDialog from "@/components/unauthorized-login-dialog"

type ApartmentCardProps = {
    from: "feed" | "favorites";
    apartment: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        userEmail: string;
        userId: string;
        title: string;
        description: string;
        price: number;
        rooms: number;
        bathrooms: number;
        surfaceArea: number;
        photoUrls: string[];
        photoCount: number;
        location: {
            latitude: number;
            longitude: number;
        };
        address: string;
        marker: any;
        amenities: string[];
        customAmenities: string[];
        timestamp: any;
        furnished: string;
        transactionType: string;
        propertyType: string;
    };
    selectedAmenities?: string[];
    amenityOptions?: { id: string; label: string }[];
};


export function ApartmentCard({from, apartment, selectedAmenities = [], amenityOptions = []}: ApartmentCardProps) {
    const router = useRouter()
    const {isFavorite, addFavorite, removeFavorite} = useFavorites()
    const [isHovering, setIsHovering] = useState(false)
    const [showLoginDialog, setShowLoginDialog] = useState(false)

    const auth = getAuth(firebase_app);
    const user = auth.currentUser;

    const handleClick = () => {
        // Save apartment data to sessionStorage as a JSON string
        sessionStorage.setItem("selectedApartment", JSON.stringify(apartment))

        // Navigate to the apartment details page
        router.push(`/apartment/${apartment.id}?from=${from}`)
    }

    const handleFavoriteClick = (e: React.MouseEvent) => {

        e.stopPropagation();

        console.log("favorited apartment: ", apartment);
        console.log("is favorite: ", isFavorite(apartment.id));

        if (!user) {
            setShowLoginDialog(true);
            return;
        }

        if (isFavorite(apartment.id)) {
            void removeFavorite(apartment.id);
        } else {
            void addFavorite(apartment.id);
        }
    }

    function convertToSimpleDate(input: any): Date | null {
        if (!input) return new Date();

        if (typeof input === "object") {
            if (input.seconds !== undefined && input.nanos !== undefined) {
                // Firestore Timestamp raw
                return new Date(input.seconds * 1000 + Math.floor(input.nanos / 1_000_000));
            }

            if (typeof input.toDate === "function") {
                return input.toDate();
            }
        }

        const parsed = new Date(input);
        return isNaN(parsed.getTime()) ? null : parsed;
    }

    return (
        <>
            <Card
                className="overflow-hidden cursor-pointer shadow-md border-blue-200 hover:shadow-lg transition-shadow"
                onClick={handleClick}
            >
                <div className="aspect-video w-full overflow-hidden relative">
                    <img
                        src={apartment.photoUrls?.[0] || "property_default.jpg"}
                        alt={apartment.title}
                        className="h-full w-full object-cover transition-all hover:scale-105"
                    />
                    <Badge className="absolute bottom-2 left-2 bg-blue-600 hover:bg-blue-700">
                        {apartment.transactionType === "renting" ? "For Rent" : "For Sale"}
                    </Badge>
                    <button
                        className="absolute top-2 left-2 p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors"
                        onClick={handleFavoriteClick}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        <Heart
                            className={`h-5 w-5 ${
                                isFavorite(apartment.id)
                                    ? "fill-red-500 text-red-500"
                                    : isHovering
                                        ? "fill-red-200 text-red-400"
                                        : "text-gray-400"
                            }`}
                        />
                    </button>
                </div>
                <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-lg text-blue-900">{apartment.title}</h3>
                            <p className="text-sm text-blue-600">{apartment.address}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-blue-900">
                                €{apartment.price}
                                {apartment.transactionType === "renting" ? "/month" : ""}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {apartment.surfaceArea} m²
                                • {apartment.rooms} {apartment.rooms === 1 ? "bed" : "beds"} •{" "}
                                {apartment.bathrooms} {apartment.bathrooms === 1 ? "bath" : "baths"}
                            </p>
                        </div>
                    </div>
                    <p className="text-sm mt-2">{apartment.description}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Added {convertToSimpleDate(apartment.timestamp)?.toLocaleDateString("en-US")}</span>
                        {apartment.furnished === "furnished" && (
                            <span className="font-medium text-blue-600">Furnished</span>
                        )}
                        {apartment.furnished === "partially-furnished" && (
                            <span className="font-medium text-blue-600">Partially Furnished</span>
                        )}
                        {apartment.furnished === "unfurnished" && (
                            <span className="font-medium text-blue-600">Unfurnished</span>
                        )}

                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                        {(apartment.amenities ?? []).map((amenity) => (
                            <span
                                key={amenity}
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                                    !selectedAmenities ||
                                    selectedAmenities.some(
                                        (id) =>
                                            !amenityOptions ||
                                            amenityOptions.find((opt) => opt.id === id)?.label === amenity
                                    )
                                        ? "bg-blue-100 text-blue-800 border-blue-200"
                                        : "border border-blue-100"
                                }`}
                            >
                                {amenity}
                            </span>
                        ))}
                    </div>

                </CardContent>
            </Card>

            <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}/>
        </>
    )
}

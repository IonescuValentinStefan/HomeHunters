"use client"

import React, {useEffect, useRef, useState} from "react"
import {ChevronLeft, ChevronRight, Heart, Plus, Trash2} from "lucide-react"

import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import Link from "next/link";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import firebase_app from "@/firebase/firebase-config";
import axios from "axios";
import {MapProvider} from "@/map/MapContext";
import {Libraries, useJsApiLoader} from "@react-google-maps/api";
import {googleMapsApiKey} from "@/map/config";
import {usePlacesService} from "@/map/useEffectsMap";
import MapComponent from "@/map/MapComponent";
import {Group} from "@mantine/core";
import Loading from "@/components/loading";
import {useRouter} from "next/navigation";

const libraries: Libraries = ['places'];

const transactionTypeColors = {
    "For Rent": "bg-blue-500",
    "For Sale": "bg-green-500",
}

export default function SellerDashboard() {

    const auth = getAuth(firebase_app);
    const user = auth.currentUser;
    const userId = user ? user.uid : null;

    const [currentIndex, setCurrentIndex] = useState(0)
    const [propertyList, setPropertyList] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0);
    const router = useRouter();
    const mapRef = useRef<google.maps.Map | null>(null);

    const {isLoaded, loadError} = useJsApiLoader({
        googleMapsApiKey,
        libraries,
    });

    const placesServiceRef = usePlacesService(isLoaded, mapRef);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firestore/properties/user/${userId}`);
                setPropertyList(response.data);
            } catch (error) {
                console.error("Error fetching properties:", error);
            } finally {
                setLoading(false);
            }
        };

        void fetchProperties();
    }, []);


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

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % propertyList.length)
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + propertyList.length) % propertyList.length)
    }

    // const deleteProperty = (id: string) => {
    //     setPropertyList((prev) => prev.filter((property) => property.id !== id))
    //     if (currentIndex >= propertyList.length - 1) {
    //         setCurrentIndex(Math.max(0, propertyList.length - 2))
    //     }
    // }

    const deleteProperty = async (id: string) => {
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firestore/properties/${id}`);
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firestore/properties/user/${userId}`);
            setPropertyList(response.data);
            setCurrentIndex(0);
            setRefreshKey((prev) => prev + 1);
        } catch (error) {
            console.error("Error deleting property:", error);
        }
    };

    // Always show current property and next property
    const getVisibleProperties = () => {
        if (propertyList.length === 0) return []
        if (propertyList.length === 1) return [propertyList[0]]

        const nextIndex = (currentIndex + 1) % propertyList.length
        return [propertyList[currentIndex], propertyList[nextIndex]]
    }

    const visibleProperties = getVisibleProperties()

    if (loading) {
        return <Loading/>
    }

    if (propertyList.length === 0) {
        return (
            <div className="min-h-screen bg-blue-200 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
                            <p className="text-gray-600">Manage your listed properties</p>
                        </div>
                    </div>

                    <div className="text-center py-12">
                        <Link href="/property-listing">
                            <div
                                className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Plus className="h-8 w-8 text-gray-400"/>
                            </div>
                        </Link>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No properties listed</h3>
                        <p className="text-gray-600 mb-4">Start by adding your first property</p>
                        <Link href="/property-listing">
                            <Button className="bg-blue-600 hover:bg-blue-700">Add New Property</Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <MapProvider
            mapRef={mapRef}
            placesServiceRef={placesServiceRef}
            isLoaded={isLoaded}
        >
            <div className="min-h-screen bg-blue-200 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
                            <p className="text-gray-600">Manage your {propertyList.length} listed properties</p>
                        </div>
                        <Link href="/property-listing">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2"/>
                                Add New Property
                            </Button>
                        </Link>
                    </div>

                    {/* Property Carousel */}
                    <div className="relative">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Property Listings</h2>

                        <div className="relative">
                            {/* Navigation Arrows */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={prevSlide}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full w-10 h-10 p-0 shadow-lg"
                            >
                                <ChevronLeft className="h-5 w-5"/>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={nextSlide}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full w-10 h-10 p-0 shadow-lg"
                            >
                                <ChevronRight className="h-5 w-5"/>
                            </Button>

                            {/* Property Cards */}
                            <div
                                className={`overflow-hidden ${visibleProperties.length === 1 ? "flex justify-center" : "flex gap-6"}`}>
                                {visibleProperties.map((property) => (
                                    <div
                                        key={property.id}
                                        className={`${
                                            visibleProperties.length === 1 ? "w-[400px]" : "flex-1 min-w-0"
                                        }`}
                                    >
                                        {/*<Card className="bg-white overflow-hidden shadow-lg rounded-2xl">*/}
                                        <Card
                                            className="bg-white overflow-hidden shadow-lg rounded-2xl h-[550px]"
                                        >
                                            <div className="relative">
                                                <img
                                                    src={property.photoUrls?.[0] || "property_default.jpg"}
                                                    alt={property.title}
                                                    className="w-full h-48 object-cover"
                                                />
                                                <div className="absolute top-3 left-3">
                                                    <Heart className="h-6 w-6 text-white fill-red-500"/>
                                                </div>
                                                <div className="absolute bottom-3 left-3">
                                                    <Badge
                                                        className={`${transactionTypeColors[property.transactionType]} text-white`}>{property.transactionType}</Badge>
                                                </div>
                                            </div>

                                            <CardContent className="p-4 flex flex-col h-full">
                                                {/* Titlu + Adresă */}
                                                <div className="mb-3">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{property.title}</h3>
                                                    <p className="text-blue-600 text-sm font-medium">{property.address}</p>
                                                </div>

                                                {/* Descriere + spațiu flexibil */}
                                                {/*<p className="text-gray-700 text-sm mb-3 flex-grow">{property.description}</p>*/}

                                                <p className="ext-gray-700 text-sm mb-3 flex-grow">
                                                    {property.description
                                                        .split(" ")
                                                        .slice(0, 10)
                                                        .join(" ")}
                                                    {property.description.split(" ").length > 10 ? "..." : ""}
                                                </p>

                                                {/* Info + preț */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Added {convertToSimpleDate(property.timestamp)?.toLocaleDateString("en-US")}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-bold text-gray-900">{property.price}€</p>
                                                        <p className="text-sm text-gray-600">
                                                            {property.surfaceArea} m²
                                                            • {property.rooms} {property.rooms === 1 ? "room" : "rooms"} • {property.bathrooms} {property.bathrooms === 1 ? "bath" : "baths"}
                                                        </p>
                                                        <p className="text-sm text-gray-600">{property.furnished}</p>
                                                    </div>
                                                </div>

                                                {/* Buton de ștergere */}
                                                <div className="mt-auto flex justify-center pt-4">
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => deleteProperty(property.id)}
                                                        className="bg-red-500 hover:bg-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2"/>
                                                        Delete Property
                                                    </Button>
                                                </div>
                                            </CardContent>

                                        </Card>
                                    </div>
                                ))}
                            </div>

                            {/* Navigation Dots - Individual Properties */}
                            <div className="flex justify-center mt-6 gap-2">
                                {propertyList.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`w-3 h-3 rounded-full transition-colors ${
                                            index === currentIndex ? "bg-blue-600" : "bg-white"
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <Group justify="center" grow>
                        <MapComponent userType="seller" refreshKey={refreshKey}/>
                        {/*<MarkerFormComponent/>*/}
                    </Group>
                </div>
            </div>
        </MapProvider>
    )
}

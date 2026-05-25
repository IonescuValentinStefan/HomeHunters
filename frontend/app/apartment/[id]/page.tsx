"use client"

import {ArrowLeft, Calendar, CircleCheck, Home, MapPin, Maximize, Ruler, ShowerHead} from "lucide-react"

import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Separator} from "@/components/ui/separator"
import {ImageCarousel} from "@/apartment/image-carousel";
import React, {useEffect, useState} from "react";
import {useParams, useRouter, useSearchParams} from 'next/navigation';
import {useFavorites} from "@/favorites-context";
import axios from "axios";
import {ScheduleViewingDialog} from "@/apartment/[id]/schedule-viewing-dialog";
import Link from "next/link";
import Loading from "@/components/loading";


export default function ApartmentListing() {

    const params = useParams() as { id?: string | string[] };
    const rawId = params?.id;
    const apartmentId = Array.isArray(rawId) ? rawId[0] : rawId;
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get("from")?.replace(/^"|"$/g, ""); // Remove quotes if present

    console.log("params:", params);
    console.log("apartmentId:", apartmentId);

    const [apartment, setApartment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFav, setIsFav] = useState(false);
    const [formattedDate, setFormattedDate] = useState("");

    const {favorites, isFavorite, addFavorite, removeFavorite} = useFavorites();

    const variant: "destructive" | "default" =
        apartmentId && isFavorite(apartmentId) ? "destructive" : "default";

    const colorClass = isFav ? "" : "bg-blue-600 text-white hover:bg-blue-700";


    useEffect(() => {
        if (apartmentId) {
            console.log("Apartment ID is set:", apartmentId);

            console.log("Checking if apartment is favorite:", isFavorite(apartmentId));

            setIsFav(isFavorite(apartmentId));
        }
    }, [apartmentId, favorites]);

    const handleToggleFavorite = async () => {
        if (!apartmentId) return;

        if (isFav) {
            await removeFavorite(apartmentId);
        } else {
            await addFavorite(apartmentId);
        }
    };

    useEffect(() => {
        if (!apartmentId) return;

        const fetchApartment = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firestore/properties/${apartmentId}`);
                console.log("Fetched apartment data:", response.data);
                setApartment(response.data);

                console.log("Timestamp from response:", response.data.timestamp);

                // Convert timestamp to a simple date format
                const dateAdded = convertToSimpleDate(response.data.timestamp);

                console.log("dateAdded:", dateAdded);

                let formattedDate = "";

                // Format date to a readable string
                if (dateAdded) {
                    formattedDate = new Intl.DateTimeFormat("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    }).format(dateAdded);
                }

                console.log("Formatted date:", formattedDate);

                setFormattedDate(formattedDate);

            } catch (error) {
                console.error("Error fetching apartment data:", error);
                setApartment(null);
            } finally {
                setLoading(false);
            }
        };

        void fetchApartment();
    }, [apartmentId]);


    if (loading) {
        return <Loading/>
    }
    if (apartment === null) return <p>Apartment not found.</p>;


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

    function getInitialsFromName(firstName: string = "", lastName: string = ""): string {
        const firstInitial = firstName.trim()[0]?.toUpperCase() || "";
        const lastInitial = lastName.trim()[0]?.toUpperCase() || "";
        return `${firstInitial}${lastInitial}`;
    }


    return (
        <div className="min-h-screen flex flex-col bg-blue-200">
            {from && (
                <div className="mb-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push(`/${from}`)}
                        className="flex items-center text-blue-600 hover:text-blue-800 p-0">
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Back to {from.charAt(0).toUpperCase() + from.slice(1)}
                    </Button>
                </div>
            )}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                    {/* Main content - takes 2/3 of the space on large screens */}
                    <div className="lg:col-span-2">
                        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h1 className="text-3xl font-bold">{apartment.title}</h1>
                                <div className="mt-2 flex items-center text-muted-foreground">
                                    <MapPin className="mr-1 h-4 w-4"/>
                                    <span>{apartment.address}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-primary">€{apartment.price}</div>
                                <div className="text-sm text-muted-foreground">per month</div>
                            </div>
                        </div>

                        {/* Image carousel */}
                        <ImageCarousel images={apartment.photoUrls || []} title={apartment.title}/>

                        {/* Description */}
                        <div className="mb-8">
                            <h2 className="mb-4 text-2xl font-semibold">Description</h2>
                            <p>{apartment.description}</p>
                            {/*<p className="mt-4">*/}
                            {/*    This beautiful loft apartment is located in the heart of downtown, offering stunning*/}
                            {/*    city*/}
                            {/*    views and modern*/}
                            {/*    amenities. The open floor plan creates a spacious feel, with large windows that allow*/}
                            {/*    natural light to*/}
                            {/*    flood the space. The apartment features high-end finishes, including hardwood floors,*/}
                            {/*    stainless steel*/}
                            {/*    appliances, and granite countertops.*/}
                            {/*</p>*/}
                        </div>

                        {/* Details */}
                        <div className="mb-8">
                            <h2 className="mb-4 text-2xl font-semibold">Property Details</h2>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center p-4">
                                        <Home className="mb-2 h-6 w-6 text-primary"/>
                                        <span className="text-sm text-muted-foreground">Rooms</span>
                                        <span className="text-lg font-semibold">{apartment.rooms}</span>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center p-4">
                                        <ShowerHead className="mb-2 h-6 w-6 text-primary"/>
                                        <span className="text-sm text-muted-foreground">Bathrooms</span>
                                        <span className="text-lg font-semibold">{apartment.bathrooms}</span>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center p-4">
                                        <Maximize className="mb-2 h-6 w-6 text-primary"/>
                                        <span className="text-sm text-muted-foreground">Area</span>
                                        <span className="text-lg font-semibold">{apartment.surfaceArea} m²</span>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center p-4">
                                        <Calendar className="mb-2 h-6 w-6 text-primary"/>
                                        <span className="text-sm text-muted-foreground">Available</span>
                                        <span className="text-lg font-semibold">Immediately</span>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="mb-8">
                            <h2 className="mb-4 text-2xl font-semibold">Amenities</h2>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {apartment.amenities?.map((amenity, index) => (
                                    <div key={index}
                                         className="flex items-center gap-2 rounded-md border border-white p-3">
                                        <CircleCheck className="h-5 w-5 text-blue-600"/>
                                        <span>{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - takes 1/3 of the space on large screens */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-8">
                            <CardContent className="p-6">
                                <h3 className="mb-4 text-xl font-semibold">Contact Information</h3>
                                <div className="mb-6 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-12 w-12 rounded-full bg-primary/10">
                                            <div
                                                className="flex h-full w-full items-center justify-center text-primary font-semibold">
                                                {getInitialsFromName(apartment.firstName, apartment.lastName)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {apartment.firstName} {apartment.lastName}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Available 10AM–4PM</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        <p>Listed on {formattedDate}</p>
                                        <p>Reference ID: #{apartmentId}</p>
                                    </div>
                                </div>

                                <Separator className="my-4"/>

                                <div className="space-y-4">
                                    <ScheduleViewingDialog propertyId={apartmentId as string}/>

                                    {/*using encodeURIComponent because the title may contain special characters (spaces, etc.)*/}

                                    <Link
                                        href={`/contact?apartmentId=${apartmentId}&title=${encodeURIComponent(apartment.title)}`}
                                        className="block w-full"
                                    >
                                        <Button variant="outline" className="w-full">
                                            Contact Seller
                                        </Button>
                                    </Link>

                                    <Button
                                        variant={variant}
                                        className={`w-full ${colorClass}`}
                                        onClick={handleToggleFavorite}
                                        disabled={!apartmentId}
                                    >
                                        {isFav ? "Remove from Favorites" : "Add to Favorites"}
                                    </Button>
                                </div>

                                <Separator className="my-4"/>

                                <div className="rounded-md bg-muted p-4">
                                    <h4 className="mb-2 font-medium">Property Features</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-primary/10">
                                                {apartment.transactionType === "renting" ? "For Rent" : "For Sale"}
                                            </Badge>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Ruler className="h-4 w-4 text-muted-foreground"/>
                                            <span>{apartment.surfaceArea} m²</span>
                                        </li>
                                        {apartment.furnished && (
                                            <li className="flex items-center gap-2">
                                                <div
                                                    className="h-4 w-4 rounded-full bg-primary/10 text-center text-xs text-primary">✓
                                                </div>
                                                <span>Furnished</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

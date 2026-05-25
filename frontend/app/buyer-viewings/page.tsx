"use client"

import {Calendar, Clock, MapPin, Phone} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Navbar} from "@/feed/navbar";
import {useEffect, useState} from "react";
import axios from "axios";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import firebase_app from "@/firebase/firebase-config";
import {useRouter} from "next/navigation";
import Loading from "@/components/loading";
import Link from "next/link";

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

export default function Component() {
    const [viewings, setViewings] = useState([])
    const [authLoading, setAuthLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(true);
    const auth = getAuth(firebase_app);
    const user = auth.currentUser;
    const userId = user ? user.uid : null;

    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/unauthorized");
            } else {
                setAuthLoading(false);
            }
        });

        return () => unsubscribe();
    }, [auth, router]);

    useEffect(() => {
        const fetchViewings = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firestore/viewings/user/${userId}`)
                setViewings(response.data)
            } catch (error) {
                console.error("Failed to fetch viewings", error)
            } finally {
                setDataLoading(false)
            }
        }

        void fetchViewings()
    }, [userId])

    const cancelViewing = async (viewingId: string) => {
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firestore/viewings/${viewingId}`)
            setViewings(prev => prev.filter(viewing => viewing.id !== viewingId))
        } catch (error) {
            console.error("Failed to cancel viewing", error)
        }
    }

    if (authLoading || dataLoading) {
        return <Loading/>;
    }

    return (
        <div className="min-h-screen bg-blue-200">
            <Navbar/>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-6">

                {/* Viewings List */}
                <div className="space-y-6">
                    {viewings.map((viewing) => (
                        <Card key={viewing.id} className="overflow-hidden shadow-md bg-white">
                            <CardContent className="p-0">
                                <div className="flex flex-col lg:flex-row">

                                    {/* Property Content */}
                                    <div className="flex-1 p-6">
                                        <div className="flex flex-col space-y-4">
                                            {/* Title and Address */}
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900">{viewing.property.title}</h3>
                                                <p className="text-gray-600 flex items-center">
                                                    <MapPin className="h-4 w-4 mr-1"/>
                                                    {viewing.property.address}
                                                </p>
                                            </div>

                                            {/* Viewing Date and Time */}
                                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-2"/>
                                                    {formatDate(viewing.date)}
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-2"/>
                                                    {viewing.time}
                                                </div>
                                            </div>

                                            {/* Agent Info */}
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-900">{viewing.property.firstName} {viewing.property.lastName}</p>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Phone className="h-3 w-3"/>
                                                    {viewing.property.phone}
                                                </div>
                                            </div>

                                            {/* Buttons */}
                                            <div className="flex gap-3">
                                                <Button
                                                    variant="outline"
                                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                                    onClick={() => cancelViewing(viewing.id)}
                                                >
                                                    Cancel Viewing
                                                </Button>

                                                <Button
                                                    className="bg-blue-600 hover:from-blue-700 hover:to-purple-700 text-white"
                                                    onClick={() => router.push(`/apartment/${viewing.property.id}?from="buyer-viewings"`)}
                                                >
                                                    View Property Details
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State (if no viewings) */}
                {!dataLoading && viewings.length === 0 && (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No viewings scheduled</h3>
                            <p className="text-gray-600 mb-4">Start exploring properties and schedule your first
                                viewing.</p>
                            <Link href="/feed">
                                <Button>Browse Properties</Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    )
}

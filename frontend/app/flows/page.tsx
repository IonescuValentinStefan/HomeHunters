"use client";

import {LayoutDashboard, LogOut, Search, Star} from "lucide-react"
import {Button} from "@/components/ui/button"
import Link from "next/link";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import firebase_app from "@/firebase/firebase-config";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import Loading from "@/components/loading";

export default function Flows() {

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
        <div className="min-h-screen bg-blue-200 p-8 flex items-center justify-center">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/30 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-lg">
                    <div className="space-y-6">
                        {/* Leave a Review Section */}
                        <div
                            className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg p-10 flex items-center gap-x-8 hover:bg-white/60 transition-all duration-200">
                            <div className="flex items-center gap-x-6 flex-1">
                                <div
                                    className="bg-yellow-100/80 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                                    <Star className="h-8 w-8 text-yellow-600"/>
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-2xl font-semibold text-gray-900 mb-2 truncate">
                                        Leave a Review
                                    </h2>
                                    <p className="text-gray-700 text-sm md:text-base break-words">
                                        Share your experience with properties and help others make informed decisions.
                                    </p>
                                </div>
                            </div>
                            <Link href="/add-review">
                                <Button size="lg" className="w-48 bg-blue-600/90 hover:bg-blue-600">
                                    Write Review
                                </Button>
                            </Link>
                        </div>

                        {/* Browse Properties Section */}
                        <div
                            className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg p-10 flex items-center gap-x-8 hover:bg-white/60 transition-all duration-200">
                            <div className="flex items-center gap-x-6 flex-1">
                                <div
                                    className="bg-blue-100/80 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                                    <Search className="h-8 w-8 text-blue-600"/>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-900 mb-2 truncate">
                                        Browse Properties
                                    </h2>
                                    <p className="text-gray-700">
                                        Discover your perfect home from our extensive collection of properties.
                                    </p>
                                </div>
                            </div>
                            <Link href="/feed">
                                <Button size="lg" className="w-48 bg-blue-600/90 hover:bg-blue-600">
                                    Start Browsing
                                </Button>
                            </Link>
                        </div>

                        {/*/!* List a Property Section *!/*/}
                        {/*<div*/}
                        {/*    className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg p-10 flex items-center gap-x-8 hover:bg-white/60 transition-all duration-200">*/}
                        {/*    <div className="flex items-center gap-x-6 flex-1">*/}
                        {/*        <div*/}
                        {/*            className="bg-green-100/80 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">*/}
                        {/*            <Home className="h-8 w-8 text-green-600"/>*/}
                        {/*        </div>*/}
                        {/*        <div>*/}
                        {/*            <h2 className="text-2xl font-semibold text-gray-900 mb-2 truncate">*/}
                        {/*                List a Property*/}
                        {/*            </h2>*/}
                        {/*            <p className="text-gray-700">*/}
                        {/*                Get your property in front of thousands of potential buyers and renters.*/}
                        {/*            </p>*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*    <Link href="/property-listing">*/}
                        {/*        <Button size="lg" className="w-48 bg-blue-600/90 hover:bg-blue-600">*/}
                        {/*            List Property*/}
                        {/*        </Button>*/}
                        {/*    </Link>*/}
                        {/*</div>*/}

                        {/* Manage Listings Section */}
                        <div
                            className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg p-10 flex items-center gap-x-8 hover:bg-white/60 transition-all duration-200">
                            <div className="flex items-center gap-x-6 flex-1">
                                <div
                                    className="bg-purple-100/80 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                                    <LayoutDashboard className="h-8 w-8 text-purple-600"/>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-900 mb-2 truncate">
                                        Manage Listings
                                    </h2>
                                    <p className="text-gray-700">
                                        View and manage your existing listings or post a new one in your seller
                                        dashboard.
                                    </p>
                                </div>
                            </div>
                            <Link href="/seller-dashboard">
                                <Button size="lg" className="w-48 bg-blue-600/90 hover:bg-blue-600">
                                    Go to Dashboard
                                </Button>
                            </Link>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <Link href="/logout">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="bg-red-500 hover:bg-red-600 flex items-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Button>
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

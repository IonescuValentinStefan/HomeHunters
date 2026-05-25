"use client"

import {useRouter, useSearchParams} from "next/navigation"
import {Heart, LayoutGrid} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Navbar} from "@/feed/navbar"
import {useFavorites} from "@/favorites-context"

export default function SwipeEndPage() {
    const router = useRouter()
    const {favorites} = useFavorites()

    const searchParams = useSearchParams()
    const initialCount = parseInt(searchParams.get("initial") ?? "0")
    const newCount = Math.max(0, favorites.length - initialCount)

    return (
        <main className="bg-blue-200 min-h-screen">
            <Navbar/>
            <div
                className="container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center min-h-[80vh]">
                <div
                    className="w-full max-w-md text-center bg-white p-6 md:p-8 rounded-xl shadow-lg border border-blue-200">
                    <h1 className="text-2xl md:text-3xl font-bold mb-4 text-blue-900">You've seen all properties!</h1>

                    {newCount > 0 ? (
                        <p className="text-base md:text-lg mb-6">
                            You've added <span className="font-semibold text-blue-600">{newCount}</span>{" new "}
                            {newCount === 1 ? "property" : "properties"} to your favorites.
                        </p>
                    ) : (
                        <p className="text-base md:text-lg mb-6">
                            You haven't added any new properties to your favorites yet. Try swiping right on properties you
                            like!
                        </p>
                    )}

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => router.push("/feed")}
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 w-full"
                        >
                            <LayoutGrid className="h-4 w-4"/>
                            <span>Browse All Properties</span>
                        </Button>

                        <Button
                            onClick={() => router.push("/favorites")}
                            variant="outline"
                            className="flex items-center justify-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100 w-full"
                        >
                            <Heart className="h-4 w-4"/>
                            <span>View Favorites</span>
                        </Button>

                        <Button
                            onClick={() => router.push("/swipe")}
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 hover:bg-blue-200 w-full"
                        >
                            Start Over
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    )
}

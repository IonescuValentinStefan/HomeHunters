"use client"

import Link from "next/link"
import {Calendar, Heart, Home, LayoutGrid, LogOut, Map, Menu, Shuffle} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet"
import {useFavorites} from "@/favorites-context"
import {usePathname} from "next/navigation"
import React from "react";

export function Navbar() {
    const {favorites} = useFavorites()
    const pathname = usePathname()

    return (
        <header className="border-b bg-white shadow-sm border-blue-100">
            <div className="container mx-auto h-16 px-4 relative">
                {/* Logo on the left */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Link href="/" className="flex items-center gap-2">
                        <Home className="h-5 w-5 text-blue-900"/>
                        <span className="text-lg font-semibold text-blue-900">HomeHunters</span>
                    </Link>
                </div>

                {/* Desktop navigation - pushed to the far right */}
                <div className="hidden md:flex items-center justify-end h-full pr-0">
                    <nav className="flex items-center gap-6">
                        <Link
                            href="/feed"
                            className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1 ${
                                pathname === "/" ? "text-blue-600" : "text-muted-foreground"
                            }`}
                        >
                            <LayoutGrid className="h-4 w-4"/>
                            Feed
                        </Link>
                        <Link
                            href="/buyer"
                            className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1 ${
                                pathname.startsWith("/buyer") ? "text-blue-600" : "text-muted-foreground"
                            }`}
                        >
                            <Map className="h-4 w-4"/>
                            Map
                        </Link>
                        <Link
                            href="/swipe"
                            className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1 ${
                                pathname.startsWith("/swipe") ? "text-blue-600" : "text-muted-foreground"
                            }`}
                        >
                            <Shuffle className="h-4 w-4"/>
                            Swipe
                        </Link>
                        <div className="flex items-center gap-1">
                            <Link
                                href="/favorites"
                                className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1 ${
                                    pathname === "/favorites" ? "text-blue-600" : "text-muted-foreground"
                                }`}
                            >
                                <Heart className="h-4 w-4"/>
                                Favorites

                            </Link>

                            {favorites.length > 0 && (
                                <span
                                    className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
                                    {favorites.length}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            <Link
                                href="/buyer-viewings"
                                className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1 ${
                                    pathname === "/buyer-viewings" ? "text-blue-600" : "text-muted-foreground"
                                }`}
                            >
                                <Calendar className="h-4 w-4"/>
                                Viewings

                            </Link>
                        </div>

                        <Link
                            href="/logout"
                            className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1 ${
                                pathname.startsWith("/logout") ? "text-blue-600" : "text-muted-foreground"
                            }`}
                        >
                            <LogOut className="h-4 w-4"/>
                            Logout
                        </Link>
                    </nav>
                </div>

                {/* Mobile navigation */}
                <div className="md:hidden flex items-center justify-end h-full">
                    <div className="flex items-center gap-2">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="border-blue-200 h-9 w-9">
                                    <Menu className="h-5 w-5 text-blue-700"/>
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <SheetHeader>
                                    <SheetTitle>Menu</SheetTitle>
                                </SheetHeader>
                                <nav className="flex flex-col gap-4 mt-8">
                                    <Link
                                        href="/feed"
                                        className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1 ${pathname === "/" ? "text-blue-600" : "text-muted-foreground"}`}
                                    >
                                        <LayoutGrid className="h-4 w-4"/>
                                        Feed
                                    </Link>
                                    <Link
                                        href="/buyer"
                                        className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1 ${pathname.startsWith("/buyer") ? "text-blue-600" : "text-muted-foreground"}`}
                                    >
                                        <Map className="h-4 w-4"/>
                                        Map
                                    </Link>
                                    <Link
                                        href="/swipe"
                                        className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1 ${pathname.startsWith("/swipe") ? "text-blue-600" : "text-muted-foreground"}`}
                                    >
                                        <Shuffle className="h-4 w-4"/>
                                        Swipe
                                    </Link>
                                    <div className="flex items-center gap-1">
                                        <Link
                                            href="/favorites"
                                            className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1 ${pathname === "/favorites" ? "text-blue-600" : "text-muted-foreground"}`}
                                        >
                                            <Heart className="h-4 w-4"/>
                                            Favorites
                                        </Link>
                                        {favorites.length > 0 && (
                                            <span
                                                className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
                                                {favorites.length}
                                            </span>
                                        )}
                                    </div>
                                    <Link
                                        href="/logout"
                                        className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1 ${pathname.startsWith("/logout") ? "text-blue-600" : "text-muted-foreground"}`}
                                    >
                                        <LogOut className="h-4 w-4"/>
                                        Logout
                                    </Link>
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    )
}

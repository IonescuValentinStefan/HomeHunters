"use client"

import {useEffect, useState} from "react"
import {MapContainer, Marker, TileLayer, useMap, useMapEvents} from "react-leaflet"
import {Button} from "@/components/ui/button"
import {Info, Locate} from "lucide-react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
    iconUrl: "/marker-icon.png",
    shadowUrl: "/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})

// Default position (New York City)
const DEFAULT_POSITION = {lat: 40.7128, lng: -74.006}

interface LocationMapProps {
    location: { lat: number; lng: number } | null
    setLocation: (location: { lat: number; lng: number }) => void
}

function MapEvents({setLocation}: { setLocation: (location: { lat: number; lng: number }) => void }) {
    useMapEvents({
        click: (e) => {
            setLocation({lat: e.latlng.lat, lng: e.latlng.lng})
        },
    })
    return null
}

function RecenterButton({setLocation}: { setLocation: (location: { lat: number; lng: number }) => void }) {
    const map = useMap()
    const [isLoading, setIsLoading] = useState(false)
    const [isGeolocationAvailable, setIsGeolocationAvailable] = useState(false)

    // Check if geolocation is available in this environment
    useEffect(() => {
        // Safely check if geolocation exists and is accessible
        try {
            if (
                typeof navigator !== "undefined" &&
                navigator.geolocation &&
                typeof navigator.geolocation.getCurrentPosition === "function"
            ) {
                setIsGeolocationAvailable(true)
            }
        } catch (e) {
            console.log("Geolocation API is not accessible in this environment")
            setIsGeolocationAvailable(false)
        }
    }, [])

    const handleRecenter = () => {
        if (!isGeolocationAvailable) {
            alert("Geolocation is not available in this environment. Please click on the map to set your location manually.")
            return
        }

        setIsLoading(true)

        // Use a timeout to handle cases where geolocation might hang
        const timeoutId = setTimeout(() => {
            setIsLoading(false)
            alert("Location request timed out. Please click on the map to set your location manually.")
        }, 10000)

        try {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clearTimeout(timeoutId)
                    const {latitude, longitude} = position.coords
                    const newLocation = {lat: latitude, lng: longitude}
                    setLocation(newLocation)
                    map.flyTo([latitude, longitude], 15)
                    setIsLoading(false)
                },
                (error) => {
                    clearTimeout(timeoutId)
                    console.error("Error getting location:", error)

                    // Set a default location and inform the user
                    alert("Unable to get your current location. Please click on the map to set your location manually.")
                    setIsLoading(false)
                },
            )
        } catch (err) {
            clearTimeout(timeoutId)
            console.error("Geolocation error:", err)
            alert(
                "An error occurred while trying to access your location. Please click on the map to set your location manually.",
            )
            setIsLoading(false)
        }
    }

    if (!isGeolocationAvailable) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className="absolute top-3 right-3 z-[1000] bg-white text-black p-2 rounded-md flex items-center">
                            <Info className="h-4 w-4 mr-2 text-amber-500"/>
                            <span className="text-sm">Geolocation unavailable</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="max-w-xs">
                            Geolocation is not available in this environment. Please click directly on the map to set
                            your location.
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return (
        <Button
            onClick={handleRecenter}
            className="absolute top-3 right-3 z-[1000] bg-white text-black hover:bg-gray-100"
            size="sm"
            disabled={isLoading}
        >
            <Locate className="h-4 w-4 mr-2"/>
            {isLoading ? "Loading..." : "Current Location"}
        </Button>
    )
}

export default function LocationMap({location, setLocation}: LocationMapProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)

        // Set default location if none provided
        if (!location) {
            setLocation(DEFAULT_POSITION)
        }

        // Clean up Leaflet elements on unmount
        return () => {
            setIsMounted(false)
        }
    }, [location, setLocation])

    if (!isMounted) {
        return <div className="h-full w-full bg-gray-100 flex items-center justify-center">Loading map...</div>
    }

    return (
        <div className="h-full w-full relative">
            <div className="absolute bottom-3 left-3 z-[1000] bg-white p-2 rounded-md shadow-md">
                <p className="text-sm font-medium">Click anywhere on the map to set your location</p>
            </div>

            <MapContainer
                center={location ? [location.lat, location.lng] : [DEFAULT_POSITION.lat, DEFAULT_POSITION.lng]}
                zoom={13}
                style={{height: "100%", width: "100%"}}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {location && <Marker position={[location.lat, location.lng]} icon={icon}/>}
                <MapEvents setLocation={setLocation}/>
                <RecenterButton setLocation={setLocation}/>
            </MapContainer>
        </div>
    )
}

import React, {useRef, useState} from 'react';
import {Libraries} from '@react-google-maps/api';
import {useUserLocation} from './useUserLocation';
import {createMarker, recenterMap} from './MapUtils';
import GoogleMapComponent from './GoogleMapComponent';
// import {Card} from '@mantine/core';
import categoryIcons from './categoryIcons';

import {useMapContext} from '@/map/MapContext';
import {getAuth} from "firebase/auth";
import firebase_app from '../firebase/firebase-config';
import {Briefcase, Building, ChevronDown, Compass, Home, Loader2, MapPin, School, Utensils} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import Link from "next/link";
import AddressSearch from "@/map/AddressSearch";
import {useMarkers} from "@/map/useMarkers";
import {CgGym} from "react-icons/cg";
import {TbHospital} from "react-icons/tb";
import {FaSubway} from "react-icons/fa";
import {MdPark} from "react-icons/md";

interface MapComponentProps {
    userType: string;
    refreshKey: number;
}

declare global {
    let google: typeof globalThis.google;
}

const libraries: Libraries = ['places'];

const MapComponent: React.FC<MapComponentProps> = ({userType, refreshKey}) => {

    const auth = getAuth(firebase_app);
    const user = auth.currentUser;

    const {mapRef, placesServiceRef, isLoaded} = useMapContext();
    // const mapRef = useRef<google.maps.Map | null>(null);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

    const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
    const [searchAddressResult, setSearchAddressResult] = useState<google.maps.places.PlaceResult[]>([]);
    const [valueSearch, setValueSearch] = useState('');
    const [category, setCategory] = useState("");

    const categories = [
        {name: 'restaurant', label: 'Restaurants', icon: <Utensils className="h-4 w-4"/>},
        {name: 'gym', label: 'Gyms', icon: <CgGym className="h-4 w-4"/>},
        {name: 'hospital', label: 'Hospitals', icon: <TbHospital className="h-4 w-4"/>},
        {name: 'school', label: 'Schools', icon: <School className="h-4 w-4"/>},
        {name: 'subway_station', label: 'Subway Stations', icon: <FaSubway className="h-4 w-4"/>},
        {name: 'park', label: 'Parks', icon: <MdPark className="h-4 w-4"/>},
    ]

    // const {isLoaded, loadError} = useJsApiLoader({
    //     googleMapsApiKey,
    //     libraries,
    // });

    console.log('User type: ', userType);
    console.log('User: ', user);

    // const {markers, setMarkers} = useFetchMarkers(userType, user);
    const {markers, loading, error} = useMarkers(userType, user?.uid, refreshKey);
    console.log("Markers: ", markers);

    const {userLocation} = useUserLocation();
    // const placesServiceRef = usePlacesService(isLoaded, mapRef);

    const [searchCategoryMarkers, setSearchCategoryMarkers] = useState<{
        lat: number;
        lng: number;
        marker: google.maps.Marker;
    }[]>([]);

    const [searchAddressMarker, setSearchAddressMarker] = useState<{
        lat: number;
        lng: number;
        marker: google.maps.Marker;
    }[]>([]);

    // if (loadError) {
    //     return <div>Error loading Google Maps</div>;
    // }

    if (!isLoaded) {
        return (
            <div className="flex justify-center items-center h-[600px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500"/>
            </div>
        );
    }

    const searchPlacesByCategory = (category: string) => {
        setCategory(category); // Update the category in the local state
        searchCategoryMarkers.forEach((place) => place.marker.setMap(null)); // Clear previous markers

        if (placesServiceRef.current && userLocation && category) {
            const request = {
                location: new google.maps.LatLng(userLocation.lat, userLocation.lng),
                radius: 10000, // 10 km radius
                type: category,
            };

            placesServiceRef.current.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    setSearchResults(results);
                    if (mapRef.current) {
                        results.forEach((place) =>
                            createMarker(
                                place,
                                mapRef.current,
                                setSearchCategoryMarkers,
                                infoWindowRef,
                                categoryIcons[category]
                            )
                        );
                    }
                }
            });
        }
    };

    const handleSearchResults = (results: google.maps.places.PlaceResult[]) => {
        searchAddressMarker.forEach((place) => place.marker.setMap(null)); // Clear all existing markers
        setSearchAddressMarker([]); // Reset state

        if (results.length > 0) {
            const place = results[0]; // Get the top result
            setSearchAddressResult(results);

            if (mapRef.current) {
                createMarker(place, mapRef.current, setSearchAddressMarker, infoWindowRef);
                recenterMap(mapRef, place.geometry?.location);
            }
        }
    };

    const triangleCoords = [
        {lat: 44.37703333630288, lng: 26.1201399190022},
        {lat: 44.37997795420136, lng: 26.134688220698976},
        {lat: 44.393748211491236, lng: 26.120998225886964},
    ];

    const location = new google.maps.LatLng(44.4268, 26.1025);

    const onMapLoad = (map: google.maps.Map) => {
        console.log('User: ', userType);
        mapRef.current = map;
        if (typeof window !== 'undefined' && (window as any).google && !placesServiceRef.current) {
            const googleMaps = (window as any).google.maps as typeof google.maps;
            placesServiceRef.current = new googleMaps.places.PlacesService(map);
        }
    };

    return (

        <main className="w-[80vw] h-[84vh] mx-auto flex flex-col px-4 py-6">

            <div className="mb-8 text-center">
                {/* Header */}
                <div className="mb-6 shrink-0 h-[80px] text-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Explore Nearby Places</h1>
                    <p className="text-gray-500">Discover amenities and points of interest around your location</p>
                </div>

            </div>

            {/* Search and Filters */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">

                {/* Category Dropdown */}
                <div className="relative">
                    <label className="text-sm font-medium text-gray-700">Search Places by Category</label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between bg-white">
                                <div className="flex items-center">
                                    {category
                                        ? categories.find((cat) => cat.name === category)?.icon
                                        : <Compass className="h-4 w-4 text-gray-500"/>}
                                    <span className="ml-2">
                                        {category
                                            ? categories.find((cat) => cat.name === category)?.label
                                            : "Select a category"}
                                      </span>
                                </div>
                                <ChevronDown className="h-4 w-4 opacity-50"/>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="start"
                            className="w-[var(--radix-dropdown-menu-trigger-width)]"
                        >
                            {/* Reset option */}
                            <DropdownMenuItem
                                onClick={() => {
                                    setCategory('');
                                    searchCategoryMarkers.forEach((place) => place.marker.setMap(null));
                                    setSearchResults([]);
                                }}
                                className="flex items-center text-muted-foreground italic"
                            >
                                <span className="ml-2">Reset</span>
                            </DropdownMenuItem>

                            {/* Category options */}
                            {categories.map((cat) => (
                                <DropdownMenuItem
                                    key={cat.name}
                                    onClick={() => {
                                        setCategory(cat.name);
                                        searchPlacesByCategory(cat.name);
                                    }}
                                    className="flex items-center"
                                >
                                    {cat.icon}
                                    <span className="ml-2">{cat.label}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Address Search */}
                <AddressSearch
                    value={valueSearch}
                    onChange={(e) => setValueSearch(e.target.value)}
                    placesServiceRef={placesServiceRef}
                    onSearchResults={handleSearchResults}
                />


            </div>

            <Card className="mb-6 h-full overflow-hidden border-gray-200 shadow-md">
                <CardContent className="p-0 relative h-full flex justify-center">
                    <div className="w-[98%] h-full">
                        <GoogleMapComponent
                            markers={markers}
                            userLocation={userLocation}
                            onMapLoad={onMapLoad}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">

                <Button
                    onClick={() => recenterMap(mapRef, userLocation)}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                    <MapPin className="h-4 w-4"/>
                    Recenter to Current Location
                </Button>
                <Link href="/">
                    <Button variant="outline" className="bg-white flex items-center gap-2">
                        <Home className="h-4 w-4"/>
                        Back to Home
                    </Button>
                </Link>
            </div>

            {/*<Group align="center" justify="center" mt="md">*/}
            {/*    <RecenterButton onClick={() => recenterMap(mapRef, userLocation)}/>*/}
            {/*</Group>*/}

        </main>
    );
};

export default MapComponent;

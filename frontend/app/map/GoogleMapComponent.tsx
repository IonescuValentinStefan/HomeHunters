'use client';

import React, {useEffect, useRef, useState} from 'react';
import {GoogleMap, Marker} from '@react-google-maps/api';
import {defaultCenter} from './config';
import {recenterMap} from './MapUtils';

interface GoogleMapComponentProps {
    markers: {
        location: { lat: number; lng: number };
        price: number;
        rooms: string;
        title: string;
        surfaceArea: number
    }[],
    userLocation: { lat: number; lng: number } | null,
    onMapLoad: (map: google.maps.Map) => void,
    showUserLocation?: boolean
}

const containerStyle = {
    width: '100%',
    height: '100%',
    cursor: 'pointer',
};

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
                                                                   markers,
                                                                   userLocation,
                                                                   onMapLoad,
                                                                   showUserLocation = true,
                                                               }) => {
    const mapRef = useRef<google.maps.Map | null>(null);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

    // Store the marker references
    const markerRefs = useRef<(google.maps.Marker | null)[]>([]);
    const [currentMarkerIndex, setCurrentMarkerIndex] = useState<number | null>(null);

    useEffect(() => {
        if (userLocation) {
            recenterMap(mapRef, userLocation);
        }
    }, [userLocation]);

    useEffect(() => {
        // Create the InfoWindow once, rather than on every click.
        if (!infoWindowRef.current) {
            infoWindowRef.current = new google.maps.InfoWindow();
        }

        // Open the info window on marker click
        if (currentMarkerIndex !== null && markerRefs.current[currentMarkerIndex]) {
            const marker = markerRefs.current[currentMarkerIndex];
            const markerData = markers[currentMarkerIndex];

            // Set content and open the InfoWindow
            // infoWindowRef.current.setContent(markerData.content);
            infoWindowRef.current.setContent(`
              <div style="font-family: Arial, sans-serif; max-width: 200px;">
                <h3 style="margin: 0 0 6px; font-size: 14px; color: #222;">${markerData.title}</h3>
                <p style="margin: 0 0 4px; font-size: 12px; color: #555;">Price: $${markerData.price.toLocaleString()}</p>
                <p style="margin: 0 0 4px; font-size: 12px; color: #555;">Rooms: ${markerData.rooms}</p>
                <p style="margin: 0 0 4px; font-size: 12px; color: #555;">Surface Area: ${markerData.surfaceArea} m²</p>
              </div>
            `);


            infoWindowRef.current.open(mapRef.current, marker);
        }
    }, [currentMarkerIndex, markers]);

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={userLocation || defaultCenter}
            zoom={10}
            onLoad={(map) => {
                mapRef.current = map;
                onMapLoad(map);
            }}
        >
            {markers.map((markerData, index) => {
                return (
                    <Marker
                        key={index}
                        position={{lat: markerData.location.lat, lng: markerData.location.lng}}
                        title={markerData.title}
                        onLoad={(marker) => {
                            markerRefs.current[index] = marker;
                        }}
                        onClick={() => {
                            setCurrentMarkerIndex(index);
                        }}
                    />
                );
            })}

            {userLocation && showUserLocation && (
                <Marker
                    position={userLocation}
                    icon={{
                        url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    }}
                    title="You are here"
                />
            )}
        </GoogleMap>
    );
};

export default GoogleMapComponent;

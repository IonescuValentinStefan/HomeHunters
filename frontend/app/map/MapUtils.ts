import addData from '../firestore/addData';
import {defaultCenter} from './config';
import {MutableRefObject} from 'react';

// Function to add a new marker to Firebase
export const addMarker = async (lat: number, lng: number) => {

    console.log("Adding marker to Firebase:", {lat, lng});

    const markerId = Date.now().toString();

    try {
        const firestoreResult = await addData("markers", markerId, {lat, lng});
        console.log(`Marker added to Firestore with id ${markerId}:`, {lat, lng});

    } catch (error) {
        console.log("Error adding marker to Firestore:", error);
    }
};

// Function to recentre the map
export const recenterMap = (mapRef: MutableRefObject<google.maps.Map | null>, userLocation: any) => {
    if (mapRef.current && userLocation) {
        mapRef.current.setCenter(userLocation);
        mapRef.current.setZoom(15); // Adjust zoom level
    } else if (mapRef.current) {
        mapRef.current.setCenter(defaultCenter);
    }
};

export const createMarker = (
    place: google.maps.places.PlaceResult,
    map: google.maps.Map | null,
    setSearchPlacesMarkers: React.Dispatch<React.SetStateAction<{
        lat: number;
        lng: number;
        marker: google.maps.Marker;
    }[]>>,
    infoWindowRef: React.RefObject<google.maps.InfoWindow | null>,
    iconUrl: string = "", // Default icon
    color: string = 'red' // Default color is red
) => {
    if (!place.geometry || !place.geometry.location) return;

    if (iconUrl === "") {
        iconUrl = `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`;
    }

    // Define a custom marker icon based on the color
    const icon = {
        url: iconUrl,
        scaledSize: new google.maps.Size(32, 32), // Adjust size if needed
    };

    const marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        icon: icon, // Set the custom icon
    });

    google.maps.event.addListener(marker, 'click', () => {
        if (!infoWindowRef.current) {
            // @ts-ignore
            // noinspection JSConstantReassignment
            infoWindowRef.current = new google.maps.InfoWindow();
        }

        const content = `
            ${place.name || ''}<br>
            ${place.vicinity || ''}<br>
            ${place.rating ? `Rating: ${place.rating}` : ''}<br>
            ${place.user_ratings_total ? `Total ratings: ${place.user_ratings_total}` : ''}
        `;

        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(map, marker);
    });

    setSearchPlacesMarkers((prevMarkers) => {
        if (place.geometry && place.geometry.location) {
            const marketArray = [...prevMarkers, {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                marker,
            }];
            console.log('MARKER ARRAY:', marketArray);
            return [
                ...prevMarkers,
                {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    marker,
                },
            ];
        } else {
            // Handle the case where geometry or location is undefined
            console.log("Place geometry or location is undefined.");
            return prevMarkers;
        }
    });
};

export const createMarkerAddressSearch = (
    place: google.maps.places.PlaceResult,
    map: google.maps.Map | null,
    setSearchAddressMarkers: React.Dispatch<React.SetStateAction<{
        lat: number;
        lng: number;
        marker: google.maps.Marker
    }[]>>,
    infoWindowRef: React.RefObject<google.maps.InfoWindow | null>
) => {
    if (!place.geometry || !place.geometry.location) return;

    const marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
    });

    google.maps.event.addListener(marker, 'click', () => {
        if (!infoWindowRef.current) {
            // @ts-ignore
            // noinspection JSConstantReassignment
            infoWindowRef.current = new google.maps.InfoWindow();
        }

        const content = `
            ${place.name || ''}<br>
            ${place.vicinity || ''}<br>
            ${place.rating ? `Rating: ${place.rating}` : ''}<br>
            ${place.user_ratings_total ? `Total ratings: ${place.user_ratings_total}` : ''}
        `;

        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(map, marker);
    });

    setSearchAddressMarkers((prevMarkers) => {
        if (place.geometry && place.geometry.location) {
            const marketArray = [...prevMarkers, {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                marker,
            }];
            console.log('MARKER ARRAY:', marketArray);

            return [
                ...prevMarkers,
                {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    marker,
                },
            ];
        } else {
            // Handle the case where geometry or location is undefined
            console.log("Place geometry or location is undefined.");
            return prevMarkers;
        }
    });

};

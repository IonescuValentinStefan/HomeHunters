import {useEffect, useRef, useState} from 'react';
import {collection, getDocs, getFirestore, onSnapshot, query, where} from 'firebase/firestore';
import firebase_app from '../firebase/firebase-config';

const db = getFirestore(firebase_app);

export const useFetchMarkers = (userType: string, user: any) => {
    const [markers, setMarkers] = useState<{ lat: number; lng: number, content: string }[]>([]);

    let userId = user ? user.uid : null;

    useEffect(() => {
        const propertiesCollectionRef = collection(db, 'properties');

        const unsubscribe = onSnapshot(propertiesCollectionRef, (snapshot) => {
            const fetchedMarkers: { lat: number; lng: number, content: string }[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.marker && data.marker.lat && data.marker.lng) {

                    // console.log('data.userId:', data.userId);
                    // console.log('userId:', userId);
                    // console.log('User type:', userType);

                    if (userType === 'buyer' || (userType === 'seller' && data.userId === userId)) {

                        console.log('User has permission to view marker.');

                        const contentString = `
            ${data.title}<br>
            ${data.description}<br>
            ${data.price ? `Price: ${data.price}` : ''}<br>
        `;

                        fetchedMarkers.push({
                            lat: data.marker.lat,
                            lng: data.marker.lng,
                            content: contentString,
                        });
                    }
                }
            });

            setMarkers(fetchedMarkers);
            console.log('Fetched markers:', fetchedMarkers);
        });

        return () => unsubscribe();
    }, [db]);

    return {markers, setMarkers}; // Return both markers and the updater
};

export const fetchProperties = async (user: any) => {
    const userId = user ? user.uid : null;

    if (!userId) {
        // If no user ID is available, return an empty array or handle accordingly
        return [];
    }

    // Define the query to filter properties based on the userId
    const propertiesCollectionRef = collection(db, 'properties');
    const propertiesQuery = query(propertiesCollectionRef, where('userId', '==', userId));

    // Fetch the filtered properties
    const querySnapshot = await getDocs(propertiesQuery);

    // Map through the filtered properties and return them
    return querySnapshot.docs.map((doc) => {
        const property = doc.data();

        return {
            propertyType: property.propertyType,
            transactionType: property.transactionType,
            location: property.location,
            rooms: property.rooms,
            surface: property.surface,
            title: property.title,
            description: property.description,
            price: property.price,
            timestamp: property.timestamp,
        };
    });
};

export const usePlacesService = (isLoaded: boolean, mapRef: React.MutableRefObject<google.maps.Map | null>) => {
    const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

    useEffect(() => {
        console.log('isLoaded:', isLoaded);
        console.log('mapRef:', mapRef.current)
        if (isLoaded && mapRef.current) {
            placesServiceRef.current = new google.maps.places.PlacesService(mapRef.current);
        }
    }, [isLoaded, mapRef]);

    return placesServiceRef;
};
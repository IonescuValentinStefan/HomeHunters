'use client';

import React, {useEffect, useRef, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import MapComponent from '../map/MapComponent';
import {collection, doc, getDocs, getFirestore, query, setDoc, where} from 'firebase/firestore';
import firebase_app from '../firebase/firebase-config';
import {MapProvider} from "@/map/MapContext";
import {Libraries, useJsApiLoader} from "@react-google-maps/api";
import {googleMapsApiKey} from "@/map/config";
import {usePlacesService} from "@/map/useEffectsMap";
import {getAuth, onAuthStateChanged, signOut} from "firebase/auth";
import {Navbar} from "@/feed/navbar";
import Loading from "@/components/loading";

export default function ProtectedPage() {
    // @ts-ignore
    const auth = getAuth(firebase_app);
    const router = useRouter();
    const searchParams = useSearchParams();
    const password = searchParams.get('password');
    const db = getFirestore(firebase_app);

    const libraries: Libraries = ['places'];

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (!firebaseUser) {
                router.push("/unauthorized");
            } else {
                setUser(firebaseUser);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [auth, router]);

    useEffect(() => {
        if (!password) {
            console.warn('Password parameter is missing.');
        }
    }, [password]);

    useEffect(() => {
        const updateOrAddUserByEmail = async () => {
            if (!user || !password) return;

            try {
                const buyersCollectionRef = collection(db, 'buyers');
                const q = query(buyersCollectionRef, where('email', '==', user.email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const docRef = querySnapshot.docs[0].ref;
                    const existingData = querySnapshot.docs[0].data();

                    if (existingData.password !== password) {
                        await setDoc(docRef, {password}, {merge: true});
                        console.log('Password updated for existing user with the same email');
                    } else {
                        console.log('Password is the same; no update needed');
                    }
                } else {
                    const newDocRef = doc(db, 'buyers', user.uid);
                    await setDoc(newDocRef, {
                        email: user.email,
                        name: user.displayName,
                        photoURL: user.photoURL,
                        password,
                    });
                    console.log('New user added to Firestore');
                }
            } catch (error) {
                console.error('Error updating or adding user by email:', error);
            }
        };

        void updateOrAddUserByEmail();
    }, [user, password, db]);

    const mapRef = useRef<google.maps.Map | null>(null);

    const {isLoaded, loadError} = useJsApiLoader({
        googleMapsApiKey,
        libraries,
    });

    const placesServiceRef = usePlacesService(isLoaded, mapRef);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log('User logged out successfully');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };


    if (loading) {
        return <Loading/>;
    }

    return (
        <main
            className={"bg-blue-200 min-h-screen"}
        >
            <Navbar/>
            <MapProvider
                mapRef={mapRef}
                placesServiceRef={placesServiceRef}
                isLoaded={isLoaded}
            >
                <div className="flex flex-col items-center justify-center">
                    <MapComponent userType="buyer"/>
                </div>
            </MapProvider>
        </main>
    );
}

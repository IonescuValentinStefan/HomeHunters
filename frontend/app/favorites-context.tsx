"use client"

import {createContext, type ReactNode, useContext, useEffect, useState} from "react"
import firebase_app from "@/firebase/firebase-config";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import axios from "axios";

// Define the type for the context
type FavoritesContextType = {
    favorites: string[]
    addFavorite: (id: string) => Promise<void>
    removeFavorite: (id: string) => Promise<void>
    isFavorite: (id: string) => boolean
}

// Create the context with default values
const FavoritesContext = createContext<FavoritesContextType>({
    favorites: [],
    addFavorite: async () => {
    },
    removeFavorite: async () => {
    },
    isFavorite: () => false
});


export function FavoritesProvider({children}: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const auth = getAuth(firebase_app);

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                try {
                    const response = await axios.get<string[]>(`${BACKEND_URL}/api/firestore/users/${user.uid}/favorites`);
                    setFavorites(response.data);
                } catch (error) {
                    console.error("Failed to fetch favorites", error);
                }
            } else {
                setUserId(null);
                setFavorites([]);
            }
        });

        return () => unsubscribe();
    }, []);

    const addFavorite = async (propertyId: string) => {
        if (!userId) return;

        try {
            await axios.post(`${BACKEND_URL}/api/firestore/users/${userId}/favorites/${propertyId}`);
            setFavorites((prev) => [...prev, propertyId]);
        } catch (error) {
            console.error("Error adding favorite:", error);
        }
    };

    const removeFavorite = async (propertyId: string) => {
        if (!userId) return;

        try {
            await axios.delete(`${BACKEND_URL}/api/firestore/users/${userId}/favorites/${propertyId}`);
            setFavorites((prev) => prev.filter((id) => id !== propertyId));
        } catch (error) {
            console.error("Error removing favorite:", error);
        }
    };

    const isFavorite = (propertyId: string): boolean => {
        return favorites.includes(propertyId);
    };

    return (
        <FavoritesContext.Provider value={{favorites, addFavorite, removeFavorite, isFavorite}}>
            {children}
        </FavoritesContext.Provider>
    );
}

// Custom hook to use the favorite context
export function useFavorites() {
    return useContext(FavoritesContext)
}

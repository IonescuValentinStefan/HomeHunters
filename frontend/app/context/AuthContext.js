"use client";

import React from 'react';
import {getAuth, onAuthStateChanged,} from 'firebase/auth';
import firebase_app from '../firebase/firebase-config';
import Loading from "@/components/loading";

const auth = getAuth(firebase_app);

export const AuthContext = React.createContext({});

export const useAuthContext = () => React.useContext(AuthContext);

export const AuthContextProvider = ({
                                        children,
                                    }) => {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);

                console.log("User is logged in");
            } else {
                setUser(null);

                console.log("User is logged out");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{user}}>
            {loading ? <Loading/> : children}
        </AuthContext.Provider>
    );
};
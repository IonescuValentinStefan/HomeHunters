'use client';

import Header from './startup-page/Header';
import Body from './startup-page/Body';
import Footer from './startup-page/Footer';
import {Stack} from '@mantine/core';
import {AuthContextProvider} from "./context/AuthContext";
import {getAuth} from 'firebase/auth';
import firebase_app from './firebase/firebase-config';

export default function StartupPage() {

    const auth = getAuth(firebase_app);
    const user = auth.currentUser;
    console.log(user);

    return (
        <AuthContextProvider>
            <div>
                <Stack>
                    <Header/>
                    <Body/>
                    <Footer/>
                </Stack>
            </div>
        </AuthContextProvider>
    );
}
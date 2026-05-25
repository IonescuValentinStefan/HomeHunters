import "@mantine/core/styles.css";
import '@mantine/carousel/styles.css';
import '../styles/globals.css'
import React from "react";
import {ColorSchemeScript, MantineProvider} from "@mantine/core";
import {theme} from "../theme";
import {AuthContextProvider} from "./context/AuthContext";
// import {ThemeProvider} from "@/components/Theme/theme-provider"
import {FavoritesProvider} from "@/favorites-context";
import {Providers} from "@/providers";

export const metadata = {
    title: "HomeHunters",
    description: "Best real estate app!",
};


export default function RootLayout({children}: { children: any }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <ColorSchemeScript/>
            {/* <link rel="shortcut icon" href="/favicon.svg"/> */}
            <meta
                name="viewport"
                content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
            />
            <title>HomeHunters</title>
        </head>
        <body>
        <Providers>
            <MantineProvider theme={theme} defaultColorScheme="light">
                <AuthContextProvider>
                    <FavoritesProvider>
                        {children}
                    </FavoritesProvider>
                </AuthContextProvider>
            </MantineProvider>
        </Providers>
        </body>
        </html>
    );
}

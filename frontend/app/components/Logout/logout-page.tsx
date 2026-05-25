// components/logout-logout-page.tsx
"use client"

import {cn} from "@/lib/utils"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import React, {useEffect, useState} from "react"

import app from "@/firebase/firebase-config"
import {getAuth, signOut} from "firebase/auth"
import {useRouter} from "next/navigation"

export default function LogoutPage({
                                       className,
                                       ...props
                                   }: React.ComponentProps<"div">) {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const auth = getAuth(app)
    const router = useRouter()

    useEffect(() => {
        const handleLogout = async () => {
            try {
                await signOut(auth)
                router.push("/") // Redirect after logout
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unexpected error")
            } finally {
                setLoading(false)
            }
        }

        void handleLogout();
    }, [])

    return (
        <div className={cn("flex flex-col items-center justify-center min-h-screen bg-blue-200", className)} {...props}>
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Logging out...</CardTitle>
                    <CardDescription>You will be redirected shortly.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <>
                        {loading && <p>Please wait...</p>}
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </>
                </CardContent>
            </Card>
        </div>
    )
}

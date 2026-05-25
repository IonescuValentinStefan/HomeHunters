'use client';

import React, {useState} from "react";
import {sendResetEmail} from "@/firebase/auth/password-reset";
import {fetchSignInMethodsForEmail, getAuth} from "firebase/auth";
import firebase_app from "../firebase/firebase-config";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {ArrowLeft, CheckCircle, Mail} from "lucide-react";

export default function ResetPassword() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const isValidEmail = (email: string): boolean => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!email) {
            setError("Please enter your email address")
            return
        }

        if (!isValidEmail(email)) {
            setError("Please enter a valid email address")
            return
        }

        setIsLoading(true)

        const auth = getAuth(firebase_app);

        try {
            // Check if the email is associated with any sign-in method
            const signInMethods = await fetchSignInMethodsForEmail(auth, email);

            setIsLoading(false)

            console.log("Sign-in methods for email:", signInMethods);

            if (signInMethods.length === 0) {
                // No account found for the email
                setError("No account found with this email.");
                return;
            }

            // Proceed to send the reset email if the account exists
            await sendResetEmail(email);
            setIsSubmitted(true)

        } catch (error) {
            // Handle any other errors (e.g., network issues)
            setError("Error sending password reset email");
            console.log("Error sending reset email:", error);
        }
    }

    if (isSubmitted) {
        return (
            <div
                className="min-h-screen bg-blue-200 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="text-center pb-8">
                            <div
                                className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600"/>
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-800">Check Your Email</CardTitle>
                            <CardDescription className="text-gray-600 mt-2">
                                We've sent a password reset link to <span
                                className="font-medium text-gray-800">{email}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Button
                                    onClick={() => setIsSubmitted(false)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Try Another Email
                                </Button>

                                <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
                                    <ArrowLeft className="w-4 h-4 mr-2"/>
                                    Back to Sign In
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div
                className="min-h-screen bg-blue-200 flex items-center justify-center p-4">
                <div className="w-full max-w-md relative z-10">
                    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="text-center pb-8">
                            <div
                                className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <Mail className="w-8 h-8 text-blue-600"/>
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-800">Reset Your Password</CardTitle>
                            <CardDescription className="text-gray-600 mt-2">
                                Enter your email address and we'll send you a link to reset your password
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        disabled={isLoading}
                                    />
                                    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
                                </div>

                                <div className="space-y-3">
                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center">
                                                <div
                                                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Sending Reset Link...
                                            </div>
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </Button>

                                    <Link href="/login" passHref>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full h-12 bg-white hover:bg-gray-50"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2"/>
                                            Back to Sign In
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
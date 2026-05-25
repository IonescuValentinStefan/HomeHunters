"use client"

import type React from "react"
import {useEffect, useState} from "react"
import {useSearchParams} from "next/navigation"
import Link from "next/link"
import {ArrowLeft, Mail, MapPin, Phone} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {getAuth, onAuthStateChanged} from "firebase/auth";
import firebase_app from "@/firebase/firebase-config";

export default function ContactPage() {
    const searchParams = useSearchParams()
    const apartmentId = searchParams.get("apartmentId")
    const apartmentTitle = searchParams.get("title")

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const auth = getAuth(firebase_app);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setName(user.displayName || "");
                setEmail(user.email || "");
            }
        });

        return () => unsubscribe();
    }, []);


    // Pre-fill message if coming from an apartment page
    useEffect(() => {
        if (apartmentId && apartmentTitle) {
            setMessage(
                `Hi, I'm interested in the property "${apartmentTitle}" (ID: ${apartmentId}). Please provide more information about this listing.`,
            )
        }
    }, [apartmentId, apartmentTitle])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setIsSubmitted(true)
        setIsSubmitting(false)
    }

    return (
        <main className="min-h-screen bg-blue-200">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <Link href={apartmentId ? `/apartment/${apartmentId}` : "/"}>
                            <Button variant="ghost" className="flex items-center text-blue-600 hover:text-blue-800 p-0">
                                <ArrowLeft className="mr-2 h-4 w-4"/>
                                {apartmentId ? "Back to Property" : "Back to Home"}
                            </Button>
                        </Link>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm">
                        <h1 className="text-3xl font-bold text-blue-900 mb-6">Contact Us</h1>

                        {isSubmitted ? (
                            <div className="text-center py-8">
                                <div
                                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="h-8 w-8 text-green-600"/>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
                                <p className="text-gray-600 mb-6">Thank you for reaching out. Our team will get back to
                                    you shortly.</p>
                                <Button onClick={() => setIsSubmitted(false)} className="bg-blue-600 hover:bg-blue-700">
                                    Send Another Message
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h2 className="text-xl font-semibold text-blue-800 mb-4">Get in Touch</h2>
                                    <p className="text-gray-700 mb-6">
                                        {apartmentId
                                            ? "Complete the form to inquire about this property. Our agent will contact you shortly."
                                            : "Have questions or feedback? We'd love to hear from you. Fill out the form or use our contact information to reach us."}
                                    </p>

                                    <div className="space-y-4">
                                        <div className="flex items-start">
                                            <Mail className="h-5 w-5 text-blue-600 mt-0.5 mr-3"/>
                                            <div>
                                                <p className="font-medium">Email</p>
                                                <p className="text-gray-600">contact@homehunters.com</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Phone className="h-5 w-5 text-blue-600 mt-0.5 mr-3"/>
                                            <div>
                                                <p className="font-medium">Phone</p>
                                                <p className="text-gray-600">(+40) 723 456 789</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <MapPin className="h-5 w-5 text-blue-600 mt-0.5 mr-3"/>
                                            <div>
                                                <p className="font-medium">Address</p>
                                                <p className="text-gray-600">
                                                    Splaiul Independenței 313
                                                    <br/>
                                                    Bucharest 060042, Romania
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <form className="space-y-4" onSubmit={handleSubmit}>
                                                {apartmentId && apartmentTitle && (
                                                    <div className="p-3 bg-blue-50 rounded-md mb-4">
                                                        <p className="text-sm text-blue-700">
                                                            <span
                                                                className="font-medium">Property Inquiry:</span> {apartmentTitle}
                                                        </p>
                                                        <p className="text-xs text-blue-600">Reference ID:
                                                            #{apartmentId}</p>
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Full Name</Label>
                                                    <Input
                                                        id="name"
                                                        placeholder="Your name"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="Your email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="message">Message</Label>
                                                    <Textarea
                                                        id="message"
                                                        placeholder="Your message"
                                                        className="min-h-[120px]"
                                                        value={message}
                                                        onChange={(e) => setMessage(e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700"
                                                        disabled={isSubmitting}>
                                                    {isSubmitting ? "Sending..." : "Send Message"}
                                                </Button>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}

"use client"

import type React from "react"
import {useEffect, useState} from "react"
import {ArrowLeft, CheckCircle, Send, Star} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Checkbox} from "@/components/ui/checkbox"
import {getAuth, onAuthStateChanged} from "firebase/auth";
import firebase_app from "@/firebase/firebase-config";
import axios from "axios";
import Link from "next/link";
import {useRouter} from "next/navigation";
import Loading from "@/components/loading";

export default function AddReview() {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [review, setReview] = useState("")
    const [isAnonymous, setIsAnonymous] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const router = useRouter();
    const auth = getAuth(firebase_app);
    const [loading, setLoading] = useState(true);
    const [firebaseUser, setFirebaseUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/unauthorized");
            } else {
                setFirebaseUser(user);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [auth, router]);


    useEffect(() => {
        if (firebaseUser) {
            if (firebaseUser.displayName) {
                setName(firebaseUser.displayName);
            }
            if (firebaseUser.email) {
                setEmail(firebaseUser.email);
            }
        }
    }, [firebaseUser]);

    if (loading) {
        return <Loading/>;
    }

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}

        if (rating === 0) {
            newErrors.rating = "Please select a rating"
        }

        if (!review.trim()) {
            newErrors.review = "Please write a review"
        }

        if (!isAnonymous) {
            if (!name.trim()) {
                newErrors.name = "Please enter your name"
            }
            if (!email.trim()) {
                newErrors.email = "Please enter your email"
            } else if (!email.includes("@") || !email.includes(".")) {
                newErrors.email = "Please enter a valid email address"
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            const reviewPayload = {
                rating,
                review,
                fullName: isAnonymous ? "Anonymous" : name,
                email: isAnonymous ? "" : email,
            };

            await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firestore/reviews`,
                reviewPayload
            );

            setIsSubmitted(true);
            setRating(0);
            setName("");
            setEmail("");
            setReview("");
            setIsAnonymous(false);
            setErrors({});
        } catch (error) {
            console.error("Failed to submit review:", error);
            alert("Something went wrong while submitting your review. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleStarClick = (starRating: number) => {
        setRating(starRating)
        if (errors.rating) {
            setErrors({...errors, rating: ""})
        }
    }

    const handleStarHover = (starRating: number) => {
        setHoveredRating(starRating)
    }

    const handleStarLeave = () => {
        setHoveredRating(0)
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
                            <CardTitle className="text-2xl font-bold text-gray-800">Thank You!</CardTitle>
                            <CardDescription className="text-gray-600 mt-2">
                                Your review has been submitted successfully and will be published soon.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={() => {
                                    setIsSubmitted(false)
                                    setRating(0)
                                    setName("")
                                    setEmail("")
                                    setReview("")
                                    setIsAnonymous(false)
                                    setErrors({})
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Add Another Review
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-blue-200 p-4">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" className="flex items-center text-blue-600 hover:text-blue-800 p-0">
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Back to Home
                    </Button>
                </Link>
            </div>

            <div className="flex items-center justify-center">
                <div className="w-full max-w-lg relative z-10">
                    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="text-center pb-6">
                            <div
                                className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <Star className="w-8 h-8 text-blue-600"/>
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-800">Add Your Review</CardTitle>
                            <CardDescription className="text-gray-600 mt-2">
                                Share your experience and help others make informed decisions
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Rating */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Rating</Label>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => handleStarClick(star)}
                                                onMouseEnter={() => handleStarHover(star)}
                                                onMouseLeave={handleStarLeave}
                                                className="p-1 transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    className={`w-8 h-8 transition-colors ${
                                                        star <= (hoveredRating || rating)
                                                            ? "text-yellow-400 fill-yellow-400"
                                                            : "text-gray-300 hover:text-yellow-300"
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                        <span className="ml-2 text-sm text-gray-600">
                    {rating > 0 && (
                        <>
                            {rating} star{rating !== 1 ? "s" : ""}
                        </>
                    )}
                  </span>
                                    </div>
                                    {errors.rating && <p className="text-sm text-red-600">{errors.rating}</p>}
                                </div>

                                {/* Review Text */}
                                <div className="space-y-2">
                                    <Label htmlFor="review" className="text-sm font-medium text-gray-700">
                                        Your Review
                                    </Label>
                                    <Textarea
                                        id="review"
                                        placeholder="Tell us about your experience..."
                                        value={review}
                                        onChange={(e) => {
                                            setReview(e.target.value)
                                            if (errors.review) {
                                                setErrors({...errors, review: ""})
                                            }
                                        }}
                                        className="min-h-[120px] bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                                        disabled={isLoading}
                                    />
                                    {errors.review && <p className="text-sm text-red-600">{errors.review}</p>}
                                </div>

                                {/* Anonymous Option */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="anonymous"
                                        checked={isAnonymous}
                                        onCheckedChange={(checked) => {
                                            setIsAnonymous(checked as boolean)
                                            if (checked) {
                                                setErrors({...errors, name: "", email: ""})
                                            }
                                        }}
                                    />
                                    <Label htmlFor="anonymous" className="text-sm text-gray-700 cursor-pointer">
                                        Submit anonymously
                                    </Label>
                                </div>

                                {/* Name and Email (only if not anonymous) */}
                                {!isAnonymous && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                                Your Name
                                            </Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                placeholder="Enter your full name"
                                                value={name}
                                                onChange={(e) => {
                                                    setName(e.target.value)
                                                    if (errors.name) {
                                                        setErrors({...errors, name: ""})
                                                    }
                                                }}
                                                className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                                disabled={isLoading}
                                            />
                                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                                Email Address
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Enter your email address"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value)
                                                    if (errors.email) {
                                                        setErrors({...errors, email: ""})
                                                    }
                                                }}
                                                className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                                disabled={isLoading}
                                            />
                                            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <div
                                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Submitting Review...
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <Send className="w-4 h-4 mr-2"/>
                                            Submit Review
                                        </div>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

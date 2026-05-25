import React, {useEffect, useState} from 'react';
import {Star} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import axios from "axios";

type Review = {
    fullName: string;
    rating: number;
    review: string;
};

export default function Body() {

    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState<number | null>(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const [reviewsRes, ratingRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firestore/reviews/latest`),
                    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firestore/reviews/average-rating`)
                ]);
                setReviews(reviewsRes.data);
                setAverageRating(Number(ratingRes.data));
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };

        void fetchReviews();
    }, []);

    return (
        <div
            className="z-0 bg-blue-200 w-screen min-h-screen fixed top-0 left-0 flex items-center justify-center"
        >
            <div>
                {/* Hero Section */}
                <section className="container mx-auto px-4 py-16 text-center">
                    <div className="mb-[3%]">
                        <h1 className="text-4xl md:text-4xl font-bold text-gray-800 mb-8">Your Trust, Our Pride</h1>

                        {/* Rating Display */}
                        <div className="flex justify-center mb-12">
                            <Card
                                className="
                                  transition-transform duration-300 hover:scale-105
                                  w-[80vw] sm:w-[60vw] md:w-[45vw] lg:w-[35vw] xl:w-[30vw] 2xl:w-[25vh]
                                  h-[280px] sm:h-[25vh] md:h-[35vh] lg:h-[45vh] xl:h-[50vh] 2xl:h-[25vh]
                                  bg-white/60 backdrop-blur-md border border-white/20 shadow-2xl hover:shadow-3xl hover:bg-white/40
                                "
                            >
                                <CardContent className="h-full flex items-center justify-center">
                                    <div className="flex flex-col items-center space-y-[0.5%]">
                                        {/* Large Star Icon */}
                                        <div className="relative w-[5vh] h-[5vh]">
                                            <div
                                                className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl scale-150"
                                            >
                                            </div>
                                            <Star
                                                className="relative w-full h-full fill-yellow-400 text-yellow-400 drop-shadow-lg"/>
                                        </div>

                                        {/* Rating Number */}
                                        <div
                                            className="text-[4.5vw] sm:text-[2.5vw] font-black text-gray-800 tracking-tight drop-shadow-sm">
                                            {averageRating !== null ? averageRating.toFixed(1) : "–"}
                                        </div>

                                        {/* Star Rating */}
                                        <div className="flex items-center gap-[1%]">
                                            {[...Array(Math.round(averageRating ?? 0))].map((_, i) => (
                                                <Star key={i}
                                                      className="w-[4vw] h-[4vw] sm:w-[1vw] sm:h-[1vw] text-yellow-400 fill-current drop-shadow-sm"/>
                                            ))}
                                        </div>

                                        {/* Label */}
                                        <div
                                            className="bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent font-semibold text-[2vw] sm:text-[1vw]">
                                            Overall Rating
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>


                    {/* Reviews Section */}
                    <section className="mb-16">
                        <h2 className="text-3xl md:text-3xl font-bold text-gray-800 mb-4">What Our Clients Say</h2>

                        {/* Reviews Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
                            {reviews.map((review, index) => (
                                <Card
                                    key={index}
                                    className="flex flex-col h-full min-h-[20vh] bg-white/60 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <CardContent className="p-[4%] flex flex-col h-full">
                                        {/* Star rating row */}
                                        <div className="flex gap-1 mb-[2%]">
                                            {[...Array(review.rating)].map((_, i) => (
                                                <Star key={i}
                                                      className="w-[1.5rem] h-[1.5rem] text-yellow-400 fill-current"/>
                                            ))}
                                        </div>

                                        {/* Review text */}
                                        <p className="flex-grow text-gray-700 text-[clamp(0.8rem,1.5vw,1.1rem)] leading-snug sm:leading-normal">
                                            "{review.review}"
                                        </p>

                                        {/* Footer: avatar + name */}
                                        <div className="flex items-center border-t border-gray-100 pt-[1.5%] mt-auto">
                                            <div
                                                className={`w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-4 shadow-md`}
                                            >
                                                {review.fullName
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </div>
                                            <div className="flex flex-col justify-center text-[clamp(0.7rem,1vw,1rem)]">
                                                <p className="font-semibold text-gray-800">{review.fullName}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                            ))}
                        </div>
                    </section>
                </section>

            </div>
        </div>
    );
}

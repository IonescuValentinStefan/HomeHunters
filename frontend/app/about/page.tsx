import Link from "next/link"
import {ArrowLeft} from "lucide-react"
import {Button} from "@/components/ui/button"

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-blue-200">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <Link href="/">
                            <Button variant="ghost" className="flex items-center text-blue-600 hover:text-blue-800 p-0">
                                <ArrowLeft className="mr-2 h-4 w-4"/>
                                Back to Home
                            </Button>
                        </Link>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm">
                        <h1 className="text-3xl font-bold text-blue-900 mb-6">About Us</h1>

                        <div className="space-y-4 text-gray-700">
                            <p>
                                Welcome to HomeHunters, the premier platform for finding and listing properties. Founded
                                in 2025, we've
                                been helping people find their perfect homes and enabling property owners to connect
                                with potential
                                buyers and renters.
                            </p>

                            <p>
                                Our mission is to simplify the property search process through innovative technology and
                                user-friendly
                                design. We believe that finding a new home should be an exciting journey, not a
                                stressful experience.
                            </p>

                            <h2 className="text-xl font-semibold text-blue-800 mt-8 mb-3">Our Vision</h2>
                            <p>
                                We envision a world where everyone can find their ideal living space with ease. Through
                                our platform, we
                                strive to create transparent, efficient connections between property seekers and owners.
                            </p>

                            <h2 className="text-xl font-semibold text-blue-800 mt-8 mb-3">Our Team</h2>
                            <p>
                                HomeHunters is powered by a dedicated team of real estate professionals, technology
                                experts, and
                                customer service specialists. Together, we work to provide the best possible experience
                                for our users.
                            </p>

                            <p className="mt-8">
                                Thank you for choosing HomeHunters for your property needs. We're excited to be part of
                                your journey,
                                whether you're searching for a new place to call home or looking to list your property.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

import Link from "next/link"
import {ArrowLeft} from "lucide-react"
import {Button} from "@/components/ui/button"

export default function PrivacyPage() {
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
                        <h1 className="text-3xl font-bold text-blue-900 mb-6">Privacy Policy</h1>

                        <div className="space-y-6 text-gray-700">
                            <p className="text-sm text-gray-500">Last updated: May 5, 2025</p>

                            <div>
                                <h2 className="text-xl font-semibold text-blue-800 mb-3">1. Introduction</h2>
                                <p>
                                    Welcome to HomeHunters' Privacy Policy. This document explains how we collect, use,
                                    and protect your
                                    personal information when you use our website and services.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-blue-800 mb-3">2. Information We Collect</h2>
                                <p>We may collect the following types of information:</p>
                                <ul className="list-disc pl-6 mt-2 space-y-1">
                                    <li>Personal information (name, email address, phone number)</li>
                                    <li>Account information when you register</li>
                                    <li>Property preferences</li>
                                    <li>Usage data and cookies</li>
                                    <li>Communications with our team</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-blue-800 mb-3">3. How We Use Your
                                    Information</h2>
                                <p>We use your information to:</p>
                                <ul className="list-disc pl-6 mt-2 space-y-1">
                                    <li>Provide and improve our services</li>
                                    <li>Process transactions and bookings</li>
                                    <li>Communicate with you about your account or properties</li>
                                    <li>Send relevant property recommendations</li>
                                    <li>Ensure the security of our platform</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-blue-800 mb-3">4. Information Sharing</h2>
                                <p>
                                    We do not sell your personal information. We may share information with property
                                    owners, service
                                    providers, or as required by law.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-blue-800 mb-3">5. Your Rights</h2>
                                <p>
                                    You have the right to access, correct, or delete your personal information. You can
                                    manage your
                                    preferences in your account settings or contact us directly.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-blue-800 mb-3">6. Contact Us</h2>
                                <p>
                                    If you have any questions about this Privacy Policy, please contact us at
                                    privacy@homehunters.com.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
import {ArrowLeft, Lock} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import Link from "next/link";

export default function AccessDenied() {
    return (
        <div className="min-h-screen bg-blue-200 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardContent className="pt-8 pb-8 px-8">
                    <div className="flex flex-col items-center text-center space-y-6">
                        {/* Lock Icon */}
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <Lock className="w-8 h-8 text-red-600"/>
                        </div>

                        {/* Heading */}
                        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>

                        {/* Description */}
                        <p className="text-gray-600 leading-relaxed">
                            You are not logged in and cannot view this page. Please log in to continue.
                        </p>

                        {/* Buttons with proper spacing */}
                        <div className="flex flex-col w-full space-y-3 pt-2">
                            <Link href="/login">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                                    Go to Login
                                </Button>
                            </Link>

                            <Link href="/">
                                <Button variant="ghost"
                                        className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                        size="lg">
                                    <ArrowLeft className="w-4 h-4 mr-2"/>
                                    Back to Home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
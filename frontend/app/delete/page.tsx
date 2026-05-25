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

                        <div className="space-y-6 text-gray-700">
                            To request account deletion, please email us at sg22dia@gmail.com.
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
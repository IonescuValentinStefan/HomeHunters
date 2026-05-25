import Link from "next/link"
import {AlertTriangle} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card"

// Accepting the 'message' prop
interface UnauthorizedWarningProps {
    message: string;
}

export default function UnauthorizedWarning({message}: UnauthorizedWarningProps) {
    return (
        <div className="flex min-h-[50vh] items-center justify-center p-4">
            <Card className="mx-auto max-w-md shadow-lg">
                <CardHeader className="flex flex-row items-center gap-2 text-amber-500">
                    <AlertTriangle size={24}/>
                    <h2 className="text-xl font-semibold">Authentication Required</h2>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="mb-4 text-muted-foreground">
                        {message}
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button asChild size="lg" className="px-8">
                        <Link href="/signin">Log In</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

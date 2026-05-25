"use client"

import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {LogIn} from "lucide-react"
import Link from "next/link";

interface LoginDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function LoginDialog({open, onOpenChange}: LoginDialogProps) {

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Login Required</DialogTitle>
                    <DialogDescription>
                        You need to be logged in to create a favorites list. Please log in first.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center py-4">
                    <div className="rounded-full bg-blue-50 p-6">
                        <LogIn className="h-10 w-10 text-blue-600"/>
                    </div>
                </div>
                <DialogFooter className="sm:justify-center">
                    <Link href="/signin" passHref>
                        <Button type="button" className="bg-blue-600 hover:bg-blue-700">
                            Log In
                        </Button>
                    </Link>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

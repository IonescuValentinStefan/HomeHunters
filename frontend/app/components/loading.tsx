"use client"

import React from "react"

export default function Loading({ message = "Loading..." }: { message?: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-200">
            <div className="flex flex-col items-center space-y-4">
                <div className="h-8 w-8 border-4 border-white border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-700 font-medium">{message}</p>
            </div>
        </div>
    )
}

'use client'

import {RegisterForm} from "@/components/Login/register-form";

export default function LogupPage() {
    return (
        <div className="bg-blue-200 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <RegisterForm/>
            </div>
        </div>
    )
}

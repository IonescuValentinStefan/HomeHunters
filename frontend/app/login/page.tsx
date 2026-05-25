'use client'

import {LoginForm} from "@/components/Login/login-form"

export default function LoginPage() {

    return (
        <div className="bg-blue-200 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <LoginForm/>
            </div>
        </div>
    )
}

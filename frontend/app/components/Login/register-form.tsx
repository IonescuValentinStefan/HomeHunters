"use client"

import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {FaGoogle} from "react-icons/fa"
import {saveUserToFirestore} from "@/firestore/saveUserToFirestore";

import React, {useState} from "react"
import app from "@/firebase/firebase-config"
import {
    createUserWithEmailAndPassword,
    FacebookAuthProvider,
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from "firebase/auth"
import {useRouter} from "next/navigation"

export function RegisterForm({className, ...props}: React.ComponentProps<"div">) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("");
    const [role, setRole] = useState("buyer")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const auth = getAuth(app)
    const googleProvider = new GoogleAuthProvider()
    const facebookProvider = new FacebookAuthProvider();
    const router = useRouter()

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            setLoading(true)
            const result = await createUserWithEmailAndPassword(auth, email, password)
            await updateProfile(result.user, {
                displayName: name,
            });

            console.log("Registered:", result.user)

            await saveUserToFirestore(email, name, password);

            router.push("/flows");

        } catch (err) {
            console.error(err)
            setError("Registration failed. Email may already be in use.")
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleRegister = async () => {
        try {
            googleProvider.setCustomParameters({prompt: "select_account"})
            const result = await signInWithPopup(auth, googleProvider)

            if (!result.user) {
                setError("Google Sign-In failed.")
                return
            }

            const user = result.user;

            console.log("Registered with Google:", user)

            await saveUserToFirestore(user.email ?? "unknown@email.com", user.displayName ?? "Google User", "google");

            router.push("/flows");
        } catch (err) {
            console.error(err)
            setError("Google Sign-In failed.")
        }
    }

    // const handleFacebookRegister = async () => {
    //     try {
    //         facebookProvider.setCustomParameters({display: "popup"});
    //         facebookProvider.addScope("email");
    //
    //         const result = await signInWithPopup(auth, facebookProvider);
    //
    //         if (!result.user) {
    //             setError("Facebook Sign-In failed.");
    //             return;
    //         }
    //
    //         const user = result.user;
    //
    //         console.log("Registered with Facebook:", user);
    //
    //         await saveUserToFirestore(
    //             user.email ?? "unknown@email.com",
    //             user.displayName ?? "Facebook User",
    //             "facebook"
    //         );
    //
    //         router.push("/flows");
    //     } catch (err) {
    //         console.error(err);
    //         setError("Facebook Sign-In failed.");
    //     }
    // };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Create your account</CardTitle>
                    <CardDescription>Register using email or Google</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister}>
                        <div className="grid gap-6">
                            {/*<Button type="button" variant="outline" className="w-full" onClick={handleFacebookRegister}>*/}
                            {/*    <FaFacebookSquare className="text-[#1877F2]"/>*/}
                            {/*    Register with Facebook*/}
                            {/*</Button>*/}
                            <Button type="button" variant="outline" className="w-full" onClick={handleGoogleRegister}>
                                <FaGoogle/>
                                Register with Google
                            </Button>

                            <div className="relative text-center text-sm">
                                <span className="bg-background text-muted-foreground relative z-10 px-2">
                                  Or continue with
                                </span>
                                <div className="absolute inset-0 top-1/2 border-t border-border"/>
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={name}
                                    placeholder="Your full name"
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    placeholder="Your email address"
                                    autoComplete="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Your password"
                                    value={password}
                                    autoComplete="new-password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/*<Select*/}
                            {/*    label="Role"*/}
                            {/*    placeholder="Select role"*/}
                            {/*    data={[*/}
                            {/*        {value: "buyer", label: "Buyer"},*/}
                            {/*        {value: "seller", label: "Seller"},*/}
                            {/*    ]}*/}
                            {/*    value={role}*/}
                            {/*    onChange={(value) => setRole(value || "")}*/}
                            {/*/>*/}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Registering..." : "Register"}
                            </Button>

                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                            <div className="text-center text-sm">
                                Already have an account?{" "}
                                <a href="/login" className="underline underline-offset-4">
                                    Log in
                                </a>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

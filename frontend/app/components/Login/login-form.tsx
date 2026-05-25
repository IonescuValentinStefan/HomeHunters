import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {FaGoogle} from "react-icons/fa";

import React, {useState} from "react";

import app from "@/firebase/firebase-config";
import {
    FacebookAuthProvider,
    getAuth,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup
} from "firebase/auth";
import {useRouter} from "next/navigation";
import {saveUserToFirestore} from "@/firestore/saveUserToFirestore";

export function LoginForm({
                              className,
                              ...props
                          }: React.ComponentProps<"div">) {

    const [email, setEmail] = useState("marius@gmail.com");
    const [password, setPassword] = useState("marius");
    const [role, setRole] = useState("buyer");
    const [error, setError] = useState("");

    const auth = getAuth(app);
    const googleProvider = new GoogleAuthProvider();
    const facebookProvider = new FacebookAuthProvider();

    const router = useRouter()

    const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Logged in:", user);

            await saveUserToFirestore(user.uid, email, user.displayName || "User", password);
            router.push("/flows");

        } catch (err) {
            if (err instanceof Error) {
                // TypeScript now knows err is an instance of Error
                console.error(err.message);
                setError("Failed to log in. Please check your credentials.");
            } else {
                console.error("An unexpected error occurred.");
                setError("An unexpected error occurred. Please try again.");
            }
        }
    };

    const handleGoogleLogin = async () => {
        try {

            console.log("Attempting Google Sign-In...");

            googleProvider.setCustomParameters({prompt: "select_account"});
            const result = await signInWithPopup(auth, googleProvider);

            if (!result.user || !result.user.uid) {
                setError("User not found after login.");
                console.log("User not found after login.");
                return;
            }

            console.log("Logged in with Google:", result.user);

            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;
            const user = result.user;

            console.log("Google Sign-In successful");
            console.log("User info:", user);
            console.log("Token:", token);

            await saveUserToFirestore(user.uid, user.email ?? "unknown@email.com", user.displayName ?? "Google User", "google");

            await router.push("/flows");

        } catch (err) {
            if (err instanceof Error) {
                // TypeScript now knows err is an instance of Error
                console.error(err.message);
                setError("Failed to log in. Please check your credentials.");
            } else {
                console.error("An unexpected error occurred.");
                setError("An unexpected error occurred. Please try again.");
            }
        }
    };

    // const handleFacebookLogin = async () => {
    //     try {
    //         console.log("Attempting Facebook Sign-In...");
    //
    //         facebookProvider.setCustomParameters({ display: "popup" });
    //         const result = await signInWithPopup(auth, facebookProvider);
    //
    //         if (!result.user || !result.user.uid) {
    //             setError("User not found after login.");
    //             console.log("User not found after login.");
    //             return;
    //         }
    //
    //         console.log("Logged in with Facebook:", result.user);
    //
    //         const credential = FacebookAuthProvider.credentialFromResult(result);
    //         const token = credential?.accessToken;
    //         const user = result.user;
    //
    //         console.log("Facebook Sign-In successful");
    //         console.log("User info:", user);
    //         console.log("Token:", token);
    //
    //         await saveUserToFirestore(
    //             user.email ?? "unknown@email.com",
    //             user.displayName ?? "Facebook User",
    //             "facebook"
    //         );
    //
    //         await router.push("/flows");
    //     } catch (err) {
    //         if (err instanceof Error) {
    //             console.error(err.message);
    //             setError("Failed to log in. Please check your credentials.");
    //         } else {
    //             console.error("An unexpected error occurred.");
    //             setError("An unexpected error occurred. Please try again.");
    //         }
    //     }
    // };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>
                        Login with your Google account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleEmailLogin}>
                        <div className="grid gap-6">
                            <div className="flex flex-col gap-4">
                                {/*<Button variant="outline" className="w-full" onClick={handleFacebookLogin}>*/}
                                {/*    <div className="flex items-center justify-center gap-2">*/}
                                {/*        <FaFacebookSquare className="text-[#1877F2]"/>*/}
                                {/*        <span className="text-sm md:text-base">Login with Facebook</span>*/}
                                {/*    </div>*/}
                                {/*</Button>*/}
                                <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin}>
                                    <FaGoogle/>
                                    Login with Google
                                </Button>
                            </div>
                            <div
                                className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                <span className="bg-background text-muted-foreground relative z-10 px-2">
                                  Or continue with
                                </span>
                            </div>
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        placeholder="m@example.com"
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        <a
                                            href="/forgot-password"
                                            className="ml-auto text-sm underline-offset-4 hover:underline"
                                        >
                                            Forgot your password?
                                        </a>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required/>
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
                                <Button type="submit" className="w-full">
                                    Login
                                </Button>

                                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                            </div>
                            <div className="text-center text-sm">
                                Don&apos;t have an account?{" "}
                                <a href="/register" className="underline underline-offset-4">
                                    Sign up
                                </a>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

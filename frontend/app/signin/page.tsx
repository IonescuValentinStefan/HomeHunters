"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {Button, Flex, Paper, PasswordInput, Select, Stack, TextInput, Title, useMantineTheme,} from "@mantine/core";
import Link from "next/link";
import {useDisclosure} from "@mantine/hooks";
import {FacebookAuthProvider, getAuth, GoogleAuthProvider, signInWithPopup,} from "firebase/auth";
import firebase_app from "../firebase/firebase-config";
import signIn from '../firebase/auth/signin';

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export default function Page() {
    const theme = useMantineTheme();
    const [email, setEmail] = useState("marius@gmail.com");
    const [password, setPassword] = useState("marius");
    const [role, setRole] = useState("buyer");
    const [visible, {toggle}] = useDisclosure(false);
    const router = useRouter();

    const auth = getAuth(firebase_app);
    const user = auth.currentUser;

    console.log('User: ', user);

    const [error, setError] = useState<string>("");

    const handleForm = async (event: { preventDefault: () => void }) => {
        event.preventDefault();

        const {result, error} = await signIn(email, password);
        if (error) {
            const typedError = error as Error;
            setError(typedError.message);
            console.log('Sign-In Error:', error);
            return;
        }

        console.log(result);
        console.log("Login with email and password:", email, password);

        const redirectPath = role === "seller" ? "/seller" : "/buyer";
        console.log(`Redirecting to ${role} page`);
        router.push(`${redirectPath}?password=${encodeURIComponent(password)}`);
    };

    const handleGoogleSignIn = async () => {
        const auth = getAuth();
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;
            const user = result.user;

            console.log("Google Sign-In successful");
            console.log("User info:", user);
            console.log("Token:", token);

            router.push("/buyer");
        } catch (error: any) {
            console.error("Google Sign-In Error:", error.message);
            setError(error.message);
        }
    };

    const handleFacebookSignIn = async () => {
        const auth = getAuth();
        try {
            const result = await signInWithPopup(auth, facebookProvider);
            const credential = FacebookAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;
            const user = result.user;

            console.log("Facebook Sign-In successful");
            console.log("User info:", user);
            console.log("Token:", token);

            router.push("/buyer");
        } catch (error: any) {
            console.error("Facebook Sign-In Error:", error.message);
            setError(error.message);
        }
    };

    return (
        <Flex justify="center" align="center" h="100vh" style={{backgroundColor: "#2e2e2e"}}>
            <Paper shadow="md" radius="md" p="xl" withBorder style={{width: "60%", maxWidth: 400}}>
                <Stack gap="xl">
                    <Title order={1} style={{padding: 20, textAlign: "center"}}>
                        Sign In
                    </Title>

                    <form onSubmit={handleForm}>
                        <Stack gap="md">
                            <TextInput
                                label="Email"
                                placeholder="marius@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <PasswordInput
                                label="Password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                visible={visible}
                                onVisibilityChange={toggle}
                                required
                            />

                            <div
                                onClick={() => router.push("/forgot-password")}
                                style={{
                                    cursor: "pointer",
                                    color: theme.colors.blue[6],
                                    fontSize: "12px",
                                    textDecoration: "underline",
                                }}
                            >
                                Forgot password?
                            </div>

                            <Select
                                label="Role"
                                placeholder="Select role"
                                data={[
                                    {value: "buyer", label: "Buyer"},
                                    {value: "seller", label: "Seller"},
                                ]}
                                value={role}
                                onChange={(value) => setRole(value || "")}
                            />

                            <Button type="submit" fullWidth>
                                Sign In
                            </Button>
                        </Stack>
                    </form>

                    <div style={{textAlign: "center"}}>Sign in with Social Accounts</div>

                    <Stack gap="sm">
                        <Button onClick={handleGoogleSignIn} color="blue" fullWidth>
                            Sign in with Google
                        </Button>
                        <Button onClick={handleFacebookSignIn} color="blue" fullWidth>
                            Sign in with Facebook
                        </Button>
                    </Stack>

                    {error && (
                        <div style={{color: theme.colors.red[6], textAlign: "center"}}>
                            {error}
                        </div>
                    )}

                    <Stack gap="xs" align="center">
                        <div>New to HomeHunters?</div>
                        <Link href="/signup" passHref>
                            <Button>Create an account</Button>
                        </Link>

                        <Link href="/" passHref>
                            <Button>Back to Home</Button>
                        </Link>

                        <Link href="/feed" passHref>
                            <Button>Apt filter</Button>
                        </Link>

                        <Link href="/property-listing" passHref>
                            <Button>Property listing</Button>
                        </Link>
                    </Stack>
                </Stack>
            </Paper>
        </Flex>
    );
}

'use client';

import React, {useState} from 'react';
import {Button, Flex, Paper, Select, Stack, TextInput, Title} from '@mantine/core';
import signUp from '../firebase/auth/signup';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {TERRACOTTA_RED} from '../map/config';
import {PasswordInputComponent} from "./PasswordInputComponent";

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('buyer');

    const router = useRouter();

    const handleForm = async (event: React.FormEvent) => {
        event.preventDefault();

        const {result, error} = await signUp(email, password);

        if (error) {
            console.error('Sign-Up Error:', error);
            return;
        }

        switch (role) {
            case 'seller':
                console.log('Redirecting to seller page', result);
                router.push(`/seller?password=${encodeURIComponent(password)}`);
                break;

            case 'buyer':
                console.log('Redirecting to buyer page', result);
                router.push(`/buyer?password=${encodeURIComponent(password)}`);
                break;

            default:
                console.log('Invalid role');
        }
    };

    return (
        <Flex
            justify="center"
            align="center"
            h="100vh"
            style={{backgroundColor: "#2e2e2e"}}
        >
            <Paper
                shadow="md"
                radius="md"
                p="xl"
                withBorder
                style={{width: '60%', maxWidth: 300}}
            >

                <form onSubmit={handleForm}>
                    <Stack gap="md">
                        <Title order={1} style={{padding: 20, textAlign: "center"}}>
                            Sign Up
                        </Title>

                        <TextInput
                            label="Email"
                            placeholder="example@mail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        {/* Password input field moved to PasswordInputComponent */}
                        <PasswordInputComponent value={password} onChange={setPassword}/>

                        <Select
                            label="Role"
                            placeholder="Select your role"
                            value={role}
                            onChange={(value) => setRole(value || 'buyer')}
                            data={[
                                {value: 'buyer', label: 'Buyer'},
                                {value: 'seller', label: 'Seller'},
                            ]}
                        />
                        <Button type="submit" fullWidth style={{backgroundColor: TERRACOTTA_RED}}>
                            Register
                        </Button>
                    </Stack>
                </form>
                <Stack gap="sm" mt="xl" align="center">
                    <Link href="/">
                        <Button>
                            Back to Home
                        </Button>
                    </Link>
                    <Link href="/signin" passHref>
                        <Button>
                            Go to Sign In
                        </Button>
                    </Link>
                </Stack>
            </Paper>
        </Flex>
    );
}

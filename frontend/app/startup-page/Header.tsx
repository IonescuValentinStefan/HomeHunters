import {Button} from '@/components/ui/button';
import NextImage from 'next/image';
import Link from "next/link";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import app from "@/firebase/firebase-config";
import {useEffect, useState} from "react";

export default function Header() {

    const auth = getAuth(app);

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsLoggedIn(!!user);
        });
        return () => unsubscribe();
    }, [auth]);

    return (
        <div>
            {/* Logo image using next/image */}
            <NextImage
                src="/logo.png"
                alt="HomeHunters logo"
                width={100}
                height={100}
                className="absolute top-5 left-5 z-20 mb-8 h-auto w-[7vw]"
                priority
            />

            <div
                className="relative h-screen bg-blue-900 bg-cover bg-center bg-no-repeat z-[1]"
                style={{backgroundImage: "url('/bg-2.jpg')"}}
            >

                {/* Black gradient overlay */}
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/25 via-black/65 to-transparent"/>

                {/* Blue transparent overlay */}
                <div className="absolute inset-0 z-0 bg-blue-950/30"/>

                <div className="relative z-10 h-full flex flex-col justify-center max-w-3xl mx-auto px-6 md:px-10">
                    {/* Title replacement */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6">
                        HomeHunters
                    </h1>

                    {/* Description replacement */}
                    <p className="text-lg md:text-xl lg:text-2xl text-blue-100 mt-4 mb-10 leading-relaxed">
                        Buying and selling has never been so simple.
                        <br/>
                        Now, everything you need to successfully buy or sell your home is on one platform!
                    </p>

                    <Link href={isLoggedIn ? "/flows" : "/login"}>
                        <Button
                            className="!text-2xl !md:text-6xl mt-6 w-fit px-16 py-8 font-extrabold tracking-wide uppercase rounded-full bg-blue-700 text-white hover:opacity-90 transition-all"
                        >
                            Start Now
                        </Button>
                    </Link>

                </div>
            </div>
        </div>
    );
}

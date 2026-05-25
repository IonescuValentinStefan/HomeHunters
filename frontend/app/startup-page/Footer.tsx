import React from 'react';

export default function Footer() {
    return (
        <footer
            className="absolute top-[210vh] w-full bg-blue-950 text-white h-[5vh] flex items-center justify-center z-0">
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap justify-center gap-8 text-md">
                    <a href="/about" className="hover:text-blue-400 transition-colors">
                        About Us
                    </a>
                    <a href="/contact" className="hover:text-blue-400 transition-colors">
                        Contact
                    </a>
                    <a href="/privacy" className="hover:text-blue-400 transition-colors">
                        Privacy Policy
                    </a>
                </div>
            </div>
        </footer>
    );
}

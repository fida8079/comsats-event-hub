"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Logo + Brand */}
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center text-white font-bold text-sm">
                            CUI
                        </div>
                        <span className="text-lg font-bold text-foreground tracking-tight">
                            Event Hub
                        </span>
                    </Link>

                    {/* Center: Nav Links (desktop) */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            href="/"
                            className="text-sm font-medium text-foreground hover:text-brand-purple transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            href="/#events"
                            className="text-sm font-medium text-muted-foreground hover:text-brand-purple transition-colors"
                        >
                            Events
                        </Link>
                        <Link
                            href="/#about"
                            className="text-sm font-medium text-muted-foreground hover:text-brand-purple transition-colors"
                        >
                            About
                        </Link>
                    </div>

                    {/* Right: Auth Buttons (desktop) */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/login">
                            <Button variant="ghost" className="text-sm font-medium">
                                Login
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button className="bg-brand-purple hover:bg-brand-purple-dark text-white text-sm font-semibold px-6 rounded-full">
                                Register
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2 text-foreground"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-border px-4 py-4 space-y-3">
                    <Link
                        href="/"
                        className="block text-sm font-medium text-foreground py-2"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        href="/#events"
                        className="block text-sm font-medium text-muted-foreground py-2"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Events
                    </Link>
                    <Link
                        href="/#about"
                        className="block text-sm font-medium text-muted-foreground py-2"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        About
                    </Link>
                    <div className="flex gap-3 pt-2">
                        <Link href="/login" className="flex-1">
                            <Button variant="outline" className="w-full text-sm">
                                Login
                            </Button>
                        </Link>
                        <Link href="/register" className="flex-1">
                            <Button className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white text-sm rounded-full">
                                Register
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}

"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export default function HeroSection({
    searchQuery,
    onSearchChange,
}: HeroSectionProps) {
    return (
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 -z-10" />
            <div className="absolute top-20 right-10 w-72 h-72 bg-brand-purple/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl -z-10" />

            <div className="max-w-4xl mx-auto text-center space-y-8">
                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
                    Discover Events at{" "}
                    <span className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
                        COMSATS
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="text-lg sm:text-xl text-muted-foreground font-medium tracking-wide">
                    Register &bull; Participate &bull; Grow
                </p>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <Input
                        type="text"
                        placeholder="Search events by name, date or venue..."
                        className="pl-12 pr-4 py-6 text-base rounded-full border-border shadow-sm bg-white focus-visible:ring-brand-purple"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a href="#events">
                        <Button
                            size="lg"
                            className="bg-brand-purple hover:bg-brand-purple-dark text-white font-semibold px-8 rounded-full text-base"
                        >
                            Browse All Events
                        </Button>
                    </a>
                    <a href="#events">
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white font-semibold px-8 rounded-full text-base"
                        >
                            View Upcoming
                        </Button>
                    </a>
                </div>
            </div>
        </section>
    );
}

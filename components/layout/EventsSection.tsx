"use client";

import { Calendar, MapPin } from "lucide-react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Event } from "@/lib/types";
import EventCardModalWrapper from "@/components/events/EventCardModalWrapper";
import { Users } from "lucide-react";

interface EventsSectionProps {
    events: Event[];
    eventCounts?: Record<string, number>;
}

const categoryColors: Record<string, string> = {
    Workshop: "bg-brand-purple/10 text-brand-purple border-brand-purple/20",
    Sports: "bg-green-50 text-green-700 border-green-200",
    Cultural: "bg-orange-50 text-orange-700 border-orange-200",
    Technical: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
    Seminar: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Others: "bg-slate-100 text-slate-700 border-slate-200",
};

function getCategoryStyle(category: string) {
    return (
        categoryColors[category] ||
        "bg-gray-50 text-gray-700 border-gray-200"
    );
}

function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function EventsSection({ events, eventCounts = {} }: EventsSectionProps) {
    if (events.length === 0) {
        return (
            <section id="events" className="py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                        Current & Upcoming Events
                    </h2>
                    <p className="text-muted-foreground">
                        No events found. Check back later!
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section id="events" className="py-20 px-4 bg-muted/30">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                        Current & Upcoming Events
                    </h2>
                    <p className="text-muted-foreground mt-3 text-lg">
                        Find your next opportunity to learn, compete, and grow
                    </p>
                </div>

                {/* Event Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => {
                        const joinedCount = eventCounts[event.id] || 0;
                        return (
                            <EventCardModalWrapper key={event.id} event={event} joinedCount={joinedCount}>
                                <Card className="hover:-translate-y-1 transition-transform duration-300 bg-white border-slate-100 shadow-sm hover:shadow-md rounded-2xl overflow-hidden flex flex-col h-full text-left">
                                    {/* Event Image */}
                                    <div className="relative w-full h-48 bg-slate-100 border-b border-border/50">
                                        {event.image_url ? (
                                            <img
                                                src={event.image_url}
                                                alt={event.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 flex flex-col items-center justify-center text-slate-400">
                                                <Calendar size={32} className="mb-2 opacity-50" />
                                                <span className="text-xs font-medium uppercase tracking-wider">No Image</span>
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] uppercase font-bold tracking-wider shadow-sm backdrop-blur-md bg-white/90 ${getCategoryStyle(event.category)}`}
                                            >
                                                {event.category}
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardHeader className="pb-3 pt-4">
                                        <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-2">
                                            {event.title}
                                        </h3>
                                    </CardHeader>
                                    
                                    <CardContent className="space-y-3 pb-3 flex-1">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar size={16} className="text-brand-purple shrink-0" />
                                            <span>
                                                {formatDate(event.event_date)} &bull;{" "}
                                                {formatTime(event.event_date)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin size={16} className="text-brand-blue shrink-0" />
                                            <span>{event.venue || "TBA"}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 pt-1 text-sm text-brand-purple font-medium">
                                            <Users size={16} className="shrink-0" />
                                            <span>{joinedCount} users joined</span>
                                        </div>

                                        {event.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 pt-1">
                                                {event.description}
                                            </p>
                                        )}
                                    </CardContent>

                                    <CardFooter className="pt-3" onClick={(e) => e.stopPropagation()}>
                                        <Link href={`/events/${event.id}`} className="w-full">
                                            <Button
                                                variant="outline"
                                                className="w-full border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white font-medium rounded-lg relative z-10"
                                            >
                                                View Details
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            </EventCardModalWrapper>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

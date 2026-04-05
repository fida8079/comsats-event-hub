"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Event, EventRequest } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Calendar, MapPin, Search, Users } from "lucide-react";
import EventCardModalWrapper from "@/components/events/EventCardModalWrapper";
import { toast } from "sonner";

const categoryFilters = ["All", "Workshop", "Sports", "Cultural", "Technical", "Seminar", "Others"];

export default function StudentEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [requests, setRequests] = useState<EventRequest[]>([]);
    const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
    const [activeFilter, setActiveFilter] = useState("All");
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadData() {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Load events
        const { data: eventsData } = await supabase
            .from("events")
            .select("*")
            .order("event_date", { ascending: true });
        if (eventsData) setEvents(eventsData);

        // Load requests to know which ones we've already applied for
        const { data: requestsData } = await supabase
            .from("event_requests")
            .select("*")
            .eq("student_id", user.id);
        if (requestsData) setRequests(requestsData);

        // Load all approved requests to aggregate counts
        const { data: allApprovedRequests } = await supabase
            .from("event_requests")
            .select("event_id")
            .eq("status", "approved");
            
        if (allApprovedRequests) {
            const counts: Record<string, number> = {};
            allApprovedRequests.forEach(req => {
                counts[req.event_id] = (counts[req.event_id] || 0) + 1;
            });
            setEventCounts(counts);
        }

        setLoading(false);
    }

    async function handleRequest(eventId: string) {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from("event_requests").insert({
            event_id: eventId,
            student_id: user.id,
        });

        if (error) {
            if (error.code === "23505") {
                toast.error("You have already requested this event.");
            } else {
                toast.error("Failed to send request.");
            }
        } else {
            toast.success("Request Sent!");
            loadData(); // Refresh the requests list to disable button
        }
    }

    const requestedEventIds = requests.map((r) => r.event_id);

    const filteredEvents =
        activeFilter === "All"
            ? events
            : events.filter((e) => e.category === activeFilter);

    if (loading) {
        return <div className="text-center py-12 text-slate-500">Loading events...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Browse Events
                </h1>
                <p className="text-slate-500 mt-1">
                    Discover and participate in upcoming campus activities.
                </p>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2 py-2">
                {categoryFilters.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            activeFilter === cat
                                ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20"
                                : "bg-white text-slate-500 border border-slate-200 hover:border-brand-purple/30 hover:text-brand-purple"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {filteredEvents.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500 shadow-sm flex flex-col items-center">
                    <Search size={48} className="text-slate-300 mb-4" />
                    <p className="text-lg font-medium text-slate-900">No events found.</p>
                    <p>There are no events available for the selected category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => {
                        const isRequested = requestedEventIds.includes(event.id);
                        const joinedCount = eventCounts[event.id] || 0;
                        return (
                            <EventCardModalWrapper key={event.id} event={event} joinedCount={joinedCount}>
                                <Card className="hover:-translate-y-1 transition-transform duration-300 bg-white border-slate-100 shadow-sm hover:shadow-md rounded-2xl overflow-hidden flex flex-col h-full text-left">
                                    {/* Event Image */}
                                    <div className="relative w-full h-48 bg-slate-100 border-b border-slate-50">
                                        {event.image_url ? (
                                            <img
                                                src={event.image_url}
                                                alt={event.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-brand-purple/5 to-brand-blue/5 flex flex-col items-center justify-center text-slate-300">
                                                <Calendar size={32} className="mb-2 opacity-50" />
                                                <span className="text-xs font-semibold uppercase tracking-widest">No Image</span>
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <Badge
                                                variant="outline"
                                                className="w-fit text-[10px] uppercase tracking-wider font-bold shadow-sm backdrop-blur-md bg-white/90 text-brand-purple border-brand-purple/20 rounded-md px-2 py-0.5"
                                            >
                                                {event.category}
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardHeader className="pb-3 pt-4 bg-white">
                                        <h3 className="text-lg font-bold text-slate-900 line-clamp-2 leading-tight">
                                            {event.title}
                                        </h3>
                                    </CardHeader>
                                    <CardContent className="space-y-3 pt-1 flex-1">
                                        <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                                <Calendar size={16} className="text-slate-500" />
                                            </div>
                                            <span>
                                                {event.event_date ? new Date(event.event_date).toLocaleDateString(undefined, {
                                                    month: "short", day: "numeric", year: "numeric"
                                                }) : "TBA"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                                <MapPin size={16} className="text-slate-500" />
                                            </div>
                                            <span>{event.venue || "TBA"}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 pt-2 text-sm text-brand-purple font-medium">
                                            <Users size={16} />
                                            <span>{joinedCount} users joined</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-2 pb-5 px-6" onClick={(e) => e.stopPropagation()}>
                                        {isRequested ? (
                                            <Button disabled variant="outline" className="w-full text-[15px] font-semibold rounded-xl h-11 border-slate-200 text-slate-400 bg-slate-50">
                                                Already Requested
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleRequest(event.id);
                                                }}
                                                className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white text-[15px] font-semibold rounded-xl h-11 shadow-sm relative z-10"
                                            >
                                                Request to Participate
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            </EventCardModalWrapper>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

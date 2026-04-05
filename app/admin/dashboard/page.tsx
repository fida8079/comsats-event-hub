"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Event } from "@/lib/types";
import {
    CalendarDays,
    Users,
    ClipboardCheck,
    TrendingUp,
    Calendar,
    MapPin,
    Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import EventCardModalWrapper from "@/components/events/EventCardModalWrapper";
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";

const categoryFilters = ["All", "Workshop", "Sports", "Cultural", "Technical", "Seminar", "Others"];

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalEvents: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        totalUsers: 0,
    });
    const [events, setEvents] = useState<Event[]>([]);
    const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
    const [activeFilter, setActiveFilter] = useState("All");
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const [eventsCountRes, requestsRes, usersRes, allEventsRes] = await Promise.all([
                supabase.from("events").select("id", { count: "exact" }),
                supabase.from("event_requests").select("status, event_id"),
                supabase.from("profiles").select("id", { count: "exact" }),
                supabase.from("events").select("*").order("event_date", { ascending: true }),
            ]);

            const requests = requestsRes.data || [];
            
            setStats({
                totalEvents: eventsCountRes.count || 0,
                pendingRequests: requests.filter((r) => r.status === "pending").length,
                approvedRequests: requests.filter((r) => r.status === "approved").length,
                totalUsers: usersRes.count || 0,
            });

            if (allEventsRes.data) setEvents(allEventsRes.data);
            
            // Generate live joined counts from the requests we already fetched
            const counts: Record<string, number> = {};
            requests.filter(r => r.status === "approved").forEach(req => {
                counts[req.event_id] = (counts[req.event_id] || 0) + 1;
            });
            setEventCounts(counts);

            setLoading(false);
        }
        
        loadData();
    }, []);

    const filteredEvents =
        activeFilter === "All"
            ? events
            : events.filter((e) => e.category === activeFilter);

    if (loading) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                Loading dashboard metrics...
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    Welcome, Admin
                </h1>
                <p className="text-slate-500 mt-2 text-base">
                    Here's an overview of what's happening today.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-2xl bg-brand-purple/10 flex items-center justify-center">
                        <CalendarDays size={26} className="text-brand-purple" />
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold text-slate-900">{stats.totalEvents}</p>
                        <p className="text-sm font-medium text-slate-500">Total Events</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
                        <ClipboardCheck size={26} className="text-amber-600" />
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold text-slate-900">
                            {stats.pendingRequests}
                        </p>
                        <p className="text-sm font-medium text-slate-500">Pending Requests</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                        <TrendingUp size={26} className="text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold text-slate-900">
                            {stats.approvedRequests}
                        </p>
                        <p className="text-sm font-medium text-slate-500">Approved Participation</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
                        <Users size={26} className="text-brand-blue" />
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold text-slate-900">{stats.totalUsers}</p>
                        <p className="text-sm font-medium text-slate-500">Total Users</p>
                    </div>
                </div>
            </div>

            {/* Events Section */}
            <div className="pt-4 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Recent & Upcoming Events</h2>
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {categoryFilters.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                activeFilter === cat
                                    ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                                    : "bg-white text-slate-500 border border-slate-200 hover:border-brand-blue/30 hover:text-brand-blue"
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
                            const joinedCount = eventCounts[event.id] || 0;
                            return (
                                <EventCardModalWrapper key={event.id} event={event} joinedCount={joinedCount}>
                                    <Card className="hover:-translate-y-1 transition-transform duration-300 bg-white border-slate-100 shadow-sm hover:shadow-md rounded-2xl overflow-hidden flex flex-col h-full text-left">
                                        {/* Event Image */}
                                        <div className="relative w-full h-40 bg-slate-100 border-b border-slate-50">
                                            {event.image_url ? (
                                                <img
                                                    src={event.image_url}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-brand-blue/5 to-brand-purple/5 flex flex-col items-center justify-center text-slate-300">
                                                    <Calendar size={28} className="mb-2 opacity-50" />
                                                    <span className="text-[10px] font-semibold uppercase tracking-widest">No Image</span>
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3">
                                                <Badge
                                                    variant="outline"
                                                    className="w-fit text-[10px] uppercase tracking-wider font-bold shadow-sm backdrop-blur-md bg-white/90 text-brand-blue border-brand-blue/20 rounded-md px-2 py-0.5"
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
                                        <CardContent className="space-y-3 pt-1 flex-1 pb-6">
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
                                            
                                            <div className="flex items-center gap-2 pt-2 text-sm text-brand-blue font-medium">
                                                <Users size={16} />
                                                <span>{joinedCount} users joined</span>
                                            </div>
                                            
                                            {event.description && (
                                                <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                                                    {event.description}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </EventCardModalWrapper>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

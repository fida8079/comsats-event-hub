"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Event } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ id: string; role: string } | null>(null);
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        const supabase = createClient();

        async function fetchEvent() {
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .eq("id", params.id as string)
                .single();

            if (!error && data) {
                setEvent(data);
            }
            setLoading(false);
        }

        async function checkUser() {
            const {
                data: { user: authUser },
            } = await supabase.auth.getUser();
            if (authUser) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", authUser.id)
                    .single();
                if (profile) {
                    setUser({ id: authUser.id, role: profile.role });
                }
            }
        }

        fetchEvent();
        checkUser();
    }, [params.id]);

    async function handleRequestParticipation() {
        if (!user) {
            router.push("/login");
            return;
        }
        setRequesting(true);
        const supabase = createClient();
        const { error } = await supabase.from("event_requests").insert({
            event_id: params.id as string,
            student_id: user.id,
        });

        if (error) {
            if (error.code === "23505") {
                toast.error("You have already requested this event.");
            } else {
                toast.error("Failed to send request. Please try again.");
            }
        } else {
            toast.success("Request Sent! Your participation request has been submitted.");
        }
        setRequesting(false);
    }

    if (loading) {
        return (
            <main className="min-h-screen">
                <Navbar />
                <div className="pt-24 text-center text-muted-foreground">Loading...</div>
            </main>
        );
    }

    if (!event) {
        return (
            <main className="min-h-screen">
                <Navbar />
                <div className="pt-24 text-center text-muted-foreground">
                    Event not found.
                </div>
            </main>
        );
    }

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });

    const formatTime = (dateString: string) =>
        new Date(dateString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <main className="min-h-screen">
            <Navbar />
            <div className="pt-24 pb-16 px-4">
                <div className="max-w-3xl mx-auto">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-purple mb-6 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Events
                    </button>

                    <div className="bg-white rounded-2xl border border-border p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <Badge
                                variant="outline"
                                className="text-xs font-medium bg-brand-purple/10 text-brand-purple border-brand-purple/20"
                            >
                                {event.category}
                            </Badge>
                        </div>

                        <h1 className="text-3xl font-bold text-foreground">
                            {event.title}
                        </h1>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Calendar size={18} className="text-brand-purple" />
                                <span>
                                    {formatDate(event.event_date)} at {formatTime(event.event_date)}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <MapPin size={18} className="text-brand-blue" />
                                <span>{event.venue}</span>
                            </div>
                        </div>

                        {event.description && (
                            <div className="pt-4 border-t border-border">
                                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                                    Description
                                </h3>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {event.description}
                                </p>
                            </div>
                        )}

                        {user?.role === "student" && (
                            <div className="pt-4">
                                <Button
                                    onClick={handleRequestParticipation}
                                    disabled={requesting}
                                    className="bg-brand-purple hover:bg-brand-purple-dark text-white font-semibold px-8 rounded-full"
                                >
                                    {requesting ? "Sending..." : "Request to Participate"}
                                </Button>
                            </div>
                        )}

                        {!user && (
                            <div className="pt-4">
                                <Button
                                    onClick={() => router.push("/login")}
                                    className="bg-brand-purple hover:bg-brand-purple-dark text-white font-semibold px-8 rounded-full"
                                >
                                    Login to Participate
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}

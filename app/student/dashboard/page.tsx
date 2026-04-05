"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import {
    CalendarDays,
    ClipboardList,
} from "lucide-react";
import Link from "next/link";

export default function StudentDashboardOverview() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        upcoming: 0,
    });
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            // Load profile
            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();
            if (profileData) setProfile(profileData);

            // Load request stats
            const { data: requests } = await supabase
                .from("event_requests")
                .select("status")
                .eq("student_id", user.id);

            const reqs = requests || [];

            // Load events count
            const { count: eventsCount } = await supabase
                .from("events")
                .select("id", { count: "exact" });

            setStats({
                pending: reqs.filter((r) => r.status === "pending").length,
                approved: reqs.filter((r) => r.status === "approved").length,
                upcoming: eventsCount || 0,
            });

            setLoading(false);
        }
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return <div className="text-center py-12 text-slate-500">Loading overview...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    Welcome back, {profile?.full_name}!
                </h1>
                <p className="text-slate-500 mt-2 text-base">
                    {profile?.roll_no && `Roll No: ${profile.roll_no}`}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Link href="/student/events" className="group">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-all group-hover:border-brand-purple/30">
                        <div className="w-14 h-14 rounded-2xl bg-brand-purple/10 flex items-center justify-center">
                            <CalendarDays size={26} className="text-brand-purple group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <p className="text-3xl font-extrabold text-slate-900">{stats.upcoming}</p>
                            <p className="text-sm font-medium text-slate-500">Available Events</p>
                        </div>
                    </div>
                </Link>

                <Link href="/student/requests" className="group">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-all group-hover:border-amber-300">
                        <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
                            <ClipboardList size={26} className="text-amber-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <p className="text-3xl font-extrabold text-slate-900">{stats.pending}</p>
                            <p className="text-sm font-medium text-slate-500">Pending Requests</p>
                        </div>
                    </div>
                </Link>

                <Link href="/student/requests" className="group">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-all group-hover:border-emerald-300">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                            <ClipboardList size={26} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <p className="text-3xl font-extrabold text-slate-900">{stats.approved}</p>
                            <p className="text-sm font-medium text-slate-500">Approved Participations</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

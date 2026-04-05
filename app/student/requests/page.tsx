"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Event, EventRequest } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { ClipboardList } from "lucide-react";

const statusStyles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
};

export default function StudentRequestsPage() {
    const [requests, setRequests] = useState<(EventRequest & { events: Event })[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        loadRequests();
        const channel = supabase
            .channel("student-requests")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "event_requests" },
                () => {
                    loadRequests();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadRequests() {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: requestsData } = await supabase
            .from("event_requests")
            .select("*, events(*)")
            .eq("student_id", user.id)
            .order("created_at", { ascending: false });
        if (requestsData) setRequests(requestsData as (EventRequest & { events: Event })[]);
        setLoading(false);
    }

    async function handleCancel(requestId: string) {
        const { error } = await supabase
            .from("event_requests")
            .delete()
            .eq("id", requestId);

        if (error) {
            toast.error("Failed to cancel request.");
        } else {
            toast.success("Request cancelled.");
            loadRequests();
        }
    }

    if (loading) {
        return <div className="text-center py-12 text-slate-500">Loading requests...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    My Participation Requests
                </h1>
                <p className="text-slate-500 mt-1">
                    Track the status of your event participation applications.
                </p>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500 shadow-sm flex flex-col items-center">
                    <ClipboardList size={48} className="text-slate-300 mb-4" />
                    <p className="text-lg font-medium text-slate-900">No requests yet.</p>
                    <p>Go to "Browse Events" to start participating.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="py-4 font-semibold text-slate-700">Event</TableHead>
                                <TableHead className="hidden sm:table-cell py-4 font-semibold text-slate-700">Date & Time</TableHead>
                                <TableHead className="hidden md:table-cell py-4 font-semibold text-slate-700">Venue</TableHead>
                                <TableHead className="py-4 font-semibold text-slate-700">Status</TableHead>
                                <TableHead className="text-right py-4 font-semibold text-slate-700">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map((req) => (
                                <TableRow key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="font-semibold text-slate-900">
                                        {req.events?.title || "Unknown"}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell text-sm font-medium text-slate-500">
                                        {req.events?.event_date
                                            ? new Date(req.events.event_date).toLocaleDateString(undefined, {
                                                month: "short", day: "numeric", year: "numeric"
                                            })
                                            : "-"}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-sm font-medium text-slate-500">
                                        {req.events?.venue || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`capitalize text-xs font-semibold px-2.5 py-0.5 rounded-md ${statusStyles[req.status]}`}
                                        >
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {(req.status === "pending" || req.status === "approved") && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCancel(req.id)}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-3 rounded-lg"
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}

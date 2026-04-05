"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Event, EventRequest, Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

type RequestWithDetails = EventRequest & {
    events: Event;
    profiles: Profile;
};

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState<RequestWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        loadRequests();

        const channel = supabase
            .channel("admin-requests")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "event_requests" },
                () => loadRequests()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadRequests() {
        const { data } = await supabase
            .from("event_requests")
            .select("*, events(*), profiles(*)")
            .order("created_at", { ascending: false });
        if (data) setRequests(data as RequestWithDetails[]);
        setLoading(false);
    }

    async function handleApprove(req: RequestWithDetails) {
        const { error } = await supabase
            .from("event_requests")
            .update({ status: "approved" })
            .eq("id", req.id);
        if (error) toast.error("Failed to approve.");
        else {
            await supabase.from("notifications").insert({
                student_id: req.student_id,
                event_id: req.event_id,
                message: `Your registration for ${req.events?.title || "an event"} has been Approved`
            });
            toast.success("Request Approved!");
            loadRequests();
        }
    }

    async function handleReject(req: RequestWithDetails) {
        const { error } = await supabase
            .from("event_requests")
            .update({ status: "rejected" })
            .eq("id", req.id);
        if (error) toast.error("Failed to reject.");
        else {
            await supabase.from("notifications").insert({
                student_id: req.student_id,
                event_id: req.event_id,
                message: `Your registration for ${req.events?.title || "an event"} has been Rejected`
            });
            toast.success("Request Rejected.");
            loadRequests();
        }
    }

    const pendingRequests = requests.filter((r) => r.status === "pending");

    if (loading) {
        return <div className="text-center py-12 text-slate-500">Loading requests...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Pending Approvals
                </h1>
                <p className="text-slate-500 mt-1">
                    Review and manage student participation requests.
                </p>
            </div>

            {pendingRequests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500 shadow-sm flex flex-col items-center">
                    <Check size={48} className="text-slate-300 mb-4" />
                    <p className="text-lg font-medium text-slate-900">All caught up!</p>
                    <p>No pending requests require your attention.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="py-4">Student Name</TableHead>
                                <TableHead className="hidden sm:table-cell py-4">Roll No</TableHead>
                                <TableHead className="py-4">Event</TableHead>
                                <TableHead className="hidden md:table-cell py-4">Venue</TableHead>
                                <TableHead className="text-right py-4">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingRequests.map((req) => (
                                <TableRow key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="font-semibold text-slate-900">
                                        {req.profiles?.full_name || "Unknown"}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell text-sm text-slate-500">
                                        {req.profiles?.roll_no || "-"}
                                    </TableCell>
                                    <TableCell className="text-sm font-medium text-slate-700">
                                        {req.events?.title || "Unknown"}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-sm text-slate-500">
                                        {req.events?.venue || "-"}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleApprove(req)}
                                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 h-9 px-4 rounded-xl shadow-sm"
                                        >
                                            <Check size={16} className="mr-1.5" />
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleReject(req)}
                                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-9 px-4 rounded-xl shadow-sm"
                                        >
                                            <X size={16} className="mr-1.5" />
                                            Reject
                                        </Button>
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

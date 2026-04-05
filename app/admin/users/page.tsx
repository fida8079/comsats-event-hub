"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
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
import { Users, GraduationCap, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"student" | "admin">("student");

    const supabase = createClient();

    useEffect(() => {
        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadUsers() {
        setLoading(true);
        const { data } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });
        if (data) setUsers(data);
        setLoading(false);
    }

    async function handleRemoveUser(id: string) {
        if (!confirm("Are you sure you want to remove this user? This will also delete their requests.")) return;

        const { error } = await supabase
            .from("profiles")
            .delete()
            .eq("id", id);
        
        if (error) {
            toast.error("Failed to remove user.");
        } else {
            toast.success("User removed successfully.");
            loadUsers();
        }
    }

    if (loading) {
        return <div className="text-center py-12 text-slate-500">Loading users...</div>;
    }

    const filteredUsers = users.filter((u) => u.role === activeTab);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Manage Users
                </h1>
                <p className="text-slate-500 mt-1">
                    Directory of all registered students and administrators.
                </p>
            </div>

            {/* Role Toggle Tabs */}
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl w-full max-w-md">
                <button
                    onClick={() => setActiveTab("student")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        activeTab === "student"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                    <GraduationCap size={18} className={activeTab === "student" ? "text-brand-purple" : ""} />
                    Students
                </button>
                <button
                    onClick={() => setActiveTab("admin")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        activeTab === "admin"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                    <ShieldCheck size={18} className={activeTab === "admin" ? "text-brand-blue" : ""} />
                    Administrators
                </button>
            </div>

            {filteredUsers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500 shadow-sm flex flex-col items-center">
                    <Users size={48} className="text-slate-300 mb-4" />
                    <p className="text-lg font-medium text-slate-900">
                        No {activeTab}s found.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="py-4 font-semibold text-slate-700">Full Name</TableHead>
                                {activeTab === "student" && (
                                    <TableHead className="py-4 font-semibold text-slate-700">Roll No</TableHead>
                                )}
                                <TableHead className="py-4 font-semibold text-slate-700">Role</TableHead>
                                <TableHead className="hidden sm:table-cell py-4 font-semibold text-slate-700">Joined</TableHead>
                                <TableHead className="text-right py-4 font-semibold text-slate-700">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="font-semibold text-slate-900">{user.full_name}</TableCell>
                                    {activeTab === "student" && (
                                        <TableCell className="text-sm font-medium text-slate-500">
                                            {user.roll_no || "-"}
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs font-semibold capitalize px-2.5 py-0.5 rounded-md ${
                                                user.role === "admin"
                                                    ? "bg-brand-blue/10 text-brand-blue border-brand-blue/20"
                                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                            }`}
                                        >
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell text-sm text-slate-500">
                                        {new Date(user.created_at).toLocaleDateString(undefined, {
                                            month: "short", day: "numeric", year: "numeric"
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveUser(user.id)}
                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg h-8 w-8"
                                            title="Remove User"
                                        >
                                            <Trash2 size={16} />
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

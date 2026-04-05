"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, Check, Info, Calendar, MapPin, CheckCircle2, XCircle } from "lucide-react";
import type { Notification } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function StudentNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    function timeAgo(dateStr: string) {
        const date = new Date(dateStr);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    }

    const supabase = createClient();

    useEffect(() => {
        loadNotifications();

        const channel = supabase
            .channel("student-notifications")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "notifications" },
                () => loadNotifications()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadNotifications() {
        // Fetch user profile to get student_id
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", userData.user.id)
            .single();

        if (profile) {
            const { data } = await supabase
                .from("notifications")
                .select("*")
                .eq("student_id", profile.id)
                .order("created_at", { ascending: false });
            if (data) setNotifications(data);
        }
        setLoading(false);
    }

    async function markAsRead(id: string) {
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);
        
        if (!error) {
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
        }
    }

    async function markAllAsRead() {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("student_id", userData.user.id)
            .eq("is_read", false);

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            toast.success("All notifications marked as read");
        }
    }

    function getNotificationIcon(message: string) {
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes("approved")) return <CheckCircle2 className="text-emerald-500" size={20} />;
        if (lowerMsg.includes("rejected") || lowerMsg.includes("cancelled")) return <XCircle className="text-red-500" size={20} />;
        if (lowerMsg.includes("date")) return <Calendar className="text-brand-purple" size={20} />;
        if (lowerMsg.includes("venue")) return <MapPin className="text-brand-blue" size={20} />;
        return <Info className="text-slate-400" size={20} />;
    }

    if (loading) {
        return (
            <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                <Bell size={32} className="text-slate-300 mb-4 animate-pulse" />
                Loading your notifications...
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="bg-brand-purple text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Updates regarding your event participation.
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={markAllAsRead}
                        className="rounded-full text-slate-600 font-medium"
                    >
                        <Check size={16} className="mr-2" />
                        Mark all as read
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center text-slate-500 shadow-sm flex flex-col items-center">
                    <Bell size={48} className="text-slate-300 mb-4" />
                    <p className="text-lg font-medium text-slate-900">No notifications yet</p>
                    <p>We'll let you know when an event updates or your request is reviewed.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <Card 
                            key={notification.id} 
                            className={`border-none rounded-2xl transition-all duration-300 ${notification.is_read ? 'bg-white shadow-sm' : 'bg-brand-blue/5 shadow-md border-l-4 border-l-brand-blue'}`}
                        >
                            <CardContent className="p-4 sm:p-5 flex items-start sm:items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 shrink-0 mt-1 sm:mt-0">
                                    {getNotificationIcon(notification.message)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className={`text-base ${notification.is_read ? 'text-slate-700 font-medium' : 'text-slate-900 font-bold'}`}>
                                        {notification.message}
                                    </p>
                                    <p className="text-xs font-medium text-slate-500">
                                        {timeAgo(notification.created_at)}
                                    </p>
                                </div>
                                {!notification.is_read && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="shrink-0 text-brand-blue hover:text-white hover:bg-brand-blue rounded-full px-4"
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        Mark as read
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Info } from "lucide-react";
import type { Event } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface Props {
    event: Event;
    children: React.ReactNode;
    joinedCount?: number;
}

const categoryColors: Record<string, string> = {
    Workshop: "bg-brand-purple/10 text-brand-purple border-brand-purple/20",
    Sports: "bg-green-50 text-green-700 border-green-200",
    Cultural: "bg-orange-50 text-orange-700 border-orange-200",
    Technical: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
    Seminar: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Others: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function EventCardModalWrapper({ event, children, joinedCount = 0 }: Props) {
    const [open, setOpen] = useState(false);
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger nativeButton={false} render={<div className="cursor-pointer group h-full flex flex-col" />} >
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-3xl border-none outline-none max-h-[90vh] overflow-y-auto w-[95vw]">
                {/* Visual Header / Cover Image */}
                <div className="relative w-full h-56 sm:h-72 bg-slate-100 border-b border-border/50 shrink-0">
                    {event.image_url ? (
                        <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 flex flex-col items-center justify-center text-slate-400">
                            <Calendar size={48} className="mb-3 opacity-50" />
                            <span className="text-sm font-semibold uppercase tracking-widest">No Image</span>
                        </div>
                    )}
                    
                    {/* Category Overlay */}
                    <div className="absolute top-4 left-4">
                        <Badge
                            variant="outline"
                            className={`text-xs uppercase font-bold tracking-wider shadow-md backdrop-blur-md bg-white/90 px-3 py-1 ${categoryColors[event.category] || "bg-slate-100 text-slate-700 border-slate-200"}`}
                        >
                            {event.category}
                        </Badge>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 sm:p-8 pt-6 space-y-6 bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                            {event.title}
                        </DialogTitle>
                        <DialogDescription className="hidden">Event details modal</DialogDescription>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm mt-3 pt-3 border-t border-slate-100/50">
                            <div className="flex items-center gap-2 text-brand-purple font-semibold bg-brand-purple/5 px-3 py-1.5 rounded-lg border border-brand-purple/10">
                                <Users size={16} />
                                <span>{joinedCount} {joinedCount === 1 ? 'user' : 'users'} joined</span>
                            </div>
                        </div>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-100 flex flex-shrink-0 items-center justify-center text-brand-purple">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Date & Time</p>
                                <p className="text-sm font-medium">
                                    {event.event_date ? new Date(event.event_date).toLocaleString(undefined, {
                                        weekday: 'short', month: 'short', day: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    }) : "TBA"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-100 flex flex-shrink-0 items-center justify-center text-brand-blue">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Location</p>
                                <p className="text-sm font-medium line-clamp-1">{event.venue || "TBA"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Info size={16} className="text-slate-400" />
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">About this event</h4>
                        </div>
                        <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap rounded-xl bg-slate-50 border border-slate-100 p-4 min-h-[100px]">
                            {event.description || <span className="italic text-slate-400">No description provided.</span>}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

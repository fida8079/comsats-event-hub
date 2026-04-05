"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    ClipboardList,
    Search,
    User,
    Bell,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { Profile } from "@/lib/types";

const sidebarLinks = [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/requests", label: "My Participation Requests", icon: ClipboardList },
    { href: "/student/events", label: "Browse Events", icon: Search },
    { href: "/student/profile", label: "Profile", icon: User },
    { href: "/student/notifications", label: "Notifications", icon: Bell },
];

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        async function loadProfile() {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();
                if (data) setProfile(data);
            }
        }
        loadProfile();
    }, []);

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
    }

    return (
        <div className="min-h-screen bg-muted/30 flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-border flex-col py-8 px-5 z-40 shadow-sm">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-12 h-12 rounded-full bg-brand-purple flex items-center justify-center text-white font-bold text-sm shadow-md">
                        CUI
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                        Event Hub
                    </span>
                </div>

                <nav className="space-y-1.5 flex-1">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 ${
                                    isActive
                                        ? "bg-[#f5effb] text-brand-purple shadow-sm"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <link.icon size={20} className={isActive ? "text-brand-purple" : "text-slate-400"} />
                                    {link.label}
                                </div>
                                {/* Notification dot specifically for requests if active - dummy effect for precision UI */}
                                {link.href === "/student/requests" && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto px-2 pt-6 border-t border-border">
                    {profile && (
                        <div className="mb-4">
                            <p className="text-sm font-semibold text-slate-900">{profile.full_name}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">{profile.roll_no}</p>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl px-2.5 py-6"
                    >
                        <LogOut size={20} className="mr-3 text-slate-400" />
                        <span className="text-[15px] font-medium">Logout</span>
                    </Button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-border h-16 px-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        className="p-2 -ml-2 text-slate-600 hover:text-slate-900 bg-slate-50 rounded-lg"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center text-white font-bold text-[10px]">
                        CUI
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                >
                    <LogOut size={18} />
                </Button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <aside className="lg:hidden fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)}>
                    <div
                        className="w-72 h-full bg-white border-r border-border py-6 px-4 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <nav className="space-y-1.5 flex-1">
                            {sidebarLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                                            isActive
                                                ? "bg-[#f5effb] text-brand-purple"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <link.icon size={20} className={isActive ? "text-brand-purple" : "text-slate-400"} />
                                            {link.label}
                                        </div>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </aside>
            )}

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-72 pt-16 lg:pt-0 min-h-screen">
                <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto">{children}</div>
            </main>
        </div>
    );
}

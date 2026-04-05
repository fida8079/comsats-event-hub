"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, Lock, Loader2, GraduationCap, ShieldCheck } from "lucide-react";

type Role = "student" | "admin";

export default function LoginPage() {
    const router = useRouter();
    const [activeRole, setActiveRole] = useState<Role>("student");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            toast.error("Please fill in all fields.");
            return;
        }

        setLoading(true);

        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error(error.message);
            setLoading(false);
            return;
        }

        // Fetch user role from profiles table
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();

        if (profileError) {
            console.error("Profile fetch error:", profileError.message);
        }

        const userRole = profile?.role || "student";

        // Validate: ensure user is logging in with the correct tab
        if (activeRole === "admin" && userRole !== "admin") {
            toast.error("This account does not have admin privileges.");
            await supabase.auth.signOut();
            setLoading(false);
            return;
        }

        if (activeRole === "student" && userRole !== "student") {
            toast.error("This is an admin account. Please use the Admin Login tab.");
            await supabase.auth.signOut();
            setLoading(false);
            return;
        }

        toast.success("Login successful!");

        // Refresh to update server-side session cookies
        router.refresh();

        if (userRole === "admin") {
            router.push("/admin/dashboard");
        } else {
            router.push("/student/dashboard");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-brand-purple/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-brand-purple-light/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center text-white font-bold text-2xl mx-auto mb-5 shadow-lg shadow-brand-purple/25 rotate-3 hover:rotate-0 transition-transform duration-300">
                        CUI
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Sign in to COMSATS Event Hub
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-8 shadow-xl shadow-slate-200/50">
                    {/* Role Toggle Tabs */}
                    <div className="flex bg-slate-100 rounded-2xl p-1.5 mb-8">
                        <button
                            type="button"
                            onClick={() => setActiveRole("student")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                activeRole === "student"
                                    ? "bg-brand-purple text-white shadow-md shadow-brand-purple/25"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <GraduationCap size={18} />
                            Student Login
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveRole("admin")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                activeRole === "admin"
                                    ? "bg-brand-blue text-white shadow-md shadow-brand-blue/25"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <ShieldCheck size={18} />
                            Admin Login
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="login-email" className="text-slate-700 font-semibold text-sm">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <Input
                                    id="login-email"
                                    type="email"
                                    placeholder={activeRole === "admin" ? "admin@comsats.edu.pk" : "student@comsats.edu.pk"}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-11 rounded-xl h-12 border-slate-200 bg-slate-50/50 focus:bg-white transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="login-password" className="text-slate-700 font-semibold text-sm">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <Input
                                    id="login-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pl-11 rounded-xl h-12 border-slate-200 bg-slate-50/50 focus:bg-white transition-colors"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className={`w-full h-12 font-semibold rounded-xl text-[15px] shadow-md transition-all duration-300 ${
                                activeRole === "admin"
                                    ? "bg-brand-blue hover:bg-brand-blue/90 shadow-brand-blue/25"
                                    : "bg-brand-purple hover:bg-brand-purple-dark shadow-brand-purple/25"
                            } text-white`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin mr-2" />
                                    Signing in...
                                </>
                            ) : (
                                `Sign In as ${activeRole === "admin" ? "Admin" : "Student"}`
                            )}
                        </Button>

                        <p className="text-center text-sm text-slate-500 pt-2">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className={`font-semibold hover:underline transition-colors ${
                                    activeRole === "admin" ? "text-brand-blue" : "text-brand-purple"
                                }`}
                            >
                                Sign Up
                            </Link>
                        </p>
                    </form>
                </div>

                <div className="text-center mt-6">
                    <Link
                        href="/"
                        className="text-sm text-slate-400 hover:text-brand-purple transition-colors font-medium"
                    >
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import {
    Mail,
    Lock,
    Loader2,
    GraduationCap,
    ShieldCheck,
    User,
    Hash,

} from "lucide-react";

type Role = "student" | "admin";



export default function RegisterPage() {
    const router = useRouter();
    const [activeRole, setActiveRole] = useState<Role>("student");

    // Common fields
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Student-only
    const [rollNo, setRollNo] = useState("");



    const [loading, setLoading] = useState(false);

    function resetForm() {
        setFullName("");
        setEmail("");
        setPassword("");
        setRollNo("");

    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();

        // Validation
        if (!fullName.trim() || !email.trim() || !password.trim()) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        if (activeRole === "student" && !rollNo.trim()) {
            toast.error("Roll Number is required for student registration.");
            return;
        }



        setLoading(true);

        const supabase = createClient();

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    roll_no: activeRole === "student" ? rollNo : null,
                    role: activeRole,
                },
            },
        });

        if (error) {
            toast.error(error.message);
            setLoading(false);
            return;
        }

        // Also manually insert into profiles to ensure the role is set correctly
        // (in case the trigger doesn't exist or fails)
        if (data.user) {
            const { error: profileError } = await supabase
                .from("profiles")
                .upsert({
                    id: data.user.id,
                    full_name: fullName,
                    roll_no: activeRole === "student" ? rollNo : null,
                    role: activeRole,
                });

            if (profileError) {
                console.error("Profile upsert error:", profileError.message);
                // Don't block — the trigger may have handled it
            }
        }

        toast.success("Registration successful! Redirecting...");

        // Give session a moment to sync, then refresh cookies
        await new Promise((resolve) => setTimeout(resolve, 600));
        router.refresh();

        if (activeRole === "admin") {
            router.push("/admin/dashboard");
        } else {
            router.push("/student/dashboard");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-brand-purple/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-brand-purple-light/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center text-white font-bold text-2xl mx-auto mb-5 shadow-lg shadow-brand-purple/25 -rotate-3 hover:rotate-0 transition-transform duration-300">
                        CUI
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Create Account
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Join COMSATS Event Hub
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-8 shadow-xl shadow-slate-200/50">
                    {/* Role Toggle Tabs */}
                    <div className="flex bg-slate-100 rounded-2xl p-1.5 mb-8">
                        <button
                            type="button"
                            onClick={() => { setActiveRole("student"); resetForm(); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                activeRole === "student"
                                    ? "bg-brand-purple text-white shadow-md shadow-brand-purple/25"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <GraduationCap size={18} />
                            Student
                        </button>
                        <button
                            type="button"
                            onClick={() => { setActiveRole("admin"); resetForm(); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                activeRole === "admin"
                                    ? "bg-brand-blue text-white shadow-md shadow-brand-blue/25"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <ShieldCheck size={18} />
                            Admin
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="reg-name" className="text-slate-700 font-semibold text-sm">
                                Full Name
                            </Label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <Input
                                    id="reg-name"
                                    type="text"
                                    placeholder="Ahmed Khan"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="pl-11 rounded-xl h-12 border-slate-200 bg-slate-50/50 focus:bg-white transition-colors"
                                />
                            </div>
                        </div>

                        {/* Roll Number - Student Only */}
                        {activeRole === "student" && (
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label htmlFor="reg-roll" className="text-slate-700 font-semibold text-sm">
                                    Roll Number
                                </Label>
                                <div className="relative">
                                    <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <Input
                                        id="reg-roll"
                                        type="text"
                                        placeholder="2023-BSCS-045"
                                        value={rollNo}
                                        onChange={(e) => setRollNo(e.target.value)}
                                        required
                                        className="pl-11 rounded-xl h-12 border-slate-200 bg-slate-50/50 focus:bg-white transition-colors uppercase"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="reg-email" className="text-slate-700 font-semibold text-sm">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <Input
                                    id="reg-email"
                                    type="email"
                                    placeholder={activeRole === "admin" ? "admin@comsats.edu.pk" : "student@comsats.edu.pk"}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-11 rounded-xl h-12 border-slate-200 bg-slate-50/50 focus:bg-white transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="reg-password" className="text-slate-700 font-semibold text-sm">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <Input
                                    id="reg-password"
                                    type="password"
                                    placeholder="Min 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="pl-11 rounded-xl h-12 border-slate-200 bg-slate-50/50 focus:bg-white transition-colors"
                                />
                            </div>
                        </div>



                        <Button
                            type="submit"
                            disabled={loading}
                            className={`w-full h-12 font-semibold rounded-xl text-[15px] shadow-md transition-all duration-300 mt-2 ${
                                activeRole === "admin"
                                    ? "bg-brand-blue hover:bg-brand-blue/90 shadow-brand-blue/25"
                                    : "bg-brand-purple hover:bg-brand-purple-dark shadow-brand-purple/25"
                            } text-white`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin mr-2" />
                                    Creating account...
                                </>
                            ) : (
                                `Register as ${activeRole === "admin" ? "Admin" : "Student"}`
                            )}
                        </Button>

                        <p className="text-center text-sm text-slate-500 pt-2">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className={`font-semibold hover:underline transition-colors ${
                                    activeRole === "admin" ? "text-brand-blue" : "text-brand-purple"
                                }`}
                            >
                                Sign In
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

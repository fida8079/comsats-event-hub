"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function StudentProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        full_name: "",
        roll_no: "",
    });

    const supabase = createClient();

    useEffect(() => {
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
                
                if (data) {
                    setProfile(data);
                    setForm({
                        full_name: data.full_name || "",
                        roll_no: data.roll_no || "",
                    });
                }
            }
            setLoading(false);
        }
        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleUpdate() {
        if (!profile) return;
        
        if (!form.full_name) {
            toast.error("Full name is required");
            return;
        }

        const { error } = await supabase
            .from("profiles")
            .update({
                full_name: form.full_name,
                roll_no: form.roll_no,
            })
            .eq("id", profile.id);

        if (error) {
            toast.error("Failed to update profile");
        } else {
            toast.success("Profile updated successfully!");
        }
    }

    if (loading) {
        return <div className="text-center py-12 text-slate-500">Loading profile...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    My Profile
                </h1>
                <p className="text-slate-500 mt-1">
                    Manage your personal information.
                </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left">
                <div className="p-8 sm:p-10 flex items-center gap-6 border-b border-slate-50 bg-slate-50/50">
                    <div className="w-20 h-20 rounded-full bg-brand-purple/10 flex items-center justify-center border-4 border-white shadow-sm">
                        <User size={32} className="text-brand-purple" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{profile?.full_name}</h2>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-1">{profile?.role}</p>
                    </div>
                </div>
                
                <div className="p-8 sm:p-10 space-y-6">
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold">Full Name</Label>
                        <Input 
                            value={form.full_name}
                            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                            className="rounded-xl border-slate-200 h-12"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold">Roll Number</Label>
                        <Input 
                            value={form.roll_no}
                            onChange={(e) => setForm({ ...form, roll_no: e.target.value })}
                            className="rounded-xl border-slate-200 h-12 uppercase"
                        />
                    </div>

                    <Button 
                        onClick={handleUpdate}
                        className="bg-brand-purple hover:bg-brand-purple-dark text-white rounded-xl h-12 font-semibold shadow-sm px-8"
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}

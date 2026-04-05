"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Event } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    const [eventDialogOpen, setEventDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [eventForm, setEventForm] = useState({
        title: "",
        description: "",
        category: "",
        venue: "",
        event_date: "",
        image_url: "",
    });

    const supabase = createClient();

    useEffect(() => {
        loadEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadEvents() {
        const { data } = await supabase
            .from("events")
            .select("*")
            .order("event_date", { ascending: true });
        if (data) setEvents(data);
        setLoading(false);
    }

    function openCreateEvent() {
        setEditingEvent(null);
        setImageFile(null);
        setEventForm({ title: "", description: "", category: "", venue: "", event_date: "", image_url: "" });
        setEventDialogOpen(true);
    }

    function openEditEvent(event: Event) {
        setEditingEvent(event);
        setImageFile(null);
        setEventForm({
            title: event.title,
            description: event.description || "",
            category: event.category || "",
            venue: event.venue || "",
            event_date: event.event_date
                ? new Date(event.event_date).toISOString().slice(0, 16)
                : "",
            image_url: event.image_url || "",
        });
        setEventDialogOpen(true);
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Simple validation
            if (!file.type.startsWith("image/")) {
                toast.error("Please upload a valid image file.");
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("Image size should be less than 5MB.");
                return;
            }
            setImageFile(file);
        }
    }

    async function handleSaveEvent() {
        if (!eventForm.title.trim()) {
            toast.error("Title is required.");
            return;
        }

        setIsSaving(true);
        let finalImageUrl = eventForm.image_url;

        // 1. Upload image if a new one is selected
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError, data } = await supabase.storage
                .from("event-images")
                .upload(fileName, imageFile);

            if (uploadError) {
                toast.error("Failed to upload image. Make sure your Storage bucket is public and named 'event-images'.");
                console.error(uploadError);
                setIsSaving(false);
                return;
            }

            const { data: publicUrlData } = supabase.storage
                .from("event-images")
                .getPublicUrl(fileName);

            finalImageUrl = publicUrlData.publicUrl;
        }

        // 2. Save Event DB Record
        if (editingEvent) {
            // Determine what has changed
            const notifyDate = editingEvent.event_date && eventForm.event_date && new Date(editingEvent.event_date).getTime() !== new Date(eventForm.event_date).getTime();
            const notifyVenue = editingEvent.venue !== eventForm.venue;
            const notifyDescription = editingEvent.description !== eventForm.description && eventForm.description.trim() !== "";
            
            const { error } = await supabase
                .from("events")
                .update({
                    title: eventForm.title,
                    description: eventForm.description,
                    category: eventForm.category,
                    venue: eventForm.venue,
                    event_date: eventForm.event_date || null,
                    image_url: finalImageUrl || null,
                })
                .eq("id", editingEvent.id);
                
            if (error) {
                toast.error("Failed to update event.");
            } else {
                toast.success("Event updated.");
                setEventDialogOpen(false);
                loadEvents();
                
                // Notify users if critical details changed
                if (notifyDate || notifyVenue || notifyDescription) {
                    const { data: affectedUsers } = await supabase
                        .from("event_requests")
                        .select("student_id")
                        .eq("event_id", editingEvent.id)
                        .in("status", ["pending", "approved"]);
                        
                    if (affectedUsers && affectedUsers.length > 0) {
                        const notifications: { student_id: string; event_id: string; message: string; }[] = [];
                        
                        affectedUsers.forEach(user => {
                            if (notifyDate) {
                                notifications.push({ student_id: user.student_id, event_id: editingEvent.id, message: "Event date has been changed for " + editingEvent.title });
                            }
                            if (notifyVenue) {
                                notifications.push({ student_id: user.student_id, event_id: editingEvent.id, message: "Venue has been updated for " + editingEvent.title });
                            }
                            if (notifyDescription) {
                                notifications.push({ student_id: user.student_id, event_id: editingEvent.id, message: "New description added for " + editingEvent.title });
                            }
                        });
                        
                        if (notifications.length > 0) {
                            await supabase.from("notifications").insert(notifications);
                        }
                    }
                }
            }
        } else {
            const { error } = await supabase.from("events").insert({
                title: eventForm.title,
                description: eventForm.description,
                category: eventForm.category,
                venue: eventForm.venue,
                event_date: eventForm.event_date || null,
                image_url: finalImageUrl || null,
            });
            if (error) {
                toast.error("Failed to create event.");
            } else {
                toast.success("Event created!");
                setEventDialogOpen(false);
                loadEvents();
            }
        }

        setIsSaving(false);
    }

    async function handleDeleteEvent(event: Event) {
        if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
        
        // Find users to notify before deleting
        const { data: affectedUsers } = await supabase
            .from("event_requests")
            .select("student_id")
            .eq("event_id", event.id)
            .in("status", ["pending", "approved"]);
            
        const { error } = await supabase.from("events").delete().eq("id", event.id);
        if (error) {
            toast.error("Failed to delete event.");
        } else {
            toast.success("Event deleted.");
            loadEvents();
            
            // Send Cancelled Notification (event_id is null since it's deleted)
            if (affectedUsers && affectedUsers.length > 0) {
                const notifications = affectedUsers.map(user => ({
                    student_id: user.student_id,
                    message: "Event has been cancelled: " + event.title
                }));
                await supabase.from("notifications").insert(notifications);
            }
        }
    }

    if (loading) {
        return <div className="text-center py-12 text-slate-500">Loading events...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Manage Events
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Create, update, and remove campus events.
                    </p>
                </div>

                <Dialog open={eventDialogOpen} onOpenChange={(open) => !isSaving && setEventDialogOpen(open)}>
                    <DialogTrigger
                        render={
                            <Button
                                onClick={openCreateEvent}
                                className="bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold rounded-full px-6 shadow-sm"
                            >
                                <Plus size={18} className="mr-2" />
                                Create New Event
                            </Button>
                        }
                    />
                    <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                {editingEvent ? "Edit Event" : "Create New Event"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            {/* Image Upload Field */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium text-sm">Cover Image</Label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 relative">
                                        {imageFile ? (
                                            <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                                        ) : eventForm.image_url ? (
                                            <img src={eventForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon size={24} className="text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Label htmlFor="image-upload" className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-slate-200 bg-white hover:bg-slate-100 text-slate-900 h-9 px-4 py-2 w-full">
                                            {imageFile ? "Change Image" : (eventForm.image_url ? "Change Image" : "Upload Image")}
                                        </Label>
                                        <Input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <p className="text-[11px] text-slate-500 mt-1.5 text-center">
                                            JPEG, PNG or WebP • Max 5MB
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Event Title</Label>
                                <Input
                                    value={eventForm.title}
                                    onChange={(e) =>
                                        setEventForm({ ...eventForm, title: e.target.value })
                                    }
                                    placeholder="e.g. Annual Tech Symposium"
                                    className="rounded-xl border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Description</Label>
                                <Textarea
                                    value={eventForm.description}
                                    onChange={(e) =>
                                        setEventForm({ ...eventForm, description: e.target.value })
                                    }
                                    placeholder="Brief event description..."
                                    rows={3}
                                    className="rounded-xl border-slate-200 resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-medium">Category</Label>
                                    <Select
                                        value={eventForm.category}
                                        onValueChange={(val) =>
                                            setEventForm({ ...eventForm, category: val ?? "" })
                                        }
                                    >
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="Workshop">Workshop</SelectItem>
                                            <SelectItem value="Sports">Sports</SelectItem>
                                            <SelectItem value="Cultural">Cultural</SelectItem>
                                            <SelectItem value="Technical">Technical</SelectItem>
                                            <SelectItem value="Seminar">Seminar</SelectItem>
                                            <SelectItem value="Others">Others</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-medium">Venue / Room</Label>
                                    <Input
                                        value={eventForm.venue}
                                        onChange={(e) =>
                                            setEventForm({ ...eventForm, venue: e.target.value })
                                        }
                                        placeholder="e.g. Block A"
                                        className="rounded-xl border-slate-200"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Date & Time</Label>
                                <Input
                                    type="datetime-local"
                                    value={eventForm.event_date}
                                    onChange={(e) =>
                                        setEventForm({ ...eventForm, event_date: e.target.value })
                                    }
                                    className="rounded-xl border-slate-200"
                                />
                            </div>
                            <Button
                                onClick={handleSaveEvent}
                                disabled={isSaving}
                                className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl h-11 text-base font-semibold mt-2"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    editingEvent ? "Save Changes" : "Publish Event"
                                )}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="py-4 font-semibold text-slate-700 w-16">Image</TableHead>
                            <TableHead className="py-4 font-semibold text-slate-700">Title</TableHead>
                            <TableHead className="hidden sm:table-cell py-4 font-semibold text-slate-700">Category</TableHead>
                            <TableHead className="hidden md:table-cell py-4 font-semibold text-slate-700">Date</TableHead>
                            <TableHead className="hidden lg:table-cell py-4 font-semibold text-slate-700">Venue</TableHead>
                            <TableHead className="text-right py-4 font-semibold text-slate-700">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                    No events found. Click "Create New Event" to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            events.map((event) => (
                                <TableRow key={event.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell>
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                                            {event.image_url ? (
                                                <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={16} className="text-slate-400" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold text-slate-900">{event.title}</TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <Badge variant="outline" className="text-xs bg-slate-100 border-slate-200 text-slate-600 font-medium rounded-md">
                                            {event.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-sm font-medium text-slate-500">
                                        {event.event_date
                                            ? new Date(event.event_date).toLocaleDateString(undefined, {
                                                month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                                            })
                                            : "-"}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell text-sm text-slate-500">
                                        {event.venue}
                                    </TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => openEditEvent(event)}
                                            className="h-8 w-8 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg"
                                        >
                                            <Pencil size={16} />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleDeleteEvent(event)}
                                            className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

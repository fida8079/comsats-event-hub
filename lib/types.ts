export type UserRole = "student" | "admin";

export interface Profile {
    id: string;
    role: UserRole;
    full_name: string;
    roll_no: string | null;
    created_at: string;
}

export interface Event {
    id: string;
    title: string;
    description: string;
    category: string;
    venue: string;
    event_date: string;
    image_url?: string | null;
    created_at: string;
}

export type RequestStatus = "pending" | "approved" | "rejected";

export interface EventRequest {
    id: string;
    event_id: string;
    student_id: string;
    status: RequestStatus;
    created_at: string;
    // Joined fields (optional)
    events?: Event;
    profiles?: Profile;
}

export interface Notification {
    id: string;
    student_id: string;
    message: string;
    is_read: boolean;
    created_at: string;
    event_id?: string | null;
}


<img width="1914" height="880" alt="Screenshot 2026-04-06 074436" src="https://github.com/user-attachments/assets/a928fdb2-2c0a-4c8c-9ce6-f78fcac5ccd3" />
<img width="1917" height="882" alt="Screenshot 2026-04-06 074453" src="https://github.com/user-attachments/assets/ef5690c2-617f-478c-af68-c8e95d8158b6" />
<img width="1218" height="876" alt="Screenshot 2026-04-06 074812" src="https://github.com/user-attachments/assets/411160be-5e04-4314-a98f-804760e6c41a" />
<img width="1042" height="875" alt="Screenshot 2026-04-06 074831" src="https://github.com/user-attachments/assets/cb383393-93c0-4e2f-9e00-42b99828543e" />





















# COMSATS Event Hub 🎉

A complete, production-ready Full-Stack Event Management System designed for COMSATS University. This application handles student registrations, administrative event management, robust role-based authentication, and real-time live notifications.

## 🚀 Tech Stack

- **Frontend Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (Radix primitives)
- **Icons:** Lucide React
- **Authentication & Backend:** Supabase (Auth, PostgreSQL DB, Storage)
- **Deployment:** Vercel

---

## ✨ Key Features

### For Students:
- **Role-based Authentication:** Secure Signup and Login using University Roll Numbers.
- **Event Exploring:** Beautiful grid displays categorizing events (Workshop, Sports, Cultural, Technical, Seminar, Others).
- **Interactive Modals:** Detailed views of events containing dates, venues, full descriptions, and cover images.
- **Participation Requests:** Ability to request access to events with a single click.
- **Dashboard Tracking:** See upcoming events alongside the approval status of your requested events.
- **Real-Time Notifications:** Live portal alerting students instantly when an admin approves/rejects their request, or modifies the date/venue of an event they joined.

### For Administrators:
- **Analytics Dashboard:** Live metrics tracking Total Events, active Users, Pending Approvals, and recently approved interactions.
- **Manage Events:** Create, update, and delete campus events. Supports uploading custom Event Cover Images directly to cloud storage.
- **Approve/Reject Students:** Admin interface to securely accept or decline student event requests in one click.
- **Manage Users:** View an entire administrative directory logging all registered users by role, and securely remove disruptive accounts.
- **Automated Notifications System:** Editing any event silently triggers alerts to all participants indicating **exact** changes made.

---

## 💾 Database Schema (Supabase)

This project runs on PostgreSQL via Supabase using complete Row-Level Security (RLS) to enforce safe data boundaries.

### 1. `profiles`
Handles user identity and role assignment.
- `id` (UUID - Foreign Key to `auth.users`)
- `role` ('student' | 'admin')
- `full_name` (Text)
- `roll_no` (Text, optional - specific to students)

### 2. `events`
Data for University Events.
- `id` (UUID)
- `title` (Text)
- `description` (Text)
- `category` (Text)
- `venue` (Text)
- `event_date` (Timestamptz)
- `image_url` (Text - Links to Storage bucket)

### 3. `event_requests`
Join table connecting a Student profile to an Event indicating registration.
- `id` (UUID)
- `event_id` (UUID)
- `student_id` (UUID)
- `status` ('pending' | 'approved' | 'rejected')

### 4. `notifications`
Real-time messaging system inbox.
- `id` (UUID)
- `student_id` (UUID - The recipient)
- `message` (Text)
- `is_read` (Boolean)
- `event_id` (UUID)

### Storage 
- **Bucket:** `event-images` (Public access, holds Next.js optimized cover art uploads).

---

## 🛠️ Local Development Setup

To run this project on your local machine:

1. **Clone the Repository**
   ```bash
   git clone <your-repository-url>
   cd comsats-event-hub
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🌐 Deploying to Vercel

If you want to host this site permanently for free on Vercel:

1. Push your code to a new **GitHub Repository**.
2. Create an account on [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub Repository.
4. **CRITICAL STEP:** Under the "Environment Variables" section before deploying, you must add:
   - Key: `NEXT_PUBLIC_SUPABASE_URL` | Value: `your_supabase_url`
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Value: `your_supabase_anon_key`
5. Click **Deploy**.

> If you ever see a `@supabase/ssr` or `Failed to Fetch` error during deployment, it means Vercel does not have these environment variables configured!




This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

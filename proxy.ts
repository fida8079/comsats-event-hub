import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // --- Protect student routes ---
    if (pathname.startsWith("/student")) {
        if (!user) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        // Fetch profile role
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        // Only redirect if we POSITIVELY know the role is admin
        // If profile is null (RLS issue, timing), let them through —
        // the page itself will handle it gracefully
        if (profile?.role === "admin") {
            return NextResponse.redirect(
                new URL("/admin/dashboard", request.url)
            );
        }
        // role is "student" OR null/undefined → allow access
    }

    // --- Protect admin routes ---
    if (pathname.startsWith("/admin")) {
        if (!user) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        // Only redirect if we POSITIVELY know the role is student
        if (profile?.role === "student") {
            return NextResponse.redirect(
                new URL("/student/dashboard", request.url)
            );
        }
        // role is "admin" OR null/undefined → allow access
    }

    // --- Redirect logged-in users away from auth pages ---
    if (user && (pathname === "/login" || pathname === "/register")) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role === "admin") {
            return NextResponse.redirect(
                new URL("/admin/dashboard", request.url)
            );
        } else if (profile?.role === "student") {
            return NextResponse.redirect(
                new URL("/student/dashboard", request.url)
            );
        }
        // If role is null/undefined, DON'T redirect — avoid loop
        // Let them stay on login/register page
    }

    return supabaseResponse;
}

export const config = {
    matcher: ["/student/:path*", "/admin/:path*", "/login", "/register"],
};

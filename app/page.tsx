"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/layout/HeroSection";
import EventsSection from "@/components/layout/EventsSection";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/client";
import type { Event } from "@/lib/types";

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchEvents() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (!error && data) {
        setEvents(data);
      }

      // Fetch all approved requests to aggregate counts
      const { data: allApprovedRequests } = await supabase
          .from("event_requests")
          .select("event_id")
          .eq("status", "approved");
          
      if (allApprovedRequests) {
          const counts: Record<string, number> = {};
          allApprovedRequests.forEach(req => {
              counts[req.event_id] = (counts[req.event_id] || 0) + 1;
          });
          setEventCounts(counts);
      }

      setLoading(false);
    }

    fetchEvents();

    // Realtime subscription for new events
    const channel = supabase
      .channel("public-events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter events based on search
  const filteredEvents = events.filter((event) => {
    const query = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) ||
      event.venue.toLowerCase().includes(query) ||
      event.category.toLowerCase().includes(query) ||
      event.event_date.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      {loading ? (
        <section className="py-20 text-center">
          <div className="animate-pulse text-muted-foreground">
            Loading events...
          </div>
        </section>
      ) : (
        <EventsSection events={filteredEvents} eventCounts={eventCounts} />
      )}
      <Footer />
    </main>
  );
}

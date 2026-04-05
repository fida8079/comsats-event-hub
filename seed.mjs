import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://umrsqammypsvcdonmuks.supabase.co",
  "sb_publishable_M6V9ujYrjOY4vHD0LyY76w_09_LuhvK"
);

(async () => {
    const events = [
        {
          title: "Introduction to React Native",
          description: "A comprehensive workshop covering the basics of mobile app development with React Native.",
          event_date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
          category: "Workshop",
          venue: "Main Auditorium",
        },
        {
          title: "Campus Table Tennis Tournament",
          description: "Annual table tennis tournament for all students. Great prizes to be won!",
          event_date: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
          category: "Sports",
          venue: "Sports Complex",
        },
        {
          title: "Tech Innovation Seminar 2026",
          description: "Guest speakers from top tech companies discussing the future of AI and software engineering.",
          event_date: new Date(Date.now() + 86400000 * 10).toISOString(), // 10 days from now
          category: "Seminar",
          venue: "Block B - Hall 1",
        }
    ];

    const { data, error } = await supabase.from('events').insert(events).select();
    
    if (error) {
        console.error("Error seeding events:", error);
    } else {
        console.log("Successfully seeded events:", data);
    }
})();

"use client";

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-white font-sans flex flex-col">
      {/* --- THE CALENDAR --- */}
      <div className="flex-grow w-full bg-white h-screen">
        <iframe 
          // Added '?theme=light' to match your site
          src="https://cal.com/evanbillings/lesson?theme=light" 
          style={{ width: "100%", height: "100%", minHeight: "100vh", border: "none" }}
          title="Book a lesson"
        ></iframe>
      </div>
    </main>
  );
}
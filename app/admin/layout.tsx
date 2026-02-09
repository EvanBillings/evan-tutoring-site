"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

// ⚠️ REPLACE THIS WITH YOUR EXACT CLERK LOGIN EMAIL
const ADMIN_EMAIL = "evancbillings@gmail.com"; 

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      
      // If not logged in, or logged in but NOT the admin...
      if (!user || userEmail !== ADMIN_EMAIL) {
        // Kick them out to the student dashboard
        router.push("/dashboard"); 
      }
    }
  }, [isLoaded, user, router]);

  // While checking, show a loading screen or nothing
  if (!isLoaded || !user?.primaryEmailAddress?.emailAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-2 text-slate-400 font-bold">
           <ShieldAlert size={48} />
           Checking Admin Privileges...
        </div>
      </div>
    );
  }

  // Double check render block (prevents flash of content)
  if (user.primaryEmailAddress.emailAddress !== ADMIN_EMAIL) {
    return null; 
  }

  // If we pass the checks, show the Admin pages
  return <>{children}</>;
}
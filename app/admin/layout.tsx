import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import '../globals.css'; 

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  
  // SECURE CHECK: If it's not you, kick them out
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const isAdmin = userEmail === "evancbillings@gmail.com";

  if (!isAdmin) {
    redirect("/dashboard"); 
  }

  // We return ONLY the children. No extra <nav> or <div>.
  return <>{children}</>;
}
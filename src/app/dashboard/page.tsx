import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTodayUsage, isProUser } from "@/lib/supabase";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  const [usage, isPro] = await Promise.all([
    getTodayUsage(userId),
    isProUser(userId),
  ]);

  const remaining = isPro ? Infinity : Math.max(0, 5 - usage);

  return (
    <DashboardClient 
      userId={userId} 
      usage={usage} 
      remaining={remaining} 
      isPro={isPro} 
    />
  );
}

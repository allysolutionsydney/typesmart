import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTodayUsage, canGenerate } from "@/lib/supabase";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  const [usage, canGen] = await Promise.all([
    getTodayUsage(userId),
    canGenerate(userId),
  ]);

  const remaining = canGen.isPro ? Infinity : Math.max(0, 5 - usage);

  return (
    <DashboardClient 
      userId={userId} 
      usage={usage} 
      remaining={remaining} 
      isPro={canGen.isPro} 
      isOwner={canGen.isOwner}
    />
  );
}

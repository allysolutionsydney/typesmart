import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTodayUsage, canGenerate } from "@/lib/supabase";
import AccountDashboard from "@/components/AccountDashboard";

export default async function AccountPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const [usage, canGen] = await Promise.all([
    getTodayUsage(userId),
    canGenerate(userId),
  ]);

  return (
    <AccountDashboard 
      userId={userId}
      usage={usage}
      isPro={canGen.isPro}
    />
  );
}

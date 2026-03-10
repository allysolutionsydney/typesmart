import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTodayUsage, canGenerate } from "@/lib/supabase";
import AccountDashboard from "@/components/AccountDashboard";

export default async function AccountPage() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const userEmail = user?.emailAddresses[0]?.emailAddress;

  const [usage, canGen] = await Promise.all([
    getTodayUsage(userId),
    canGenerate(userId, userEmail),
  ]);

  return (
    <AccountDashboard 
      userId={userId}
      userEmail={userEmail}
      usage={usage}
      isPro={canGen.isPro}
      isOwner={canGen.isOwner}
    />
  );
}

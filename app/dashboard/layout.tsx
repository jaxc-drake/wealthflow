import BottomNav from "@/components/layout/BottomNav";
import TopBar from "@/components/layout/TopBar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-dvh bg-neo-bg flex flex-col">
      <TopBar
        userName={profile?.full_name || profile?.email || "User"}
        userId={user.id}
      />
      <main className="flex-1 overflow-y-auto pb-24 pt-16">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

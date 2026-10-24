import BottomNav from "@/components/layout/BottomNav";
import TopBar from "@/components/layout/TopBar";
import { createClient } from "@/lib/supabase/server";
import { getAvatarSignedUrl } from "@/lib/supabase/avatar";
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
    .select("full_name, email, avatar_url")
    .eq("id", user.id)
    .single();

  const avatarUrl = await getAvatarSignedUrl(supabase, profile?.avatar_url ?? null);

  return (
    <div className="relative flex min-h-dvh flex-col bg-y2k-lavender">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="checker absolute -left-12 -top-12 h-52 w-52 rotate-6 opacity-70" />
        <div className="checker absolute -right-16 top-24 h-44 w-44 -rotate-6 opacity-40" />
        <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-brand-purple/10 blur-2xl" />
      </div>

      <TopBar
        userName={profile?.full_name || profile?.email || "User"}
        avatarUrl={avatarUrl}
      />

      <main className="relative flex-1 overflow-y-auto pb-[72px] pt-[116px]">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}

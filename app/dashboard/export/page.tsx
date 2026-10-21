import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ExportClient from "@/components/export/ExportClient";

export default async function ExportPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const currentYear = new Date().getFullYear();

  const [{ data: profile }, { data: transactions }, { data: exportLog }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", `${currentYear}-01-01`)
        .lte("date", `${currentYear}-12-31`)
        .order("date", { ascending: false }),
      supabase
        .from("export_logs")
        .select("id, exported_at")
        .eq("user_id", user.id)
        .eq("export_year", currentYear)
        .single(),
    ]);

  return (
    <ExportClient
      profile={profile}
      transactions={transactions || []}
      exportYear={currentYear}
      alreadyExported={!!exportLog}
      exportedAt={exportLog?.exported_at || null}
      userId={user.id}
    />
  );
}

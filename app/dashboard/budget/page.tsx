import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BudgetClient from "@/components/budget/BudgetClient";

export default async function BudgetPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: profile }, { data: transactions }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false }),
  ]);

  return (
    <BudgetClient
      profile={profile}
      transactions={transactions || []}
    />
  );
}

import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "@/lib/supabase/types";

const supabase = createClient();

export async function getTransactions(
  userId: string,
  filters?: { year?: number; month?: number }
): Promise<Transaction[]> {
  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (filters?.year) {
    const start = `${filters.year}-01-01`;
    const end = `${filters.year}-12-31`;
    query = query.gte("date", start).lte("date", end);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getMonthlyTransactions(
  userId: string,
  year: number,
  month: number
): Promise<Transaction[]> {
  const monthStr = String(month).padStart(2, "0");
  const start = `${year}-${monthStr}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${monthStr}-${lastDay}`;

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createTransaction(
  tx: Omit<Transaction, "id" | "created_at" | "updated_at">
): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .insert(tx)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTransaction(
  id: string,
  userId: string,
  updates: Partial<Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTransaction(
  id: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

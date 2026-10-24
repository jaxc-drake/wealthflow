import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

const supabase = createClient();

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

export async function updateProfile(
  userId: string,
  updates: {
    full_name?: string;
    avatar_url?: string | null;
    monthly_budget?: number;
    currency?: string;
  }
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function checkExportAllowed(
  userId: string,
  year: number
): Promise<boolean> {
  const { data } = await supabase
    .from("export_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("export_year", year)
    .single();

  return !data; // true = allowed (no log exists)
}

export async function logExport(userId: string, year: number): Promise<void> {
  const { error } = await supabase
    .from("export_logs")
    .insert({ user_id: userId, export_year: year });

  if (error) throw error;
}

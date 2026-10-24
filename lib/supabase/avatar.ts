import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export async function getAvatarSignedUrl(
  supabase: SupabaseClient<Database>,
  path: string | null,
  expiresIn = 60 * 60
): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  const { data, error } = await supabase.storage
    .from("avatars")
    .createSignedUrl(path, expiresIn);

  if (error) return null;
  return data?.signedUrl ?? null;
}

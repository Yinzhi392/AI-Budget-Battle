import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { resolveSupabaseServerConfig } from "@/server/supabase/config";

export function createSupabaseServiceClient(): SupabaseClient | undefined {
  const config = resolveSupabaseServerConfig();
  if (!config.ok) {
    return undefined;
  }

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

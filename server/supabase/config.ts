export type SupabaseServerConfigResult =
  | {
      ok: true;
      url: string;
      anonKey: string;
      serviceRoleKey: string;
    }
  | {
      ok: false;
      reason:
        | "missing_url"
        | "missing_anon_key"
        | "missing_service_role_key";
    };

export function resolveSupabaseServerConfig(): SupabaseServerConfigResult {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    return {
      ok: false,
      reason: "missing_url",
    };
  }

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) {
    return {
      ok: false,
      reason: "missing_anon_key",
    };
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return {
      ok: false,
      reason: "missing_service_role_key",
    };
  }

  return {
    ok: true,
    url,
    anonKey,
    serviceRoleKey,
  };
}

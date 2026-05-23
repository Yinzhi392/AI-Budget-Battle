import { createMockAuthProvider } from "@/server/providers/mock-auth";
import { createSupabaseAuthProvider, supabaseUnavailable } from "@/server/providers/supabase-auth";
import { resolveSupabaseServerConfig } from "@/server/supabase/config";
import type { AuthSignInInput, AuthSignInResult } from "@/server/providers/types";

export async function runAuthSignIn(input: AuthSignInInput): Promise<AuthSignInResult> {
  const provider = process.env.AUTH_PROVIDER ?? "mock";

  if (provider === "supabase") {
    if (!resolveSupabaseServerConfig().ok) {
      return supabaseUnavailable();
    }

    const auth = createSupabaseAuthProvider();
    if (input.method === "google_oauth") {
      return auth.signInWithGoogle({ email: input.email });
    }

    return auth.signInWithMagicLink({ email: input.email });
  }

  const auth = createMockAuthProvider();
  if (input.method === "google_oauth") {
    return auth.signInWithGoogle({ email: input.email });
  }

  return auth.signInWithMagicLink({ email: input.email });
}

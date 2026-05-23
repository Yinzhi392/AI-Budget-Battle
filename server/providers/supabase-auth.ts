import { createClient } from "@supabase/supabase-js";
import { resolveSupabaseServerConfig } from "@/server/supabase/config";
import type { AuthProvider, AuthSignInResult } from "@/server/providers/types";
import type { AuthProviderType } from "@/types/domain";

export function createSupabaseAuthProvider(): AuthProvider {
  return {
    async signInWithMagicLink(input) {
      return signInWithSupabaseEmail(input.email);
    },

    async signInWithGoogle(input) {
      const email = input?.email ?? "google-user@gmail.com";
      return signInWithSupabaseOAuth(email);
    },
  };
}

function createSupabaseClient() {
  const config = resolveSupabaseServerConfig();
  if (!config.ok) {
    return undefined;
  }

  return createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function signInWithSupabaseEmail(email: string): Promise<AuthSignInResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    return {
      ok: false,
      reason: "invalid_email",
      message: "请输入有效邮箱。支持 QQ Mail、163、Outlook、Gmail 和学校邮箱。",
    };
  }

  const supabase = createSupabaseClient();
  if (!supabase) {
    return supabaseUnavailable();
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
  });
  if (error) {
    return supabaseUnavailable();
  }

  return createPendingUser(normalizedEmail, "email_magic_link");
}

async function signInWithSupabaseOAuth(email: string): Promise<AuthSignInResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const supabase = createSupabaseClient();
  if (!supabase) {
    return supabaseUnavailable();
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });
  if (error) {
    return supabaseUnavailable();
  }

  return createPendingUser(normalizedEmail, "google_oauth");
}

function createPendingUser(email: string, provider: AuthProviderType): AuthSignInResult {
  return {
    ok: true,
    user: {
      id: `supabase_${email.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}`,
      email,
      provider,
      createdAt: new Date().toISOString(),
    },
  };
}

export function supabaseUnavailable(): AuthSignInResult {
  return {
    ok: false,
    reason: "auth_unavailable",
    message: "Supabase Auth 未完成配置；请检查服务端环境变量。",
  };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

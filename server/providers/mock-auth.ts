import type { AuthProvider, AuthSignInResult } from "@/server/providers/types";
import type { AuthProviderType, AuthUser } from "@/types/domain";

const defaultNow = "2026-05-21T00:00:00.000Z";
const fallbackGoogleEmail = "google-user@gmail.com";

export function createMockAuthProvider(): AuthProvider {
  return {
    async signInWithMagicLink(input) {
      return createMockUser(input.email, "email_magic_link");
    },

    async signInWithGoogle(input) {
      return createMockUser(input?.email ?? fallbackGoogleEmail, "google_oauth");
    },
  };
}

function createMockUser(email: string, provider: AuthProviderType): AuthSignInResult {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    return {
      ok: false,
      reason: "invalid_email",
      message: "请输入有效邮箱。支持 QQ Mail、163、Outlook、Gmail 和学校邮箱。",
    };
  }

  const user: AuthUser = {
    id: `user_${normalizedEmail.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}`,
    email: normalizedEmail,
    provider,
    createdAt: defaultNow,
  };

  return {
    ok: true,
    user,
  };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

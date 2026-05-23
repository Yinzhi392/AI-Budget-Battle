import type { AuthUser } from "@/types/domain";

const oneDayInSeconds = 60 * 60 * 24;

export const authCookieNames = {
  userId: "abb_user_id",
  email: "abb_user_email",
  provider: "abb_auth_provider",
} as const;

type CookieOptions = {
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: "lax" | "strict" | "none";
};

type CookieStore = {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options?: CookieOptions): void;
};

export type AuthCookieState = {
  userId?: string;
  email?: string;
  provider?: AuthUser["provider"];
};

const authCookieOptions = {
  httpOnly: true,
  maxAge: oneDayInSeconds * 30,
  path: "/",
  sameSite: "lax",
} satisfies CookieOptions;

export function readAuthCookieState(cookieStore: Pick<CookieStore, "get">): AuthCookieState {
  const provider = cookieStore.get(authCookieNames.provider)?.value;

  return {
    userId: cookieStore.get(authCookieNames.userId)?.value,
    email: cookieStore.get(authCookieNames.email)?.value,
    provider: provider === "email_magic_link" || provider === "google_oauth"
      ? provider
      : undefined,
  };
}

export function setAuthCookies(cookieStore: CookieStore, user: AuthUser) {
  cookieStore.set(authCookieNames.userId, user.id, authCookieOptions);
  cookieStore.set(authCookieNames.email, user.email, authCookieOptions);
  cookieStore.set(authCookieNames.provider, user.provider, authCookieOptions);
}

export function sanitizeReturnTo(value?: FormDataEntryValue | string | null) {
  const raw = typeof value === "string" ? value : "";
  if (!raw.startsWith("/") || raw.startsWith("//")) {
    return "/";
  }

  return raw;
}

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { runAuthSignIn } from "@/server/providers/auth-provider";
import { mockPersistence } from "@/server/providers/mock-singleton";
import { readAuthCookieState, sanitizeReturnTo, setAuthCookies } from "@/server/auth/session";
import { readSetupCookieState } from "@/server/setup/session";

export type AuthActionState = {
  error?: string;
};

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const method = formData.get("method");
  const returnTo = sanitizeReturnTo(formData.get("returnTo"));
  const email = String(formData.get("email") ?? "");

  const result = await runAuthSignIn(
    method === "google_oauth"
      ? {
          method: "google_oauth",
          email: email || undefined,
        }
      : {
          method: "email_magic_link",
          email,
        },
  );

  if (!result.ok) {
    return {
      error: result.message,
    };
  }

  const cookieStore = await cookies();
  setAuthCookies(cookieStore, result.user);

  const setup = readSetupCookieState(cookieStore);
  if (setup.anonymousSessionId) {
    await mockPersistence.linkAnonymousSessionToUser(setup.anonymousSessionId, result.user.id);
  }

  const authState = readAuthCookieState(cookieStore);
  if (!authState.userId) {
    return {
      error: "登录状态写入失败，请重试。",
    };
  }

  redirect(returnTo);
}

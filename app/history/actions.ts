"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readAuthCookieState } from "@/server/auth/session";
import { mockPersistence } from "@/server/providers/mock-singleton";

export async function deleteSavedReportAction(formData: FormData) {
  const cookieStore = await cookies();
  const auth = readAuthCookieState(cookieStore);
  const reportId = String(formData.get("reportId") ?? "");

  if (!auth.userId) {
    redirect(`/auth?returnTo=${encodeURIComponent("/history")}`);
  }

  await mockPersistence.deleteReportForUser(reportId, auth.userId);
  redirect("/history?deleted=1");
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ensureAnonymousSessionCookie } from "@/server/setup/session";

export async function GET() {
  const cookieStore = await cookies();
  await ensureAnonymousSessionCookie(cookieStore);
  redirect("/battle/region-currency");
}

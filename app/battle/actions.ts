"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { mockPersistence } from "@/server/providers/mock-singleton";
import { readAuthCookieState } from "@/server/auth/session";
import {
  ensureAnonymousSessionCookie,
  readSetupCookieState,
  setPeriodCookies,
  setRegionCurrencyCookies,
} from "@/server/setup/session";
import { resolvePeriodRange, validateRegionCurrency } from "@/server/setup/validation";

export async function saveRegionCurrency(formData: FormData) {
  const cookieStore = await cookies();
  await ensureAnonymousSessionCookie(cookieStore);

  const setup = validateRegionCurrency({
    region: formData.get("region"),
    countryRegion: formData.get("countryRegion"),
    currency: formData.get("region") === "study_abroad"
      ? formData.get("studyCurrency")
      : formData.get("currency"),
  });

  setRegionCurrencyCookies(cookieStore, setup.region, setup.currency, setup.countryRegion);
  redirect("/battle/period");
}

export async function savePeriod(formData: FormData) {
  const cookieStore = await cookies();
  const anonymousSessionId = await ensureAnonymousSessionCookie(cookieStore);
  const setup = readSetupCookieState(cookieStore);
  const auth = readAuthCookieState(cookieStore);

  if (!setup.region || !setup.currency) {
    redirect("/battle/region-currency");
  }

  const period = resolvePeriodRange({
    periodType: formData.get("periodType"),
    customStart: formData.get("customStart"),
    customEnd: formData.get("customEnd"),
  });
  const analysisSession = await mockPersistence.createAnalysisSession({
    anonymousSessionId,
    userId: auth.userId,
    region: setup.region,
    countryRegion: setup.countryRegion,
    currency: setup.currency,
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
  });

  setPeriodCookies(cookieStore, {
    ...period,
    analysisSessionId: analysisSession.id,
  });
  redirect("/battle/upload");
}

import type { Currency, Region } from "@/types/domain";
import { mockPersistence } from "@/server/providers/mock-singleton";
import { validateRegionCurrency, type PeriodType } from "@/server/setup/validation";

const oneDayInSeconds = 60 * 60 * 24;

export const setupCookieNames = {
  anonymousSessionId: "abb_anonymous_session",
  region: "abb_region",
  countryRegion: "abb_country_region",
  currency: "abb_currency",
  periodType: "abb_period_type",
  periodStart: "abb_period_start",
  periodEnd: "abb_period_end",
  analysisSessionId: "abb_analysis_session",
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

export type SetupCookieState = {
  anonymousSessionId?: string;
  region?: Region;
  countryRegion?: string;
  currency?: Currency;
  periodType?: PeriodType;
  periodStart?: string;
  periodEnd?: string;
  analysisSessionId?: string;
};

const setupCookieOptions = {
  httpOnly: true,
  maxAge: oneDayInSeconds,
  path: "/",
  sameSite: "lax",
} satisfies CookieOptions;

export async function ensureAnonymousSessionCookie(cookieStore: CookieStore) {
  const existingSessionId = cookieStore.get(setupCookieNames.anonymousSessionId)?.value;
  if (existingSessionId) {
    return existingSessionId;
  }

  const session = await mockPersistence.createAnonymousSession({
    expiresAt: new Date(Date.now() + oneDayInSeconds * 1000).toISOString(),
  });
  cookieStore.set(setupCookieNames.anonymousSessionId, session.id, setupCookieOptions);
  return session.id;
}

export function readSetupCookieState(cookieStore: Pick<CookieStore, "get">): SetupCookieState {
  const region = cookieStore.get(setupCookieNames.region)?.value;
  const countryRegion = cookieStore.get(setupCookieNames.countryRegion)?.value;
  const currency = cookieStore.get(setupCookieNames.currency)?.value;
  const periodType = cookieStore.get(setupCookieNames.periodType)?.value;

  return {
    anonymousSessionId: cookieStore.get(setupCookieNames.anonymousSessionId)?.value,
    ...readRegionCurrency(region, countryRegion, currency),
    periodType: periodType === "this_week" || periodType === "this_month" || periodType === "custom"
      ? periodType
      : undefined,
    periodStart: cookieStore.get(setupCookieNames.periodStart)?.value,
    periodEnd: cookieStore.get(setupCookieNames.periodEnd)?.value,
    analysisSessionId: cookieStore.get(setupCookieNames.analysisSessionId)?.value,
  };
}

export function getSetupRedirectTarget(setup: SetupCookieState) {
  if (!setup.region || !setup.currency) {
    return "/battle/region-currency";
  }

  if (!setup.periodType || !setup.periodStart || !setup.periodEnd || !setup.analysisSessionId) {
    return "/battle/period";
  }

  return undefined;
}

export function setRegionCurrencyCookies(
  cookieStore: CookieStore,
  region: Region,
  currency: Currency,
  countryRegion?: string,
) {
  cookieStore.set(setupCookieNames.region, region, setupCookieOptions);
  if (countryRegion) {
    cookieStore.set(setupCookieNames.countryRegion, countryRegion, setupCookieOptions);
  }
  cookieStore.set(setupCookieNames.currency, currency, setupCookieOptions);
}

export function setPeriodCookies(
  cookieStore: CookieStore,
  period: {
    periodType: PeriodType;
    periodStart: string;
    periodEnd: string;
    analysisSessionId: string;
  },
) {
  cookieStore.set(setupCookieNames.periodType, period.periodType, setupCookieOptions);
  cookieStore.set(setupCookieNames.periodStart, period.periodStart, setupCookieOptions);
  cookieStore.set(setupCookieNames.periodEnd, period.periodEnd, setupCookieOptions);
  cookieStore.set(setupCookieNames.analysisSessionId, period.analysisSessionId, setupCookieOptions);
}

function readRegionCurrency(region?: string, countryRegion?: string, currency?: string) {
  try {
    return validateRegionCurrency({ region, countryRegion, currency });
  } catch {
    return {};
  }
}

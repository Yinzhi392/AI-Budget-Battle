import type { PersistenceProvider } from "@/server/providers/types";
import {
  setupCookieNames,
  type SetupCookieState,
} from "@/server/setup/session";
import type { PeriodType } from "@/server/setup/validation";

const oneDayInSeconds = 60 * 60 * 24;

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

type RecoverUploadAnalysisSessionInput = {
  cookieStore: CookieStore;
  persistence: PersistenceProvider;
  setup: SetupCookieState;
  userId?: string;
};

const setupCookieOptions = {
  httpOnly: true,
  maxAge: oneDayInSeconds,
  path: "/",
  sameSite: "lax",
} satisfies CookieOptions;

export async function recoverUploadAnalysisSession({
  cookieStore,
  persistence,
  setup,
  userId,
}: RecoverUploadAnalysisSessionInput) {
  const existingAnalysisSessionId = setup.analysisSessionId;

  if (existingAnalysisSessionId) {
    const snapshot = await persistence.getAnalysisSnapshot(existingAnalysisSessionId);
    if (snapshot) {
      return existingAnalysisSessionId;
    }
  }

  if (
    !setup.region ||
    !setup.currency ||
    !setup.periodType ||
    !setup.periodStart ||
    !setup.periodEnd
  ) {
    return undefined;
  }

  const anonymousSessionId = await recoverAnonymousSession(cookieStore, persistence, setup);
  const analysisSession = await persistence.createAnalysisSession({
    anonymousSessionId,
    userId,
    region: setup.region,
    countryRegion: setup.countryRegion,
    currency: setup.currency,
    periodStart: setup.periodStart,
    periodEnd: setup.periodEnd,
  });

  setRecoveredPeriodCookies(cookieStore, {
    periodType: setup.periodType,
    periodStart: setup.periodStart,
    periodEnd: setup.periodEnd,
    analysisSessionId: analysisSession.id,
  });

  return analysisSession.id;
}

async function recoverAnonymousSession(
  cookieStore: CookieStore,
  persistence: PersistenceProvider,
  setup: SetupCookieState,
) {
  if (setup.anonymousSessionId) {
    return setup.anonymousSessionId;
  }

  const session = await persistence.createAnonymousSession({
    expiresAt: new Date(Date.now() + oneDayInSeconds * 1000).toISOString(),
  });
  cookieStore.set(setupCookieNames.anonymousSessionId, session.id, setupCookieOptions);
  return session.id;
}

function setRecoveredPeriodCookies(
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

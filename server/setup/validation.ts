import type { Currency, Region } from "@/types/domain";
import { regions } from "@/types/domain";
import {
  isSupportedWorldCurrencyCode,
  isSupportedWorldRegionCode,
} from "@/lib/world-options";

export const periodTypes = ["this_week", "this_month", "custom"] as const;
export type PeriodType = (typeof periodTypes)[number];

export type RegionCurrencyInput = {
  region?: FormDataEntryValue | string | null;
  countryRegion?: FormDataEntryValue | string | null;
  currency?: FormDataEntryValue | string | null;
};

export type PeriodRangeInput = {
  periodType?: FormDataEntryValue | PeriodType | string | null;
  customStart?: FormDataEntryValue | string | null;
  customEnd?: FormDataEntryValue | string | null;
};

export type ResolvedPeriodRange = {
  periodType: PeriodType;
  periodStart: string;
  periodEnd: string;
};

export function validateRegionCurrency(input: RegionCurrencyInput): {
  region: Region;
  countryRegion?: string;
  currency: Currency;
} {
  const region = String(input.region ?? "");
  const currency = String(input.currency ?? "");

  if (!isRegion(region) || !isCurrency(currency)) {
    throw new Error("Unsupported region or currency");
  }

  if (region === "cn_mainland") {
    if (currency !== "CNY") {
      throw new Error("Unsupported region or currency");
    }

    return { region, currency: "CNY" };
  }

  const countryRegion = String(input.countryRegion ?? "");
  if (!isCountryRegion(countryRegion)) {
    throw new Error("Study abroad region is required");
  }

  return { region, countryRegion, currency };
}

export function resolvePeriodRange(
  input: PeriodRangeInput,
  now = new Date(),
): ResolvedPeriodRange {
  const periodType = normalizePeriodType(input.periodType);

  if (periodType === "this_month") {
    return {
      periodType,
      periodStart: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString(),
      periodEnd: now.toISOString(),
    };
  }

  if (periodType === "this_week") {
    const start = new Date(now);
    const day = start.getUTCDay();
    const daysSinceMonday = day === 0 ? 6 : day - 1;
    start.setUTCDate(start.getUTCDate() - daysSinceMonday);
    start.setUTCHours(0, 0, 0, 0);

    return {
      periodType,
      periodStart: start.toISOString(),
      periodEnd: now.toISOString(),
    };
  }

  const customStart = parseDateOnly(input.customStart, "Custom period start is required");
  const customEnd = parseDateOnly(input.customEnd, "Custom period end is required");
  customEnd.setUTCHours(23, 59, 59, 999);

  if (customStart.getTime() > customEnd.getTime()) {
    throw new Error("Custom period start must be before or equal to end");
  }

  return {
    periodType,
    periodStart: customStart.toISOString(),
    periodEnd: customEnd.toISOString(),
  };
}

export function assertAnonymousReportAllowance(input: {
  isAuthenticated: boolean;
  completedReportCount: number;
}) {
  if (!input.isAuthenticated && input.completedReportCount >= 1) {
    throw new Error("Anonymous users can generate one report before login");
  }

  return true;
}

function normalizePeriodType(value: PeriodRangeInput["periodType"]): PeriodType {
  const periodType = String(value ?? "this_month");
  if (!periodTypes.includes(periodType as PeriodType)) {
    throw new Error("Unsupported period type");
  }

  return periodType as PeriodType;
}

function parseDateOnly(value: FormDataEntryValue | string | null | undefined, message: string) {
  const dateValue = String(value ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    throw new Error(message);
  }

  const date = new Date(`${dateValue}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(message);
  }

  return date;
}

function isRegion(value: string): value is Region {
  return regions.includes(value as Region);
}

function isCurrency(value: string): value is Currency {
  return isSupportedWorldCurrencyCode(value);
}

function isCountryRegion(value: string) {
  return isSupportedWorldRegionCode(value);
}

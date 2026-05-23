import { describe, expect, it } from "vitest";
import {
  assertAnonymousReportAllowance,
  resolvePeriodRange,
  validateRegionCurrency,
} from "@/server/setup/validation";

describe("Task 5 setup flow validation", () => {
  it("accepts supported region and currency choices", () => {
    expect(validateRegionCurrency({ region: "cn_mainland", currency: "CNY" })).toEqual({
      region: "cn_mainland",
      currency: "CNY",
    });

    expect(
      validateRegionCurrency({ region: "study_abroad", countryRegion: "MY", currency: "MYR" }),
    ).toEqual({
      region: "study_abroad",
      countryRegion: "MY",
      currency: "MYR",
    });
  });

  it("rejects unsupported region and currency choices", () => {
    expect(() => validateRegionCurrency({ region: "mars", currency: "CNY" })).toThrow(
      "Unsupported region or currency",
    );
    expect(() => validateRegionCurrency({ region: "cn_mainland", currency: "BTC" })).toThrow(
      "Unsupported region or currency",
    );
    expect(() => validateRegionCurrency({ region: "study_abroad", currency: "USD" })).toThrow(
      "Study abroad region is required",
    );
  });

  it("resolves quick period ranges from a stable current date", () => {
    const now = new Date("2026-05-21T12:00:00.000Z");

    expect(resolvePeriodRange({ periodType: "this_month" }, now)).toEqual({
      periodType: "this_month",
      periodStart: "2026-05-01T00:00:00.000Z",
      periodEnd: "2026-05-21T12:00:00.000Z",
    });

    expect(resolvePeriodRange({ periodType: "this_week" }, now)).toEqual({
      periodType: "this_week",
      periodStart: "2026-05-18T00:00:00.000Z",
      periodEnd: "2026-05-21T12:00:00.000Z",
    });
  });

  it("requires valid custom period bounds", () => {
    expect(
      resolvePeriodRange(
        {
          periodType: "custom",
          customStart: "2026-04-01",
          customEnd: "2026-04-30",
        },
        new Date("2026-05-21T12:00:00.000Z"),
      ),
    ).toEqual({
      periodType: "custom",
      periodStart: "2026-04-01T00:00:00.000Z",
      periodEnd: "2026-04-30T23:59:59.999Z",
    });

    expect(() =>
      resolvePeriodRange({
        periodType: "custom",
        customStart: "2026-05-02",
        customEnd: "2026-05-01",
      }),
    ).toThrow("Custom period start must be before or equal to end");
  });

  it("limits anonymous users to one generated report before login", () => {
    expect(assertAnonymousReportAllowance({ isAuthenticated: false, completedReportCount: 0 })).toBe(
      true,
    );
    expect(() =>
      assertAnonymousReportAllowance({ isAuthenticated: false, completedReportCount: 1 }),
    ).toThrow("Anonymous users can generate one report before login");
    expect(assertAnonymousReportAllowance({ isAuthenticated: true, completedReportCount: 5 })).toBe(
      true,
    );
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it, afterEach } from "vitest";
import { runAuthSignIn } from "@/server/providers/auth-provider";
import {
  getPersistenceProvider,
  resolvePersistenceProviderConfig,
} from "@/server/providers/persistence-provider";
import { resolveSupabaseServerConfig } from "@/server/supabase/config";

const originalEnv = {
  AUTH_PROVIDER: process.env.AUTH_PROVIDER,
  PERSISTENCE_PROVIDER: process.env.PERSISTENCE_PROVIDER,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

describe("Task 14 Supabase boundary", () => {
  afterEach(() => {
    process.env.AUTH_PROVIDER = originalEnv.AUTH_PROVIDER;
    process.env.PERSISTENCE_PROVIDER = originalEnv.PERSISTENCE_PROVIDER;
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalEnv.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalEnv.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("defines the required Supabase tables, storage buckets, and RLS policies", () => {
    const migration = readFileSync(
      "supabase/migrations/20260522140000_task14_core_schema.sql",
      "utf8",
    );

    for (const table of [
      "app_users",
      "anonymous_sessions",
      "analysis_sessions",
      "uploaded_images",
      "transaction_items",
      "confirmed_aggregates",
      "category_total_hints",
      "extraction_outputs",
      "ai_reports",
      "share_cards",
      "benchmark_profiles",
    ]) {
      expect(migration).toContain(`create table if not exists public.${table}`);
      expect(migration).toContain(`alter table public.${table} enable row level security`);
    }

    expect(migration).toContain("temporary-uploads");
    expect(migration).toContain("share-cards");
    expect(migration).toContain("auth.uid()");
    expect(migration).toContain("service_role");
    expect(migration).toContain("with check");
  });

  it("seeds China mainland and study-abroad benchmark profiles", () => {
    const seed = readFileSync("supabase/seed.sql", "utf8");

    expect(seed).toContain("cn_mainland");
    expect(seed).toContain("study_abroad");
    expect(seed).toContain("CNY");
    expect(seed).toContain("milk_tea");
    expect(seed).toContain("food_delivery");
  });

  it("keeps Supabase service-role configuration server-only and explicit", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(resolveSupabaseServerConfig()).toEqual({
      ok: false,
      reason: "missing_service_role_key",
    });

    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    expect(resolveSupabaseServerConfig()).toEqual({
      ok: true,
      url: "https://example.supabase.co",
      anonKey: "anon-key",
      serviceRoleKey: "service-role-key",
    });
  });

  it("defaults persistence to mock and only enables Supabase when server config is complete", () => {
    delete process.env.PERSISTENCE_PROVIDER;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(resolvePersistenceProviderConfig()).toEqual({
      provider: "mock",
      fallbackToMock: false,
    });

    process.env.PERSISTENCE_PROVIDER = "supabase";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(resolvePersistenceProviderConfig()).toEqual({
      provider: "supabase",
      fallbackToMock: true,
      reason: "missing_service_role_key",
    });
  });

  it("falls back to mock persistence when Supabase is selected without usable env", async () => {
    process.env.PERSISTENCE_PROVIDER = "supabase";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const persistence = getPersistenceProvider();
    const anonymous = await persistence.createAnonymousSession({
      expiresAt: "2026-05-23T00:00:00.000Z",
    });

    expect(anonymous.id).toMatch(/^anonymous_/);
  });

  it("keeps Supabase Auth recoverable when configuration is incomplete", async () => {
    process.env.AUTH_PROVIDER = "supabase";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    await expect(
      runAuthSignIn({ method: "email_magic_link", email: "student@example.com" }),
    ).resolves.toEqual({
      ok: false,
      reason: "auth_unavailable",
      message: "Supabase Auth 未完成配置；请检查服务端环境变量。",
    });
  });
});

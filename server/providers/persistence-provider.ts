import { createMockPersistence } from "@/server/providers/mock-persistence";
import { createSupabasePersistence } from "@/server/providers/supabase-persistence";
import { resolveSupabaseServerConfig } from "@/server/supabase/config";
import type { PersistenceProvider } from "@/server/providers/types";

export type PersistenceProviderConfig =
  | {
      provider: "mock";
      fallbackToMock: false;
    }
  | {
      provider: "supabase";
      fallbackToMock: false;
    }
  | {
      provider: "supabase";
      fallbackToMock: true;
      reason: "missing_url" | "missing_anon_key" | "missing_service_role_key";
    };

type PersistenceGlobal = typeof globalThis & {
  __aiBudgetBattlePersistence?: {
    key: string;
    provider: PersistenceProvider;
  };
};

export function resolvePersistenceProviderConfig(): PersistenceProviderConfig {
  const requestedProvider = process.env.PERSISTENCE_PROVIDER ?? "mock";
  if (requestedProvider !== "supabase") {
    return {
      provider: "mock",
      fallbackToMock: false,
    };
  }

  const supabaseConfig = resolveSupabaseServerConfig();
  if (!supabaseConfig.ok) {
    return {
      provider: "supabase",
      fallbackToMock: true,
      reason: supabaseConfig.reason,
    };
  }

  return {
    provider: "supabase",
    fallbackToMock: false,
  };
}

export function getPersistenceProvider(): PersistenceProvider {
  const config = resolvePersistenceProviderConfig();
  const key = JSON.stringify({
    provider: config.provider,
    fallbackToMock: config.fallbackToMock,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });

  const globalForPersistence = globalThis as PersistenceGlobal;
  if (globalForPersistence.__aiBudgetBattlePersistence?.key === key) {
    return globalForPersistence.__aiBudgetBattlePersistence.provider;
  }

  const provider =
    config.provider === "supabase" && !config.fallbackToMock
      ? createSupabasePersistence()
      : createMockPersistence();

  globalForPersistence.__aiBudgetBattlePersistence = {
    key,
    provider,
  };

  return provider;
}

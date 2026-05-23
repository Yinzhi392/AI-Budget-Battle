import { getPersistenceProvider } from "@/server/providers/persistence-provider";

// Backward-compatible export name for existing Task 5-13 call sites.
// The provider now resolves to mock by default or Supabase when fully configured.
export const mockPersistence = getPersistenceProvider();

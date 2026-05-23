import type {
  AiReport,
  AiReport as StoredAiReport,
  AnalysisSession,
  AnalysisSnapshot,
  AnonymousSession,
  AuthProviderType,
  AuthUser,
  CategoryTotalHint,
  ConfirmedAggregateItem,
  Currency,
  ExtractionOutput,
  Region,
  ShareCard,
  StoredExtractionOutput,
  TransactionCandidate,
  TransactionItem,
  TransactionSource,
  UploadedImageMetadata,
} from "@/types/domain";
import type { AiReportPayload } from "@/server/ai/schemas";

export type ExtractTransactionsInput = {
  analysisSessionId: string;
  uploadedImages: UploadedImageMetadata[];
};

export type GenerateReportInput = {
  analysisSessionId: string;
  region: Region;
  currency: Currency;
  periodStart: string;
  periodEnd: string;
  confirmedTransactions: TransactionItem[];
  confirmedAggregates: ConfirmedAggregateItem[];
};

export type AiProvider = {
  extractTransactions(input: ExtractTransactionsInput): Promise<unknown>;
  generateReport(input: GenerateReportInput): Promise<unknown>;
};

export type CreateAnonymousSessionInput = {
  expiresAt: string;
};

export type CreateAnalysisSessionInput = {
  anonymousSessionId?: string;
  userId?: string;
  region: Region;
  countryRegion?: string;
  currency: Currency;
  periodStart: string;
  periodEnd: string;
};

export type SaveConfirmedTransactionInput = TransactionCandidate & {
  id?: string;
  source: TransactionSource;
};

export type SaveCategoryTotalHintInput = Omit<
  CategoryTotalHint,
  "id" | "analysisSessionId" | "createdAt"
>;

export type SaveConfirmedAggregateInput = Omit<
  ConfirmedAggregateItem,
  "id" | "analysisSessionId" | "isUserConfirmed" | "createdAt"
> & {
  id?: string;
};

export type SaveShareCardInput = Omit<ShareCard, "id" | "createdAt">;

export type AuthSignInInput =
  | {
      method: "email_magic_link";
      email: string;
    }
  | {
      method: "google_oauth";
      email?: string;
    };

export type AuthSignInResult =
  | {
      ok: true;
      user: AuthUser;
    }
  | {
      ok: false;
      reason: "auth_unavailable" | "invalid_email";
      message: string;
    };

export type AuthProvider = {
  signInWithMagicLink(input: { email: string }): Promise<AuthSignInResult>;
  signInWithGoogle(input?: { email?: string }): Promise<AuthSignInResult>;
};

export type PersistenceProvider = {
  createAnonymousSession(input: CreateAnonymousSessionInput): Promise<AnonymousSession>;
  createAnalysisSession(input: CreateAnalysisSessionInput): Promise<AnalysisSession>;
  saveUploadedImages(
    analysisSessionId: string,
    images: UploadedImageMetadata[],
  ): Promise<UploadedImageMetadata[]>;
  saveConfirmedTransactions(
    analysisSessionId: string,
    transactions: SaveConfirmedTransactionInput[],
  ): Promise<TransactionItem[]>;
  saveCategoryTotalHints(
    analysisSessionId: string,
    hints: SaveCategoryTotalHintInput[],
  ): Promise<CategoryTotalHint[]>;
  saveConfirmedAggregates(
    analysisSessionId: string,
    aggregates: SaveConfirmedAggregateInput[],
  ): Promise<ConfirmedAggregateItem[]>;
  saveExtractionOutput(
    analysisSessionId: string,
    output: ExtractionOutput,
  ): Promise<StoredExtractionOutput>;
  saveReport(analysisSessionId: string, report: AiReportPayload): Promise<StoredAiReport>;
  saveShareCard(input: SaveShareCardInput): Promise<ShareCard>;
  saveReportToHistory(analysisSessionId: string, userId: string): Promise<AnalysisSession>;
  linkAnonymousSessionToUser(anonymousSessionId: string, userId: string): Promise<AnalysisSnapshot[]>;
  getGeneratedReportCountForAnonymousSession(anonymousSessionId: string): Promise<number>;
  listSavedReportsForUser(userId: string): Promise<AnalysisSnapshot[]>;
  getSavedReportForUser(analysisSessionId: string, userId: string): Promise<AnalysisSnapshot | undefined>;
  deleteReportForUser(
    reportId: string,
    userId: string,
  ): Promise<{ ok: true } | { ok: false; reason: "not_found" | "forbidden" }>;
  getAnalysisSnapshot(analysisSessionId: string): Promise<AnalysisSnapshot | undefined>;
  getAnalysisSnapshotByReportId(reportId: string): Promise<AnalysisSnapshot | undefined>;
};

export type MockPersistenceState = {
  authUsers: AuthUser[];
  anonymousSessions: AnonymousSession[];
  analysisSessions: AnalysisSession[];
  uploadedImages: UploadedImageMetadata[];
  extractionOutputs: StoredExtractionOutput[];
  transactionItems: TransactionItem[];
  confirmedAggregates: ConfirmedAggregateItem[];
  categoryTotalHints: CategoryTotalHint[];
  aiReports: AiReport[];
  shareCards: ShareCard[];
};

export type StoredAuthUserInput = {
  id: string;
  email: string;
  provider: AuthProviderType;
};

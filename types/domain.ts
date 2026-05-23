export const regions = ["cn_mainland", "study_abroad"] as const;
export type Region = (typeof regions)[number];

export const fallbackCurrencies = ["CNY", "USD", "MYR", "SGD", "EUR", "GBP"] as const;
export type Currency = string;

export const spendingCategories = [
  "food_delivery",
  "milk_tea",
  "online_shopping",
  "gaming",
  "transport",
  "campus_cafeteria",
  "social_meals",
  "study_supplies",
  "subscriptions",
  "other",
] as const;
export type SpendingCategory = (typeof spendingCategories)[number];

export const uploadSourceTypes = [
  "monthly_summary",
  "representative_daily",
  "category_summary",
  "single_transaction",
] as const;
export type UploadSourceType = (typeof uploadSourceTypes)[number];

export type AnonymousSession = {
  id: string;
  createdAt: string;
  expiresAt: string;
  linkedUserId?: string;
};

export type AuthProviderType = "email_magic_link" | "google_oauth";

export type AuthUser = {
  id: string;
  email: string;
  provider: AuthProviderType;
  createdAt: string;
};

export type AnalysisSessionStatus =
  | "created"
  | "collecting"
  | "confirmed"
  | "report_generated"
  | "saved";

export type AnalysisSession = {
  id: string;
  userId?: string;
  anonymousSessionId?: string;
  region: Region;
  countryRegion?: string;
  currency: Currency;
  periodStart: string;
  periodEnd: string;
  status: AnalysisSessionStatus;
  isSaved: boolean;
  createdAt: string;
};

export type UploadedImageMetadata = {
  id: string;
  analysisSessionId: string;
  sourceType: UploadSourceType;
  originalName: string;
  sizeBytes: number;
  temporaryStorageUrl: string;
  ocrStatus: "pending" | "completed" | "failed";
  expiresAt: string;
  createdAt: string;
};

export type CategoryTotalHint = {
  id: string;
  analysisSessionId: string;
  category: SpendingCategory;
  amount: number;
  currency: Currency;
  periodLabel: string;
  note?: string;
  confidence: number;
  isEstimate: true;
  createdAt: string;
};

export type TransactionSource = "manual" | "mock_ai" | "ocr";

export type TransactionCandidate = {
  amount: number;
  currency: Currency;
  category: SpendingCategory;
  merchant?: string;
  note?: string;
  transactionTime: string;
  sourceImageId?: string;
  confidence: number;
};

export type ExtractionSourcePlatform = "alipay" | "wechat" | "bank" | "unknown";

export type ExtractionTransactionCandidate = TransactionCandidate & {
  sourceImageId: string;
  sourceType: UploadSourceType;
  sourcePlatform?: ExtractionSourcePlatform;
  dedupeKey?: string;
  overlapGroupId?: string;
  possibleDuplicate?: boolean;
  isEstimate: false;
};

export type ExtractionAggregateCandidate = {
  amount: number;
  currency: Currency;
  category: SpendingCategory;
  periodLabel: string;
  note?: string;
  sourceImageId: string;
  sourceType: UploadSourceType;
  sourcePlatform?: ExtractionSourcePlatform;
  confidence: number;
  dedupeKey?: string;
  overlapGroupId?: string;
  possibleOverlap?: boolean;
  isEstimate: true;
};

export type ExtractionOutput = {
  transactionCandidates: ExtractionTransactionCandidate[];
  aggregateCandidates: ExtractionAggregateCandidate[];
  warnings: string[];
};

export type StoredExtractionOutput = ExtractionOutput & {
  analysisSessionId: string;
  createdAt: string;
};

export type TransactionItem = TransactionCandidate & {
  id: string;
  analysisSessionId: string;
  source: TransactionSource;
  isUserConfirmed: boolean;
  createdAt: string;
};

export type ConfirmedAggregateItem = {
  id: string;
  analysisSessionId: string;
  amount: number;
  currency: Currency;
  category: SpendingCategory;
  periodLabel: string;
  note?: string;
  source: TransactionSource;
  sourceImageId?: string;
  sourceType?: UploadSourceType;
  sourcePlatform?: ExtractionSourcePlatform;
  confidence: number;
  dedupeKey?: string;
  overlapGroupId?: string;
  possibleDuplicate?: boolean;
  possibleOverlap?: boolean;
  isEstimate: true;
  isUserConfirmed: boolean;
  createdAt: string;
};

export type AiReport = {
  id: string;
  analysisSessionId: string;
  personality: {
    title: string;
    emoji: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
    behaviorSummary: string;
  };
  roast: {
    short: string;
    safeLevel: "gentle" | "sharp_safe";
  };
  scores: {
    financialHealth: number;
    impulse: number;
    savingsPotential: number;
    lifestyleEfficiency: number;
    stability: number;
  };
  benchmarkInsights: Array<{
    category: SpendingCategory;
    text: string;
    confidence: "benchmark";
  }>;
  riskPredictions: Array<{
    type: "overspending" | "low_savings" | "category_spike";
    text: string;
    severity: "low" | "medium" | "high";
  }>;
  challenge: {
    title: string;
    tag: string;
    description: string;
  };
  shareCopy: {
    xiaohongshu: string;
    wechat: string;
  };
  generatedAt: string;
};

export type ShareCard = {
  id: string;
  aiReportId: string;
  templateType: "xiaohongshu_square" | "xiaohongshu_vertical" | "wechat_moments";
  platform: "xiaohongshu" | "wechat";
  imageUrl: string;
  challengeTag: string;
  isWatermarked: boolean;
  ownerType: "anonymous" | "user";
  createdAt: string;
};

export type BenchmarkProfile = {
  id: string;
  region: Region;
  currency: Currency;
  studentContext: string;
  category: SpendingCategory;
  rangeLow: number;
  rangeHigh: number;
  label: string;
  description: string;
};

export type AnalysisSnapshot = {
  analysisSession: AnalysisSession;
  uploadedImages: UploadedImageMetadata[];
  extractionOutput?: StoredExtractionOutput;
  confirmedTransactions: TransactionItem[];
  confirmedAggregates: ConfirmedAggregateItem[];
  categoryTotalHints: CategoryTotalHint[];
  report?: AiReport;
  shareCards: ShareCard[];
};

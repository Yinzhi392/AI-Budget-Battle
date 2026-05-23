import { z } from "zod";
import { regions, spendingCategories, uploadSourceTypes } from "@/types/domain";

const isoDateTimeSchema = z.string().datetime({ offset: true });

export const regionSchema = z.enum(regions);
export const currencySchema = z.string().regex(/^[A-Z]{3}$/);
export const spendingCategorySchema = z.enum(spendingCategories);
export const uploadSourceTypeSchema = z.enum(uploadSourceTypes);
export const extractionSourcePlatformSchema = z.enum(["alipay", "wechat", "bank", "unknown"]);

export const transactionCandidateSchema = z.object({
  amount: z.number().positive(),
  currency: currencySchema,
  category: spendingCategorySchema,
  merchant: z.string().min(1).optional(),
  note: z.string().min(1).optional(),
  transactionTime: isoDateTimeSchema,
  sourceImageId: z.string().min(1).optional(),
  confidence: z.number().min(0).max(1),
});

export const transactionCandidateListSchema = z.array(transactionCandidateSchema);

export const extractionTransactionCandidateSchema = transactionCandidateSchema.extend({
  sourceImageId: z.string().min(1),
  sourceType: uploadSourceTypeSchema,
  sourcePlatform: extractionSourcePlatformSchema.optional(),
  dedupeKey: z.string().min(1).optional(),
  overlapGroupId: z.string().min(1).optional(),
  possibleDuplicate: z.boolean().optional(),
  isEstimate: z.literal(false),
});

export const extractionAggregateCandidateSchema = z.object({
  amount: z.number().positive(),
  currency: currencySchema,
  category: spendingCategorySchema,
  periodLabel: z.string().min(1),
  note: z.string().min(1).optional(),
  sourceImageId: z.string().min(1),
  sourceType: uploadSourceTypeSchema,
  sourcePlatform: extractionSourcePlatformSchema.optional(),
  confidence: z.number().min(0).max(1),
  dedupeKey: z.string().min(1).optional(),
  overlapGroupId: z.string().min(1).optional(),
  possibleOverlap: z.boolean().optional(),
  isEstimate: z.literal(true),
});

export const extractionOutputSchema = z.object({
  transactionCandidates: z.array(extractionTransactionCandidateSchema),
  aggregateCandidates: z.array(extractionAggregateCandidateSchema),
  warnings: z.array(z.string().min(1)),
});

export const aiReportSchema = z.object({
  personality: z.object({
    title: z.string().min(1),
    emoji: z.string().min(1),
    description: z.string().min(1),
    strengths: z.array(z.string().min(1)).min(1),
    weaknesses: z.array(z.string().min(1)).min(1),
    behaviorSummary: z.string().min(1),
  }),
  roast: z.object({
    short: z.string().min(1),
    safeLevel: z.enum(["gentle", "sharp_safe"]),
  }),
  scores: z.object({
    financialHealth: z.number().int().min(0).max(100),
    impulse: z.number().int().min(0).max(100),
    savingsPotential: z.number().int().min(0).max(100),
    lifestyleEfficiency: z.number().int().min(0).max(100),
    stability: z.number().int().min(0).max(100),
  }),
  benchmarkInsights: z
    .array(
      z.object({
        category: spendingCategorySchema,
        text: z.string().min(1),
        confidence: z.literal("benchmark"),
      }),
    )
    .min(1),
  riskPredictions: z.array(
    z.object({
      type: z.enum(["overspending", "low_savings", "category_spike"]),
      text: z.string().min(1),
      severity: z.enum(["low", "medium", "high"]),
    }),
  ),
  challenge: z.object({
    title: z.string().min(1),
    tag: z.string().min(1),
    description: z.string().min(1),
  }),
  shareCopy: z.object({
    xiaohongshu: z.string().min(1),
    wechat: z.string().min(1),
  }),
});

export type TransactionCandidatePayload = z.infer<typeof transactionCandidateSchema>;
export type ExtractionOutputPayload = z.infer<typeof extractionOutputSchema>;
export type AiReportPayload = z.infer<typeof aiReportSchema>;

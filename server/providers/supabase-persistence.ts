import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServiceClient } from "@/server/supabase/client";
import { aiReportSchema, extractionOutputSchema, transactionCandidateSchema } from "@/server/ai/schemas";
import type {
  CreateAnalysisSessionInput,
  CreateAnonymousSessionInput,
  PersistenceProvider,
  SaveConfirmedTransactionInput,
  SaveShareCardInput,
} from "@/server/providers/types";
import type {
  AiReport,
  AnalysisSession,
  AnalysisSnapshot,
  AnonymousSession,
  CategoryTotalHint,
  ConfirmedAggregateItem,
  ShareCard,
  StoredExtractionOutput,
  TransactionItem,
  UploadedImageMetadata,
} from "@/types/domain";

type DbRow = Record<string, unknown>;
type QueryResult<T> = PromiseLike<{
  data: T | null;
  error: { message: string } | null;
}>;

export function createSupabasePersistence(client = createSupabaseServiceClient()): PersistenceProvider {
  if (!client) {
    throw new Error("Supabase persistence requires complete server-side Supabase configuration.");
  }

  return {
    async createAnonymousSession(input: CreateAnonymousSessionInput) {
      const session: AnonymousSession = {
        id: randomId("anonymous"),
        createdAt: new Date().toISOString(),
        expiresAt: input.expiresAt,
      };

      await checked(
        client.from("anonymous_sessions").insert({
          id: session.id,
          created_at: session.createdAt,
          expires_at: session.expiresAt,
        }),
      );

      return session;
    },

    async createAnalysisSession(input: CreateAnalysisSessionInput) {
      const session: AnalysisSession = {
        id: randomId("analysis"),
        anonymousSessionId: input.anonymousSessionId,
        userId: input.userId,
        region: input.region,
        countryRegion: input.countryRegion,
        currency: input.currency,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        status: "created",
        isSaved: false,
        createdAt: new Date().toISOString(),
      };

      await checked(
        client.from("analysis_sessions").insert(toAnalysisSessionRow(session)),
      );

      return session;
    },

    async saveUploadedImages(analysisSessionId: string, images: UploadedImageMetadata[]) {
      await ensureAnalysisSession(client, analysisSessionId);
      await checked(client.from("uploaded_images").delete().eq("analysis_session_id", analysisSessionId));

      const normalized = images.map((image) => ({
        ...image,
        analysisSessionId,
      }));

      if (normalized.length > 0) {
        await checked(
          client.from("uploaded_images").insert(normalized.map(toUploadedImageRow)),
        );
      }

      return normalized;
    },

    async saveConfirmedTransactions(
      analysisSessionId: string,
      transactions: SaveConfirmedTransactionInput[],
    ) {
      await ensureAnalysisSession(client, analysisSessionId);
      await invalidateReportForAnalysisSession(client, analysisSessionId);
      await checked(client.from("transaction_items").delete().eq("analysis_session_id", analysisSessionId));

      const confirmedTransactions: TransactionItem[] = transactions.map((transaction) => {
        const candidate = transactionCandidateSchema.parse(transaction);

        return {
          ...candidate,
          id: transaction.id ?? randomId("transaction"),
          analysisSessionId,
          source: transaction.source,
          isUserConfirmed: true,
          createdAt: new Date().toISOString(),
        };
      });

      if (confirmedTransactions.length > 0) {
        await checked(
          client.from("transaction_items").insert(confirmedTransactions.map(toTransactionItemRow)),
        );
      }
      await updateAnalysisSession(client, analysisSessionId, { status: "confirmed" });

      return confirmedTransactions;
    },

    async saveCategoryTotalHints(analysisSessionId: string, hints) {
      await ensureAnalysisSession(client, analysisSessionId);
      await checked(client.from("category_total_hints").delete().eq("analysis_session_id", analysisSessionId));

      const categoryTotalHints: CategoryTotalHint[] = hints.map((hint) => ({
        id: randomId("category_total"),
        analysisSessionId,
        createdAt: new Date().toISOString(),
        ...hint,
      }));

      if (categoryTotalHints.length > 0) {
        await checked(
          client.from("category_total_hints").insert(categoryTotalHints.map(toCategoryTotalHintRow)),
        );
      }
      await updateAnalysisSession(client, analysisSessionId, { status: "collecting" });

      return categoryTotalHints;
    },

    async saveConfirmedAggregates(analysisSessionId: string, aggregates) {
      await ensureAnalysisSession(client, analysisSessionId);
      await invalidateReportForAnalysisSession(client, analysisSessionId);
      await checked(client.from("confirmed_aggregates").delete().eq("analysis_session_id", analysisSessionId));

      const confirmedAggregates: ConfirmedAggregateItem[] = aggregates.map((aggregate) => ({
        ...aggregate,
        id: aggregate.id ?? randomId("aggregate"),
        analysisSessionId,
        isEstimate: true,
        isUserConfirmed: true,
        createdAt: new Date().toISOString(),
      }));

      if (confirmedAggregates.length > 0) {
        await checked(
          client.from("confirmed_aggregates").insert(confirmedAggregates.map(toConfirmedAggregateRow)),
        );
      }
      await updateAnalysisSession(client, analysisSessionId, { status: "confirmed" });

      return confirmedAggregates;
    },

    async saveExtractionOutput(analysisSessionId: string, output) {
      await ensureAnalysisSession(client, analysisSessionId);
      const parsed = extractionOutputSchema.parse(output);
      const storedOutput: StoredExtractionOutput = {
        analysisSessionId,
        createdAt: new Date().toISOString(),
        ...parsed,
      };

      await checked(
        client.from("extraction_outputs").upsert({
          analysis_session_id: analysisSessionId,
          payload: parsed,
          created_at: storedOutput.createdAt,
        }),
      );
      await updateAnalysisSession(client, analysisSessionId, { status: "collecting" });

      return storedOutput;
    },

    async saveReport(analysisSessionId: string, reportPayload) {
      await ensureAnalysisSession(client, analysisSessionId);
      const report = aiReportSchema.parse(reportPayload);
      const storedReport: AiReport = {
        id: randomId("report"),
        analysisSessionId,
        ...report,
        generatedAt: new Date().toISOString(),
      };

      await checked(client.from("ai_reports").delete().eq("analysis_session_id", analysisSessionId));
      await checked(
        client.from("ai_reports").insert({
          id: storedReport.id,
          analysis_session_id: analysisSessionId,
          payload: report,
          generated_at: storedReport.generatedAt,
        }),
      );
      await updateAnalysisSession(client, analysisSessionId, { status: "report_generated" });

      return storedReport;
    },

    async saveShareCard(input: SaveShareCardInput) {
      if (input.ownerType === "anonymous") {
        const existing = await checked<DbRow[]>(
          client
            .from("share_cards")
            .select("id")
            .eq("ai_report_id", input.aiReportId)
            .eq("owner_type", "anonymous"),
        );
        if (existing.length > 0) {
          throw new Error("Only one anonymous share card can be exported before login.");
        }
      }

      const card: ShareCard = {
        id: randomId("share_card"),
        createdAt: new Date().toISOString(),
        ...input,
      };
      await checked(client.from("share_cards").insert(toShareCardRow(card)));
      return card;
    },

    async saveReportToHistory(analysisSessionId: string, userId: string) {
      const session = await ensureAnalysisSession(client, analysisSessionId);
      const updated: AnalysisSession = {
        ...session,
        userId,
        isSaved: true,
        status: session.status === "report_generated" ? "saved" : session.status,
      };
      await checked(
        client
          .from("analysis_sessions")
          .update({
            user_id: userId,
            is_saved: updated.isSaved,
            status: updated.status,
          })
          .eq("id", analysisSessionId),
      );
      return updated;
    },

    async linkAnonymousSessionToUser(anonymousSessionId: string, userId: string) {
      await checked(
        client
          .from("anonymous_sessions")
          .update({ linked_user_id: userId })
          .eq("id", anonymousSessionId),
      );

      const sessions = await checked<DbRow[]>(
        client
          .from("analysis_sessions")
          .select("*")
          .eq("anonymous_session_id", anonymousSessionId),
      );
      const analysisSessions = sessions.map(fromAnalysisSessionRow);

      for (const session of analysisSessions) {
        const snapshot = await this.getAnalysisSnapshot(session.id);
        const hasReport = Boolean(snapshot?.report);
        await checked(
          client
            .from("analysis_sessions")
            .update({
              user_id: userId,
              is_saved: hasReport ? true : session.isSaved,
              status: hasReport ? "saved" : session.status,
            })
            .eq("id", session.id),
        );
      }

      const snapshots = await Promise.all(
        analysisSessions.map((session) => this.getAnalysisSnapshot(session.id)),
      );
      return snapshots.filter((snapshot): snapshot is AnalysisSnapshot => Boolean(snapshot));
    },

    async getGeneratedReportCountForAnonymousSession(anonymousSessionId: string) {
      const sessions = await checked<DbRow[]>(
        client
          .from("analysis_sessions")
          .select("id")
          .eq("anonymous_session_id", anonymousSessionId),
      );
      const sessionIds = sessions.map((session) => String(session.id));
      if (sessionIds.length === 0) {
        return 0;
      }

      const reports = await checked<DbRow[]>(
        client.from("ai_reports").select("id").in("analysis_session_id", sessionIds),
      );
      return reports.length;
    },

    async listSavedReportsForUser(userId: string) {
      const sessions = await checked<DbRow[]>(
        client
          .from("analysis_sessions")
          .select("id")
          .eq("user_id", userId)
          .eq("is_saved", true),
      );
      const snapshots = await Promise.all(
        sessions.map((session) => this.getAnalysisSnapshot(String(session.id))),
      );

      return snapshots
        .filter((snapshot): snapshot is AnalysisSnapshot => Boolean(snapshot?.report))
        .sort((left, right) =>
          (right.report?.generatedAt ?? right.analysisSession.createdAt).localeCompare(
            left.report?.generatedAt ?? left.analysisSession.createdAt,
          ),
        );
    },

    async getSavedReportForUser(analysisSessionId: string, userId: string) {
      const snapshot = await this.getAnalysisSnapshot(analysisSessionId);
      if (
        !snapshot?.report ||
        !snapshot.analysisSession.isSaved ||
        snapshot.analysisSession.userId !== userId
      ) {
        return undefined;
      }

      return snapshot;
    },

    async deleteReportForUser(reportId: string, userId: string) {
      const report = await maybeSingle<DbRow>(
        client.from("ai_reports").select("*").eq("id", reportId).maybeSingle(),
      );
      if (!report) {
        return {
          ok: false,
          reason: "not_found",
        } as const;
      }

      const analysisSessionId = String(report.analysis_session_id);
      const session = await maybeSingle<DbRow>(
        client.from("analysis_sessions").select("*").eq("id", analysisSessionId).maybeSingle(),
      );
      if (!session || session.user_id !== userId) {
        return {
          ok: false,
          reason: "forbidden",
        } as const;
      }

      await checked(client.from("share_cards").delete().eq("ai_report_id", reportId));
      await checked(client.from("ai_reports").delete().eq("id", reportId));
      await checked(
        client
          .from("analysis_sessions")
          .update({ is_saved: false, status: "confirmed" })
          .eq("id", analysisSessionId),
      );

      return {
        ok: true,
      } as const;
    },

    async getAnalysisSnapshot(analysisSessionId: string) {
      const sessionRow = await maybeSingle<DbRow>(
        client.from("analysis_sessions").select("*").eq("id", analysisSessionId).maybeSingle(),
      );
      if (!sessionRow) {
        return undefined;
      }

      const reportRow = await maybeSingle<DbRow>(
        client.from("ai_reports").select("*").eq("analysis_session_id", analysisSessionId).maybeSingle(),
      );

      return {
        analysisSession: fromAnalysisSessionRow(sessionRow),
        uploadedImages: (await selectRows(client, "uploaded_images", analysisSessionId)).map(
          fromUploadedImageRow,
        ),
        extractionOutput: fromExtractionOutputRow(
          await maybeSingle<DbRow>(
            client
              .from("extraction_outputs")
              .select("*")
              .eq("analysis_session_id", analysisSessionId)
              .maybeSingle(),
          ),
        ),
        confirmedTransactions: (await selectRows(client, "transaction_items", analysisSessionId)).map(
          fromTransactionItemRow,
        ),
        confirmedAggregates: (await selectRows(client, "confirmed_aggregates", analysisSessionId)).map(
          fromConfirmedAggregateRow,
        ),
        categoryTotalHints: (await selectRows(client, "category_total_hints", analysisSessionId)).map(
          fromCategoryTotalHintRow,
        ),
        report: fromAiReportRow(reportRow),
        shareCards: reportRow
          ? (await checked<DbRow[]>(
              client.from("share_cards").select("*").eq("ai_report_id", String(reportRow.id)),
            )).map(fromShareCardRow)
          : [],
      };
    },

    async getAnalysisSnapshotByReportId(reportId: string) {
      const report = await maybeSingle<DbRow>(
        client.from("ai_reports").select("*").eq("id", reportId).maybeSingle(),
      );
      if (!report) {
        return undefined;
      }

      return this.getAnalysisSnapshot(String(report.analysis_session_id));
    },
  };
}

async function checked<T>(query: QueryResult<T>): Promise<T> {
  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return data as T;
}

async function maybeSingle<T>(query: QueryResult<T>): Promise<T | undefined> {
  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return data ?? undefined;
}

async function ensureAnalysisSession(
  client: SupabaseClient,
  analysisSessionId: string,
): Promise<AnalysisSession> {
  const row = await maybeSingle<DbRow>(
    client.from("analysis_sessions").select("*").eq("id", analysisSessionId).maybeSingle(),
  );
  if (!row) {
    throw new Error(`Unknown analysis session: ${analysisSessionId}`);
  }
  return fromAnalysisSessionRow(row);
}

async function updateAnalysisSession(
  client: SupabaseClient,
  analysisSessionId: string,
  values: DbRow,
) {
  await checked(client.from("analysis_sessions").update(values).eq("id", analysisSessionId));
}

async function invalidateReportForAnalysisSession(
  client: SupabaseClient,
  analysisSessionId: string,
) {
  const staleReports = await checked<DbRow[]>(
    client.from("ai_reports").select("id").eq("analysis_session_id", analysisSessionId),
  );
  const staleReportIds = staleReports.map((report) => String(report.id));
  if (staleReportIds.length === 0) {
    return;
  }

  await checked(client.from("share_cards").delete().in("ai_report_id", staleReportIds));
  await checked(client.from("ai_reports").delete().eq("analysis_session_id", analysisSessionId));
  await checked(
    client
      .from("analysis_sessions")
      .update({ is_saved: false })
      .eq("id", analysisSessionId),
  );
}

async function selectRows(client: SupabaseClient, table: string, analysisSessionId: string) {
  return checked<DbRow[]>(
    client.from(table).select("*").eq("analysis_session_id", analysisSessionId),
  );
}

function toAnalysisSessionRow(session: AnalysisSession): DbRow {
  return {
    id: session.id,
    user_id: session.userId,
    anonymous_session_id: session.anonymousSessionId,
    region: session.region,
    country_region: session.countryRegion,
    currency: session.currency,
    period_start: session.periodStart,
    period_end: session.periodEnd,
    status: session.status,
    is_saved: session.isSaved,
    created_at: session.createdAt,
  };
}

function fromAnalysisSessionRow(row: DbRow): AnalysisSession {
  return {
    id: String(row.id),
    userId: optionalString(row.user_id),
    anonymousSessionId: optionalString(row.anonymous_session_id),
    region: row.region as AnalysisSession["region"],
    countryRegion: optionalString(row.country_region),
    currency: String(row.currency),
    periodStart: String(row.period_start),
    periodEnd: String(row.period_end),
    status: row.status as AnalysisSession["status"],
    isSaved: Boolean(row.is_saved),
    createdAt: String(row.created_at),
  };
}

function toUploadedImageRow(image: UploadedImageMetadata): DbRow {
  return {
    id: image.id,
    analysis_session_id: image.analysisSessionId,
    source_type: image.sourceType,
    original_name: image.originalName,
    size_bytes: image.sizeBytes,
    temporary_storage_url: image.temporaryStorageUrl,
    ocr_status: image.ocrStatus,
    expires_at: image.expiresAt,
    created_at: image.createdAt,
  };
}

function fromUploadedImageRow(row: DbRow): UploadedImageMetadata {
  return {
    id: String(row.id),
    analysisSessionId: String(row.analysis_session_id),
    sourceType: row.source_type as UploadedImageMetadata["sourceType"],
    originalName: String(row.original_name),
    sizeBytes: Number(row.size_bytes),
    temporaryStorageUrl: String(row.temporary_storage_url),
    ocrStatus: row.ocr_status as UploadedImageMetadata["ocrStatus"],
    expiresAt: String(row.expires_at),
    createdAt: String(row.created_at),
  };
}

function toTransactionItemRow(item: TransactionItem): DbRow {
  return {
    id: item.id,
    analysis_session_id: item.analysisSessionId,
    amount: item.amount,
    currency: item.currency,
    category: item.category,
    merchant: item.merchant,
    note: item.note,
    transaction_time: item.transactionTime,
    source_image_id: item.sourceImageId,
    confidence: item.confidence,
    source: item.source,
    is_user_confirmed: item.isUserConfirmed,
    created_at: item.createdAt,
  };
}

function fromTransactionItemRow(row: DbRow): TransactionItem {
  return {
    id: String(row.id),
    analysisSessionId: String(row.analysis_session_id),
    amount: Number(row.amount),
    currency: String(row.currency),
    category: row.category as TransactionItem["category"],
    merchant: optionalString(row.merchant),
    note: optionalString(row.note),
    transactionTime: String(row.transaction_time),
    sourceImageId: optionalString(row.source_image_id),
    confidence: Number(row.confidence),
    source: row.source as TransactionItem["source"],
    isUserConfirmed: Boolean(row.is_user_confirmed),
    createdAt: String(row.created_at),
  };
}

function toCategoryTotalHintRow(hint: CategoryTotalHint): DbRow {
  return {
    id: hint.id,
    analysis_session_id: hint.analysisSessionId,
    category: hint.category,
    amount: hint.amount,
    currency: hint.currency,
    period_label: hint.periodLabel,
    note: hint.note,
    confidence: hint.confidence,
    is_estimate: hint.isEstimate,
    created_at: hint.createdAt,
  };
}

function fromCategoryTotalHintRow(row: DbRow): CategoryTotalHint {
  return {
    id: String(row.id),
    analysisSessionId: String(row.analysis_session_id),
    category: row.category as CategoryTotalHint["category"],
    amount: Number(row.amount),
    currency: String(row.currency),
    periodLabel: String(row.period_label),
    note: optionalString(row.note),
    confidence: Number(row.confidence),
    isEstimate: true,
    createdAt: String(row.created_at),
  };
}

function toConfirmedAggregateRow(aggregate: ConfirmedAggregateItem): DbRow {
  return {
    id: aggregate.id,
    analysis_session_id: aggregate.analysisSessionId,
    amount: aggregate.amount,
    currency: aggregate.currency,
    category: aggregate.category,
    period_label: aggregate.periodLabel,
    note: aggregate.note,
    source: aggregate.source,
    source_image_id: aggregate.sourceImageId,
    source_type: aggregate.sourceType,
    source_platform: aggregate.sourcePlatform,
    confidence: aggregate.confidence,
    dedupe_key: aggregate.dedupeKey,
    overlap_group_id: aggregate.overlapGroupId,
    possible_duplicate: aggregate.possibleDuplicate,
    possible_overlap: aggregate.possibleOverlap,
    is_estimate: aggregate.isEstimate,
    is_user_confirmed: aggregate.isUserConfirmed,
    created_at: aggregate.createdAt,
  };
}

function fromConfirmedAggregateRow(row: DbRow): ConfirmedAggregateItem {
  return {
    id: String(row.id),
    analysisSessionId: String(row.analysis_session_id),
    amount: Number(row.amount),
    currency: String(row.currency),
    category: row.category as ConfirmedAggregateItem["category"],
    periodLabel: String(row.period_label),
    note: optionalString(row.note),
    source: row.source as ConfirmedAggregateItem["source"],
    sourceImageId: optionalString(row.source_image_id),
    sourceType: row.source_type as ConfirmedAggregateItem["sourceType"],
    sourcePlatform: row.source_platform as ConfirmedAggregateItem["sourcePlatform"],
    confidence: Number(row.confidence),
    dedupeKey: optionalString(row.dedupe_key),
    overlapGroupId: optionalString(row.overlap_group_id),
    possibleDuplicate: optionalBoolean(row.possible_duplicate),
    possibleOverlap: optionalBoolean(row.possible_overlap),
    isEstimate: true,
    isUserConfirmed: Boolean(row.is_user_confirmed),
    createdAt: String(row.created_at),
  };
}

function fromExtractionOutputRow(row?: DbRow): StoredExtractionOutput | undefined {
  if (!row) {
    return undefined;
  }

  const payload = extractionOutputSchema.parse(row.payload);
  return {
    analysisSessionId: String(row.analysis_session_id),
    createdAt: String(row.created_at),
    ...payload,
  };
}

function fromAiReportRow(row?: DbRow): AiReport | undefined {
  if (!row) {
    return undefined;
  }

  const payload = aiReportSchema.parse(row.payload);
  return {
    id: String(row.id),
    analysisSessionId: String(row.analysis_session_id),
    ...payload,
    generatedAt: String(row.generated_at),
  };
}

function toShareCardRow(card: ShareCard): DbRow {
  return {
    id: card.id,
    ai_report_id: card.aiReportId,
    template_type: card.templateType,
    platform: card.platform,
    image_url: card.imageUrl,
    challenge_tag: card.challengeTag,
    is_watermarked: card.isWatermarked,
    owner_type: card.ownerType,
    created_at: card.createdAt,
  };
}

function fromShareCardRow(row: DbRow): ShareCard {
  return {
    id: String(row.id),
    aiReportId: String(row.ai_report_id),
    templateType: row.template_type as ShareCard["templateType"],
    platform: row.platform as ShareCard["platform"],
    imageUrl: String(row.image_url),
    challengeTag: String(row.challenge_tag),
    isWatermarked: Boolean(row.is_watermarked),
    ownerType: row.owner_type as ShareCard["ownerType"],
    createdAt: String(row.created_at),
  };
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function optionalBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function randomId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

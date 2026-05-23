import { aiReportSchema, extractionOutputSchema, transactionCandidateSchema } from "@/server/ai/schemas";
import type {
  CreateAnalysisSessionInput,
  CreateAnonymousSessionInput,
  MockPersistenceState,
  PersistenceProvider,
  SaveConfirmedTransactionInput,
  SaveShareCardInput,
} from "@/server/providers/types";
import type {
  AiReport,
  AnalysisSession,
  AnonymousSession,
  AuthUser,
  CategoryTotalHint,
  ConfirmedAggregateItem,
  StoredExtractionOutput,
  ShareCard,
  TransactionItem,
  UploadedImageMetadata,
} from "@/types/domain";

const defaultNow = "2026-05-21T00:00:00.000Z";

export function createMockPersistence(
  initialState?: Partial<MockPersistenceState>,
): PersistenceProvider {
  const state: MockPersistenceState = {
    authUsers: [...(initialState?.authUsers ?? [])],
    anonymousSessions: [...(initialState?.anonymousSessions ?? [])],
    analysisSessions: [...(initialState?.analysisSessions ?? [])],
    uploadedImages: [...(initialState?.uploadedImages ?? [])],
    extractionOutputs: [...(initialState?.extractionOutputs ?? [])],
    transactionItems: [...(initialState?.transactionItems ?? [])],
    confirmedAggregates: [...(initialState?.confirmedAggregates ?? [])],
    categoryTotalHints: [...(initialState?.categoryTotalHints ?? [])],
    aiReports: [...(initialState?.aiReports ?? [])],
    shareCards: [...(initialState?.shareCards ?? [])],
  };

  return {
    async createAnonymousSession(input: CreateAnonymousSessionInput) {
      const session: AnonymousSession = {
        id: nextId("anonymous", state.anonymousSessions.length),
        createdAt: defaultNow,
        expiresAt: input.expiresAt,
      };
      state.anonymousSessions.push(session);
      return session;
    },

    async createAnalysisSession(input: CreateAnalysisSessionInput) {
      const session: AnalysisSession = {
        id: nextId("analysis", state.analysisSessions.length),
        anonymousSessionId: input.anonymousSessionId,
        userId: input.userId,
        region: input.region,
        countryRegion: input.countryRegion,
        currency: input.currency,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        status: "created",
        isSaved: false,
        createdAt: defaultNow,
      };
      state.analysisSessions.push(session);
      return session;
    },

    async saveUploadedImages(analysisSessionId: string, images: UploadedImageMetadata[]) {
      ensureAnalysisSession(state, analysisSessionId);
      const normalized = images.map((image) => ({
        ...image,
        analysisSessionId,
      }));
      state.uploadedImages = [
        ...state.uploadedImages.filter((image) => image.analysisSessionId !== analysisSessionId),
        ...normalized,
      ];
      return normalized;
    },

    async saveConfirmedTransactions(
      analysisSessionId: string,
      transactions: SaveConfirmedTransactionInput[],
    ) {
      ensureAnalysisSession(state, analysisSessionId);
      invalidateReportForAnalysisSession(state, analysisSessionId);
      const confirmedTransactions: TransactionItem[] = transactions.map((transaction, index) => {
        const candidate = transactionCandidateSchema.parse(transaction);

        return {
          ...candidate,
          id: transaction.id ?? nextId("transaction", index),
          analysisSessionId,
          source: transaction.source,
          isUserConfirmed: true,
          createdAt: defaultNow,
        };
      });

      state.transactionItems = [
        ...state.transactionItems.filter((item) => item.analysisSessionId !== analysisSessionId),
        ...confirmedTransactions,
      ];
      updateAnalysisStatus(state, analysisSessionId, "confirmed");
      return confirmedTransactions;
    },

    async saveCategoryTotalHints(analysisSessionId: string, hints) {
      ensureAnalysisSession(state, analysisSessionId);
      state.categoryTotalHints = state.categoryTotalHints ?? [];
      const categoryTotalHints: CategoryTotalHint[] = hints.map((hint, index) => ({
        id: nextId("category_total", index),
        analysisSessionId,
        createdAt: defaultNow,
        ...hint,
      }));

      state.categoryTotalHints = [
        ...state.categoryTotalHints.filter((hint) => hint.analysisSessionId !== analysisSessionId),
        ...categoryTotalHints,
      ];
      updateAnalysisStatus(state, analysisSessionId, "collecting");
      return categoryTotalHints;
    },

    async saveConfirmedAggregates(analysisSessionId: string, aggregates) {
      ensureAnalysisSession(state, analysisSessionId);
      invalidateReportForAnalysisSession(state, analysisSessionId);
      const confirmedAggregates: ConfirmedAggregateItem[] = aggregates.map((aggregate, index) => ({
        ...aggregate,
        id: aggregate.id ?? nextId("aggregate", index),
        analysisSessionId,
        isEstimate: true,
        isUserConfirmed: true,
        createdAt: defaultNow,
      }));

      state.confirmedAggregates = [
        ...state.confirmedAggregates.filter((item) => item.analysisSessionId !== analysisSessionId),
        ...confirmedAggregates,
      ];
      updateAnalysisStatus(state, analysisSessionId, "confirmed");
      return confirmedAggregates;
    },

    async saveExtractionOutput(analysisSessionId: string, output) {
      ensureAnalysisSession(state, analysisSessionId);
      const parsed = extractionOutputSchema.parse(output);
      const storedOutput: StoredExtractionOutput = {
        analysisSessionId,
        createdAt: defaultNow,
        ...parsed,
      };

      state.extractionOutputs = [
        ...state.extractionOutputs.filter((item) => item.analysisSessionId !== analysisSessionId),
        storedOutput,
      ];
      updateAnalysisStatus(state, analysisSessionId, "collecting");
      return storedOutput;
    },

    async saveReport(analysisSessionId: string, reportPayload) {
      ensureAnalysisSession(state, analysisSessionId);
      const report = aiReportSchema.parse(reportPayload);
      const storedReport: AiReport = {
        id: nextId("report", state.aiReports.length),
        analysisSessionId,
        ...report,
        generatedAt: defaultNow,
      };

      state.aiReports = [
        ...state.aiReports.filter((reportItem) => reportItem.analysisSessionId !== analysisSessionId),
        storedReport,
      ];
      updateAnalysisStatus(state, analysisSessionId, "report_generated");
      return storedReport;
    },

    async saveShareCard(input: SaveShareCardInput) {
      if (
        input.ownerType === "anonymous" &&
        state.shareCards.some(
          (card) => card.ownerType === "anonymous" && card.aiReportId === input.aiReportId,
        )
      ) {
        throw new Error("Only one anonymous share card can be exported before login.");
      }

      const card: ShareCard = {
        id: nextId("share_card", state.shareCards.length),
        createdAt: defaultNow,
        ...input,
      };
      state.shareCards.push(card);
      return card;
    },

    async saveReportToHistory(analysisSessionId: string, userId: string) {
      ensureAnalysisSession(state, analysisSessionId);
      ensureUser(state, userId);
      state.analysisSessions = state.analysisSessions.map((session) =>
        session.id === analysisSessionId
          ? {
              ...session,
              userId,
              isSaved: true,
              status: session.status === "report_generated" ? "saved" : session.status,
            }
          : session,
      );

      return state.analysisSessions.find((session) => session.id === analysisSessionId)!;
    },

    async linkAnonymousSessionToUser(anonymousSessionId: string, userId: string) {
      const anonymousSession = state.anonymousSessions.find(
        (session) => session.id === anonymousSessionId,
      );
      if (!anonymousSession) {
        throw new Error(`Unknown anonymous session: ${anonymousSessionId}`);
      }

      ensureUser(state, userId);
      state.anonymousSessions = state.anonymousSessions.map((session) =>
        session.id === anonymousSessionId
          ? {
              ...session,
              linkedUserId: userId,
            }
          : session,
      );
      state.analysisSessions = state.analysisSessions.map((session) => {
        if (session.anonymousSessionId !== anonymousSessionId) {
          return session;
        }

        const hasReport = state.aiReports.some((report) => report.analysisSessionId === session.id);
        return {
          ...session,
          userId,
          isSaved: hasReport ? true : session.isSaved,
          status: hasReport ? "saved" : session.status,
        };
      });

      const linkedSessionIds = state.analysisSessions
        .filter((session) => session.anonymousSessionId === anonymousSessionId)
        .map((session) => session.id);
      const snapshots = await Promise.all(
        linkedSessionIds.map((analysisSessionId) => this.getAnalysisSnapshot(analysisSessionId)),
      );

      return snapshots.filter((snapshot): snapshot is NonNullable<typeof snapshot> => Boolean(snapshot));
    },

    async getGeneratedReportCountForAnonymousSession(anonymousSessionId: string) {
      const analysisSessionIds = state.analysisSessions
        .filter((session) => session.anonymousSessionId === anonymousSessionId)
        .map((session) => session.id);

      return state.aiReports.filter((report) =>
        analysisSessionIds.includes(report.analysisSessionId),
      ).length;
    },

    async listSavedReportsForUser(userId: string) {
      const savedSessionIds = state.analysisSessions
        .filter((session) => session.userId === userId && session.isSaved)
        .map((session) => session.id);
      const snapshots = await Promise.all(
        savedSessionIds.map((analysisSessionId) => this.getAnalysisSnapshot(analysisSessionId)),
      );

      return snapshots
        .filter((snapshot): snapshot is NonNullable<typeof snapshot> => Boolean(snapshot?.report))
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
      const report = state.aiReports.find((reportItem) => reportItem.id === reportId);
      if (!report) {
        return {
          ok: false,
          reason: "not_found",
        } as const;
      }

      const analysisSession = state.analysisSessions.find(
        (session) => session.id === report.analysisSessionId,
      );
      if (!analysisSession || analysisSession.userId !== userId) {
        return {
          ok: false,
          reason: "forbidden",
        } as const;
      }

      state.aiReports = state.aiReports.filter((reportItem) => reportItem.id !== reportId);
      state.shareCards = state.shareCards.filter((card) => card.aiReportId !== reportId);
      state.analysisSessions = state.analysisSessions.map((session) =>
        session.id === analysisSession.id
          ? {
              ...session,
              isSaved: false,
              status: "confirmed",
            }
          : session,
      );

      return {
        ok: true,
      } as const;
    },

    async getAnalysisSnapshot(analysisSessionId: string) {
      const analysisSession = state.analysisSessions.find(
        (session) => session.id === analysisSessionId,
      );
      if (!analysisSession) {
        return undefined;
      }

      const report = state.aiReports.find((reportItem) => reportItem.analysisSessionId === analysisSessionId);
      return {
        analysisSession,
        uploadedImages: state.uploadedImages.filter(
          (image) => image.analysisSessionId === analysisSessionId,
        ),
        extractionOutput: state.extractionOutputs.find(
          (output) => output.analysisSessionId === analysisSessionId,
        ),
        confirmedTransactions: state.transactionItems.filter(
          (transaction) => transaction.analysisSessionId === analysisSessionId,
        ),
        confirmedAggregates: state.confirmedAggregates.filter(
          (aggregate) => aggregate.analysisSessionId === analysisSessionId,
        ),
        categoryTotalHints: (state.categoryTotalHints ?? []).filter(
          (hint) => hint.analysisSessionId === analysisSessionId,
        ),
        report,
        shareCards: report
          ? state.shareCards.filter((card) => card.aiReportId === report.id)
          : [],
      };
    },

    async getAnalysisSnapshotByReportId(reportId: string) {
      const report = state.aiReports.find((reportItem) => reportItem.id === reportId);
      if (!report) {
        return undefined;
      }

      return this.getAnalysisSnapshot(report.analysisSessionId);
    },
  };
}

function nextId(prefix: string, index: number) {
  return `${prefix}_${index + 1}`;
}

function ensureAnalysisSession(state: MockPersistenceState, analysisSessionId: string) {
  if (!state.analysisSessions.some((session) => session.id === analysisSessionId)) {
    throw new Error(`Unknown analysis session: ${analysisSessionId}`);
  }
}

function ensureUser(state: MockPersistenceState, userId: string) {
  if (!state.authUsers.some((user) => user.id === userId)) {
    const email = userId.replace(/^user_/, "").replace(/_/g, ".") || "mock@example.com";
    const user: AuthUser = {
      id: userId,
      email,
      provider: "email_magic_link",
      createdAt: defaultNow,
    };
    state.authUsers.push(user);
  }
}

function updateAnalysisStatus(
  state: MockPersistenceState,
  analysisSessionId: string,
  status: AnalysisSession["status"],
) {
  state.analysisSessions = state.analysisSessions.map((session) =>
    session.id === analysisSessionId ? { ...session, status } : session,
  );
}

function invalidateReportForAnalysisSession(
  state: MockPersistenceState,
  analysisSessionId: string,
) {
  const staleReportIds = state.aiReports
    .filter((report) => report.analysisSessionId === analysisSessionId)
    .map((report) => report.id);

  if (staleReportIds.length === 0) {
    return;
  }

  state.aiReports = state.aiReports.filter(
    (report) => report.analysisSessionId !== analysisSessionId,
  );
  state.shareCards = state.shareCards.filter(
    (card) => !staleReportIds.includes(card.aiReportId),
  );
  state.analysisSessions = state.analysisSessions.map((session) =>
    session.id === analysisSessionId
      ? {
          ...session,
          isSaved: false,
        }
      : session,
  );
}

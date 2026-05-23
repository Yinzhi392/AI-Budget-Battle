import { afterEach, describe, expect, it } from "vitest";
import { evaluateAuthGate } from "@/server/auth/gates";
import { runAuthSignIn } from "@/server/providers/auth-provider";
import { createMockAuthProvider } from "@/server/providers/mock-auth";
import { createMockPersistence } from "@/server/providers/mock-persistence";
import type { AiReport, AnalysisSession, AnonymousSession } from "@/types/domain";

const originalAuthProvider = process.env.AUTH_PROVIDER;

const anonymousSession: AnonymousSession = {
  id: "anonymous_1",
  createdAt: "2026-05-21T00:00:00.000Z",
  expiresAt: "2026-05-22T00:00:00.000Z",
};

const analysisSession: AnalysisSession = {
  id: "analysis_1",
  anonymousSessionId: anonymousSession.id,
  region: "cn_mainland",
  currency: "CNY",
  periodStart: "2026-05-01T00:00:00.000Z",
  periodEnd: "2026-05-31T23:59:59.999Z",
  status: "report_generated",
  isSaved: false,
  createdAt: "2026-05-21T00:00:00.000Z",
};

const report: AiReport = {
  id: "report_1",
  analysisSessionId: analysisSession.id,
  personality: {
    title: "奶茶黑洞人格",
    emoji: "MT",
    description: "你不是在买奶茶，你是在给情绪续命。",
    strengths: ["会奖励自己"],
    weaknesses: ["小额高频支出容易失控"],
    behaviorSummary: "本期包含估算型奶茶支出。",
  },
  roast: {
    short: "奶茶不是你的搭子，是你的赛博房东。",
    safeLevel: "sharp_safe",
  },
  scores: {
    financialHealth: 68,
    impulse: 82,
    savingsPotential: 61,
    lifestyleEfficiency: 54,
    stability: 72,
  },
  benchmarkInsights: [
    {
      category: "milk_tea",
      text: "你的奶茶支出接近学生高频消费组。",
      confidence: "benchmark",
    },
  ],
  riskPredictions: [
    {
      type: "overspending",
      text: "如果保持这个节奏，月底娱乐预算会提前透支。",
      severity: "medium",
    },
  ],
  challenge: {
    title: "奶茶战损挑战",
    tag: "#本周奶茶战损",
    description: "晒出你的本周奶茶人格。",
  },
  shareCopy: {
    xiaohongshu: "AI 说我是奶茶黑洞人格。",
    wechat: "我的 AI 消费人格报告出来了。",
  },
  generatedAt: "2026-05-21T00:00:00.000Z",
};

afterEach(() => {
  if (originalAuthProvider === undefined) {
    delete process.env.AUTH_PROVIDER;
  } else {
    process.env.AUTH_PROVIDER = originalAuthProvider;
  }
});

describe("Task 12 auth provider boundary", () => {
  it("mock magic-link login accepts common student email providers", async () => {
    const auth = createMockAuthProvider();

    const domains = ["qq.com", "163.com", "outlook.com", "gmail.com", "student.edu"];
    for (const domain of domains) {
      const result = await auth.signInWithMagicLink({
        email: `student@${domain}`,
      });

      expect(result.ok).toBe(true);
      if (!result.ok) {
        throw new Error(result.message);
      }
      expect(result.user?.email).toBe(`student@${domain}`);
      expect(result.user?.provider).toBe("email_magic_link");
    }
  });

  it("defaults to mock auth and keeps unavailable Supabase behind the provider selector", async () => {
    delete process.env.AUTH_PROVIDER;
    await expect(
      runAuthSignIn({ method: "email_magic_link", email: "student@163.com" }),
    ).resolves.toMatchObject({
      ok: true,
      user: {
        email: "student@163.com",
        provider: "email_magic_link",
      },
    });

    process.env.AUTH_PROVIDER = "supabase";
    await expect(
      runAuthSignIn({ method: "google_oauth" }),
    ).resolves.toMatchObject({
      ok: false,
      reason: "auth_unavailable",
    });
  });

  it("links anonymous report data to the mock user after login", async () => {
    const persistence = createMockPersistence({
      anonymousSessions: [anonymousSession],
      analysisSessions: [analysisSession],
      aiReports: [report],
    });

    await persistence.linkAnonymousSessionToUser(anonymousSession.id, "user_student_qq_com");
    const snapshot = await persistence.getAnalysisSnapshot(analysisSession.id);

    expect(snapshot?.analysisSession.userId).toBe("user_student_qq_com");
    expect(snapshot?.analysisSession.isSaved).toBe(true);
    await expect(
      persistence.getGeneratedReportCountForAnonymousSession(anonymousSession.id),
    ).resolves.toBe(1);
  });

  it("gates repeated reports and share upgrades behind login", () => {
    expect(
      evaluateAuthGate({
        action: "generate_repeated_report",
        userId: undefined,
        anonymousReportCount: 1,
      }),
    ).toMatchObject({
      loginRequired: true,
      message: expect.stringContaining("登录后继续"),
    });

    expect(
      evaluateAuthGate({
        action: "remove_watermark",
        userId: undefined,
        anonymousReportCount: 0,
      }),
    ).toMatchObject({
      loginRequired: true,
    });

    expect(
      evaluateAuthGate({
        action: "remove_watermark",
        userId: "user_student_qq_com",
        anonymousReportCount: 1,
      }),
    ).toEqual({
      loginRequired: false,
    });
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StoryScreenCard } from "@/components/result-story-flow";
import { getPersonaDisplayTitle, getPersonaImage } from "@/lib/persona-images";
import { buildReportStoryScreens } from "@/lib/report-story";
import type { AiReport } from "@/types/domain";

const sampleReport: AiReport = {
  id: "report_1",
  analysisSessionId: "analysis_1",
  personality: {
    title: "奶茶黑洞人格",
    emoji: "MT",
    description: "你不是在买奶茶，你是在给情绪续命。",
    strengths: ["会奖励自己", "生活节奏清晰"],
    weaknesses: ["小额高频支出容易失控"],
    behaviorSummary: "本期包含 1 笔确认交易和 1 条估算汇总，饮品和外卖是主要观察项。",
  },
  roast: {
    short: "你的奶茶预算已经开始像房租一样稳定了。",
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
      text: "如果保持这个节奏，月底娱乐和外卖预算会提前透支。",
      severity: "medium",
    },
  ],
  challenge: {
    title: "奶茶战损挑战",
    tag: "#本周奶茶战损",
    description: "晒出你的本周奶茶人格。",
  },
  shareCopy: {
    xiaohongshu: "AI 说我是奶茶黑洞人格，笑死但有点准。",
    wechat: "我的 AI 消费人格报告出来了。",
  },
  generatedAt: "2026-05-21T00:00:00.000Z",
};

describe("Task 10 result story flow", () => {
  it("maps supported spending personas to character images", () => {
    expect(getPersonaImage("奶茶黑洞人格")?.src).toBe(
      "/personas/milk-tea-black-hole.png?v=black-bg-20260522-2",
    );
    expect(getPersonaImage("外卖依赖人格")?.src).toBe(
      "/personas/takeout-dependent.png?v=black-bg-20260522-2",
    );
    expect(getPersonaImage("生存模式人格")?.src).toBe(
      "/personas/survival-mode.png?v=black-bg-20260522-2",
    );
    expect(getPersonaImage("卷王燃烧人格")?.src).toBe(
      "/personas/grind-burnout.png?v=black-bg-20260522-2",
    );
    expect(getPersonaImage("社交燃烧人格")?.src).toBe(
      "/personas/social-burnout.png?v=black-bg-20260522-2",
    );
    expect(getPersonaImage("游戏氪金战神人格")?.src).toBe(
      "/personas/game-spending-warrior.png?v=black-bg-20260522-2",
    );
    expect(getPersonaImage("网购拆箱成瘾人格")?.src).toBe(
      "/personas/unboxing-addict.png?v=black-bg-20260522-2",
    );
    expect(getPersonaImage("出门即打车人格")?.src).toBe(
      "/personas/taxi-everywhere.png?v=black-bg-20260522-2",
    );
    expect(getPersonaImage("假精致人格")?.src).toBe(
      "/personas/fake-refined.png?v=black-bg-20260522-2",
    );
    expect(getPersonaImage("焦虑奋斗人格")?.src).toBe(
      "/personas/anxious-hustler.png?v=black-bg-20260522-2",
    );
    expect(getPersonaDisplayTitle("奶茶黑洞人格")).toBe("奶茶黑洞人格🧋");
    expect(getPersonaDisplayTitle("外卖依赖人格")).toBe("外卖依赖人格🥡");
    expect(getPersonaDisplayTitle("生存模式人格")).toBe("生存模式人格🛟");
    expect(getPersonaDisplayTitle("卷王燃烧人格")).toBe("卷王燃烧人格🔥");
    expect(getPersonaDisplayTitle("社交燃烧人格")).toBe("社交燃烧人格🎉");
    expect(getPersonaDisplayTitle("游戏氪金战神人格")).toBe("游戏氪金战神人格🎮");
    expect(getPersonaDisplayTitle("网购拆箱成瘾人格")).toBe("网购拆箱成瘾人格📦");
    expect(getPersonaDisplayTitle("出门即打车人格")).toBe("出门即打车人格🚕");
    expect(getPersonaDisplayTitle("假精致人格")).toBe("假精致人格💅");
    expect(getPersonaDisplayTitle("焦虑奋斗人格")).toBe("焦虑奋斗人格⚡");
  });

  it("builds the required eight Cyber Wrapped story screens from a report", () => {
    const screens = buildReportStoryScreens(sampleReport);

    expect(screens.map((screen) => screen.kind)).toEqual([
      "personality",
      "behavior",
      "roast",
      "scores",
      "benchmark",
      "risk",
      "challenge",
      "share",
    ]);
    expect(screens).toHaveLength(8);
    expect(screens[0].personaImage).toEqual({
      src: "/personas/milk-tea-black-hole.png?v=black-bg-20260522-2",
      alt: "奶茶黑洞人格角色图",
    });
    expect(screens[0].title).toBe("奶茶黑洞人格🧋");
    expect(screens[0].bullets).toEqual([
      "🎁 会奖励自己",
      "🧭 生活节奏清晰",
      "⚠️ 小额高频支出容易失控",
    ]);
    expect(screens[4].body).toBe(
      "下面是基于你确认消费生成的娱乐化参照线，不代表真实排名或精确统计。",
    );
    expect(screens[4].body).not.toBe(screens[4].bullets?.[0]);
    expect(screens[5].body).toBe(
      "系统把容易超支的消费节奏标出来，方便你下次先看到预警灯。",
    );
    expect(screens[5].body).not.toBe(screens[5].bullets?.[0]);
  });

  it("renders every story screen without raw merchant detail", () => {
    const screens = buildReportStoryScreens(sampleReport);
    const html = screens
      .map((screen, index) =>
        renderToStaticMarkup(
          <StoryScreenCard screen={screen} currentIndex={index} total={screens.length} />,
        ),
      )
      .join("");

    expect(html).toContain("人格揭晓");
    expect(html).toContain("/personas/milk-tea-black-hole.png?v=black-bg-20260522-2");
    expect(html).toContain("奶茶黑洞人格角色图");
    expect(html).toContain("奶茶黑洞人格🧋");
    expect(html).toContain("🎁 会奖励自己");
    expect(html).toContain("🧭 生活节奏清晰");
    expect(html).toContain("⚠️ 小额高频支出容易失控");
    expect(html).toContain('data-testid="persona-character-frame"');
    expect(html).not.toContain("bg-[linear-gradient(rgba(52,211,153,0.12)_1px");
    expect(html).toContain("战斗分数");
    expect(html.match(/data-testid="score-radar-label"/g)).toHaveLength(5);
    expect(html).toContain("分享预览");
    expect(html).not.toContain("一点点");
  });
});

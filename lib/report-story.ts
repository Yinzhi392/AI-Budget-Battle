import type { AiReport } from "@/types/domain";
import {
  getPersonaDisplayTitle,
  getPersonaImage,
  type PersonaImage,
} from "@/lib/persona-images";

export type StoryScreenKind =
  | "personality"
  | "behavior"
  | "roast"
  | "scores"
  | "benchmark"
  | "risk"
  | "challenge"
  | "share";

export type StoryScore = {
  label: string;
  value: number;
};

export type StoryRadarPoint = {
  label: string;
  value: number;
  x: number;
  y: number;
};

export type ReportStoryScreen = {
  kind: StoryScreenKind;
  eyebrow: string;
  title: string;
  body: string;
  accent: "green" | "blue" | "orange";
  quote?: string;
  bullets?: string[];
  scores?: StoryScore[];
  radarPoints?: StoryRadarPoint[];
  tag?: string;
  personaImage?: PersonaImage;
};

const scoreLabels: Record<keyof AiReport["scores"], string> = {
  financialHealth: "财务生命值",
  impulse: "冲动指数",
  savingsPotential: "存钱潜力",
  lifestyleEfficiency: "生活效率",
  stability: "稳定性",
};

const bulletEmojiPrefixes = ["🎁", "🧭", "⚠️", "✨"];

function decoratePersonalityBullet(text: string): string {
  if (bulletEmojiPrefixes.some((emoji) => text.startsWith(emoji))) {
    return text;
  }

  if (text.includes("奖励")) {
    return `🎁 ${text}`;
  }

  if (text.includes("节奏") || text.includes("清晰")) {
    return `🧭 ${text}`;
  }

  if (text.includes("失控") || text.includes("风险") || text.includes("透支")) {
    return `⚠️ ${text}`;
  }

  return `✨ ${text}`;
}

export function buildReportStoryScreens(report: AiReport): ReportStoryScreen[] {
  const scores = Object.entries(report.scores).map(([key, value]) => ({
    label: scoreLabels[key as keyof AiReport["scores"]],
    value,
  }));
  const radarPoints = scores.map((score, index) => {
    const angle = (-90 + index * 72) * (Math.PI / 180);
    const radius = 42 * (score.value / 100);

    return {
      ...score,
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
    };
  });

  return [
    {
      kind: "personality",
      eyebrow: "人格揭晓",
      title: getPersonaDisplayTitle(report.personality.title),
      body: report.personality.description,
      accent: "green",
      quote: report.personality.emoji,
      personaImage: getPersonaImage(report.personality.title),
      bullets: [...report.personality.strengths, ...report.personality.weaknesses].map(
        decoratePersonalityBullet,
      ),
    },
    {
      kind: "behavior",
      eyebrow: "消费雷达",
      title: "你的消费行为被扫描完毕",
      body: report.personality.behaviorSummary,
      accent: "blue",
    },
    {
      kind: "roast",
      eyebrow: "安全吐槽",
      title: "系统给你的温柔一击",
      body: report.roast.short,
      accent: "orange",
      tag: report.roast.safeLevel === "sharp_safe" ? "锋利但安全" : "温柔版",
    },
    {
      kind: "scores",
      eyebrow: "战斗分数",
      title: "五维消费战力",
      body: "这些分数只用于娱乐化自我观察，不代表真实信用、资产或校园排名。",
      accent: "green",
      scores,
      radarPoints,
    },
    {
      kind: "benchmark",
      eyebrow: "学生基准",
      title: "你更接近哪类消费区间",
      body: report.benchmarkInsights.length
        ? "下面是基于你确认消费生成的娱乐化参照线，不代表真实排名或精确统计。"
        : "暂时没有足够基准线可以比较。",
      accent: "blue",
      bullets: report.benchmarkInsights.map((insight) => insight.text),
    },
    {
      kind: "risk",
      eyebrow: "风险预警",
      title: "下一个预算警报",
      body: report.riskPredictions.length
        ? "系统把容易超支的消费节奏标出来，方便你下次先看到预警灯。"
        : "暂时没有明显风险信号。",
      accent: "orange",
      bullets: report.riskPredictions.map((prediction) => prediction.text),
    },
    {
      kind: "challenge",
      eyebrow: "挑战标签",
      title: report.challenge.title,
      body: report.challenge.description,
      accent: "green",
      tag: report.challenge.tag,
    },
    {
      kind: "share",
      eyebrow: "分享预览",
      title: "这张战报可以准备出片",
      body: report.shareCopy.xiaohongshu,
      accent: "blue",
      quote: report.shareCopy.wechat,
      tag: report.challenge.tag,
    },
  ];
}

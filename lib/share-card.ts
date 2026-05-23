import type { AiReport, ShareCard } from "@/types/domain";

export type ShareCardViewModel = {
  templateType: ShareCard["templateType"];
  platform: ShareCard["platform"];
  label: string;
  aspectRatio: string;
  personalityTitle: string;
  roastLine: string;
  highlight: string;
  periodLabel: string;
  challengeTag: string;
  shareCopy: string;
  watermark: string;
  inviteText: string;
  isWatermarked: boolean;
};

export function buildShareCardViewModels(
  report: AiReport,
  options: {
    periodLabel: string;
    isWatermarked: boolean;
  },
): ShareCardViewModel[] {
  const highlight =
    report.benchmarkInsights[0]?.text ??
    `财务生命值 ${report.scores.financialHealth}`;

  return [
    {
      templateType: "xiaohongshu_square",
      platform: "xiaohongshu",
      label: "小红书方图",
      aspectRatio: "1 / 1",
      personalityTitle: report.personality.title,
      roastLine: report.roast.short,
      highlight,
      periodLabel: options.periodLabel,
      challengeTag: report.challenge.tag,
      shareCopy: report.shareCopy.xiaohongshu,
      watermark: options.isWatermarked ? "AI Budget Battle 水印" : "AI Budget Battle",
      inviteText: "扫码生成你的赛博消费人格",
      isWatermarked: options.isWatermarked,
    },
    {
      templateType: "xiaohongshu_vertical",
      platform: "xiaohongshu",
      label: "小红书竖图",
      aspectRatio: "3 / 4",
      personalityTitle: report.personality.title,
      roastLine: report.roast.short,
      highlight,
      periodLabel: options.periodLabel,
      challengeTag: report.challenge.tag,
      shareCopy: report.shareCopy.xiaohongshu,
      watermark: options.isWatermarked ? "AI Budget Battle 水印" : "AI Budget Battle",
      inviteText: "AI 正在扫描你的消费人格",
      isWatermarked: options.isWatermarked,
    },
    {
      templateType: "wechat_moments",
      platform: "wechat",
      label: "微信朋友圈",
      aspectRatio: "4 / 5",
      personalityTitle: report.personality.title,
      roastLine: report.roast.short,
      highlight,
      periodLabel: options.periodLabel,
      challengeTag: report.challenge.tag,
      shareCopy: report.shareCopy.wechat,
      watermark: options.isWatermarked ? "AI Budget Battle 水印" : "AI Budget Battle",
      inviteText: "发给朋友看看谁更离谱",
      isWatermarked: options.isWatermarked,
    },
  ];
}

export function formatSharePeriod(periodStart: string, periodEnd: string) {
  const start = formatDate(periodStart);
  const end = formatDate(periodEnd);
  if (!start || !end) {
    return "本期";
  }

  return `${start} - ${end}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
  }).format(date);
}

export type RouteStatus = "ready" | "locked" | "placeholder";

export type RoutePageContent = {
  eyebrow: string;
  title: string;
  description: string;
  status: RouteStatus;
  statusLabel: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  highlights: string[];
  panels: Array<{
    label: string;
    value: string;
    accent: "green" | "blue" | "orange";
  }>;
};

export const routePages = {
  landing: {
    eyebrow: "Cyber Wrapped Battle",
    title: "AI Budget Battle",
    description:
      "上传消费记录，确认 AI 识别结果，生成一份适合学生分享的赛博消费人格战报。",
    status: "placeholder",
    statusLabel: "功能骨架",
    primaryAction: {
      label: "开始战斗",
      href: "/battle/region-currency",
    },
    secondaryAction: {
      label: "查看历史",
      href: "/history",
    },
    highlights: ["中文优先", "匿名先体验", "分享卡默认隐藏商户明细"],
    panels: [
      { label: "默认场景", value: "中国大陆学生 / CNY", accent: "green" },
      { label: "报告形态", value: "Cyber Wrapped 故事流", accent: "blue" },
      { label: "安全边界", value: "无真实校园排名", accent: "orange" },
    ],
  },
  regionCurrency: {
    eyebrow: "Step 01",
    title: "选择战区和货币",
    description:
      "默认使用中国大陆和人民币，后续会根据选择切换分类、金额格式和基准语境。",
    status: "placeholder",
    statusLabel: "功能骨架",
    primaryAction: {
      label: "继续选择周期",
      href: "/battle/period",
    },
    secondaryAction: {
      label: "返回首页",
      href: "/",
    },
    highlights: ["中国大陆 / CNY", "海外中文学生", "分类预览待接入"],
    panels: [
      { label: "默认货币", value: "CNY", accent: "green" },
      { label: "分类语境", value: "奶茶 / 外卖 / 校园餐", accent: "blue" },
      { label: "替代地区", value: "后续接入", accent: "orange" },
    ],
  },
  period: {
    eyebrow: "Step 02",
    title: "选择分析周期",
    description:
      "本周、本月和自定义周期会贯穿确认页、战报故事和分享卡片。",
    status: "placeholder",
    statusLabel: "功能骨架",
    primaryAction: {
      label: "进入上传",
      href: "/battle/upload",
    },
    secondaryAction: {
      label: "返回战区",
      href: "/battle/region-currency",
    },
    highlights: ["本周", "本月", "自定义周期"],
    panels: [
      { label: "快速周期", value: "本月", accent: "green" },
      { label: "自定义", value: "起止日期", accent: "blue" },
      { label: "展示位置", value: "报告和分享卡", accent: "orange" },
    ],
  },
  upload: {
    eyebrow: "Step 03",
    title: "上传账单或手动输入",
    description:
      "页面骨架包含截图上传入口和手动输入兜底路径，真实表单会在后续任务接入。",
    status: "placeholder",
    statusLabel: "功能骨架",
    primaryAction: {
      label: "查看确认页",
      href: "/battle/confirm",
    },
    secondaryAction: {
      label: "返回周期",
      href: "/battle/period",
    },
    highlights: ["截图临时处理", "手动输入兜底", "隐私提示常驻"],
    panels: [
      { label: "上传状态", value: "待接入", accent: "green" },
      { label: "手动交易", value: "后续表单", accent: "blue" },
      { label: "保留规则", value: "最长 24 小时", accent: "orange" },
    ],
  },
  confirm: {
    eyebrow: "Step 04",
    title: "确认交易记录",
    description:
      "确认表会成为数据质量闸门；只有用户确认后的交易会进入报告生成。",
    status: "placeholder",
    statusLabel: "功能骨架",
    primaryAction: {
      label: "模拟生成",
      href: "/battle/generating",
    },
    secondaryAction: {
      label: "返回上传",
      href: "/battle/upload",
    },
    highlights: ["可编辑行", "低置信度提示", "确认后生成"],
    panels: [
      { label: "必填", value: "金额 / 货币 / 分类 / 时间", accent: "green" },
      { label: "可选", value: "商户 / 备注", accent: "blue" },
      { label: "默认隐私", value: "分享卡隐藏明细", accent: "orange" },
    ],
  },
  generating: {
    eyebrow: "Step 05",
    title: "正在生成战报",
    description:
      "赛博扫描动画和进度消息会在这里承接确认后的等待状态。",
    status: "placeholder",
    statusLabel: "功能骨架",
    primaryAction: {
      label: "查看战报",
      href: "/battle/result/demo-session",
    },
    secondaryAction: {
      label: "返回确认",
      href: "/battle/confirm",
    },
    highlights: ["结构化输出", "安全 roast", "失败可重试"],
    panels: [
      { label: "AI 模式", value: "Mock 优先", accent: "green" },
      { label: "输出", value: "JSON Schema", accent: "blue" },
      { label: "错误策略", value: "可恢复", accent: "orange" },
    ],
  },
  result: {
    eyebrow: "Step 06",
    title: "Cyber Wrapped 战报",
    description:
      "结果页会以故事流展示人格、吐槽、分数、基准对比、风险预测和挑战标签。",
    status: "placeholder",
    statusLabel: "功能骨架",
    primaryAction: {
      label: "编辑分享卡",
      href: "/battle/share/demo-report",
    },
    secondaryAction: {
      label: "查看面板",
      href: "/dashboard",
    },
    highlights: ["人格揭晓", "战斗分数", "挑战标签"],
    panels: [
      { label: "故事页数", value: "8 屏", accent: "green" },
      { label: "基准说法", value: "不宣称真实排名", accent: "blue" },
      { label: "明细策略", value: "故事流不展示商户", accent: "orange" },
    ],
  },
  share: {
    eyebrow: "Step 07",
    title: "分享卡片编辑器",
    description:
      "分享卡将支持小红书方图、竖图和微信朋友圈格式，匿名导出带水印。",
    status: "placeholder",
    statusLabel: "功能骨架",
    primaryAction: {
      label: "去登录保存",
      href: "/auth",
    },
    secondaryAction: {
      label: "返回战报",
      href: "/battle/result/demo-session",
    },
    highlights: ["小红书方图", "小红书竖图", "微信朋友圈"],
    panels: [
      { label: "匿名额度", value: "1 张水印卡", accent: "green" },
      { label: "导出方式", value: "html-to-image", accent: "blue" },
      { label: "隐私默认", value: "隐藏商户和精确交易", accent: "orange" },
    ],
  },
  auth: {
    eyebrow: "Account Gate",
    title: "登录后继续保存",
    description:
      "登录页会在保存历史、去水印、追加导出或重复生成时出现。",
    status: "placeholder",
    statusLabel: "功能骨架",
    primaryAction: {
      label: "查看历史骨架",
      href: "/history",
    },
    secondaryAction: {
      label: "返回分享卡",
      href: "/battle/share/demo-report",
    },
    highlights: ["Email magic link", "Google OAuth", "匿名数据衔接"],
    panels: [
      { label: "默认模式", value: "匿名优先", accent: "green" },
      { label: "MVP 登录", value: "邮箱链接 + Google", accent: "blue" },
      { label: "未来范围", value: "验证码后续", accent: "orange" },
    ],
  },
  history: {
    eyebrow: "Saved Reports",
    title: "历史战报",
    description:
      "历史页会让登录用户重新打开、分享或删除已保存战报，不存长期原始截图。",
    status: "placeholder",
    statusLabel: "功能骨架",
    primaryAction: {
      label: "打开示例战报",
      href: "/battle/result/demo-session",
    },
    secondaryAction: {
      label: "返回首页",
      href: "/",
    },
    highlights: ["重开战报", "删除记录", "不保留原始截图"],
    panels: [
      { label: "列表字段", value: "日期 / 周期 / 人格", accent: "green" },
      { label: "操作", value: "打开 / 分享 / 删除", accent: "blue" },
      { label: "访问规则", value: "需登录", accent: "orange" },
    ],
  },
  dashboard: {
    eyebrow: "Details",
    title: "轻量数据面板",
    description:
      "面板只提供故事流后的支持细节，避免变成密集的传统记账 dashboard。",
    status: "placeholder",
    statusLabel: "功能骨架",
    primaryAction: {
      label: "返回战报",
      href: "/battle/result/demo-session",
    },
    secondaryAction: {
      label: "查看历史",
      href: "/history",
    },
    highlights: ["分类概览", "分数解释", "风险备注"],
    panels: [
      { label: "图表", value: "Recharts 后续接入", accent: "green" },
      { label: "表格密度", value: "保持轻量", accent: "blue" },
      { label: "隐私", value: "不展示截图资产", accent: "orange" },
    ],
  },
} satisfies Record<string, RoutePageContent>;

export const battleFlow = [
  { label: "战区", href: "/battle/region-currency" },
  { label: "周期", href: "/battle/period" },
  { label: "上传", href: "/battle/upload" },
  { label: "确认", href: "/battle/confirm" },
  { label: "生成", href: "/battle/generating" },
  { label: "战报", href: "/battle/result/demo-session" },
  { label: "分享", href: "/battle/share/demo-report" },
];

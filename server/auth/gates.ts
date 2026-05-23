export type AuthGateAction =
  | "generate_repeated_report"
  | "additional_export"
  | "remove_watermark"
  | "save_history";

export type AuthGateInput = {
  action: AuthGateAction;
  userId?: string;
  anonymousReportCount: number;
};

export type AuthGateResult =
  | {
      loginRequired: false;
    }
  | {
      loginRequired: true;
      message: string;
    };

export function evaluateAuthGate(input: AuthGateInput): AuthGateResult {
  if (input.userId) {
    return { loginRequired: false };
  }

  if (input.action === "generate_repeated_report" && input.anonymousReportCount < 1) {
    return { loginRequired: false };
  }

  const actionCopy: Record<AuthGateAction, string> = {
    generate_repeated_report: "匿名用户只能生成一份战报",
    additional_export: "匿名用户只能导出一张水印分享卡",
    remove_watermark: "去水印需要登录",
    save_history: "保存历史需要登录",
  };

  return {
    loginRequired: true,
    message: `登录后继续：${actionCopy[input.action]}。`,
  };
}

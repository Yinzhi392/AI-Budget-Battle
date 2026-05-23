"use server";

import { cookies } from "next/headers";
import { evaluateAuthGate } from "@/server/auth/gates";
import { readAuthCookieState } from "@/server/auth/session";
import { mockPersistence } from "@/server/providers/mock-singleton";
import type { ShareCard } from "@/types/domain";

export type SaveShareCardActionState = {
  ok?: boolean;
  loginRequired?: boolean;
  message?: string;
};

export async function saveShareCardAction(input: {
  reportId: string;
  templateType: ShareCard["templateType"];
  platform: ShareCard["platform"];
  imageUrl: string;
  challengeTag: string;
}): Promise<SaveShareCardActionState> {
  const cookieStore = await cookies();
  const auth = readAuthCookieState(cookieStore);
  const snapshot = await mockPersistence.getAnalysisSnapshotByReportId(input.reportId);
  if (!snapshot?.report) {
    return {
      ok: false,
      message: "没有找到可导出的战报，请先生成战报。",
    };
  }

  if (
    !auth.userId &&
    snapshot.shareCards.some(
      (card) => card.ownerType === "anonymous" && card.isWatermarked,
    )
  ) {
    return {
      ok: false,
      loginRequired: true,
      message: "登录后继续：匿名用户只能导出一张水印分享卡。",
    };
  }

  try {
    await mockPersistence.saveShareCard({
      aiReportId: input.reportId,
      templateType: input.templateType,
      platform: input.platform,
      imageUrl: input.imageUrl,
      challengeTag: input.challengeTag,
      isWatermarked: auth.userId ? false : true,
      ownerType: auth.userId ? "user" : "anonymous",
    });

    return {
      ok: true,
      message: auth.userId ? "已生成登录账户分享卡" : "已生成水印分享卡",
    };
  } catch (error) {
    if (error instanceof Error && /one anonymous share card/i.test(error.message)) {
      return {
        ok: false,
        loginRequired: true,
        message: "登录后继续：匿名用户只能导出一张水印分享卡。",
      };
    }

    return {
      ok: false,
      message: error instanceof Error ? error.message : "分享卡导出失败，请重试。",
    };
  }
}

export async function saveShareUpgradeAction(input: {
  reportId: string;
  templateType: ShareCard["templateType"];
  platform: ShareCard["platform"];
  imageUrl: string;
  challengeTag: string;
}): Promise<SaveShareCardActionState> {
  const cookieStore = await cookies();
  const auth = readAuthCookieState(cookieStore);
  const snapshot = await mockPersistence.getAnalysisSnapshotByReportId(input.reportId);
  if (!snapshot?.report) {
    return {
      ok: false,
      message: "没有找到可保存的战报，请先生成战报。",
    };
  }

  const gate = evaluateAuthGate({
    action: "remove_watermark",
    userId: auth.userId,
    anonymousReportCount: 0,
  });
  if (gate.loginRequired) {
    return {
      ok: false,
      loginRequired: true,
      message: gate.message,
    };
  }

  const userId = auth.userId;
  if (!userId) {
    return {
      ok: false,
      loginRequired: true,
      message: "登录后继续：去水印需要登录。",
    };
  }

  await mockPersistence.saveReportToHistory(snapshot.analysisSession.id, userId);
  await mockPersistence.saveShareCard({
    aiReportId: input.reportId,
    templateType: input.templateType,
    platform: input.platform,
    imageUrl: input.imageUrl,
    challengeTag: input.challengeTag,
    isWatermarked: false,
    ownerType: "user",
  });

  return {
    ok: true,
    message: "已保存到登录账户，已生成无水印分享卡。",
  };
}

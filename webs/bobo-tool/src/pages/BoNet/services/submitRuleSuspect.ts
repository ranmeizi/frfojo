import { boNetRuleSuspectAdd } from "./api";
import { modalConfirm } from "../utils/modalConfirm";
import { NODE_KIND_LABELS, normalizeGid } from "../constants";

/**
 * 将临时可疑关系落库为 D 类规则疑似（ruleType=manual）。
 */
export async function submitRuleSuspectAdd(
  sourceGid: string,
  suspectGid: string,
  memo: string,
): Promise<{ ok: boolean; message: string }> {
  const a = normalizeGid(sourceGid);
  const b = normalizeGid(suspectGid);
  const reason = memo.trim();

  if (!a) {
    return { ok: false, message: "请先选择中心 GID" };
  }
  if (!b) {
    return { ok: false, message: "请选择要落库的可疑 GID" };
  }
  if (a === b) {
    return { ok: false, message: "不能与中心 GID 相同" };
  }
  if (!reason) {
    return { ok: false, message: "请填写可疑原因（memo）" };
  }

  const ok = await modalConfirm({
    title: "添加可疑关系",
    content: `将把 ${b} 作为「${NODE_KIND_LABELS.D}」写入规则疑似表。\n中心 GID：${a}\n可疑 GID：${b}\n原因：${reason}`,
    okText: "落库",
  });
  if (!ok) {
    return { ok: false, message: "已取消" };
  }

  try {
    await boNetRuleSuspectAdd({
      sourceGid: a,
      suspectGid: b,
      memo: reason,
      visible: true,
    });
    return {
      ok: true,
      message: `已落库「${NODE_KIND_LABELS.D}」：${a} → ${b}`,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "落库失败",
    };
  }
}

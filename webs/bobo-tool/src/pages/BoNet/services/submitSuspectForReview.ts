import { submitSuspectLink, getBoNetApplyList } from "./api";
import { modalConfirm } from "../utils/modalConfirm";
import { getNodeKindLabel, NODE_KIND_LABELS, normalizeGid } from "../constants";

function norm(gid: string) {
  return normalizeGid(gid);
}

/**
 * 拖拽节点入中心族：二次确认后提交关联核实。
 */
export async function submitSuspectForReview(
  centerGid: string,
  suspectGid: string,
  suspectKind: "C" | "D" = "D",
): Promise<{ ok: boolean; message: string }> {
  if (!centerGid.trim()) {
    return { ok: false, message: "请先选择中心 GID" };
  }
  if (!suspectGid.trim()) {
    return { ok: false, message: "无法识别该节点 GID" };
  }

  const a = norm(centerGid);
  const b = norm(suspectGid);

  if (a === b) {
    return { ok: false, message: "不能与中心 GID 相同" };
  }

  try {
    const { list } = await getBoNetApplyList({ gid: a, pageSize: 100 });
    const already = list.some(
      (l) =>
        l.type === "suspect" &&
        ((l.gidA === a && l.gidB === b) || (l.gidA === b && l.gidB === a)),
    );
    if (already) {
      return { ok: false, message: "该关联核实已在审核队列中" };
    }
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "校验失败",
    };
  }

  const kindLabel = getNodeKindLabel(suspectKind);

  const step1 = await modalConfirm({
    title: "提交关联核实",
    content: `将 ${b}（${kindLabel}）拖入中心族？将提交关联核实，进入审核队列。`,
    okText: "继续",
  });
  if (!step1) {
    return { ok: false, message: "已取消" };
  }

  const step2 = await modalConfirm({
    title: "再次确认",
    content: `请再次确认提交审核：中心 GID ${a}，关联 GID ${b}。确认后将创建「${NODE_KIND_LABELS.C}」。`,
    okText: "提交审核",
  });
  if (!step2) {
    return { ok: false, message: "已取消" };
  }

  try {
    await submitSuspectLink(a, b);
    return { ok: true, message: `已提交「${NODE_KIND_LABELS.C}」，等待审核` };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "提交失败",
    };
  }
}

import type { GuildCommandState, GuildLeaderSkillsState } from "./types";

/** refer/js/head.js `Click_Skill4SW` 内 `name_CS4SW_SKILL` */
export const LEGACY_GUILD_COMMAND_SKILL_LABELS = [
  "下达战斗命令",
  "伟大的指导力",
  "光荣的伤口",
  "冷漠之心",
  "尖锐的视线",
] as const;

/** 浮窗与主卡片标题：对应 CS4 / PassSkill3[40–44] */
export const GUILD_COMMAND_CARD_TITLE = "会长技能";

/**
 * 与 refer/js/head.js `Click_Skill5SW` 内 `name_CS5SW_SKILL` 完全一致（含全角 ＆、无多余空格）。
 */
export const LEGACY_GUILD_LEADER_SKILL_LABELS = [
  "全素质ALL+20",
  "HP+100%",
  "SP+100%",
  "ATK+100%",
  "HIT+50＆FLEE+50",
  "伤害减半",
] as const;

const GUILD_KEYS: (keyof GuildLeaderSkillsState)[] = [
  "allStats20",
  "hp100",
  "sp100",
  "atk100",
  "hitFlee50",
  "damageHalf",
];

export function guildLeaderSkillRows(): {
  key: keyof GuildLeaderSkillsState;
  label: string;
}[] {
  return GUILD_KEYS.map((key, i) => ({
    key,
    label: LEGACY_GUILD_LEADER_SKILL_LABELS[i] ?? key,
  }));
}

const GUILD_CMD_NUM_KEYS: (keyof Pick<
  GuildCommandState,
  "greatGuidance" | "gloriousWound" | "coldHeart" | "sharpGaze"
>)[] = ["greatGuidance", "gloriousWound", "coldHeart", "sharpGaze"];

/** CS4 数值行：与 `LEGACY_GUILD_COMMAND_SKILL_LABELS` 下标 1～4 对齐 */
export function guildCommandNumericRows(): {
  key: (typeof GUILD_CMD_NUM_KEYS)[number];
  label: string;
}[] {
  return GUILD_CMD_NUM_KEYS.map((key, i) => ({
    key,
    label: LEGACY_GUILD_COMMAND_SKILL_LABELS[i + 1] ?? key,
  }));
}

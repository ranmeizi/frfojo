/**
 * 这里写一下准备处理的几种属性类型
 */
type attribType = string;
// /** 技能范围 */
// | "radius"
// /** 伤害 */
// | "base_damage"
// /** 施法距离 */
// | "range"
// /** 弹射目标个数 */
// | "bounces"
// /** 伤害 */
// | "damage"
// /** 减速 */
// | "slow";

type ConstantsAbility = {
  /** 名称 */
  dname: string;
  /** 目标类型 */
  behavior: string | string[];
  /** 伤害类型 */
  dmg_type: string;
  /** 可以攻击魔法免疫 */
  bkbpierce: string;
  /** 技能描述 */
  desc: string;
  /** 技能属性 */
  attrib: {
    /** 属性类型 */
    key: attribType;
    /** label 名 */
    header: string;
    /** 值 */
    value: string | string[];
    /** unknown */
    generated: boolean;
  }[];
  /** 技能故事 */
  lore: string;
  /** 魔法消耗 */
  mc: string | string[];
  /** 冷却时间 */
  cd: string | string[];
  /** 技能图标 */
  img: string;
};

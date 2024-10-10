type ConstantsHero = {
  /** 英雄id */
  id: number;
  /** 英雄名 */
  name: string;
  /** 英雄类型 */
  primary_attr: string;
  /** 攻击类型 */
  attack_type: string;
  /** 英雄分类 */
  roles: string[];
  /** 英雄图片 */
  img: string;
  /** 英雄图标 */
  icon: string;
  /** 基础生命值 */
  base_health: number;
  /** 基础生命回复 */
  base_health_regen: number;
  /** 基础魔法值 */
  base_mana: number;
  /** 基础魔法恢复 */
  base_mana_regen: number;
  /** 基础护甲 */
  base_armor: number;
  /** unknown */
  base_mr: 25;
  /** 基础攻击最小值 */
  base_attack_min: 29;
  /** 基础攻击最大值 */
  base_attack_max: 33;
  /** 基础力量 */
  base_str: 19;
  /** 基础敏捷 */
  base_agi: 24;
  /** 基础智力 */
  base_int: 12;
  /** 力量成长 */
  str_gain: 1.6;
  /** 敏捷成长 */
  agi_gain: 2.8;
  /** 智力成长 */
  int_gain: 1.8;
  /** 攻击范围 */
  attack_range: 150;
  /** unknown */
  projectile_speed: 0;
  /** 攻击间隔 */
  attack_rate: 1.4;
  /** unknown */
  base_attack_time: 100;
  /** unknown */
  attack_point: 0.3;
  /** 移动速度 */
  move_speed: 310;
  /** unknown */
  turn_rate: null;
  /** 比赛模式可上场 */
  cm_enabled: true;
  /** 腿数 */
  legs: 2;
  /** 白天视野 */
  day_vision: 1800;
  /** 夜晚视野 */
  night_vision: 800;
  /** 英雄名称 */
  localized_name: "Anti-Mage";
};

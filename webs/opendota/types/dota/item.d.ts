type attrItemKeys = string;

type ConstantsItem = {
  abilities: {
    /** 类型 主动/被动 */
    type: string;
    /** 名称 */
    title: string;
    /** 描述 */
    description;
  }[];
  /** 提示 */
  hint: string[];
  /** 物品id */
  id: number;
  /** 物品图片 */
  img: string;
  /** 物品名称 */
  dname: string;
  /** 品质 */
  qual: string;
  /** 钱 */
  cost: number;
  /** 可用于技能免疫 */
  bkbpierce: string;
  /** 额外提示 */
  notes: string;
  /** 属性 */
  attrib: {
    /** key 有些需要识别特殊处理 */
    key: attrItemKeys;
    /** 插值表达式 */
    display?: string;
    /** 值 */
    value: string;
  }[];
  /** 魔法消耗 */
  mc?: number;
  /** 声明消耗 */
  hc?: number;
  /** 冷却时间 */
  cd?: number;
  /** 故事 */
  lore: string;
  /** 合成需要 */
  components: string[] | null;
  /** 好像是可合成 */
  created: boolean;
  /** 充能数 */
  charges?: number;
};

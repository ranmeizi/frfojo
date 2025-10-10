export enum EnumMvpIndex {
  AmonRa = "1511",
  Baphomet = "1039",
  DarkLord = "1272",
  Doppelganger = "1046",
  Dracula = "1389",
  Drake = "1112",
  Eddga = "1115",
  Garm = "1252",
  GoldenThiefBug = "1086",
  KnightOfWindstorm = "1251",
  Maya = "1147",
  Mistress = "1059",
  MoonlightFlower = "1150",
  OrcHero = "1087",
  OrcLord = "1190",
  Osiris = "1038",
  Pharaoh = "1157",
  Phreeoni = "1159",
  TurtleGeneral = "1312",
  EvilSnakeLord = "1418",
  TaoGunka = "1583",
}

/** mvp 配置数据 */
export type MvpConfig = {
  id: string;
  name_EN: string;
  name_CN: string;
  name_map: string; // map 页上的名字
  name_momo: string; // discord 服务器上的名字
  imgUrl: string; // 图片
  credibility: boolean;
  respawn_map: Record<
    string,
    {
      time_lower: number; // 重生时间 下限
      time_upper: number; // 重生时间 上限
    }
  >;
};

const UNKNOWN = {
  time_lower: min(120),
  time_upper: min(180),
};

// 分钟
function min(val: number) {
  return val * 60 * 1000;
}

/** mvp 消息存储 */
export type MvpDeathNote = {
  id: string;
  killer: string; // 击杀者
  death_time: number; // 死亡时间
  map: string; // 地图
};

const config: Record<EnumMvpIndex, MvpConfig> = {
  // 埃及王
  [EnumMvpIndex.AmonRa]: {
    id: EnumMvpIndex.AmonRa,
    name_EN: "AmonRa",
    name_CN: "古埃及王",
    name_map: "Amon Ra",
    name_momo: "AmonRa",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1511.gif",
    credibility: false, // 未和gm确认
    respawn_map: {
      moc_pryd06: {
        time_lower: min(60),
        time_upper: min(70),
      },
    },
  },
  // 巴风特
  [EnumMvpIndex.Baphomet]: {
    id: EnumMvpIndex.Baphomet,
    name_EN: "Baphomet",
    name_CN: "巴风特",
    name_map: "Baphomet",
    name_momo: "Baphomet",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1039.gif",
    credibility: true,
    respawn_map: {
      prt_maze03: {
        time_lower: min(120),
        time_upper: min(130),
      },
      gl_cas02: {
        time_lower: min(120),
        time_upper: min(130),
      },
    },
  },
  // 黑暗领主
  [EnumMvpIndex.DarkLord]: {
    id: EnumMvpIndex.DarkLord,
    name_EN: "DarkLord",
    name_CN: "黑暗领主",
    name_map: "Dark Lord",
    name_momo: "DarkLord",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1272.gif",
    credibility: true,
    respawn_map: {
      gl_chyard: {
        time_lower: min(60),
        time_upper: min(70),
      },
    },
  },
  // 死灵
  [EnumMvpIndex.Doppelganger]: {
    id: EnumMvpIndex.Doppelganger,
    name_EN: "Doppelganger",
    name_CN: "死灵",
    name_map: "Doppelganger",
    name_momo: "Doppelganger",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1046.gif",
    credibility: true,
    respawn_map: {
      gef_dun02: {
        time_lower: min(120),
        time_upper: min(150),
      },
    },
  },
  // 德古拉男爵
  [EnumMvpIndex.Dracula]: {
    id: EnumMvpIndex.Dracula,
    name_EN: "Dracula",
    name_CN: "德古拉男爵",
    name_map: "Dracula",
    name_momo: "Dracula",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1389.gif",
    credibility: false, // 用的pre re数据
    respawn_map: {
      gef_dun01: {
        time_lower: min(60),
        time_upper: min(90),
      },
    },
  },
  // 海盗船长
  [EnumMvpIndex.Drake]: {
    id: EnumMvpIndex.Drake,
    name_EN: "Drake",
    name_CN: "海盗船长",
    name_map: "Drake",
    name_momo: "Drake",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1112.gif",
    credibility: true,
    respawn_map: {
      treasure02: {
        time_lower: min(120),
        time_upper: min(150),
      },
    },
  },
  // 虎王
  [EnumMvpIndex.Eddga]: {
    id: EnumMvpIndex.Eddga,
    name_EN: "Eddga",
    name_CN: "虎王",
    name_map: "Eddga",
    name_momo: "Eddga",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1115.gif",
    credibility: true,
    respawn_map: {
      pay_fild10: {
        time_lower: min(120),
        time_upper: min(130),
      },
    },
  },
  // 卡仑
  [EnumMvpIndex.Garm]: {
    id: EnumMvpIndex.Garm,
    name_EN: "Garm",
    name_CN: "卡仑",
    name_map: "Garm",
    name_momo: "Hatii",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1252.gif",
    credibility: true,
    respawn_map: {
      xmas_fild01: {
        time_lower: min(120),
        time_upper: min(180),
      },
    },
  },
  // 黄金虫
  [EnumMvpIndex.GoldenThiefBug]: {
    id: EnumMvpIndex.GoldenThiefBug,
    name_EN: "GoldenThiefBug",
    name_CN: "黄金虫",
    name_map: "Golden Thief Bug",
    name_momo: "GoldenThiefBug",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1086.gif",
    credibility: true,
    respawn_map: {
      prt_sewb4: {
        time_lower: min(60),
        time_upper: min(70),
      },
    },
  },
  // 冰暴骑士
  [EnumMvpIndex.KnightOfWindstorm]: {
    id: EnumMvpIndex.KnightOfWindstorm,
    name_EN: "KnightOfWindstorm",
    name_CN: " 冰暴骑士",
    name_map: "Knight of Windstorm",
    name_momo: "KnightOfWindstorm",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1251.gif",
    credibility: true,
    respawn_map: {
      xmas_dun02: {
        time_lower: min(60),
        time_upper: min(70),
      },
    },
  },
  // 蚁后
  [EnumMvpIndex.Maya]: {
    id: EnumMvpIndex.Maya,
    name_EN: "Maya",
    name_CN: "蚁后",
    name_map: "Maya",
    name_momo: "Maya",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1147.gif",
    credibility: true,
    respawn_map: {
      anthell02: {
        time_lower: min(60),
        time_upper: min(90),
      },
    },
  },
  // 蜂后
  [EnumMvpIndex.Mistress]: {
    id: EnumMvpIndex.Mistress,
    name_EN: "Mistress",
    name_CN: "蜂后",
    name_map: "Mistress",
    name_momo: "Mistress",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1059.gif",
    credibility: false,
    respawn_map: {
      mjolnir_05: {
        time_lower: min(120),
        time_upper: min(130),
      },
    },
  },
  // 月夜猫
  [EnumMvpIndex.MoonlightFlower]: {
    id: EnumMvpIndex.MoonlightFlower,
    name_EN: "MoonlightFlower",
    name_CN: "月夜猫",
    name_map: "Moonlight",
    name_momo: "MoonlightFlower",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1150.gif",
    credibility: true,
    respawn_map: {
      pay_dun04: {
        time_lower: min(60),
        time_upper: min(70),
      },
    },
  },
  // 兽人英雄
  [EnumMvpIndex.OrcHero]: {
    id: EnumMvpIndex.OrcHero,
    name_EN: "OrcHero",
    name_CN: "兽人英雄",
    name_map: "Orc Hero",
    name_momo: "OrcHero",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1087.gif",
    credibility: true,
    respawn_map: {
      gef_fild14: {
        time_lower: min(60),
        time_upper: min(90),
      },
      gef_fild02: {
        time_lower: min(1440),
        time_upper: min(1470),
      },
    },
  },
  // 兽人酋长
  [EnumMvpIndex.OrcLord]: {
    id: EnumMvpIndex.OrcLord,
    name_EN: "OrcLord",
    name_CN: "兽人酋长",
    name_map: "Orc Lord",
    name_momo: "OrcLord",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1190.gif",
    credibility: true,
    respawn_map: {
      orcsdun02: {
        time_lower: min(60),
        time_upper: min(90),
      },
    },
  },
  // 俄赛里斯
  [EnumMvpIndex.Osiris]: {
    id: EnumMvpIndex.Osiris,
    name_EN: "Osiris",
    name_CN: "俄赛里斯",
    name_map: "Osiris",
    name_momo: "Osiris",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1038.gif",
    credibility: true,
    respawn_map: {
      moc_pryd04: {
        time_lower: min(60),
        time_upper: min(70),
      },
    },
  },
  // 法老王
  [EnumMvpIndex.Pharaoh]: {
    id: EnumMvpIndex.Pharaoh,
    name_EN: "Pharaoh",
    name_CN: "法老王",
    name_map: "Pharaoh",
    name_momo: "Pharaoh",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1157.gif",
    credibility: true,
    respawn_map: {
      in_sphinx5: {
        time_lower: min(60),
        time_upper: min(70),
      },
    },
  },
  // 皮里恩
  [EnumMvpIndex.Phreeoni]: {
    id: EnumMvpIndex.Phreeoni,
    name_EN: "Phreeoni",
    name_CN: "皮里恩",
    name_map: "Phreeoni",
    name_momo: "Phreeoni",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1159.gif",
    credibility: true,
    respawn_map: {
      anthell01: {
        time_lower: min(60),
        time_upper: min(90),
      },
    },
  },
  // 乌龟将军
  [EnumMvpIndex.TurtleGeneral]: {
    id: EnumMvpIndex.TurtleGeneral,
    name_EN: "TurtleGeneral",
    name_CN: "乌龟将军",
    name_map: "Turtle General",
    name_momo: "TurtleGeneral",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1312.gif",
    credibility: true,
    respawn_map: {
      tur_dun04: {
        time_lower: min(60),
        time_upper: min(70),
      },
    },
  },
  // 墨蛇君
  [EnumMvpIndex.EvilSnakeLord]: {
    id: EnumMvpIndex.EvilSnakeLord,
    name_EN: "EvilSnakeLord",
    name_CN: "墨蛇君",
    name_map: "Evil Snake Lord",
    name_momo: "Evil Snake Lord",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1418.gif",
    credibility: true,
    respawn_map: {
      gon_dun03: {
        time_lower: min(94),
        time_upper: min(124),
      },
    },
  },
  // 塔奥群卡
  [EnumMvpIndex.TaoGunka]: {
    id: EnumMvpIndex.TaoGunka,
    name_EN: "TaoGunka",
    name_CN: "塔奥群卡",
    name_map: "Tao Gunka",
    name_momo: "Tao Gunka",
    imgUrl: "https://file5s.ratemyserver.net/mobs/1583.gif",
    credibility: true,
    respawn_map: {
      beach_dun: {
        time_lower: min(300),
        time_upper: min(330),
      },
    },
  },
};

export default config;

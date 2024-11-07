// request 请求参数类型
declare namespace Params {
  export namespace Opendota {
    type SearchParams = {
      q: string;
    };
    /** 查询玩家比赛数据 */
    type PlayerMatchesParams = {
      account_id: number;
      /**
       * Hero IDs against the player's team (array)
       */
      against_hero_id?: number;
      /**
       * Days previous
       */
      date?: number;
      /**
       * Account IDs not in the match (array)
       */
      excluded_account_id?: number;
      /**
       * Game Mode ID
       */
      game_mode?: number;
      /**
       * The minimum number of games played, for filtering hero stats
       */
      having?: number;
      /**
       * Hero ID
       */
      hero_id?: number;
      /**
       * Account IDs in the match (array)
       */
      included_account_id?: number;
      /**
       * Whether the player was radiant
       */
      is_radiant?: number;
      /**
       * Lane Role ID
       */
      lane_role?: number;
      /**
       * Number of matches to limit to
       */
      limit?: number;
      /**
       * Lobby type ID
       */
      lobby_type?: number;
      /**
       * Number of matches to offset start by
       */
      offset?: number;
      /**
       * Patch ID, from dotaconstants
       */
      patch?: number;
      /**
       * Fields to project (array)
       */
      project?: string;
      /**
       * Region ID
       */
      region?: number;
      /**
       * Whether the match was significant for aggregation purposes. Defaults to 1 (true), set
       * this to 0 to return data for non-standard modes/matches.
       */
      significant?: number;
      /**
       * The field to return matches sorted by in descending order
       */
      sort?: string;
      /**
       * Whether the player won
       */
      win?: number;
      /**
       * Hero IDs on the player's team (array)
       */
      with_hero_id?: number;
    };
  }
}
// response 传输对象类型
declare namespace DTOs {
  export namespace Opendota {
    /** 常量-英雄数据 */
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
      base_mr: number;
      /** 基础攻击最小值 */
      base_attack_min: number;
      /** 基础攻击最大值 */
      base_attack_max: number;
      /** 基础力量 */
      base_str: number;
      /** 基础敏捷 */
      base_agi: number;
      /** 基础智力 */
      base_int: number;
      /** 力量成长 */
      str_gain: number;
      /** 敏捷成长 */
      agi_gain: number;
      /** 智力成长 */
      int_gain: number;
      /** 攻击范围 */
      attack_range: number;
      /** unknown */
      projectile_speed: number;
      /** 攻击间隔 */
      attack_rate: number;
      /** unknown */
      base_attack_time: number;
      /** unknown */
      attack_point: number;
      /** 移动速度 */
      move_speed: number;
      /** unknown */
      turn_rate: number | null;
      /** 比赛模式可上场 */
      cm_enabled: boolean;
      /** 腿数 */
      legs: number;
      /** 白天视野 */
      day_vision: number;
      /** 夜晚视野 */
      night_vision: number;
      /** 英雄名称 */
      localized_name: string;
    };

    /** 常量-技能数据 */
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
        key: string;
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

    /** 常量-道具数据 */
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
        key: string;
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

    /** 查询玩家列表数据 */
    type SearchResListItem = {
      /**
       * The player account ID
       */
      account_id?: number;
      /**
       * avatarfull
       */
      avatarfull?: null | string;
      /**
       * last_match_time. May not be present or null.
       */
      last_match_time?: string;
      /**
       * Player's Steam name
       */
      personaname?: null | string;
      /**
       * similarity
       */
      similarity?: number;
    };

    /** 查询玩家比赛数据 - 好像是简易版 */
    type PlayerMatches = {
      /**
       * Total assists the player had at the end of the game
       */
      assists?: number;
      /**
       * Average rank of players with public match data
       */
      average_rank?: number | null;
      /**
       * Total deaths the player had at the end of the game
       */
      deaths?: number;
      /**
       * Duration of the game in seconds
       */
      duration?: number;
      /**
       * Integer corresponding to game mode played. List of constants can be found here:
       * https://github.com/odota/dotaconstants/blob/master/json/game_mode.json
       */
      game_mode?: number;
      /**
       * The ID value of the hero played
       */
      hero_id?: number;
      /**
       * 1-indexed facet, see
       * https://github.com/odota/dotaconstants/blob/master/build/hero_abilities.json
       */
      hero_variant?: number;
      /**
       * Total kills the player had at the end of the game
       */
      kills?: number;
      /**
       * Integer describing whether or not the player left the game. 0: didn't leave. 1: left
       * safely. 2+: Abandoned
       */
      leaver_status?: number;
      /**
       * Integer corresponding to lobby type of match. List of constants can be found here:
       * https://github.com/odota/dotaconstants/blob/master/json/lobby_type.json
       */
      lobby_type?: number;
      /**
       * The ID number of the match assigned by Valve
       */
      match_id?: number;
      /**
       * Size of the player's party
       */
      party_size?: number | null;
      /**
       * Which slot the player is in. 0-127 are Radiant, 128-255 are Dire
       */
      player_slot?: number | null;
      /**
       * Boolean indicating whether Radiant won the match
       */
      radiant_win?: boolean | null;
      /**
       * Skill bracket assigned by Valve (Normal, High, Very High)
       */
      skill?: number | null;
      /**
       * The Unix timestamp at which the game started
       */
      start_time?: number;
      /**
       * version
       */
      version?: number | null;
    };
  }
}
// 公共类型
declare namespace Types {
  export namespace Opendota {}
}

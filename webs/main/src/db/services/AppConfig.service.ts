import { db } from "..";

const name = "appConfig";

type AllAppConfigKeys = "cust_theme_primary" | "theme_mode" | "is_first";

export const querys = {
  /** 按 Key 查询一行配置 */
  one(key: AllAppConfigKeys) {
    return db.collections[name].findOne({
      selector: {
        key,
      },
    });
  },
  /** 查询所有 */
  all() {
    return db.collections[name].find();
  },
};

export const services = {
  /**
   * 按 Key 查询一行配置
   * @param key 配置 key
   */
  async queryConfig(key: AllAppConfigKeys) {
    const doc = await querys.one(key).exec();

    return doc?.toJSON?.()?.value;
  },
  /**
   * 设置 config
   */
  async setConfig(key: AllAppConfigKeys, value: string) {
    return await db.collections["appConfig"].upsert({
      key: key,
      value: value,
    });
  },
};

import { db } from "..";
import schema, { MenuDocType } from "../schema/Menu.schema";

const name = "menu";

export const querys = {
  menu() {
    return db.collections[name].find({
      sort: [{ order: "asc" }],
    });
  },
};

export const services = {
  /**
   * 获取所有menu
   */
  async getMenu() {
    const res = await db.collections[name]
      .find({
        sort: [{ order: "asc" }],
      })
      .exec();
    return res || [];
  },
  /**
   * 使用 js数组 重建 menu，存之前更新id
   */
  async resetMenu(menus: MenuDocType[]) {
    // 按 menus 数组顺序 更新 order
    const data = menus.map((menu, index) => ({
      ...menu,
      order: index,
    }));

    // 删除之前的数据
    await db.collections[name].remove();

    // 重建 collection
    await db.addCollections({
      menu: {
        schema,
      },
    });

    return await db.collections[name].bulkUpsert(data);
  },
};

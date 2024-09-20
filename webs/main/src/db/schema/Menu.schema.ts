import { RxDatabase } from "rxdb";
import IconDota2 from "@/assets/move-icons/dota2.png";
import IconHTML from "@/assets/move-icons/html.png";
import IconJS from "@/assets/move-icons/js.png";
import IconMcDonalds from "@/assets/move-icons/mcdonalds.png";
import IconReact from "@/assets/move-icons/react.png";
import IconStarBucks from "@/assets/move-icons/starbucks.png";
import IconVue from "@/assets/move-icons/vue.png";

const schema = {
  title: "app_menu",
  version: 0,
  description: "an app menu collection",
  primaryKey: "id",
  type: "object",
  properties: {
    /** id */
    id: {
      type: "string",
    },
    /** 父id */
    parentId: {
      type: "string",
    },
    /** 排序 */
    order: {
      type: "number",
    },
    /** 图标类型 */
    type: {
      type: "string",
      default: "item",
    },
    /** 图标图片地址 */
    src: {
      type: "string",
    },
    /** 路由地址 */
    path: {
      type: "string",
    },
    /** 右侧弹出文字 */
    tooltip: {
      type: "string",
    },
  },
  required: ["id", "order"],
} as const;

const INIT_DATA: MenuDocType[] = [
  {
    id: "dota2",
    parentId: undefined,
    order: 0,
    type: "item",
    src: IconDota2,
    path: "/m/subapp-dota2",
    tooltip: "Dota2战绩查询",
  },
  {
    id: "html",
    parentId: undefined,
    order: 1,
    type: "item",
    src: IconHTML,
    path: "/m/topic/html",
    tooltip: "HTML 真好学",
  },
  {
    id: "js",
    parentId: undefined,
    order: 2,
    type: "item",
    src: IconJS,
    path: "/m/topic/js",
    tooltip: "JS 真好学",
  },
  {
    id: "mcdonalds",
    parentId: undefined,
    order: 3,
    type: "item",
    src: IconMcDonalds,
    path: "/m/topic/mcdonalds",
    tooltip: "麦得劳月饼",
  },
  {
    id: "react",
    parentId: undefined,
    order: 4,
    type: "item",
    src: IconReact,
    path: "/m/topic/react",
    tooltip: "React 真好学",
  },
  {
    id: "starbucks",
    parentId: undefined,
    order: 5,
    type: "item",
    src: IconStarBucks,
    path: "/m/topic/starbucks",
    tooltip: "李大嘴还未研发出星巴克",
  },
  {
    id: "vue",
    parentId: undefined,
    order: 6,
    type: "item",
    src: IconVue,
    path: "/m/topic/vue",
    tooltip: "Vue 真好学",
  },
];

export async function collection_init(db: RxDatabase) {
  await db.collections["menu"].bulkInsert(INIT_DATA);
}

export type MenuDocType = {
  id: string;
  parentId?: string;
  order: number;
  type: "item" | "folder" | "item_sub-app";
  src?: string;
  path?: string;
  tooltip: string;
};

export default schema;

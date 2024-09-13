import { RxDatabase, createRxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import AppConfigSchema from "./schema/AppConfig.schema";
import MenuSchema, { collection_init } from "./schema/Menu.schema";

import * as AppConfigService from "./services/AppConfig.service";
import * as C from "@/utils/CONSTANTS";

export let db: RxDatabase;

export async function init(next: AsyncProcessFn) {
  db = await createRxDatabase({
    name: "app-state", // <- name
    storage: getRxStorageDexie(), // <- RxStorage
    /* Optional parameters: */
    password: "boboan", // <- password (optional)
    multiInstance: true, // <- multiInstance (optional, default: true)
    eventReduce: true, // <- eventReduce (optional, default: false)
    cleanupPolicy: {}, // <- custom cleanup policy (optional)
  });

  await db.addCollections({
    appConfig: {
      schema: AppConfigSchema,
    },
    menu: {
      schema: MenuSchema,
    },
  });

  // 判断是否需要初始化数据
  const is_first = await AppConfigService.services.queryConfig(
    C.APP_CONFIG_IS_FIRST
  );

  if (is_first !== "1") {
    // 数据初始化
    await collection_init(db);
  }

  await next();
}

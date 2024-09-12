import { RxDatabase, createRxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import AppConfigSchema from "./schema/AppConfig.schema";

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
  });

  await next();
}

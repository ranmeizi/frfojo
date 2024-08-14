import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  toTypedRxJsonSchema,
} from "rxdb";

const schema = {
  title: "app_config",
  version: 0,
  description: "a app config collection",
  primaryKey: "key",
  type: "object",
  properties: {
    key: {
      type: "string",
      maxLength: 20,
    },
    value: {
      type: "string",
    },
  },
  required: ["key", "value"],
} as const;

export default schema;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const schemaTyped = toTypedRxJsonSchema(schema);

export type AppConfigType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

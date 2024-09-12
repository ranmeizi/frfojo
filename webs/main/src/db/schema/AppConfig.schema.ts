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

export type AppConfigDocType = {
  key: string;
  value: string;
};

export default schema;

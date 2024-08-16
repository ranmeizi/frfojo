import { createContext } from "react";

const defaultValue = {
  width: 0, // icon 边长
};

export const StorageContext = createContext(defaultValue);

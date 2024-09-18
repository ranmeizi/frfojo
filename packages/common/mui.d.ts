import { PaletteColorOptions } from "@mui/material/styles/createPalette";

export type PaletteApp = {
  app_paper_sidebar: string;
  app_pager_menu: string;
  app_paper_content: string;
};

declare module "@mui/material/styles/createPalette" {
  export interface PaletteOptions {
    app: PaletteApp;
  }

  export interface Palette {
    app: PaletteApp;
  }
}

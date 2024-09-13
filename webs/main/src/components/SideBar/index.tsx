import { FC, useMemo } from "react";
import { Box, Divider, styled } from "@mui/material";
import Introduce from "../Intro";
import StorageColumns from "@frfojo/components/widgets/Storage/Columns";
import { useRxQuery } from "@/db/hook/useRxQuery";
import * as MenuService from "@/db/services/Menu.service";
import { MenuDocType } from "@/db/schema/Menu.schema";

const SideBar: FC = (props) => {
  const list =
    useRxQuery<MenuDocType, "list">(
      useMemo(() => {
        return MenuService.querys.menu();
      }, [])
    ) || [];

  return (
    <Box
      sx={(theme) => ({
        padding: theme.spacing(1),
        height: "100%",
      })}
    >
      <Introduce />
      <Divider
        sx={({ spacing }) => ({
          marginTop: spacing(1),
          marginBottom: spacing(1),
        })}
      />
      <StorageColumns value={list} onChange={MenuService.services.resetMenu} />
    </Box>
  );
};

export default SideBar;

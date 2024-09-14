import { FC, useMemo } from "react";
import {
  Badge,
  BadgeProps,
  Box,
  Divider,
  styled,
  Tooltip,
  TooltipProps,
  tooltipClasses,
} from "@mui/material";
import Introduce from "../Intro";
import StorageColumns from "@frfojo/components/widgets/Storage/Columns";
import { useRxQuery } from "@/db/hook/useRxQuery";
import * as MenuService from "@/db/services/Menu.service";
import { MenuDocType } from "@/db/schema/Menu.schema";
import ContextMenu from "./ContextMenu";

const BootstrapTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    fontSize: "16px",
    padding: "16px 24px",
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.background.paper,
  },
}));

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: 6,
    top: 6,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
  },
}));

const SideBar: FC = () => {
  const list =
    useRxQuery<MenuDocType, "list">(
      useMemo(() => {
        return MenuService.querys.menu();
      }, []),
      50
    ) || [];

  console.log("update", list);

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

      <ContextMenu>
        <StorageColumns
          value={list}
          onChange={MenuService.services.resetMenu}
          renderWrapper={(item, dom) => {
            let child: React.ReactNode = dom;
            // 添加 tooltip
            console.log(item.tooltip);
            if (item.tooltip) {
              child = (
                <BootstrapTooltip title={item.tooltip} placement="right-start">
                  <div>{child}</div>
                </BootstrapTooltip>
              );
            }

            // barge
            if (item.id === "dota2") {
              child = (
                <StyledBadge badgeContent={1} color="error">
                  {child}
                </StyledBadge>
              );
            }
            return child;
          }}
        />
      </ContextMenu>
    </Box>
  );
};

export default SideBar;

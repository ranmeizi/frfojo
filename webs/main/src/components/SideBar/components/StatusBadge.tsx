import { Badge, styled } from "@mui/material";

export enum EnumStatus {
  ONLINE,
  OFFLINE,
  BUSY,
  DO_NOT_DISTURB,
}

const StatusColors: Record<EnumStatus, string> = {
  [EnumStatus.ONLINE]: "#44b700",
  [EnumStatus.OFFLINE]: "#bfbfbf",
  [EnumStatus.BUSY]: "#d87a16",
  [EnumStatus.DO_NOT_DISTURB]: "#d32029",
};

const StatusBadge = styled(Badge)<{ type: EnumStatus }>(({ theme, type }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: StatusColors[type],
    color: StatusColors[type],
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

export default StatusBadge;

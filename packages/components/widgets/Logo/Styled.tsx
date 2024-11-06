import { styled, keyframes } from "@mui/material";

const zuo = keyframes({
  "0%": {
    transform: "translateX(0)",
  },
  "50%": {
    transform: "translateX(-4px)",
  },
  "100%": {
    transform: "translateX(0)",
  },
});

const you = keyframes({
  "0%": {
    transform: "translateX(0)",
  },
  "50%": {
    transform: "translateX(4px)",
  },
  "100%": {
    transform: "translateX(0)",
  },
});

const blink = keyframes({
  "0%": {
    opacity: 0,
  },
  "20%": {
    opacity: 1,
  },
  "40%": {
    opacity: 0,
  },
  "100%": {
    opacity: 0,
  },
});

const Span = styled("span")(({ theme }) => ({
  position: "relative",
  display: "inline-block",
  userSelect: "none",
  paddingRight: theme.spacing(2),
  paddingLeft: theme.spacing(1),
  color: theme.palette.text.primary,
  fontSize: "24px",
  fontWeight: 500,
  cursor: "pointer",
  "&::after": {
    position: "absolute",
    content: "'_'",
    color: "#5973ff",
    right: 0,
    top: 0,
    fontWeight: 700,
    animation: `${blink} 3s ease-in-out infinite`,
  },
  "& .blue": {
    fontWeight: 700,
    color: "#5973ff",
  },
  "& .left": {
    display: "inline-block",
    transition: "0.2s",
  },
  "& .right": {
    display: "inline-block",
    transition: "0.2s",
  },
  "&:hover": {
    "& .left": {
      animation: `${zuo} 0.5s ease-in-out`,
    },
    "& .right": {
      animation: `${you} 0.5s ease-in-out`,
    },
  },
}));

export { Span };

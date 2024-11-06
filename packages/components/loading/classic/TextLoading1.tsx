import React, { FC } from "react";
import { keyframes, styled } from "@mui/material";

const Root = styled("div")(({ theme }) => {
  const bg = theme.palette.background.default;
  const constract = theme.palette.getContrastText(bg);
  const kf = keyframes({
    "50%": {
      backgroundPosition: "center",
      textShadow: `-10ch 0 0 ${constract},    0 0 0 ${bg},10ch 0 0 ${constract}`,
    },
    "100%": {
      backgroundPosition: "right",
      textShadow: `-20ch 0 0 ${constract},-10ch 0 0 ${bg},   0 0 0 ${constract}`,
    },
  });
  return {
    width: "max-content",
    fontWeight: "bold",
    fontFamily: "monospace",
    fontSize: "30px",
    overflow: "hidden",

    "&::before": {
      content: `'Loading...'`,
      color: "#0000",
      textShadow: ` 0 0 0 ${constract},10ch 0 0 ${bg},20ch 0 0 ${constract};`,
      background: `linear-gradient(90deg,#0000 calc(100%/3),${constract} 0 calc(2*100%/3),#0000 0) left/300% 100%`,
      animation: `${kf} 2s infinite`,
    },
  };
});

type TextLoading1Props = {};

const TextLoading1: FC<TextLoading1Props> = () => {
  return <Root />;
};

export default TextLoading1;

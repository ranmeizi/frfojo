import { FC, PropsWithChildren } from "react";
import { styled, keyframes } from "@mui/material";

const rotate = keyframes({
  "100%": {
    transform: "rotate(1turn)",
  },
});

const Root = styled("div")(() => ({
  padding: "6px",
  position: "relative",
  zIndex: 0,
  overflow: "hidden",
  boxSizing: "content-box",
  margin: "-6px",

  "&::before": {
    content: '""',
    position: "absolute",
    left: "-50%",
    top: "-50%",
    width: "200%",
    height: "200%",
    zIndex: -2,
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
    backgroundPosition: "0 0, 100% 0",
    backgroundImage: "linear-gradient(#b5a031, #4a3e00)",
    animation: `${rotate} 4s linear infinite`,
  },
}));

type BorderGoldenProps = PropsWithChildren<{}>;

const BorderGolden: FC<BorderGoldenProps> = ({ children }) => {
  return <Root className="border">{children}</Root>;
};

export default BorderGolden;

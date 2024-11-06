import { FC, PropsWithChildren } from "react";
import { keyframes, styled } from "@mui/material";

const rotate = keyframes({
  "100%": {
    transform: "rotate(1turn)",
  },
});

const Root = styled("div")(({ theme }) => ({
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
    backgroundImage: "linear-gradient(#adadaa, #3b3b3b)",
    animation: `${rotate} 4s linear infinite`,
  },
}));

type BorderSilverProps = PropsWithChildren<{}>;

const BorderSilver: FC<BorderSilverProps> = ({ children }) => {
  return <Root className="border">{children}</Root>;
};

export default BorderSilver;

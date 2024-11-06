import { FC, PropsWithChildren } from "react";
import { styled } from "@mui/material";

const Root = styled("div")(({ theme }) => ({
  boxShadow: "0 0 2px 8px rgba(0,0,0,.5)",
}));

type BorderNormalProps = PropsWithChildren<{}>;

const BorderNormal: FC<BorderNormalProps> = ({ children }) => {
  return <Root className="border">{children}</Root>;
};

export default BorderNormal;

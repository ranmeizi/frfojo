import { FC } from "react";
import { styled } from "@mui/material";

const Root = styled("div")(({ theme }) => ({}));

type FolderCollapseProps = {};

const FolderCollapse: FC<FolderCollapseProps> = (props) => {
  return <Root>Component FolderCollapse</Root>;
};

export default FolderCollapse;

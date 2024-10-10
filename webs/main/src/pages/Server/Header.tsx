import { FC, useMemo } from "react";
import { styled, Box } from "@mui/material";
import NumbersIcon from "@mui/icons-material/Numbers";
import { useParams } from "react-router-dom";
import { flatTree } from "./Sidebar";

const Root = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  height: "100%",
}));

const Header: FC = () => {
  const params = useParams<{ serverId: string; topic?: string }>();

  const topic_text = useMemo(() => {
    if (!params.topic) {
      return "";
    }
    return flatTree.find((item) => item.id === params.topic)?.label;
  }, [params.topic]);
  return (
    <Root>
      <Box sx={{ display: "flex", alignItems: "center", paddingLeft: "24px" }}>
        <NumbersIcon />
        {topic_text}
      </Box>
    </Root>
  );
};

export default Header;

import { FC, ReactNode } from "react";
import { Box, styled } from "@mui/material";
import { Item, sizes } from "./Chart";

const Root = styled("div")<{ width: number }>(({ width }) => ({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  fontSize: "10px",

  ".heatmap-item": {
    height: width + "px",
    width: width + "px",
    borderRadius: "2px",
  },
}));

type CommentProps = {
  size?: "small" | "middle" | "large";
  lessText?: ReactNode;
  moreText?: ReactNode;
  emptyText?: ReactNode;
  colors: any;
};

const range = [0, 1 / 4, 2 / 4, 3 / 4, 1] as const;

const Comment: FC<CommentProps> = ({
  size = "small",
  lessText = "Less",
  moreText = "More",
  colors,
}) => {
  const width = sizes[size];
  return (
    <Root width={width}>
      <Box>{lessText}</Box>
      <Box sx={{ display: "flex", gap: "3px" }}>
        <Item
          range={range}
          colors={colors}
          item={{ date: "", value: 0, payload: undefined }}
        />
        <Item
          range={range}
          colors={colors}
          item={{ date: "", value: 0.25, payload: undefined }}
        />
        <Item
          range={range}
          colors={colors}
          item={{ date: "", value: 0.5, payload: undefined }}
        />
        <Item
          range={range}
          colors={colors}
          item={{ date: "", value: 0.75, payload: undefined }}
        />
        <Item
          range={range}
          colors={colors}
          item={{ date: "", value: 1, payload: undefined }}
        />
      </Box>
      <Box>{moreText}</Box>
    </Root>
  );
};

export default Comment;

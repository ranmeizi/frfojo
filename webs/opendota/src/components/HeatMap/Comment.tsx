import { FC, ReactNode } from "react";
import { styled } from "@mui/material";

const Root = styled("div")(({ theme }) => ({}));

type CommentProps = {
  size?: "small" | "middle" | "large";
  lessText?: ReactNode;
  moreText?: ReactNode;
  emptyText?: ReactNode;
};

const Comment: FC<CommentProps> = ({
  size = "middle",
  lessText = "Less",
  moreText = "More",
}) => {
  return <Root>Component Comment</Root>;
};

export default Comment;

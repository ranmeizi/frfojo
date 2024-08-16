import { Box, CardMedia, styled } from "@mui/material";
import React, { useState } from "react";
import avatarImg from "@/assets/13.jpg";
import backImg from "@/assets/567.jpg";
import zIndex from "@mui/material/styles/zIndex";

const H = 52;

const Root = styled("div")((theme) => ({
  position: "relative",
  borderRadius: "8px",
  height: H,
  width: H,
  overflow: "hidden",
  "& .back": {
    height: "100%",
    width: "100%",
    filter: "blur(30px)",
    transition: "0.5s",
    transform: "scale(1.2)",
    "&:hover": {
      filter: "blur(0px)",
      transform: "scale(1)",
    },
  },

  "& .avatar": {
    position: "absolute",
    pointerEvents: "none",
    top: "50%",
    left: "50%",
    marginTop: `-${H / 3}px`,
    marginLeft: `-${H / 3}px`,
    height: (H * 2) / 3 + "px",
    width: (H * 2) / 3 + "px",
    backgroundImage: `url(${avatarImg})`,
    backgroundSize: "cover",
    borderRadius: "50%",
    transition: "0.5s",
    transform: "scale(1)",
    zIndex: 2,
    "&.hover": {
      filter: "blur(100px)",
      transform: "scale(2)",
      zIndex: 0,
    },
  },
}));

export default function Wu67() {
  const [hover, setHover] = useState(false);

  return (
    <Root
      onMouseEnter={() => {
        !hover && setHover(true);
      }}
      onMouseLeave={() => {
        hover && setHover(false);
      }}
    >
      <CardMedia className="back" image={backImg} />
      <Box className={`avatar ${hover ? "hover" : ""}`}></Box>
    </Root>
  );
}

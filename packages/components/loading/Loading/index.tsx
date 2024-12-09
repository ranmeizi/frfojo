import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box, { BoxProps } from "@mui/material/Box";

export default function Loading(props: BoxProps) {
  return (
    <Box sx={{ display: "flex" }} {...props}>
      <CircularProgress />
    </Box>
  );
}

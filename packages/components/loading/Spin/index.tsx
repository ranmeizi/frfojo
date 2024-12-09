import { Box } from "@mui/material";
import { PropsWithChildren } from "react";
import Loading from "../Loading";

type SpinProps = {
  spining: boolean;
};

export default function Spin({
  spining,
  children,
}: PropsWithChildren<SpinProps>) {
  return (
    <Box sx={{ position: "relative", overflow: "hidden" }}>
      {spining ? (
        <Loading
          sx={{
            height: "100%",
            width: "100%",
            position: "absolute",
            left: 0,
            top: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(255,255,255,.15)",
          }}
        />
      ) : null}

      {children}
    </Box>
  );
}

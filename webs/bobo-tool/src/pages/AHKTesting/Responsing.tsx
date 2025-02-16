import { FC } from "react";
import { Box, Container, styled, TextField } from "@mui/material";
import KB from "./Keyboard";

const Root = styled("div")(({ theme }) => ({
  height: "100%",
  color: "#000",
}));

type ResponsingProps = {};

const Responsing: FC<ResponsingProps> = (props) => {
  {
    /* 整个区域做响应 */
  }
  return (
    <Root>
      <Container sx={{ height: "100%" }}>
        <Box
          display="flex"
          flexDirection={"column"}
          sx={{ height: "100%", padding: "24px" }}
        >
          {/* 打字 预期 */}
          <Box
            sx={(theme) => ({
              width: "100%",
              flex: 1,
              borderRadius: "8px",
              background: theme.palette.background.default,
              marginBottom: "24px",
              color: theme.palette.text.primary,
              padding: "12px",
            })}
          >
            预期stack
          </Box>
          {/* textarea */}
          <Box
            sx={(theme) => ({
              width: "100%",
              flex: 4,
              borderRadius: "8px",
              background: theme.palette.background.default,
              marginBottom: "24px",
              color: theme.palette.text.primary,
              padding: "12px",
            })}
          >
            输入列表
          </Box>
          {/* keyboard */}
          <KB></KB>
        </Box>
      </Container>
    </Root>
  );
};

export default Responsing;

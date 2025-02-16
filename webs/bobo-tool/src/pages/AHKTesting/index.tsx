import { FC, useRef, useState } from "react";
import {
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  Modal,
  Paper,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import "react-simple-keyboard/build/css/index.css";
import KB from "./Keyboard";
import Responsing from "./Responsing";
import CloseIcon from "@mui/icons-material/Close";
import MenuLayout from "@frfojo/components/layout/Menu";
import { Back } from "@frfojo/components/widgets";
import { useNavigate } from "react-router-dom";

const Root = styled("div")(({ theme }) => ({}));

type AHKTestingProps = {};

const AHKTesting: FC<AHKTestingProps> = (props) => {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const logo = (
    <Stack direction="row" spacing={2} alignItems="center">
      <Back tooltip="back" onClick={() => navigate(-1)} />
      <Box>AHK-Testing</Box>
    </Stack>
  );
  return (
    <MenuLayout logo={logo} sidebar={<div></div>}>
      <Root sx={{ color: "#000" }}>
        <Container
          sx={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Paper sx={{ padding: "32px" }}>
            <div>测试AutoHotKey</div>
            <Button onClick={() => setOpen(true)}>开始</Button>
          </Paper>
        </Container>

        <Modal
          open={open}
          onClose={() => setOpen(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Paper
            sx={() => ({
              display: "flex",
              flexDirection: "column",
              height: "100vh",
              width: "100vw",
            })}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={(theme) => ({
                padding: "4px 12px",
                background: theme.palette.background.default,
              })}
            >
              <Typography id="modal-modal-title" variant="h6" component="h2">
                模拟应用程序窗口
              </Typography>
              <IconButton onClick={() => setOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box id="modal-modal-description" sx={{ flex: 1 }}>
              <Responsing />
            </Box>
          </Paper>
        </Modal>
      </Root>
    </MenuLayout>
  );
};

export default AHKTesting;

import { FC } from "react";
import { Box, Stack } from "@mui/material";
import { Back, LayoutMenu } from "@frfojo/components";
import { useNavigate } from "react-router-dom";

const FILEDROP_URL = "https://boboan.net/filedrop/";

const Filedrop: FC = () => {
  const navigate = useNavigate();

  const header = (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ pl: 1, pr: 1 }}>
      <Back tooltip="返回" onClick={() => navigate(-1)} />
      <Box>Filedrop</Box>
    </Stack>
  );

  return (
    <LayoutMenu header={header}>
      <Box
        sx={{
          flex: 1,
          width: "100%",
          minHeight: 0,
          height: "calc(100dvh - 48px)",
          display: "flex",
        }}
      >
        <Box
          component="iframe"
          title="Filedrop"
          src={FILEDROP_URL}
          sx={{
            flex: 1,
            width: "100%",
            height: "100%",
            border: 0,
            display: "block",
            backgroundColor: "#0b1220",
          }}
          allow="clipboard-read; clipboard-write"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </Box>
    </LayoutMenu>
  );
};

export default Filedrop;

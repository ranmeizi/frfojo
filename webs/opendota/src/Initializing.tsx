import { ThemeProvider } from "@emotion/react";
import { Box, createTheme, CssBaseline } from "@mui/material";
import { useAppTheme } from "./theme";
import TextLoading1 from "@frfojo/components/loading/classic/TextLoading1";

function Initializing() {
  const theme = useAppTheme();

  return (
    <Box
      height="100%"
      width="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <ThemeProvider theme={createTheme(theme)}>
        <CssBaseline />
        <TextLoading1 />
      </ThemeProvider>
    </Box>
  );
}

export default Initializing;

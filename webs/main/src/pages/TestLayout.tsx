import { Box } from "@mui/material";
import { LayoutApp } from "@frfojo/components/layouts";

export default function TestLayout() {
  const sidebar = (
    <Box
      sx={(theme) => ({
        padding: theme.spacing(1),
      })}
    >
      sidebar
    </Box>
  );
  return (
    <LayoutApp sidebar={sidebar}>
      <Box
        sx={(theme) => ({
          padding: theme.spacing(2),
        })}
      >
        content
      </Box>
    </LayoutApp>
  );
}

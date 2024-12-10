import { FC } from "react";
import MdDoc from "@/components/MdDoc";
import doc from "./doc.md?raw";
import { Container, Paper } from "@mui/material";

const DocReadme: FC = () => {
  return (
    <Container>
      <Paper sx={{ padding: "24px" }}>
        <MdDoc mdText={doc} />
      </Paper>
    </Container>
  );
};

export default DocReadme;

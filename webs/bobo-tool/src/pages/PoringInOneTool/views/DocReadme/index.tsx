import { FC } from "react";
import MdDoc from "@/components/MdDoc";
import doc from "./doc.md?raw";
import { Container } from "@mui/material";

const DocHomuInput: FC = () => {
  return (
    <Container>
      <MdDoc mdText={doc} />;
    </Container>
  );
};

export default DocHomuInput;

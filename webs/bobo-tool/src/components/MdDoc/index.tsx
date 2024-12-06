import { FC, useEffect, useRef } from "react";
import { styled } from "@mui/material";
import { marked } from "marked";

const Root = styled("div")(({ theme }) => ({}));

type MdDocProps = {
  mdText: string;
};

const MdDoc: FC<MdDocProps> = ({ mdText }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    setHtml();
  }, []);

  async function setHtml() {
    ref.current!.innerHTML = await marked.parse(mdText);
  }

  return <Root ref={ref}></Root>;
};

export default MdDoc;

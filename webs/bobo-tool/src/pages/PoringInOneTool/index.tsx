import { FC, useMemo, useState } from "react";
import { Box, Stack, styled } from "@mui/material";
import MenuLayout from "@frfojo/components/layout/Menu";
import { Back } from "@frfojo/components/widgets";
import Menu from "./components/menu";
import Exec from "./views/Exec";
import { useNavigate } from "react-router-dom";
import DocHomuInput from "./views/DocHomuInput";
import DocReadme from "./views/DocReadme";
import DocAHKAutoInput from "./views/DocAHKAuto";

const Root = styled("div")(({ theme }) => ({}));

type PoringInOneToolProps = {};

const PoringInOneTool: FC<PoringInOneToolProps> = (props) => {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const view = useMemo(() => {
    switch (active) {
      case 0:
        return <Exec />;
      case 1:
        return <DocHomuInput />;
      case 2:
        return <DocAHKAutoInput />;
      case 3:
        return <DocReadme />;
    }
  }, [active]);

  const logo = (
    <Stack direction="row" spacing={2} alignItems="center">
      <Back tooltip="back" onClick={() => navigate(-1)} />
      <Box>2048助手</Box>
    </Stack>
  );
  return (
    <MenuLayout
      logo={logo}
      sidebar={<Menu value={active} onChange={setActive} />}
    >
      <Root>{view}</Root>
    </MenuLayout>
  );
};

export default PoringInOneTool;

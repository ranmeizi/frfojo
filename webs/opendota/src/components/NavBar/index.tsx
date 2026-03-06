import { FC, useState } from "react";
import { Box, Button, styled } from "@mui/material";
import SearchBar from "../SearchBar";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const Root = styled("div")(({ theme }) => ({
  height: "100%",
  width: "100%",
  padding: theme.spacing(2),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  pointerEvents: "none",
  gap: theme.spacing(1),
}));

const navList = [
  {
    title: "搜索",
    path: "/ffj/search",
  },
  {
    title: "比赛",
    path: "/ffj/matches",
  },
  {
    title: "英雄",
    path: "/ffj/heroes",
  },
];

type NavBarProps = Record<string, never>;

const NavBar: FC<NavBarProps> = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  function handleSubmit(value: string) {
    const next = value.trim();
    if (!next) {
      navigate("/ffj/search", { replace: true });
      return;
    }
    navigate(`/ffj/search/${encodeURIComponent(next)}`);
  }

  return (
    <Root>
      <Box
        sx={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          overflowX: isMobile ? "auto" : "visible",
          whiteSpace: "nowrap",
        }}
      >
        {navList.map((item) => (
          <Button
            variant="text"
            key={item.path}
            size={isMobile ? "small" : "medium"}
            sx={{
              pointerEvents: "auto",
              minWidth: isMobile ? 0 : undefined,
              px: isMobile ? 1 : 1.5,
            }}
            onClick={() => navigate(item.path)}
          >
            {item.title}
          </Button>
        ))}
      </Box>
      <Box
        sx={{
          pointerEvents: "auto",
          flex: 1,
          minWidth: isMobile ? 120 : 240,
          maxWidth: isMobile ? 220 : 420,
        }}
      >
        <SearchBar
          value={keyword}
          onChange={setKeyword}
          onSubmit={handleSubmit}
        />
      </Box>
    </Root>
  );
};

export default NavBar;

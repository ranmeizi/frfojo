import { FC, useState } from "react";
import { Box, Button, styled } from "@mui/material";
import SearchBar from "../SearchBar";
import { useNavigate } from "react-router-dom";

const Root = styled("div")(({ theme }) => ({
  height: "100%",
  width: "100%",
  padding: theme.spacing(2),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  pointerEvents: "none",
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

type NavBarProps = {};

const NavBar: FC<NavBarProps> = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

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
      <div>
        {navList.map((item) => (
          <Button
            variant="text"
            sx={{ pointerEvents: "auto" }}
            onClick={() => navigate(item.path)}
          >
            {item.title}
          </Button>
        ))}
      </div>
      <Box sx={{ pointerEvents: "auto" }}>
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

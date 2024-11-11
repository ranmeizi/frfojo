import { FC } from "react";
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
    title: "Search",
    path: "/ffj/search",
  },
  {
    title: "Matches",
    path: "/ffj/matches",
  },
  {
    title: "Heroes",
    path: "/ffj/heroes",
  },
];

type NavBarProps = {};

const NavBar: FC<NavBarProps> = () => {
  const navigate = useNavigate();

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
        <SearchBar />
      </Box>
    </Root>
  );
};

export default NavBar;

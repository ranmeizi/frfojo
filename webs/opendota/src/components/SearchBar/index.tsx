import { FC } from "react";
import { Divider, IconButton, InputBase, styled } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const Root = styled("div")(({ theme }) => ({
  height: "100%",
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1),
}));

type SearchBarProps = {};

const SearchBar: FC<SearchBarProps> = (props) => {
  return (
    <Root>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="search player"
        inputProps={{ "aria-label": "search player" }}
      />
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      <IconButton type="button" sx={{ p: "8px" }} aria-label="search">
        <SearchIcon />
      </IconButton>
    </Root>
  );
};

export default SearchBar;

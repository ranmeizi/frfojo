import { FC, KeyboardEvent } from "react";
import { Divider, IconButton, InputBase, styled } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const Root = styled("div")(({ theme }) => ({
  height: "100%",
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1),
}));

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

const SearchBar: FC<SearchBarProps> = ({ value, onChange, onSubmit, onFocus, onBlur }) => {
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && onSubmit) {
      onSubmit(value);
    }
  }

  return (
    <Root>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="搜索玩家"
        inputProps={{ "aria-label": "搜索玩家" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => onFocus?.()}
        onBlur={() => onBlur?.()}
      />
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      <IconButton
        type="button"
        sx={{ p: "8px" }}
        aria-label="search"
        onClick={() => onSubmit && onSubmit(value)}
      >
        <SearchIcon />
      </IconButton>
    </Root>
  );
};

export default SearchBar;

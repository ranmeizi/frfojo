import { FC, useEffect } from "react";
import { styled } from "@mui/material";
import { ODRequest } from "../../utils/request/opendota";

const Root = styled("div")(({ theme }) => ({}));

type SearchProps = {};

const Search: FC<SearchProps> = (props) => {
  useEffect(() => {
    ODRequest.get("/search", { params: { q: "真真和" } }).then((res) => {
      console.log(res);
    });
  }, []);

  return <Root>Component Search</Root>;
};

export default Search;

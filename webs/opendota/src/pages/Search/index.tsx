import { FC, useState } from "react";
import { Button, styled, Switch, TextField } from "@mui/material";
import { opendotaApi } from "@/redux/queryApis/opendota";

const Root = styled("div")(({ theme }) => ({}));

type SearchProps = {};

const Search: FC<SearchProps> = (props) => {
  // const { data, refetch } = useGetConstantsHeroesQuery();

  // console.log(store.getState());

  // console.log(data, "data");

  const [show, setShow] = useState(true);

  return (
    <Root>
      HI
      <div>
        模拟路由卸载
        <Switch checked={show} onChange={(e) => setShow(e.target.checked)} />
        {show ? <TMD></TMD> : null}
      </div>
    </Root>
  );
};

function TMD() {
  // const { data, refetch } = useGetConstantsHeroesQuery();
  // console.log("bbr", data);
  const [trigger, result] = opendotaApi.useLazySerachQuery();

  const [search, setSeatch] = useState("");

  function handleSearch() {
    trigger({ q: search }, true);
  }

  console.log("result", result);

  return (
    <div>
      <TextField value={search} onChange={(e) => setSeatch(e.target.value)} />
      <Button onClick={handleSearch}>Search</Button>
    </div>
  );
}

export default Search;

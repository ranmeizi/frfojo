import React, { FC, useMemo, useState } from "react";
import { Box, Button, styled, Switch, TextField } from "@mui/material";
import { opendotaApi } from "@/redux/queryApis/opendota";
import { LayoutMenu } from "@frfojo/components/layout";
import NavBar from "@/components/NavBar";
import LogoMenu from "@/components/LogoMenu";
import Avatar from "@/components/Widgets/Avatar";
import RankItem from "@/components/Widgets/Rank";
import { useNavigate } from "react-router-dom";
import HeatMapChart, { ItemData } from "@/components/HeatMap/chart";
import dayjs from "dayjs";

const Root = styled("div")(({ theme }) => ({}));

type SearchProps = {};

const Search: FC<SearchProps> = (props) => {
  const navigate = useNavigate();
  // const { data, refetch } = useGetConstantsHeroesQuery();

  const { data } = opendotaApi.usePlayerMatchesQuery({
    account_id: 164917453,
    date: 90, // 最近3 月
    significant: 0,
  });

  const values = useMemo<ItemData[]>(() => {
    const memo: Record<string, ItemData> = {};
    data?.forEach((item) => {
      const date = dayjs(item.start_time * 1000).format("YYYY-MM-DD");
      if (!memo[date]) {
        memo[date] = {
          date,
          value: 1,
          payload: undefined,
        };
      } else {
        memo[date].value++;
      }
    });

    return Object.values(memo);
  }, [data]);

  console.log("value", values);

  const [show, setShow] = useState(true);

  return (
    <LayoutMenu
      sidebar={
        <Box sx={{ padding: "20px" }}>
          {/* <Box sx={{ width: "100%" }}>
            <Avatar avatar="https://avatars.steamstatic.com/5c9c619ca4928f57b9022c7a2687576045d21161_full.jpg" />
          </Box>
          <Box sx={{ width: "100%", marginTop: "24px" }}>
            <Avatar
              vip={1}
              avatar="https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg"
            />
          </Box>

          <Box sx={{ width: "100%", marginTop: "24px" }}>
            <Avatar
              vip={2}
              avatar="https://avatars.steamstatic.com/14f1a9927382fa8dea134a0f3ca6f17e6938e131_full.jpg"
            />
          </Box>

          <Box sx={{ width: "100%", marginTop: "24px" }}>
            <Avatar
              vip={1}
              avatar="https://avatars.steamstatic.com/c46fdd211b79d396a4ac833a5990a2fde7070df6_full.jpg"
            />
          </Box>

          <Box sx={{ width: "100%", transform: "translate(140px,-40px)" }}>
            <RankItem rank_tier={72}></RankItem>
          </Box> */}

          <Box sx={{ width: "100%" }}>
            {values ? <HeatMapChart values={values} /> : null}
          </Box>
        </Box>
      }
      logo={<LogoMenu />}
      header={<NavBar />}
    >
      <Root>
        HI
        <div>
          模拟路由卸载
          <Switch checked={show} onChange={(e) => setShow(e.target.checked)} />
          {show ? <TMD></TMD> : null}
          <a
            onClick={() => {
              navigate("/ffj/profile/164917453");
            }}
          >
            小连接
          </a>
          <a
            onClick={() => {
              navigate("/ffj/profile/137129583");
            }}
          >
            看看你的
          </a>
        </div>
      </Root>
    </LayoutMenu>
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

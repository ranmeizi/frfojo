// 这个组件去取数据， 传给 heatmap 组件 heatmap 负责样式
import { FC, useCallback, useMemo, useState } from "react";
import {
  Box,
  styled,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import HeatMapChart, { ItemData, ChartProps } from "@/components/HeatMap/chart";
import { opendotaApi } from "@/redux/queryApis/opendota";
import dayjs from "dayjs";
import { HeatMapComment } from "@/components/HeatMap";

type RowItem = DTOs.Opendota.PlayerMatches;

const Root = styled("div")(({ theme }) => ({
  width: "100%",
}));

type LastMonthHeatMapProps = {
  account_id: number;
};

const LastMonthHeatMap: FC<LastMonthHeatMapProps> = ({ account_id }) => {
  const { data, isFetching } = opendotaApi.usePlayerMatchesQuery({
    account_id,
    date: 90, // 搜3个月的
    significant: 0,
  });

  const ChartToogle = useClassToggle();

  const values = useMemo<ItemData[]>(() => {
    const memo: Record<string, RowItem[]> = {};
    data?.forEach((item) => {
      const date = dayjs(item.start_time! * 1000).format("YYYY-MM-DD");
      if (!memo[date]) {
        memo[date] = [item];
      } else {
        memo[date].push(item);
      }
    });

    return Object.entries(memo).map(([date, matches]) => ({
      date,
      value: ChartToogle.calcValue(matches),
      payload: matches,
    }));
  }, [data, ChartToogle.calcValue]);

  const renderTooltip: ChartProps["renderTooltip"] = (item) => {
    const date = dayjs(item.date);
    const m = dayjs.months()[date.month()];
    const d = date.get("D");
    const unit = d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th";
    const matches = item.payload || [];

    if (ChartToogle.type === "frequency") {
      return `${matches.length} matches on ${m} ${d}${unit}.`;
    } else {
      const win_matches = matches.filter(isMatchWin);

      return (
        <Box>
          <Box>{`${matches.length} matches on ${m} ${d}${unit}.`}</Box>
          <Box>win: {win_matches.length}</Box>
          <Box>lose: {matches.length}</Box>
        </Box>
      );
    }
  };

  return (
    <Root>
      {isFetching ? (
        <MySkeleton />
      ) : (
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
              ".MuiButtonBase-root": {
                padding: "2px 8px",
                fontSize: "10px",
              },
            }}
          >
            <Typography variant="h6">Activity</Typography>
            <Box>{ChartToogle.button}</Box>
          </Box>

          <HeatMapChart
            xAxis
            yAxis
            values={values}
            renderTooltip={renderTooltip}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "12px",
            }}
          >
            <HeatMapComment />
          </Box>
        </Box>
      )}
    </Root>
  );
};

function useClassToggle() {
  const [type, setType] = useState<"frequency" | "winrate">("frequency");

  const button = (
    <ToggleButtonGroup
      size="small"
      color="primary"
      value={type}
      exclusive
      onChange={(e, v) => setType(v)}
      aria-label="Platform"
    >
      <ToggleButton value="frequency">Freq</ToggleButton>
      <ToggleButton value="winrate">WinR</ToggleButton>
    </ToggleButtonGroup>
  );

  // 给 value 赋值 的函数
  function freqCalcValue(matches: RowItem[]) {
    return matches.length;
  }

  function winrCalcValue(matches: RowItem[]) {
    const win_matches = matches.filter(isMatchWin);

    return win_matches.length / matches.length;
  }

  return {
    type,
    button,
    calcValue: useCallback(
      type === "frequency" ? freqCalcValue : winrCalcValue,
      [type]
    ),
  };
}

function isMatchWin(match: RowItem) {
  if (match.player_slot! < 128 && match.radiant_win) {
    // 玩家在天辉位 天辉赢了
    return true;
  }

  if (match.player_slot! >= 128 && !match.radiant_win) {
    // 玩家在夜魇位 天辉输了
    return true;
  }
  // item.player_slot
  return false;
}

function MySkeleton() {
  return <Box sx={{ padding: "20px" }}></Box>;
}

export default LastMonthHeatMap;

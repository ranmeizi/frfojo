// 这个组件去取数据， 传给 heatmap 组件 heatmap 负责样式
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  alpha,
  Box,
  Skeleton,
  styled,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import HeatMapChart, {
  ItemData,
  ChartProps,
  RefType,
  default_colors,
  EnumItemType,
} from "@/components/HeatMap/Chart";
import { opendotaApi } from "@/redux/queryApis/opendota";
import dayjs from "dayjs";
import { HeatMapComment } from "@/components/HeatMap";
import { green, orange, red, yellow } from "@mui/material/colors";

type RowItem = DTOs.Opendota.PlayerMatches;

const Root = styled("div")(() => ({
  width: "100%",
}));

type LastMonthHeatMapProps = {
  account_id: number;
} & Omit<ChartProps, "values">;

const LastMonthHeatMap: FC<LastMonthHeatMapProps> = ({
  account_id,
  ...chartProps
}) => {
  const { data } = opendotaApi.usePlayerMatchesQuery({
    account_id,
    date: 90, // 搜3个月的
    significant: 0,
  });

  const chartRef = useRef<RefType>(null);

  const ChartToogle = useClassToggle();

  useEffect(() => {
    const memo: Record<string, RowItem[]> = {};
    data?.forEach((item) => {
      const date = dayjs(item.start_time! * 1000).format("YYYY-MM-DD");
      if (!memo[date]) {
        memo[date] = [item];
      } else {
        memo[date].push(item);
      }
    });

    const values = Object.entries(memo).map(([date, matches]) => ({
      date,
      value: ChartToogle.calcValue(matches),
      payload: matches,
    }));

    // 更新数据
    chartRef.current?.setData(values);
  }, [data, ChartToogle.calcValue]);

  const renderTooltip: ChartProps["renderTooltip"] = (item) => {
    const date = dayjs(item.date);
    const m = dayjs.months()[date.month()];
    const d = date.get("D");
    const unit = d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th";
    const matches = item.payload || [];

    const win_matches = matches.filter(isMatchWin);

    return (
      <Box>
        <Box>{`${matches.length} matches on ${m} ${d}${unit}.`}</Box>
        <Box display="flex" alignItems="baseline" justifyContent="center">
          <Typography sx={{ color: green["700"] }}>
            {win_matches.length}
          </Typography>
          <Typography sx={{ margin: "0 8px" }}>-</Typography>
          <Typography sx={{ color: red["700"] }}>
            {matches.length - win_matches.length}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Root>
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
          ref={chartRef}
          renderTooltip={renderTooltip}
          colors={ChartToogle.colors}
          onCellClick={(item) => {
            alert(
              `Date:${item.date}, open a modal with ${item.payload.length} matches `
            );
          }}
          {...chartProps}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "12px",
          }}
        >
          <HeatMapComment colors={ChartToogle.colors} />
        </Box>
      </Box>
    </Root>
  );
};

const a = 0.5;
const win_colors = {
  [EnumItemType["平平的"]]: alpha(red["900"], a), // 0~20
  [EnumItemType["有一点"]]: alpha(orange["600"], a), // 40~60
  [EnumItemType["有意思"]]: alpha(yellow["600"], a), // 60~80
  [EnumItemType["卧槽了"]]: alpha(green["A400"], a), // 80%~100
  [EnumItemType["假的"]]: "#161b22",
};

function useClassToggle() {
  const [type, setType] = useState<"frequency" | "winrate">("frequency");

  const button = (
    <ToggleButtonGroup
      size="small"
      color="primary"
      value={type}
      exclusive
      onChange={(_, v) => setType(v)}
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

    return win_matches.length / matches.length + 0.01;
  }

  return {
    type,
    button,
    calcValue: useCallback(
      type === "frequency" ? freqCalcValue : winrCalcValue,
      [type]
    ),
    colors: useMemo(
      () => (type === "frequency" ? default_colors : win_colors),
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

export default LastMonthHeatMap;

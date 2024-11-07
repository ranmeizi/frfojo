/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box, styled } from "@mui/material";
import dayjs from "dayjs";
import useRefState from "@frfojo/common/hooks/useRefState";

const GAP_K = 4;

const Root = styled("div")<{ width: number }>(({ theme, width }) => {
  const gap = Math.floor(width / GAP_K);
  return {
    width: "100%",
    display: "flex",
    gap,

    ".heatmap-col": {
      display: "flex",
      flexDirection: "column",
      gap,
    },

    ".heatmap-item": {
      height: width + "px",
      width: width + "px",
      borderRadius: "2px",
    },
  };
});

type SizeProps = {
  size?: "small" | "middle" | "large";
};

export type ItemData = {
  date: string;
  value: number;
  payload: any;
};

type ChartProps = {
  values: ItemData[];
} & SizeProps;

export enum EnumItemType {
  "平平的" = "L0",
  "一丢丢" = "L1",
  "有一点" = "L2",
  "有意思" = "L3",
  "卧槽了" = "L4",
  "假的" = "L9",
}

export const colors = {
  [EnumItemType.平平的]: "#161b22", // 在数据 start - end 的空数据(value = 0) 是 L0
  [EnumItemType.一丢丢]: "#0e4429", // L1 value > 0  value<= L2
  [EnumItemType.有一点]: "#006d32", // L2 value > L1 value<= L3
  [EnumItemType.有意思]: "#26a641", // L3 value > L2 value<= L4
  [EnumItemType.卧槽了]: "#39d353", // L4 value > L3
  [EnumItemType.假的]: "linear-gradient(to right, #cccccc, #eeeeee)", // 在数据 start - end 之外的格子，就是 L9 空数据
};

const sizes = {
  small: 12,
  middle: 18,
  large: 24,
};

const Chart: FC<ChartProps> = ({ size = "small", values = [] }) => {
  const Grid = useGridData({ size });
  const width = sizes[size];

  const el = useRef<HTMLDivElement>(null);

  function init() {
    const maxWidth = el.current?.clientWidth;
    if (!maxWidth) {
      return;
    }

    Grid.init(maxWidth);
  }

  useEffect(() => {
    // setTimeout(() => {
    //   init();
    // }, 50);
  }, []);

  // 分段
  const range = useMemo(() => {
    if (values.length === 0) {
      return [0, 0, 0, 0] as const;
    }

    const max = Math.max(...values.map((item) => item.value));

    return [0, max / 4, (max * 2) / 4, (max * 3) / 4, max] as const;
  }, [values]);

  useEffect(() => {
    init();
    // setItem
    values.forEach((item) => Grid.setItem(item.date, item));
  }, [values]);

  return (
    <Root width={width} ref={el}>
      {Grid.grid
        ? Grid.grid.map((col) => (
            <WeekCol>
              {col.map((item) => {
                // 使用最大值判断类型
                return <Item range={range} item={item} />;
              })}
            </WeekCol>
          ))
        : null}
    </Root>
  );
};

export function WeekCol({ children }: PropsWithChildren) {
  return <Box className="heatmap-col">{children}</Box>;
}

type ItemProps = {
  range: readonly [0, number, number, number, number];
  item: ItemData;
};

export function Item({ range, item }: ItemProps) {
  const type = useMemo(() => {
    const value = item.value;

    if (value === 0) {
      return EnumItemType.平平的;
    }

    // L4
    if (value > range[3]) {
      return EnumItemType.卧槽了;
    }

    if (value > range[2]) {
      return EnumItemType.有意思;
    }

    if (value > range[1]) {
      return EnumItemType.有一点;
    }

    if (value > range[0]) {
      return EnumItemType.一丢丢;
    }

    return EnumItemType.假的;
  }, [range, item]);

  console.log("item", item, "type", type);

  const color = colors[type];

  return <Box className="heatmap-item" sx={{ background: color }} />;
}

export default Chart;

/**
 * 计算生成 grid 数据
 * 根据 元素宽度 计算出有多少列
 *
 * 返回
 *  列(week) 数组 ItemData[][]
 *  日期索引 [col,row]
 *  method：按日期设置 grid item
 */
function useGridData({ size = "small" }: SizeProps) {
  const [grid, setGrid, refGrid] = useRefState<ItemData[][]>();
  const [dateIndex, setDateIndex] = useState<Record<string, [number, number]>>(
    {}
  );

  /**
   * 初始化 grid 和 dateIndex
   */
  function init(maxWidth: number) {
    const width = sizes[size];
    const gap = Math.floor(width / GAP_K);

    console.log("maxWidth", maxWidth);

    if (!maxWidth) {
      return;
    }
    // 可以容纳几列(zhou)？
    const oneset = width + gap;

    const maxCol = Math.floor((maxWidth - gap) / oneset);

    // 创建 grid
    const initGrid = Array(maxCol + 1)
      .fill(1)
      .map((_: any) => [] as ItemData[]);

    const now = dayjs();

    // 最左边一周
    const start = now.subtract(maxCol, "week");

    // 最左边第一天
    const startDay = start
      .set("day", 0)
      .set("hour", 0)
      .set("minute", 0)
      .set("second", 0);

    // 填充 grid
    let i = 0;
    while (true) {
      const date = startDay.add(i, "day");

      // 超过今天啦 或者你是不是设多了
      if (date > now || i > 2000) {
        break;
      }

      const dateString = date.format("YYYY-MM-DD");

      const col = Math.floor(i / 7);
      const row = i % 7;

      initGrid[col][row] = {
        date: dateString,
        value: 0,
        payload: undefined,
      };
      dateIndex[dateString] = [col, row];

      i++;
    }

    setGrid(initGrid);
    setDateIndex({ ...dateIndex });
  }

  /**
   * sync 如果保证这是同步调用，那么状态合并的工作将交给 react
   */
  function setItem(
    date: string,
    { value, payload }: Pick<ItemData, "value" | "payload">
  ) {
    const [weekIndex, dayIndex] = dateIndex[date] || [];

    const grid = refGrid.current;

    if (dateIndex[date] === undefined) {
      // 日期不存在，不处理了
      return;
    }

    /** 重建 item */
    grid![weekIndex][dayIndex] = {
      ...grid![weekIndex][dayIndex],
      value,
      payload,
    };

    setGrid([...grid!]);
  }

  return { init, setItem, grid, dateIndex };
}

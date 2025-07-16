/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  forwardRef,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box, BoxProps, styled, Tooltip } from "@mui/material";
import dayjs from "dayjs";
import { useRefState } from "@frfojo/common/hooks";
import localeData from "dayjs/plugin/localeData";

dayjs.extend(localeData);
/** gap 倍率 */
const GAP_K = 4;

const Root = styled("div")<{ width: number; xAxis: boolean; yAxis: boolean }>(
  ({ width, xAxis, yAxis }) => {
    const gap = Math.floor(width / GAP_K);

    const cssYAxis = yAxis
      ? {
          ".heatmap-col:first-child": {
            ".heatmap-item": {
              position: "relative",
              display: "flex",
              alignItems: "center",
            },

            // 第二个 标 Mon day =1
            ".heatmap-item:nth-child(2)": {
              "&::before": {
                position: "absolute",
                content: '"Mon"',
                fontSize: "10px",
                left: "-24px",
              },
            },
            // 第4个 标 Wed day =3
            ".heatmap-item:nth-child(4)": {
              "&::before": {
                position: "absolute",
                content: '"Wed"',
                fontSize: "10px",
                left: "-24px",
              },
            },

            // 第6个 标 Fri day =5
            ".heatmap-item:nth-child(6)": {
              "&::before": {
                position: "absolute",
                content: '"Fri"',
                fontSize: "10px",
                left: "-24px",
              },
            },
          },
        }
      : {};

    return {
      width: "100%",
      display: "flex",
      justifyContent: "center",
      // 给坐标轴让出空间
      paddingTop: xAxis ? "18px" : "",
      paddingLeft: yAxis ? "24px" : "",

      ".heatmap-chart-container": {
        display: "flex",
        gap,
        flex: 1,
      },

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
      ...cssYAxis,
    };
  }
);

type SizeProps = {
  size?: "small" | "middle" | "large";
};

export type ItemData = {
  date: string;
  value: number;
  payload: any;
};

export type ChartProps = {
  xAxis?: boolean; // 显示 X 轴月份
  yAxis?: boolean; // 显示 Y 轴周
  renderTooltip?: (item: ItemData) => ReactNode;
  renderCell?: (item: ItemData) => ReactNode;
  onCellClick?: (item: ItemData) => void;
  colors?: typeof default_colors;
} & SizeProps;

export enum EnumItemType {
  "平平的" = "L0",
  "有一点" = "L1",
  "有意思" = "L2",
  "卧槽了" = "L3",
  "假的" = "L9",
}

export const default_colors = {
  [EnumItemType.平平的]: "#0e4429", // 在数据 start - end 的空数据(value = 0) 是 L0
  [EnumItemType.有一点]: "#006d32", // L2 value > L1 value<= L3
  [EnumItemType.有意思]: "#26a641", // L3 value > L2 value<= L4
  [EnumItemType.卧槽了]: "#39d353", // L4 value > L3
  [EnumItemType.假的]: "#161b22", // 在数据 start - end 之外的格子，就是 L9 空数据
};

export const sizes = {
  small: 12,
  middle: 18,
  large: 24,
};

export type RefType = {
  init: () => void;
  setData: (v: ItemData[]) => void;
};

const Chart = forwardRef<RefType, ChartProps>(
  (
    {
      size = "small",
      xAxis = false,
      yAxis = false,
      renderTooltip,
      onCellClick,
      renderCell = () => null,
      colors = default_colors,
    },
    ref
  ) => {
    const Grid = useGridData({ size });
    const width = sizes[size];
    const [values, setValues] = useState<ItemData[]>([]);

    const el = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => {
      return {
        init,
        setData: setValues,
      };
    });

    function init() {
      const maxWidth = el.current?.clientWidth;
      if (!maxWidth) {
        return;
      }

      Grid.init(maxWidth);
    }

    // 分段
    const range = useMemo(() => {
      if (values.length === 0) {
        return [0, 0, 0, 0, 0] as const;
      }

      const max = Math.max(...values.map((item) => item.value));

      return [0, (max * 1) / 4, (max * 2) / 4, (max * 3) / 4, max] as const;
    }, [values]);

    useEffect(() => {
      init();
      // setItem
      values.forEach((item) => Grid.setItem(item.date, item));
    }, [values]);

    return (
      <Root width={width} xAxis={xAxis} yAxis={yAxis}>
        <Box className="heatmap-chart-container" ref={el}>
          {Grid.grid
            ? Grid.grid.map((col) => (
                <WeekCol>
                  {col.map((item) => {
                    const [_, rIndex] = Grid.dateIndex[item.date] || [];
                    // 如果是 row === 0 ，并且 取到的 date <= 7 (1~7) 前 7 天
                    const d = dayjs(item.date);
                    const isTheFirstCol = rIndex === 0 && d.date() <= 7;

                    return xAxis && isTheFirstCol ? (
                      <Item
                        range={range}
                        item={item}
                        renderTooltip={renderTooltip}
                        onClick={() => onCellClick && onCellClick(item)}
                        colors={colors}
                        sx={() => {
                          return {
                            position: "relative",
                            "&:before": {
                              position: "absolute",
                              top: "-14px",
                              content: `"${dayjs.monthsShort()[d.month()]}"`,
                              fontSize: "10px",
                            },
                          };
                        }}
                      >
                        {renderCell(item)}
                      </Item>
                    ) : (
                      <Item
                        range={range}
                        item={item}
                        colors={colors}
                        renderTooltip={renderTooltip}
                        onClick={() => onCellClick && onCellClick(item)}
                      >
                        {renderCell(item)}
                      </Item>
                    );
                  })}
                </WeekCol>
              ))
            : null}
        </Box>
      </Root>
    );
  }
);

export function WeekCol({ children }: PropsWithChildren) {
  return <Box className="heatmap-col">{children}</Box>;
}

type ItemProps = {
  range: readonly [0, number, number, number, number];
  item: ItemData;
  renderTooltip?: (item: ItemData) => ReactNode;
  colors: ChartProps["colors"];
} & BoxProps;

export function Item({
  range,
  item,
  renderTooltip,
  children,
  colors = default_colors,
  ...props
}: PropsWithChildren<ItemProps>) {
  const type = useMemo(() => {
    const value = item.value;

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
      return EnumItemType.平平的;
    }

    return EnumItemType.假的;
  }, [range, item]);

  const color = colors[type];

  return (
    <Box className="heatmap-item" bgcolor={color} {...props}>
      {renderTooltip ? (
        <Tooltip title={renderTooltip(item)} placement="top" enterDelay={0}>
          <Box
            sx={{
              height: "100%",
              width: "100%",
              position: "relative",
            }}
          >
            {children}
          </Box>
        </Tooltip>
      ) : null}
    </Box>
  );
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
        value: -1,
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

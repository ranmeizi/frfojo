// 这个组件去取数据， 传给 heatmap 组件 heatmap 负责样式
import { FC } from "react";
import { styled } from "@mui/material";

const Root = styled("div")(({ theme }) => ({}));

type LastMonthHeatMapProps = {
  account_id: number;
};

const LastMonthHeatMap: FC<LastMonthHeatMapProps> = (props) => {
  return <Root>Component LastMonthHeatMap</Root>;
};

export default LastMonthHeatMap;

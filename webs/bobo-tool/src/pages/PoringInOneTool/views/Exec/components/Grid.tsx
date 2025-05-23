import { FC } from "react";
import { Box, styled } from "@mui/material";
import "./Grid.less";

const Root = styled("div")(({ theme }) => ({
  background: "#bbada0",
  padding: "15px",
  borderRadius: "6px",
}));

const initial = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

type GridProps = {
  data: [
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number]
  ];
};

const Grid: FC<GridProps> = ({ data = initial }) => {
  return (
    <Root>
      <Box className='className="grid-container"'>
        {data.map((row) => (
          <Box className="grid-row" display="flex" flexDirection="row">
            {row.map((col) => (
              <Box className="grid-cell">
                <Tile value={col} />
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Root>
  );
};

function Tile({ value }: { value: number }) {
  return value ? <Box className={`tile tail-${value}`}>{value}</Box> : null;
}

export default Grid;

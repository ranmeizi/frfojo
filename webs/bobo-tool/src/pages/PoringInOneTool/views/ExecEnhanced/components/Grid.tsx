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
      <Box className="grid-container">
        {data.map((row, ri) => (
          <Box
            key={ri}
            className="grid-row"
            display="flex"
            flexDirection="row"
          >
            {row.map((col, ci) => (
              <Box key={ci} className="grid-cell">
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
  if (!value) {
    return null;
  }
  const tileClass = value > 2048 ? "tile tile-super" : `tile tile-${value}`;
  return <Box className={tileClass}>{value}</Box>;
}

export default Grid;

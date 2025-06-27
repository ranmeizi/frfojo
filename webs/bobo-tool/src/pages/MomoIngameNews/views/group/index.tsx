import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import { rewardsStatistic } from "../../services/momoro";

const columns: GridColDef<any>[] = [
  { field: "subject", headerName: "主体", width: 200 },
  { field: "cnt", headerName: "次数", width: 200 },
];

export default function Group() {
  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [type, setType] = useState<"1" | "2">("1");

  async function getData() {
    setLoading(true);
    try {
      const res = await rewardsStatistic({ search, type });
      setData(res?.data || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom component="div" sx={{ p: 2 }}>
        按人物 / 按物品 统计掉落
      </Typography>
      <Box
        display="flex"
        sx={{
          containerType: "inline-size",
          containerName: "sidebar",
          gap: "16px",

          "@container sidebar(width < 400px)": {
            ".form-item": {
              width: "100%",
            },
          },

          ".form-item": {
            width: "50%",
          },
        }}
      >
        <Box className="form-item" sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">统计维度</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={type}
              size="small"
              label="统计维度"
              onChange={(e) => {
                const value = e.target.value;
                setType(value);
              }}
            >
              <MenuItem value={"1"}>按物品统计</MenuItem>
              <MenuItem value={"2"}>按人物统计</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box className="form-item">
          <TextField
            id="outlined-basic"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            label={type === "1" ? "物品id" : "人物名称"}
            placeholder={type === "1" ? "请输入物品名或ID" : "请输入人物名称"}
            variant="outlined"
            sx={{ width: "100%" }}
          />
        </Box>
      </Box>
      {/* 刷新按钮 */}
      <Button
        fullWidth
        loading={loading}
        loadingPosition="start"
        startIcon={<RefreshIcon />}
        variant="outlined"
        onClick={() => getData()}
        sx={{ mb: 2 }}
      >
        查询
      </Button>
      <DataGrid
        getRowId={(row) => row.subject}
        rows={data}
        columns={columns}
        paginationMode="server"
      />
    </Box>
  );
}

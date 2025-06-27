import { Box, Button, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import { getRewardRank } from "../../services/momoro";

const columns: GridColDef<any>[] = [
  { field: "subject", headerName: "游戏id", width: 200 },
  {
    field: "cnt",
    headerName: "次数",
    width: 100,
  },
];

export default function Ranking() {
  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    setLoading(true);
    try {
      const res = await getRewardRank();
      setData(res.data || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom component="div" sx={{ p: 2 }}>
        获取 discord ingame news 上已公开的 掉落/偷窃 获取的上电视次数排名
      </Typography>
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
        刷新
      </Button>
      <DataGrid getRowId={(row) => row.subject} rows={data} columns={columns} />
    </Box>
  );
}

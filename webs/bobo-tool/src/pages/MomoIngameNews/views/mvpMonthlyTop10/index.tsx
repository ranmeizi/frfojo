import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useEffect, useState } from "react";
import { getMvpMonthlyTop10 } from "../../services/momoro";

type Row = { month_key: string; month_ranking: string };

export default function MvpMonthlyTop10() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const res: any = await getMvpMonthlyTop10();
      setRows((res?.data || []) as Row[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  return (
    <Box>
      <Typography variant="h6" gutterBottom component="div" sx={{ p: 2 }}>
        月度 MVP 击杀 Top10
      </Typography>

      <Button
        fullWidth
        startIcon={<RefreshIcon />}
        variant="outlined"
        onClick={refresh}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        刷新
      </Button>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>month_key</TableCell>
              <TableCell>month_ranking</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, idx) => (
              <TableRow key={`${r.month_key}-${idx}`}>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{r.month_key}</TableCell>
                <TableCell>{r.month_ranking}</TableCell>
              </TableRow>
            ))}
            {!rows.length ? (
              <TableRow>
                <TableCell colSpan={2} sx={{ color: "text.secondary" }}>
                  暂无数据
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}


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
import { getMvpSubjectObjectDetail } from "../../services/momoro";

type Row = { subject: string; cnt: string | number; detail: string };

export default function MvpSubjectObjectDetail() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const res: any = await getMvpSubjectObjectDetail();
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
        MVP 击杀总榜及对象明细
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
              <TableCell>subject</TableCell>
              <TableCell align="right">cnt</TableCell>
              <TableCell>detail</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, idx) => (
              <TableRow key={`${r.subject}-${idx}`}>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{r.subject}</TableCell>
                <TableCell align="right">{r.cnt}</TableCell>
                <TableCell>{r.detail}</TableCell>
              </TableRow>
            ))}
            {!rows.length ? (
              <TableRow>
                <TableCell colSpan={3} sx={{ color: "text.secondary" }}>
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


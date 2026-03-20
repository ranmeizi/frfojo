import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Stack,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useMemo, useState } from "react";
import { getObjectSubjectRank } from "../../services/momoro";

type Row = {
  object: string;
  objectId: string;
  subject: string;
  cnt: string | number;
};

export default function StatObjectSubjectRank() {
  const [object, setObject] = useState("");
  const [objectId, setObjectId] = useState("");
  const [type, setType] = useState("1,2");
  const [limit, setLimit] = useState("50");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  const params = useMemo(() => {
    return {
      object: object.trim() || undefined,
      objectId: objectId.trim() || undefined,
      type: type.trim() || undefined,
      limit: limit.trim() || undefined,
    };
  }, [object, objectId, type, limit]);

  async function query() {
    if (!params.object && !params.objectId) {
      setError("object 和 objectId 至少传一个");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await getObjectSubjectRank(params);
      setRows((res?.data || []) as Row[]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "查询失败";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom component="div" sx={{ p: 2 }}>
        按对象统计 subject 排行（object/objectId + type）
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: { sm: "flex-end" } }}
        >
          <TextField
            size="small"
            value={object}
            onChange={(e) => setObject(e.target.value)}
            label="object"
            placeholder="如 RSX-0806"
            sx={{ flex: 1, minWidth: 180 }}
          />
          <TextField
            size="small"
            value={objectId}
            onChange={(e) => setObjectId(e.target.value)}
            label="objectId"
            placeholder="如 10806"
            sx={{ flex: 1, minWidth: 180 }}
          />
          <FormControl size="small" sx={{ width: { xs: "100%", sm: 200 } }}>
            <InputLabel id="momoro-rank-type-label">type</InputLabel>
            <Select
              labelId="momoro-rank-type-label"
              multiple
              value={type.split(",").filter(Boolean)}
              onChange={(e) => {
                const value = e.target.value;
                setType(typeof value === "string" ? value : value.join(","));
              }}
              input={<OutlinedInput label="type" />}
            >
              <MenuItem value={"0"}>MVP击杀</MenuItem>
              <MenuItem value={"1"}>获取</MenuItem>
              <MenuItem value={"2"}>偷窃</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            label="limit"
            placeholder="默认 50，最大 200"
            sx={{ width: { xs: "100%", sm: 180 } }}
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={query}
            disabled={loading}
          >
            查询
          </Button>
        </Stack>
        {error ? <Alert sx={{ mt: 2 }} severity="warning">{error}</Alert> : null}
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>object</TableCell>
              <TableCell>objectId</TableCell>
              <TableCell>subject</TableCell>
              <TableCell align="right">cnt</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, idx) => (
              <TableRow key={`${r.object}-${r.objectId}-${r.subject}-${idx}`}>
                <TableCell>{r.object}</TableCell>
                <TableCell>{r.objectId}</TableCell>
                <TableCell>{r.subject}</TableCell>
                <TableCell align="right">{r.cnt}</TableCell>
              </TableRow>
            ))}
            {!rows.length ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ color: "text.secondary" }}>
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


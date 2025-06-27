import {
  Box,
  Button,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import { searchNews } from "../../services/momoro";
import { EnumMsgType } from "../../note";

const columns: GridColDef<any>[] = [
  { field: "subject", headerName: "游戏id", width: 200 },
  { field: "object", headerName: "对象", width: 200 },
  {
    field: "objectId",
    headerName: "对象id",
    width: 100,
    renderCell(params) {
      const type = params.row.type;
      if (type === EnumMsgType.偷窃信息 || type === EnumMsgType.掉落信息) {
        const url = `https://ratemyserver.net/index.php?iname=${params.row.objectId}&page=item_db&quick=1&isearch=Search`;
        return (
          <Button
            onClick={() => {
              window.open(url, "_blank");
            }}
          >
            {params.value}
          </Button>
        );
      } else if (type === EnumMsgType.MVP击杀信息) {
        const url = `https://ratemyserver.net/index.php?mob_name=${params.row.objectId}&page=mob_db&quick=1&f=1&mob_search=Search`;
        return (
          <Button
            onClick={() => {
              window.open(url, "_blank");
            }}
          >
            {params.value}
          </Button>
        );
      }
      return params.value;
    },
  },
  {
    field: "type",
    headerName: "类型",
    width: 100,
    renderCell(params) {
      return EnumMsgType[params.value];
    },
  },
];

export default function Search() {
  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);

  const [{ total, ...pagination }, setPagination] = useState({
    page: 0,
    pageSize: 20,
    total: 0,
  });

  const [search, setSearch] = useState("");
  const [type, setType] = useState("1,2");

  useEffect(() => {
    getData(pagination.page, pagination.pageSize);
  }, []);

  async function getData(page, pageSize) {
    setLoading(true);
    try {
      const res = await searchNews({
        current: page + 1,
        pageSize: pageSize,
        search,
        type,
      });
      setData(res.data?.list || []);
      setPagination({
        page,
        pageSize,
        total: res.data?.total,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom component="div" sx={{ p: 2 }}>
        获取 discord ingame news 查询删选 news
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
        <Box className="form-item">
          <TextField
            id="outlined-basic"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            label="关键字搜索"
            placeholder="游戏ID/物品名称/MVP名称/物品id"
            variant="outlined"
            sx={{ width: "100%" }}
          />
        </Box>
        <Box className="form-item" sx={{ mb: 2 }}>
          <Select
            size="small"
            labelId="demo-multiple-name-label"
            id="demo-multiple-name"
            multiple
            value={type.split(",")}
            onChange={(e) => {
              const value = e.target.value;
              console.log("vvvvvvv", value);
              setType(typeof value === "string" ? value : value.join(","));
            }}
            input={<OutlinedInput label="Name" />}
            sx={{ width: "100%" }}
          >
            <MenuItem value={"0"}>Mvp击杀</MenuItem>
            <MenuItem value={"1"}>获取</MenuItem>
            <MenuItem value={"2"}>偷窃</MenuItem>
          </Select>
        </Box>
      </Box>
      {/* 刷新按钮 */}
      <Button
        fullWidth
        loading={loading}
        loadingPosition="start"
        startIcon={<RefreshIcon />}
        variant="outlined"
        onClick={() => getData(0, pagination.pageSize)}
        sx={{ mb: 2 }}
      >
        查询
      </Button>
      <DataGrid
        getRowId={(row) => row.key}
        rows={data}
        columns={columns}
        rowCount={total}
        paginationMode="server"
        paginationModel={{
          page: pagination.page,
          pageSize: pagination.pageSize,
        }}
        onPaginationModelChange={(p) => getData(p.page, p.pageSize)}
      />
    </Box>
  );
}

import type { ProColumns } from "@ant-design/pro-components";
import { Button, Space, Tag } from "antd";

export const COL = (actions: {
  onEdit: (row: DTOs.UserCenterPermissions.QueryPermissions) => void;
  onDelete: (row: DTOs.UserCenterPermissions.QueryPermissions) => void;
}): ProColumns<DTOs.UserCenterPermissions.QueryPermissions>[] => [
  {
    title: "权限名",
    dataIndex: "name",
    width: 200,
    ellipsis: true,
    formItemProps: { name: "search" },
  },
  {
    title: "资源",
    dataIndex: "resource",
    width: 160,
    ellipsis: true,
  },
  {
    title: "动作",
    dataIndex: "action",
    width: 140,
    ellipsis: true,
  },
  {
    title: "说明",
    dataIndex: "description",
    ellipsis: true,
    hideInSearch: true,
    render: (_, row) => row.description || "-",
  },
  {
    title: "系统",
    dataIndex: "isSystem",
    width: 100,
    hideInSearch: true,
    render: (_, row) => (row.isSystem ? <Tag color="gold">系统</Tag> : "-"),
  },
  {
    title: "创建时间",
    dataIndex: "createdAt",
    width: 160,
    hideInSearch: true,
  },
  {
    title: "操作",
    key: "options",
    valueType: "option",
    width: 200,
    fixed: "right",
    render: (_, row) => (
      <Space size={8}>
        <Button size="small" type="link" onClick={() => actions.onEdit(row)}>
          编辑
        </Button>
        <Button
          size="small"
          type="link"
          danger
          disabled={row.isSystem}
          onClick={() => actions.onDelete(row)}
        >
          删除
        </Button>
      </Space>
    ),
  },
];


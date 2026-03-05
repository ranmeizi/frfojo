import type { ProColumns } from "@ant-design/pro-components";
import { Button, Space, Tag } from "antd";

export const COL = (actions: {
  onEdit: (row: DTOs.UserCenterRoles.QueryRoles) => void;
  onPermissions: (row: DTOs.UserCenterRoles.QueryRoles) => void;
  onDelete: (row: DTOs.UserCenterRoles.QueryRoles) => void;
}): ProColumns<DTOs.UserCenterRoles.QueryRoles>[] => [
  {
    title: "角色名",
    dataIndex: "name",
    width: 180,
    ellipsis: true,
    formItemProps: { name: "search" },
  },
  {
    title: "说明",
    dataIndex: "description",
    ellipsis: true,
    hideInSearch: true,
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
    width: 140,
    hideInSearch: true,
  },
  {
    title: "更新时间",
    dataIndex: "updatedAt",
    width: 140,
    hideInSearch: true,
  },
  {
    title: "操作",
    key: "options",
    valueType: "option",
    width: 240,
    fixed: "right",
    render: (_, row) => (
      <Space size={8}>
        <Button size="small" type="link" onClick={() => actions.onEdit(row)}>
          编辑
        </Button>
        <Button
          size="small"
          type="link"
          onClick={() => actions.onPermissions(row)}
        >
          权限
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


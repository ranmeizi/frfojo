import type { ProColumns } from "@ant-design/pro-components";
import { Button, Space, Tag } from "antd";

export const COL = (actions: {
  onEdit: (row: DTOs.UserCenterUsers.QueryUsers) => void;
  onRoles: (row: DTOs.UserCenterUsers.QueryUsers) => void;
  onDelete: (row: DTOs.UserCenterUsers.QueryUsers) => void;
}): ProColumns<DTOs.UserCenterUsers.QueryUsers>[] => [
  {
    title: "用户名",
    dataIndex: "username",
    width: 160,
    ellipsis: true,
    formItemProps: { name: "search" },
  },
  {
    title: "邮箱",
    dataIndex: "email",
    width: 220,
    ellipsis: true,
    hideInSearch: true,
  },
  {
    title: "昵称",
    dataIndex: "nickname",
    width: 140,
    ellipsis: true,
    hideInSearch: true,
    render: (_, row) => row.nickname || "-",
  },
  {
    title: "状态",
    dataIndex: "status",
    width: 120,
    valueType: "select",
    valueEnum: {
      active: { text: "active" },
      inactive: { text: "inactive" },
      locked: { text: "locked" },
    },
    render: (_, row) => {
      const c =
        row.status === "active"
          ? "green"
          : row.status === "locked"
            ? "red"
            : "default";
      return <Tag color={c}>{row.status}</Tag>;
    },
  },
  {
    title: "邮箱验证",
    dataIndex: "emailVerified",
    width: 120,
    hideInSearch: true,
    render: (_, row) => (row.emailVerified ? "是" : "否"),
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
    width: 220,
    fixed: "right",
    render: (_, row) => (
      <Space size={8}>
        <Button size="small" type="link" onClick={() => actions.onEdit(row)}>
          编辑
        </Button>
        <Button size="small" type="link" onClick={() => actions.onRoles(row)}>
          角色
        </Button>
        <Button
          size="small"
          type="link"
          danger
          onClick={() => actions.onDelete(row)}
        >
          删除
        </Button>
      </Space>
    ),
  },
];


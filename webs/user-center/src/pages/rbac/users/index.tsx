import type { ActionType, ProColumns } from "@ant-design/pro-components";
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProTable,
} from "@ant-design/pro-components";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Modal, Space, Tag, message } from "antd";
import React, { useMemo, useRef, useState } from "react";
import { COL } from "./columns.config";
import * as S from "./service";

export default function UsersPage() {
  const actionRef = useRef<ActionType>();

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<DTOs.UserCenterUsers.QueryUsers | null>(
    null,
  );

  const [rolesOpen, setRolesOpen] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [roleOptions, setRoleOptions] = useState<DTOs.UserCenterUsers.QueryRoles[]>(
    [],
  );
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [userRoles, setUserRoles] = useState<DTOs.UserCenterUsers.QueryRoles[]>([]);

  const columns = useMemo(() => {
    return COL({
      onEdit: (row) => {
        setEditing(row);
        setEditOpen(true);
      },
      onRoles: async (row) => {
        setEditing(row);
        setRolesOpen(true);
        setRolesLoading(true);
        try {
          const [all, mine] = await Promise.all([
            S.listRoles({ current: 1, pageSize: 999 }),
            S.getUserRoles({ userId: row.id }),
          ]);
          setRoleOptions(all.data?.list || []);
          const mr = mine.data || [];
          setUserRoles(mr);
          setSelectedRoleIds(mr.map((r) => r.id));
        } finally {
          setRolesLoading(false);
        }
      },
      onDelete: async (row) => {
        await new Promise<void>((resolve) => {
          Modal.confirm({
            title: "删除用户",
            content: `确认删除用户 ${row.username}？`,
            okText: "删除",
            cancelText: "取消",
            onOk: async () => {
              const res = await S.deleteUser({ id: row.id });
              if (res.code === "000000") {
                message.success("已删除");
                actionRef.current?.reload();
              } else {
                message.error(res.msg || "删除失败");
              }
              resolve();
            },
            onCancel: () => resolve(),
          });
        });
      },
    });
  }, []);

  return (
    <>
      <ProTable<DTOs.UserCenterUsers.QueryUsers>
        rowKey="id"
        actionRef={actionRef}
        columns={columns as ProColumns<DTOs.UserCenterUsers.QueryUsers>[]}
        options={false}
        search={{ span: 6 }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setEditOpen(true);
            }}
          >
            新建用户
          </Button>,
        ]}
        request={async (params) => {
          const res = await S.listUsers({
            current: params.current,
            pageSize: params.pageSize,
            search: (params as any).search,
            status: (params as any).status,
          });

          if (res.code !== "000000") {
            return { data: [], success: false, total: 0 };
          }

          return { data: res.data.list, success: true, total: res.data.total };
        }}
      />

      <ModalForm
        title={editing ? "编辑用户" : "新建用户"}
        open={editOpen}
        modalProps={{ destroyOnClose: true, onCancel: () => setEditOpen(false) }}
        initialValues={editing || { status: "active" }}
        onFinish={async (values) => {
          if (editing) {
            const res = await S.updateUser({
              id: editing.id,
              nickname: values.nickname,
              picture: values.picture,
              status: values.status,
            });
            if (res.code === "000000") {
              message.success("已更新");
              setEditOpen(false);
              actionRef.current?.reload();
              return true;
            }
            message.error(res.msg || "更新失败");
            return false;
          }

          const res = await S.createUser({
            username: values.username,
            email: values.email,
            password: values.password,
            nickname: values.nickname,
            picture: values.picture,
          });
          if (res.code === "000000") {
            message.success("已创建");
            setEditOpen(false);
            actionRef.current?.reload();
            return true;
          }
          message.error(res.msg || "创建失败");
          return false;
        }}
      >
        {editing ? null : (
          <>
            <ProFormText name="username" label="用户名" rules={[{ required: true }]} />
            <ProFormText name="email" label="邮箱" />
            <ProFormText.Password
              name="password"
              label="密码"
              rules={[{ required: true }]}
            />
          </>
        )}
        <ProFormText name="nickname" label="昵称" />
        <ProFormText name="picture" label="头像 URL" />
        <ProFormSelect
          name="status"
          label="状态"
          valueEnum={{
            active: { text: "active" },
            inactive: { text: "inactive" },
            locked: { text: "locked" },
          }}
        />
      </ModalForm>

      <Modal
        title={editing ? `配置角色：${editing.username}` : "配置角色"}
        open={rolesOpen}
        confirmLoading={rolesLoading}
        onCancel={() => setRolesOpen(false)}
        onOk={async () => {
          if (!editing) return;
          setRolesLoading(true);
          try {
            const next = new Set(selectedRoleIds);
            const prev = new Set((userRoles || []).map((r) => r.id));
            const toAdd: string[] = [];
            const toRemove: string[] = [];
            next.forEach((id) => !prev.has(id) && toAdd.push(id));
            prev.forEach((id) => !next.has(id) && toRemove.push(id));

            await Promise.all([
              ...toAdd.map((roleId) => S.bindRole({ userId: editing.id, roleId })),
              ...toRemove.map((roleId) =>
                S.removeRole({ userId: editing.id, roleId }),
              ),
            ]);

            message.success("已更新角色");
            setRolesOpen(false);
          } finally {
            setRolesLoading(false);
          }
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {roleOptions.map((r) => {
            const active = selectedRoleIds.includes(r.id);
            return (
              <Tag
                key={r.id}
                color={active ? "blue" : undefined}
                style={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => {
                  setSelectedRoleIds((prev) =>
                    prev.includes(r.id)
                      ? prev.filter((x) => x !== r.id)
                      : prev.concat(r.id),
                  );
                }}
              >
                {r.name}
              </Tag>
            );
          })}
        </div>
      </Modal>
    </>
  );
}


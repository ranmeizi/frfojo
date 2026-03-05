import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ModalForm, ProFormText, ProTable } from "@ant-design/pro-components";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Modal, Tag, message } from "antd";
import React, { useMemo, useRef, useState } from "react";
import { COL } from "./columns.config";
import * as S from "./service";

export default function RolesPage() {
  const actionRef = useRef<ActionType>();
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<DTOs.UserCenterRoles.QueryRoles | null>(
    null,
  );

  const [permOpen, setPermOpen] = useState(false);
  const [permLoading, setPermLoading] = useState(false);
  const [permOptions, setPermOptions] = useState<
    DTOs.UserCenterRoles.QueryPermissions[]
  >([]);
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
  const [rolePerms, setRolePerms] = useState<
    DTOs.UserCenterRoles.QueryPermissions[]
  >([]);

  const columns = useMemo(() => {
    return COL({
      onEdit: (row) => {
        setEditing(row);
        setEditOpen(true);
      },
      onPermissions: async (row) => {
        setEditing(row);
        setPermOpen(true);
        setPermLoading(true);
        try {
          const [all, mine] = await Promise.all([
            S.listPermissions({ current: 1, pageSize: 999 }),
            S.getRolePermissions({ roleId: row.id }),
          ]);
          setPermOptions(all.data?.list || []);
          const mr = mine.data || [];
          setRolePerms(mr);
          setSelectedPermIds(mr.map((p) => p.id));
        } finally {
          setPermLoading(false);
        }
      },
      onDelete: async (row) => {
        await new Promise<void>((resolve) => {
          Modal.confirm({
            title: "删除角色",
            content: `确认删除角色 ${row.name}？`,
            okText: "删除",
            cancelText: "取消",
            onOk: async () => {
              const res = await S.deleteRole({ id: row.id });
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
      <ProTable<DTOs.UserCenterRoles.QueryRoles>
        rowKey="id"
        actionRef={actionRef}
        columns={columns as ProColumns<DTOs.UserCenterRoles.QueryRoles>[]}
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
            新建角色
          </Button>,
        ]}
        request={async (params) => {
          const res = await S.listRoles({
            current: params.current,
            pageSize: params.pageSize,
            search: (params as any).search,
          });
          if (res.code !== "000000") {
            return { data: [], success: false, total: 0 };
          }
          return { data: res.data.list, success: true, total: res.data.total };
        }}
      />

      <ModalForm
        title={editing ? "编辑角色" : "新建角色"}
        open={editOpen}
        modalProps={{ destroyOnClose: true, onCancel: () => setEditOpen(false) }}
        initialValues={editing || {}}
        onFinish={async (values) => {
          if (editing) {
            const res = await S.updateRole({
              id: editing.id,
              name: values.name,
              description: values.description,
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

          const res = await S.createRole({
            name: values.name,
            description: values.description,
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
        <ProFormText name="name" label="角色名" rules={[{ required: true }]} />
        <ProFormText name="description" label="说明" />
      </ModalForm>

      <Modal
        title={editing ? `配置权限：${editing.name}` : "配置权限"}
        open={permOpen}
        confirmLoading={permLoading}
        onCancel={() => setPermOpen(false)}
        onOk={async () => {
          if (!editing) return;
          setPermLoading(true);
          try {
            const next = new Set(selectedPermIds);
            const prev = new Set((rolePerms || []).map((p) => p.id));
            const toAdd: string[] = [];
            const toRemove: string[] = [];
            next.forEach((id) => !prev.has(id) && toAdd.push(id));
            prev.forEach((id) => !next.has(id) && toRemove.push(id));

            await Promise.all([
              ...toAdd.map((permissionId) =>
                S.bindPermission({ roleId: editing.id, permissionId }),
              ),
              ...toRemove.map((permissionId) =>
                S.removePermission({ roleId: editing.id, permissionId }),
              ),
            ]);

            message.success("已更新权限");
            setPermOpen(false);
          } finally {
            setPermLoading(false);
          }
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {permOptions.map((p) => {
            const active = selectedPermIds.includes(p.id);
            const label = `${p.resource}:${p.action}`;
            return (
              <Tag
                key={p.id}
                color={active ? "blue" : undefined}
                style={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => {
                  setSelectedPermIds((prev) =>
                    prev.includes(p.id)
                      ? prev.filter((x) => x !== p.id)
                      : prev.concat(p.id),
                  );
                }}
              >
                {p.name || label}
              </Tag>
            );
          })}
        </div>
      </Modal>
    </>
  );
}


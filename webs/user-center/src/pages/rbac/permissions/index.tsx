import type { ActionType, ProColumns } from "@ant-design/pro-components";
import {
  ModalForm,
  ProFormText,
  ProTable,
} from "@ant-design/pro-components";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Modal, message } from "antd";
import React, { useMemo, useRef, useState } from "react";
import { COL } from "./columns.config";
import * as S from "./service";

export default function PermissionsPage() {
  const actionRef = useRef<ActionType>();
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<
    DTOs.UserCenterPermissions.QueryPermissions | null
  >(null);

  const columns = useMemo(() => {
    return COL({
      onEdit: (row) => {
        setEditing(row);
        setEditOpen(true);
      },
      onDelete: async (row) => {
        await new Promise<void>((resolve) => {
          Modal.confirm({
            title: "删除权限",
            content: `确认删除权限 ${row.name}？`,
            okText: "删除",
            cancelText: "取消",
            onOk: async () => {
              const res = await S.deletePermission({ id: row.id });
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
      <ProTable<DTOs.UserCenterPermissions.QueryPermissions>
        rowKey="id"
        actionRef={actionRef}
        columns={columns as ProColumns<DTOs.UserCenterPermissions.QueryPermissions>[]}
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
            新建权限
          </Button>,
        ]}
        request={async (params) => {
          const res = await S.listPermissions({
            current: params.current,
            pageSize: params.pageSize,
            search: (params as any).search,
            resource: (params as any).resource,
            action: (params as any).action,
          });
          if (res.code !== "000000") {
            return { data: [], success: false, total: 0 };
          }
          return { data: res.data.list, success: true, total: res.data.total };
        }}
      />

      <ModalForm
        title={editing ? "编辑权限" : "新建权限"}
        open={editOpen}
        modalProps={{ destroyOnClose: true, onCancel: () => setEditOpen(false) }}
        initialValues={editing || {}}
        onFinish={async (values) => {
          if (editing) {
            const res = await S.updatePermission({
              id: editing.id,
              name: values.name,
              description: values.description,
              resource: values.resource,
              action: values.action,
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

          const res = await S.createPermission({
            name: values.name,
            description: values.description,
            resource: values.resource,
            action: values.action,
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
        <ProFormText name="name" label="权限名" rules={[{ required: true }]} />
        <ProFormText name="resource" label="资源" rules={[{ required: true }]} />
        <ProFormText name="action" label="动作" rules={[{ required: true }]} />
        <ProFormText name="description" label="说明" />
      </ModalForm>
    </>
  );
}


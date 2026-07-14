我需要开发1个绘制节点图的组件

渲染库不做要求，需求是，我有一个 name gid 关联表：

```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity()
@Index(['name', 'gid'], { unique: true })
export class MomoPlayerGid {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '玩家名字' })
  name: string;

  @Column({ type: 'varchar', length: 20, comment: 'gid' })
  gid: string;

  @CreateDateColumn({ name: 'create_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'update_at' })
  updatedAt: Date;
}

```

请你根据这个，先查询到一类  

## 前端部分

A类节点 确切节点（确切关联节点簇） 这类节点是GID相等的，他们一定属于同一个人的账号
B类节点 人工确切节点 (人工关联GID的节点)  这类是我们通过证实2个不相等的gid 也属于同一个人的账号
C类节点 人工怀疑节点（人工关联GID但还在审核中的节点） 这类是我们通过证实2个不相等的gid 也属于同一个人的账号，但是它属于在审核中
D类节点 规则怀疑节点 （他是由GID命名推断的，GID以16进制字符串命名，如果在GID+- x(默认16) 的范围内的gid 也一并查出来）
E类节点 name 属于E类节点

对于A类节点 我会给你一个按GID查询的接口
对于BC类节点 我会给你一个按GID + 类型 查询人工关联表的接口
对于D类节点，我会给你一个按 GID+边界 查询周边gid的接口

现在接口没实现，先留空用 mock数据

下面我说一下功能。

页面分  用户 / 审核 2个界面(用户有手动关联怀疑节点的权限，审核有将怀疑转为确切的审核权限)。这两个操作会提供接口

但它们的主要功能都是来渲染这个graph canvas 图，他属于力布局的节点图。

关于画图：
中心是 A类节点，A类节点与B类GID相连 （作为确切一族）

C类D类这些怀疑节点与AB类分开，作为环形布局在 ab外侧

也就是说 CD在周围形成环形布局， AB在中心形成力布局

然后 ABCD 这些gid节点，周围都需要查询出 gid所对应的 name  E类节点，与其中心gid相连

并且 ABCDE 都有自己的颜色， AB类和他们的E节点正常透明度  CD类和他们的E节点给一个0.5透明

## 后端部分

/api/momoro/queryUid
根据角色名称模糊查询UID下拉列表

/api/momoro/getPlayerGraphByGid
使用角色GID 查询角色周边图节点

/api/momoro/getBoNetApplyList
查询申请列表

/api/momoro/BoNetApply
关联申请

/api/momoro/BoNetAudit
关联审核/驳回


## 接口文档

```
{
  "openapi": "3.0.1",
  "info": {
    "title": "Momoro BoNet 模块",
    "description": "BoNet GID 关联图后端接口：角色名查 GID、关联图数据、人工关联申请与审核。\n\n## 基础说明\n\n- **Base URL**：`http://localhost:3000/api`（PORT 见 `.env`）\n- **统一响应**：`{ code, msg, data }`，成功时 `code` 为 `000000`\n\n## 节点类型（图数据语义）\n\n| 代号 | 含义 | 数据来源 |\n|------|------|----------|\n| A | 当前账号（同 GID 簇） | `momo_player_gid` 同 gid |\n| B | 已确认关联 GID | `momo_player_gid_link` type=confirmed |\n| C | 待审核关联 GID | `momo_player_gid_link` type=suspect |\n| D | 规则怀疑（十六进制周边） | gid ± boundary 且库内存在 |\n| E | 角色名节点 | `momo_player_gid` 按 gid 查 name |\n\n## 签名校验\n\n除白名单外，所有 `/api/*` 请求需携带 `x-timestamp`、`x-nonce`、`x-signature`（见项目 `SignInterceptor`）。\n\n## 文档地址\n\n`GET /api/momoro/openapi.json`",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "http://localhost:3000/api",
      "description": "本地开发"
    }
  ],
  "tags": [
    {
      "name": "BoNet",
      "description": "GID 关联图"
    },
    {
      "name": "Doc",
      "description": "接口文档"
    }
  ],
  "paths": {
    "/momoro/openapi.json": {
      "get": {
        "tags": ["Doc"],
        "summary": "BoNet OpenAPI 文档",
        "responses": {
          "200": {
            "description": "OpenAPI JSON"
          }
        }
      }
    },
    "/momoro/queryUid": {
      "get": {
        "tags": ["BoNet"],
        "summary": "根据角色名模糊查询 GID 下拉列表",
        "parameters": [
          {
            "name": "keyword",
            "in": "query",
            "required": true,
            "schema": { "type": "string" },
            "description": "角色名关键字（模糊匹配）"
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": { "type": "integer", "minimum": 1, "maximum": 50, "default": 20 }
          }
        ],
        "responses": {
          "200": {
            "description": "成功",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    { "$ref": "#/components/schemas/ApiRes" },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "type": "array",
                          "items": { "$ref": "#/components/schemas/PlayerGidRecord" }
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    },
    "/momoro/getPlayerGraphByGid": {
      "get": {
        "tags": ["BoNet"],
        "summary": "按中心 GID 查询关联图原始数据",
        "description": "返回 A–E 类原始数据，前端负责力布局/环形布局渲染。GID 会自动规范化为 8 位小写十六进制。",
        "parameters": [
          {
            "name": "gid",
            "in": "query",
            "required": true,
            "schema": { "type": "string", "example": "00001000" }
          },
          {
            "name": "boundary",
            "in": "query",
            "required": false,
            "schema": { "type": "integer", "minimum": 1, "maximum": 256, "default": 16 },
            "description": "D 类：GID 十六进制 ± 边界"
          }
        ],
        "responses": {
          "200": {
            "description": "成功",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    { "$ref": "#/components/schemas/ApiRes" },
                    {
                      "type": "object",
                      "properties": {
                        "data": { "$ref": "#/components/schemas/PlayerGraphData" }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    },
    "/momoro/getBoNetApplyList": {
      "get": {
        "tags": ["BoNet"],
        "summary": "查询待审核关联申请列表",
        "parameters": [
          {
            "name": "gid",
            "in": "query",
            "required": false,
            "schema": { "type": "string" },
            "description": "按中心 GID 过滤（匹配 gidA 或 gidB）"
          },
          {
            "name": "current",
            "in": "query",
            "required": false,
            "schema": { "type": "integer", "minimum": 1, "default": 1 }
          },
          {
            "name": "pageSize",
            "in": "query",
            "required": false,
            "schema": { "type": "integer", "minimum": 1, "maximum": 100, "default": 20 }
          }
        ],
        "responses": {
          "200": {
            "description": "成功",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    { "$ref": "#/components/schemas/ApiRes" },
                    {
                      "type": "object",
                      "properties": {
                        "data": { "$ref": "#/components/schemas/BoNetApplyListResult" }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    },
    "/momoro/BoNetApply": {
      "post": {
        "tags": ["BoNet"],
        "summary": "提交人工怀疑关联（C 类）",
        "description": "服务端会规范化 gid 顺序（gidA < gidB）。若已存在 suspect 记录则报错；已 confirmed 则报错。",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/BoNetApplyBody" },
              "example": {
                "gidA": "00001000",
                "gidB": "00004000",
                "applicant": "操作者昵称"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "成功",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    { "$ref": "#/components/schemas/ApiRes" },
                    {
                      "type": "object",
                      "properties": {
                        "data": { "$ref": "#/components/schemas/ManualGidLink" }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    },
    "/momoro/BoNetAudit": {
      "post": {
        "tags": ["BoNet"],
        "summary": "审核人工关联（通过或驳回）",
        "description": "- `approve`：C 类转 B 类，需填写 `auditMemo`（审核依据）\n- `reject`：删除 suspect 记录",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/BoNetAuditBody" },
              "examples": {
                "approve": {
                  "value": {
                    "linkId": 3,
                    "action": "approve",
                    "auditor": "审核员A",
                    "auditMemo": "同公会、交易记录核实"
                  }
                },
                "reject": {
                  "value": {
                    "linkId": 3,
                    "action": "reject",
                    "auditor": "审核员A"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "成功",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    { "$ref": "#/components/schemas/ApiRes" },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "oneOf": [
                            { "$ref": "#/components/schemas/ManualGidLink" },
                            { "type": "null" }
                          ],
                          "description": "approve 返回更新后记录；reject 返回 null"
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "ApiRes": {
        "type": "object",
        "properties": {
          "code": { "type": "string", "example": "000000" },
          "msg": { "type": "string", "example": "success" },
          "data": {}
        },
        "required": ["code", "msg", "data"]
      },
      "PlayerGidRecord": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "name": { "type": "string", "description": "角色名" },
          "gid": { "type": "string", "description": "GID（8位十六进制）" }
        },
        "required": ["id", "name", "gid"]
      },
      "ManualGidLink": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "gidA": { "type": "string" },
          "gidB": { "type": "string" },
          "type": { "type": "string", "enum": ["confirmed", "suspect"] },
          "applicant": { "type": "string", "nullable": true },
          "auditor": { "type": "string", "nullable": true },
          "auditMemo": { "type": "string", "nullable": true, "description": "审核通过依据" },
          "createdAt": { "type": "string", "format": "date-time" }
        },
        "required": ["id", "gidA", "gidB", "type", "createdAt"]
      },
      "PlayerGraphData": {
        "type": "object",
        "properties": {
          "centerGid": { "type": "string" },
          "exactCluster": {
            "type": "array",
            "description": "A 类",
            "items": { "$ref": "#/components/schemas/PlayerGidRecord" }
          },
          "confirmedLinks": {
            "type": "array",
            "description": "B 类",
            "items": { "$ref": "#/components/schemas/ManualGidLink" }
          },
          "suspectLinks": {
            "type": "array",
            "description": "C 类",
            "items": { "$ref": "#/components/schemas/ManualGidLink" }
          },
          "nearbyGids": {
            "type": "array",
            "description": "D 类 GID 列表",
            "items": { "type": "string" }
          },
          "namesByGid": {
            "type": "object",
            "description": "E 类：gid -> 角色名列表",
            "additionalProperties": {
              "type": "array",
              "items": { "$ref": "#/components/schemas/PlayerGidRecord" }
            }
          }
        },
        "required": [
          "centerGid",
          "exactCluster",
          "confirmedLinks",
          "suspectLinks",
          "nearbyGids",
          "namesByGid"
        ]
      },
      "BoNetApplyListResult": {
        "type": "object",
        "properties": {
          "list": {
            "type": "array",
            "items": { "$ref": "#/components/schemas/ManualGidLink" }
          },
          "total": { "type": "integer" },
          "current": { "type": "integer" },
          "pageSize": { "type": "integer" }
        },
        "required": ["list", "total", "current", "pageSize"]
      },
      "BoNetApplyBody": {
        "type": "object",
        "properties": {
          "gidA": { "type": "string", "maxLength": 20 },
          "gidB": { "type": "string", "maxLength": 20 },
          "applicant": { "type": "string", "maxLength": 100, "description": "申请人标识（可选）" }
        },
        "required": ["gidA", "gidB"]
      },
      "BoNetAuditBody": {
        "type": "object",
        "properties": {
          "linkId": { "type": "integer" },
          "action": { "type": "string", "enum": ["approve", "reject"] },
          "auditor": { "type": "string", "maxLength": 100 },
          "auditMemo": {
            "type": "string",
            "maxLength": 500,
            "description": "action=approve 时必填"
          }
        },
        "required": ["linkId", "action", "auditor"]
      }
    }
  }
}

```
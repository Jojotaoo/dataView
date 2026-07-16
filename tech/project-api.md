# 项目服务端接口文档（Project API）

> 面向后端对接同学。前端已实现 `editor/src/server/project` 调用层，本文件为其权威契约。
> 所有路径前缀记为 `{base}`，例如 `https://data.example.com`。统一 `Content-Type: application/json`。
> 风格对齐 `tech/dataset-api.md`（数据集接口文档）。

## 1. 概述

项目是平台级资源，编辑器以 `projectId` 引用。一个项目的完整可还原内容称为 **schema**，结构为 `ChartEditStorage`（画布配置 + 组件列表 + 请求全局配置 + 数据集引用快照）。

- 前端通过 `useChartSchema()` 把当前编辑器状态序列化为 `ChartEditStorage`，作为保存接口的请求体。
- 「保存」语义：**仅保存 schema 结构**；项目元信息（名称 / 分类 / 描述）在创建时即落库，保存接口不修改它们。
- 运行时出图（图表按数据集取数）不在此文档范围，沿用数据集文档的 `POST /api/dataset/execute`。

## 2. 公共约定

### 2.1 鉴权

所有接口需在请求头携带：

```
Authorization: Bearer <token>
```

未携带或失效返回 `401`。

### 2.2 统一响应结构

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

- `code = 0` 表示成功；非 0 见错误码表。
- 列表/详情类接口数据在 `data`；删除成功可 `data: null` 或 `204 No Content`。

### 2.3 时间

`createdAt` / `updatedAt` 为 Unix 毫秒时间戳（number）。

### 2.4 错误码

| HTTP | code  | 含义                               |
| ---- | ----- | ---------------------------------- |
| 400  | 40000 | 请求体格式错误 / 缺少必填字段      |
| 401  | 40100 | 未鉴权或 token 失效                |
| 403  | 40300 | 无该项目权限                       |
| 404  | 40400 | 项目不存在                         |
| 409  | 40900 | 项目名称冲突或并发修改             |
| 422  | 42200 | schema 无法解析 / 结构非法         |
| 500  | 50000 | 服务端内部错误（含数据库写入失败） |

## 3. 创建项目

`POST {base}/api/project`

### 3.1 请求体（仅业务字段，不含 id/createdAt/updatedAt/status）

> `id` / `createdAt` / `updatedAt` / `status` **由服务端生成**，前端创建时不传。

| 字段        | 类型   | 必填 | 说明                 |
| ----------- | ------ | ---- | -------------------- |
| name        | string | 是   | 项目名称             |
| category    | string | 否   | 项目分类（自由文本） |
| description | string | 否   | 项目描述             |

### 3.2 请求示例

```json
{
  "name": "2026Q2资管战情",
  "category": "资管",
  "description": "面向投决会的实时资管战情大屏"
}
```

### 3.3 响应示例

````json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": "prj-a1b2c3d4",
    "name": "2026Q2资管战情",
    "category": "资管",
    "description": "面向投决会的实时资管战情大屏",
    "status": 0,
    "creator": "管",
    "createdAt": 1700000000000,
    "updatedAt": 1700000000000
  }
}

**注意**：服务端应回写 `id`（后续编辑器路由 `editor/:id` 即用此值）与 `createdAt` / `updatedAt`，默认 `status = 0`（未发布）。

## 4. 获取项目

`GET {base}/api/project/:id`

获取单个项目的元信息与已保存的 schema（用于编辑器进入时还原画布）。

### 4.1 响应示例

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": "prj-a1b2c3d4",
    "name": "2026Q2资管战情",
    "category": "资管",
    "description": "面向投决会的实时资管战情大屏",
    "status": 0,
    "creator": "管",
    "createdAt": 1700000000000,
    "updatedAt": 1700000000000,
    "schema": {
      "editCanvasConfig": { "projectName": "2026Q2资管战情", "width": 1920, "height": 1080 },
      "requestGlobalConfig": { "datasetMode": "mock", "requestOriginUrl": "" },
      "componentList": [],
      "datasetBindings": []
    }
  }
}
````

- `schema` 为 `ChartEditStorage`（见 §9）；新建后尚未保存时可为 `null`。
- 项目不存在返回 `40400`。

## 5. 保存项目 Schema

`PUT {base}/api/project/:id/schema`

编辑器点击「保存」时调用，**仅写入 schema 结构**，不修改 `name` / `category` / `description` / `status`。

### 5.1 请求体

即 `ChartEditStorage`（见 §9），例如：

```json
{
  "editCanvasConfig": { "projectName": "2026Q2资管战情", "width": 1920, "height": 1080 },
  "requestGlobalConfig": { "datasetMode": "mock", "requestOriginUrl": "" },
  "componentList": [
    {
      "id": "cmp-1",
      "key": "BarChart",
      "chartConfig": {},
      "attr": { "x": 0, "y": 0, "w": 400, "h": 300 },
      "styles": {},
      "status": {},
      "preview": {},
      "option": {},
      "request": { "requestDataType": 3, "requestDatasetId": "ds-a1b2c3d4" }
    }
  ],
  "datasetBindings": [{ "id": "ds-a1b2c3d4", "name": "销售汇总", "dataSourceId": "ds-mysql-sales" }]
}
```

### 5.2 响应示例

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": "prj-a1b2c3d4",
    "name": "2026Q2资管战情",
    "category": "资管",
    "description": "面向投决会的实时资管战情大屏",
    "status": 0,
    "creator": "管",
    "createdAt": 1700000000000,
    "updatedAt": 1700001000000,
    "schema": { "editCanvasConfig": {}, "requestGlobalConfig": {}, "componentList": [], "datasetBindings": [] }
  }
}
```

- 响应回写最新的 `updatedAt`（建议用其做乐观锁，冲突返回 `409`）。
- 项目不存在返回 `40400`；schema 无法解析返回 `42200`。

## 5.1 发布项目（保存并发布）

`PUT {base}/api/project/:id/publish`

编辑器点击「发布」时调用。**请求体携带当前 `ChartEditStorage`（schema），服务端先写入 `schema` 列，再将 `status` 置为 `1`（已发布），并刷新 `updatedAt`。** 一步到位，不等同于先点保存。

### 5.1.1 请求体

即 `ChartEditStorage`（同 §5.1 / §9），例如：

```json
{
  "editCanvasConfig": { "projectName": "2026Q2资管战情", "width": 1920, "height": 1080 },
  "requestGlobalConfig": { "datasetMode": "mock", "requestOriginUrl": "" },
  "componentList": [
    {
      "id": "cmp-1",
      "key": "BarChart",
      "chartConfig": {},
      "attr": { "x": 0, "y": 0, "w": 400, "h": 300 },
      "styles": {},
      "status": {},
      "preview": {},
      "option": {},
      "request": { "requestDataType": 3, "requestDatasetId": "ds-a1b2c3d4" }
    }
  ],
  "datasetBindings": [{ "id": "ds-a1b2c3d4", "name": "销售汇总", "dataSourceId": "ds-mysql-sales" }]
}
```

### 5.1.2 响应示例

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": "prj-a1b2c3d4",
    "name": "2026Q2资管战情",
    "category": "资管",
    "description": "面向投决会的实时资管战情大屏",
    "status": 1,
    "creator": "管",
    "createdAt": 1700000000000,
    "updatedAt": 1700002000000,
    "schema": { "editCanvasConfig": {}, "requestGlobalConfig": {}, "componentList": [], "datasetBindings": [] }
  }
}
```

- `status` 枚举：`0`=未发布，`1`=已发布（见 §8 / 附录 A）。
- 幂等：无论当前是 `0` 还是 `1`，调用后均为 `status = 1`（覆盖式发布）。
- 乐观锁：基于 `updatedAt`，并发冲突返回 `409`；项目不存在返回 `40400`；schema 无法解析返回 `42200`。

## 6. 项目列表（分页 + 模糊查询）

`POST {base}/api/project/list`

### 6.1 请求体（ListQuery）

| 字段     | 类型   | 必填 | 说明                                 |
| -------- | ------ | ---- | ------------------------------------ |
| page     | number | 是   | 页码，从 1 开始                      |
| pageSize | number | 是   | 每页条数                             |
| keyword  | string | 否   | 模糊关键字，匹配 `name` / `category` |

**请求示例**

```json
{ "page": 1, "pageSize": 20, "keyword": "资管" }
```

### 6.2 响应示例（`data` 内含 `list` / `total`）

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [
      {
        "id": "prj-a1b2c3d4",
        "name": "2026Q2资管战情",
        "category": "资管",
        "description": "面向投决会的实时资管战情大屏",
        "status": 0,
        "creator": "管",
        "createdAt": 1700000000000,
        "updatedAt": 1700001000000
      }
    ],
    "total": 1
  }
}
```

- 列表项**不含 `schema` 字段**（降低体积）；详情用 §4 `GET /api/project/:id` 获取完整 schema。
- `total` 为过滤后的总条数（用于前端分页器）。

## 7. 删除项目

`DELETE {base}/api/project/:id`

- 路径参数 `id`：项目 id。
- 成功：`204 No Content` 或 `{ "code": 0, "data": null }`。
- 级联：引用该项目的编辑器会话应在前端处理（服务端只需删除项目记录；若需强一致可返回 `409` 当仍有活跃编辑会话）。

**响应示例**

```json
{ "code": 0, "message": "ok", "data": null }
```

## 8. ProjectItem 结构

| 字段        | 类型                     | 说明                                           |
| ----------- | ------------------------ | ---------------------------------------------- |
| id          | string                   | 项目 id（服务端生成，编辑器路由 `editor/:id`） |
| name        | string                   | 项目名称                                       |
| category    | string                   | 项目分类（自由文本）                           |
| description | string                   | 项目描述                                       |
| status      | `0` \| `1`               | 发布状态枚举：`0`=未发布，`1`=已发布           |
| creator     | string                   | 创建人                                         |
| createdAt   | number                   | 创建时间（ms）                                 |
| updatedAt   | number                   | 更新时间（ms）                                 |
| schema      | ChartEditStorage \| null | 仅 §4 详情返回；列表接口不返回                 |

## 9. ChartEditStorage 结构（保存体）

保存接口（§5）的请求体与 `ProjectItem.schema` 字段一致：

| 字段                | 类型                    | 说明                                                           |
| ------------------- | ----------------------- | -------------------------------------------------------------- |
| editCanvasConfig    | EditCanvasConfigType    | 画布配置（含 `projectName` / 宽高 / 背景 / 滤镜 / 主题）       |
| requestGlobalConfig | RequestGlobalConfigType | 请求全局配置（含 `datasetMode` / `requestOriginUrl` / 数据池） |
| componentList       | CreateComponentType[]   | 组件列表（含分组 `groupList`）                                 |
| datasetBindings     | DatasetConfig[]         | 被引用的数据集快照（便携预览用）                               |

> `EditCanvasConfigType` / `RequestGlobalConfigType` / `CreateComponentType` / `DatasetConfig` 的完整字段定义见 `tech/dataset-api.md` 及相关类型文件。

## 10. 附录 A. 数据库表结构（通用 DDL）

> 供后端建库参考，与 `tech/dataset-api.md` 附录 A 风格一致。DDL 为**通用写法**，不绑定具体数据库方言；时间字段统一用 **Unix 毫秒（bigint）**。仅覆盖 `project` 表（数据源/数据集表见 dataset 文档）。

### 附录 A.1 `project` 表

对应 §3 `POST /api/project`、§4 `GET /api/project/:id`、§5 `PUT /api/project/:id/schema`、§6 `POST /api/project/list`、§7 `DELETE /api/project/:id`。

```sql
CREATE TABLE project (
  id            VARCHAR(64)    NOT NULL,          -- 项目 id（服务端生成）
  name          VARCHAR(128)   NOT NULL,          -- 项目名称（ProjectItem.name）
  category      VARCHAR(64)    DEFAULT NULL,      -- 项目分类（ProjectItem.category）
   description   TEXT,                              -- 项目描述（ProjectItem.description）
   status        TINYINT        NOT NULL DEFAULT 0,  -- 0=未发布, 1=已发布
   creator       VARCHAR(64)    DEFAULT NULL,      -- 创建人（ProjectItem.creator）
  schema        JSON           DEFAULT NULL,      -- ChartEditStorage（ProjectItem.schema）
  created_at    BIGINT         NOT NULL,          -- 创建时间（ms）
  updated_at    BIGINT         NOT NULL,          -- 更新时间（ms，乐观锁）
  PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_project_name ON project (name);            -- 名称唯一，冲突返回 §2.4 的 409
CREATE INDEX idx_project_created ON project (created_at DESC);    -- 列表排序分页
```

| 列            | 类型         | 约束               | 对应接口字段                              |
| ------------- | ------------ | ------------------ | ----------------------------------------- |
| `id`          | varchar(64)  | PK                 | `ProjectItem.id`                          |
| `name`        | varchar(128) | NOT NULL, UNIQUE   | `ProjectItem.name`                        |
| `category`    | varchar(64)  |                    | `ProjectItem.category`                    |
| `description` | text         |                    | `ProjectItem.description`                 |
| `status`      | tinyint      | NOT NULL DEFAULT 0 | `ProjectItem.status`（0=未发布,1=已发布） |
| `creator`     | varchar(64)  |                    | `ProjectItem.creator`                     |
| `schema`      | json         |                    | `ProjectItem.schema`（ChartEditStorage）  |
| `created_at`  | bigint       | NOT NULL           | `ProjectItem.createdAt`                   |
| `updated_at`  | bigint       | NOT NULL           | `ProjectItem.updatedAt`                   |

> - 创建（`POST /api/project`）：服务端生成 `id` / `created_at` / `updated_at`，默认 `status=0`（未发布）。
> - 保存 schema（`PUT /api/project/:id/schema`）：仅覆写 `schema` 列并刷新 `updated_at`（乐观锁，冲突 `409`）。
> - 列表（`POST /api/project/list`）：`SELECT` 不含 `schema` 列以降低体积。

### 附录 A.2 索引与列表查询模式

§6 列表接口入参 `ListQuery { page, pageSize, keyword }`（POST body），响应 `data:{ list, total }`。服务端推荐 SQL 模式：

```sql
-- 项目列表（keyword 模糊匹配 name / category，不含 schema 列）
SELECT id, name, category, description, status, creator, created_at, updated_at
FROM project
WHERE (:kw = '' OR name LIKE CONCAT('%', :kw, '%') OR category LIKE CONCAT('%', :kw, '%'))
ORDER BY created_at DESC
LIMIT :pageSize OFFSET (:page - 1) * :pageSize;

-- total 计数（同条件）
SELECT COUNT(*) AS total
FROM project
WHERE (:kw = '' OR name LIKE CONCAT('%', :kw, '%') OR category LIKE CONCAT('%', :kw, '%'));
```

- `keyword` 为空时退化为全量查询；`page` / `pageSize` 来自 `ListQuery`。
- `OFFSET` 分页在大数据量下可改用 keyset 分页（`WHERE created_at < :lastCreatedAt ORDER BY created_at DESC`），此处以通用写法示意。

### 附录 A.3 字段对齐小结

| 接口字段                  | → 表列                | 方向               |
| ------------------------- | --------------------- | ------------------ |
| `ProjectItem.id`          | `project.id`          | 读写（服务端生成） |
| `ProjectItem.name`        | `project.name`        | 读写               |
| `ProjectItem.category`    | `project.category`    | 读写               |
| `ProjectItem.description` | `project.description` | 读写               |
| `ProjectItem.status`      | `project.status`      | 服务端写           |
| `ProjectItem.creator`     | `project.creator`     | 服务端写           |
| `ProjectItem.schema`      | `project.schema`      | 保存接口写（§5）   |
| `ProjectItem.createdAt`   | `project.created_at`  | 服务端写           |
| `ProjectItem.updatedAt`   | `project.updated_at`  | 服务端写（乐观锁） |

## 11. 错误排查建议

- `40900`：确认项目名称是否重复（唯一索引 `uk_project_name`）；并发保存时比对 `updatedAt`。
- `40400`：确认 `id` 是否存在、是否在当前租户下。
- `42200`：确认 `schema` 是否为合法 `ChartEditStorage`（`editCanvasConfig` / `requestGlobalConfig` / `componentList` 结构完整）。

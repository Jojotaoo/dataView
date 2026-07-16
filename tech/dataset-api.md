# 数据集服务端接口文档（Dataset API）

> 面向后端对接同学。前端已实现 `editor/src/server/dataset` 调用层，本文件为其权威契约。
> 所有路径前缀记为 `{base}`，例如 `https://data.example.com`。统一 `Content-Type: application/json`。

## 1. 概述

数据集是平台级全局资源，前端通过 `datasetId` 引用，不持有任何数据库连接凭证。

- 前端**已经**用 `buildDatasetSQL` 把 `sql`（base SQL）+ `transform`（加工步骤）组装成一份**完整可执行的 SQL**，放在请求体的 `generatedSql` 字段。
- 服务端有两种用法（建议采用 **①**）：
  1. **直接使用 `generatedSql`** 查询（前端交付物为准，避免双写不一致）；
  2. 忽略 `generatedSql`，**自行**用 `sql` + `transform` 重拼（需服务端实现等价的 `buildDatasetSQL`）。
- 运行时出图（`execute`）只传 `datasetId`，服务端用已落库的 `generatedSql` 查询，前端不发送 base SQL / 加工步骤 / 凭证。

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

| HTTP | code  | 含义                                   |
| ---- | ----- | -------------------------------------- |
| 400  | 40000 | 请求体格式错误 / 缺少必填字段          |
| 401  | 40100 | 未鉴权或 token 失效                    |
| 403  | 40300 | 无该数据集权限                         |
| 404  | 40400 | 数据源 / 数据集不存在                  |
| 409  | 40900 | 数据集名称冲突或并发修改               |
| 422  | 42200 | `generatedSql` 无法执行 / SQL 语法错误 |
| 500  | 50000 | 服务端内部错误（含数据库查询失败）     |

## 3. 数据源枚举

`GET {base}/api/datasource/enum`

获取平台已注册的数据源列表（连接信息在服务端注册表，前端只持有 `id`）。

**响应示例**

```json
{
  "code": 0,
  "message": "ok",
  "data": [
    { "id": "ds-mysql-sales", "name": "MySQL-销售库", "type": "mysql" },
    { "id": "ds-pg-user", "name": "PostgreSQL-用户库", "type": "postgres" },
    { "id": "ds-ck-traffic", "name": "ClickHouse-流量库", "type": "clickhouse" }
  ]
}
```

`DataSourceItem`：`id`(string) / `name`(string) / `type`(`mysql`|`postgres`|`clickhouse`|`api`)。

## 3.1 数据源列表（分页 + 模糊查询）

`POST {base}/api/datasource/list`

获取平台已注册数据源的**分页列表**，支持按关键字模糊匹配。

### 3.1.1 请求体（ListQuery）

| 字段     | 类型   | 必填 | 说明                                    |
| -------- | ------ | ---- | --------------------------------------- |
| page     | number | 是   | 页码，从 1 开始                         |
| pageSize | number | 是   | 每页条数                                |
| keyword  | string | 否   | 模糊关键字，匹配 `name` / `id` / `type` |

**请求示例**

```json
{ "page": 1, "pageSize": 20, "keyword": "mysql" }
```

### 3.1.2 响应示例（`data` 内含 `list` / `total`）

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [{ "id": "ds-mysql-sales", "name": "MySQL-销售库", "type": "mysql" }],
    "total": 1
  }
}
```

- `list`：`DataSourceItem[]`。
- `total`：过滤后的总条数（用于前端分页器）。

## 4. 创建数据集

`POST {base}/api/dataset`

### 4.1 请求体（仅业务字段，不含 id/createdAt/updatedAt）

> `id` / `createdAt` / `updatedAt` **由服务端生成**，前端创建时不传，仅出现在响应中。

| 字段         | 类型   | 必填 | 说明                                             |
| ------------ | ------ | ---- | ------------------------------------------------ |
| name         | string | 是   | 数据集名称                                       |
| dataSourceId | string | 是   | 引用第 3 节的数据源 id                           |
| sql          | string | 是   | base SQL，如 `SELECT * FROM sales`               |
| transform    | object | 是   | 加工步骤 `{ steps: TransformStep[] }`，见第 9 节 |
| generatedSql | string | 是   | 前端用 `buildDatasetSQL` 组装好的完整可执行 SQL  |

### 4.2 请求示例

```json
{
  "name": "销售汇总",
  "dataSourceId": "ds-mysql-sales",
  "sql": "SELECT product, region, amount, qty FROM sales",
  "transform": {
    "steps": [
      {
        "type": "filter",
        "logic": "and",
        "conditions": [{ "field": "amount", "operator": "gt", "value": 100 }]
      },
      {
        "type": "summary",
        "columns": [{ "name": "total_amount", "function": "SUM", "field": "amount", "partitionBy": ["region"] }]
      }
    ]
  },
  "generatedSql": "SELECT * FROM ( SELECT *, SUM(amount) OVER (PARTITION BY region) AS total_amount FROM (SELECT product, region, amount, qty FROM sales) __src WHERE amount > 100 ) __t"
}
```

### 4.3 响应示例

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": "ds-a1b2c3d4",
    "name": "销售汇总",
    "dataSourceId": "ds-mysql-sales",
    "sql": "SELECT product, region, amount, qty FROM sales",
    "transform": { "steps": [] },
    "generatedSql": "SELECT * FROM ( ... ) __t",
    "createdAt": 1700000000000,
    "updatedAt": 1700000000000
  }
}
```

**注意**：服务端应回显 `generatedSql`（建议原样持久化，供运行时 `execute` 使用）。

## 4.0 数据集列表（分页 + 模糊查询）

`POST {base}/api/dataset/list`

获取数据集的**分页列表**，支持按关键字模糊匹配。前端数据集列表页调用此接口（mock 模式下由前端本地对 localStorage 中的数据集做过滤 + 切片）。

### 4.0.1 请求体（ListQuery）

| 字段     | 类型   | 必填 | 说明                                     |
| -------- | ------ | ---- | ---------------------------------------- |
| page     | number | 是   | 页码，从 1 开始                          |
| pageSize | number | 是   | 每页条数                                 |
| keyword  | string | 否   | 模糊关键字，匹配 `name` / `dataSourceId` |

**请求示例**

```json
{ "page": 1, "pageSize": 20, "keyword": "销售" }
```

### 4.0.2 响应示例（`data` 内含 `list` / `total`）

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [
      {
        "id": "ds-a1b2c3d4",
        "name": "销售汇总",
        "dataSourceId": "ds-mysql-sales",
        "sql": "SELECT product, region, amount, qty FROM sales",
        "transform": { "steps": [] },
        "generatedSql": "SELECT * FROM ( ... ) __t",
        "createdAt": 1700000000000,
        "updatedAt": 1700000000000
      }
    ],
    "total": 1
  }
}
```

- `list`：`DatasetConfig[]`。
- `total`：过滤后的总条数（用于前端分页器）。

## 5. 更新数据集

`PUT {base}/api/dataset/:id`

基础信息（name/dataSourceId/sql）或加工步骤（transform）变更后调用。**每次 `generatedSql` 由前端重新计算后随请求发送**。

- 路径参数 `id`：数据集 id（**请求体不再包含 `id`**）。
- 请求体：**仅可更新字段**（同第 4.1 节，不含 `id`；也不含 `updatedAt`，由服务端写入）。
- 响应：同 4.3（含服务端生成的 `updatedAt`）。

**请求示例**（仅改了 filter 阈值）

```json
{
  "name": "销售汇总",
  "dataSourceId": "ds-mysql-sales",
  "sql": "SELECT product, region, amount, qty FROM sales",
  "transform": {
    "steps": [
      {
        "type": "filter",
        "logic": "and",
        "conditions": [{ "field": "amount", "operator": "gt", "value": 200 }]
      }
    ]
  },
  "generatedSql": "SELECT * FROM ( SELECT * FROM (SELECT product, region, amount, qty FROM sales) __src WHERE amount > 200 ) __t"
}
```

**并发**：建议服务端用 `updatedAt` 做乐观锁，冲突返回 `409`。

## 6. 删除数据集

`DELETE {base}/api/dataset/:id`

- 路径参数 `id`：数据集 id。
- 成功：`204 No Content` 或 `{ "code": 0, "data": null }`。
- 级联：引用该 `datasetId` 的图表应在前端置空数据源（前端负责，服务端只需删除数据集记录；若需强一致可返回 `409` 当仍有引用）。

**响应示例**

```json
{ "code": 0, "message": "ok", "data": null }
```

## 7. 预览数据集（只读，不落库）

`POST {base}/api/dataset/preview`

用于编辑器实时预览加工结果，**不持久化**。

- 请求体：同 `DatasetConfig`（含 `generatedSql`）。
- 响应 `DatasetPreviewResult`：

| 字段    | 类型     | 说明                                      |
| ------- | -------- | ----------------------------------------- |
| sql     | string   | 实际执行的 SQL（建议回显 `generatedSql`） |
| columns | string[] | 结果列名                                  |
| rows    | object[] | 结果行                                    |

**请求示例**

```json
{
  "id": "ds-a1b2c3d4",
  "name": "销售汇总",
  "dataSourceId": "ds-mysql-sales",
  "sql": "SELECT product, region, amount, qty FROM sales",
  "transform": { "steps": [] },
  "generatedSql": "SELECT * FROM ( ... ) __t"
}
```

**响应示例**

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "sql": "SELECT * FROM ( SELECT *, SUM(amount) OVER (PARTITION BY region) AS total_amount FROM (SELECT product, region, amount, qty FROM sales) __src WHERE amount > 100 ) __t",
    "columns": ["product", "region", "amount", "qty", "total_amount"],
    "rows": [
      { "product": "手机", "region": "华东", "amount": 120, "qty": 12, "total_amount": 360 },
      { "product": "笔记本", "region": "华东", "amount": 240, "qty": 6, "total_amount": 360 }
    ]
  }
}
```

## 8. 运行时执行（图表出图）

`POST {base}/api/dataset/execute`

画布/预览页渲染时调用，只传 `datasetId`。

- 请求体：`{ "datasetId": string }`
- 响应：`{ "code": 0, "data": { "columns": string[], "rows": object[] } }`
- 服务端按 `datasetId` 取已落库的 `generatedSql` 执行；前端不发送 base SQL / 加工步骤 / 凭证。

**请求示例**

```json
{ "datasetId": "ds-a1b2c3d4" }
```

**响应示例**

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "columns": ["product", "region", "amount", "qty", "total_amount"],
    "rows": [{ "product": "手机", "region": "华东", "amount": 120, "qty": 12, "total_amount": 360 }]
  }
}
```

## 9. transform 加工协议（服务端自行重拼时必读）

`transform.steps` 为有序数组，元素类型：

- **filter** `{ type:'filter', logic:'and'|'or', conditions: FilterCondition[] }`
  - `FilterCondition { field, operator: eq|neq|gt|gte|lt|lte|like|in|isNull|notNull, value?, enabled? }`
- **formula** `{ type:'formula', columns: FormulaColumn[] }`
  - `FormulaColumn { name, expression: FormulaExpr, type?, enabled? }`
  - `FormulaExpr`：结构化表达式（`field` / `const` / `op(+ - * /)` / `func(ROUND|UPPER|LOWER|CONCAT|COALESCE)`），可序列化、可翻译为 SQL。
- **summary** `{ type:'summary', columns: SummaryColumn[] }`（窗口聚合，**不减少行数**）
  - `SummaryColumn { name, function: SUM|AVG|COUNT|MAX|MIN, field, partitionBy?: string[], enabled? }`
  - 形如 `SUM(amount) OVER (PARTITION BY region) AS total_amount`
- **select** `{ type:'select', fields: SelectField[] }`（最终输出列）
  - `SelectField { source, alias?, enabled }`
- **sort** `{ type:'sort', rules: SortRule[] }`
  - `SortRule { field, order:'asc'|'desc', enabled? }`

### 9.1 SQL 组装顺序（前端 `buildDatasetSQL` 逻辑，服务端若重拼需等价实现）

1. 内层 `SELECT * FROM (<base sql>) __src`
2. 叠加 formula 列：`(expr) AS name`
3. 叠加 summary 列：`FUNC(field) OVER (PARTITION BY ...) AS name`
4. 外层 `WHERE`（filter，and/or 拼接）
5. 最外层 `SELECT`（select 指定的列，含 alias）`FROM (...) __t`
6. 最后 `ORDER BY`（sort）

### 9.2 对照样例

- base：`SELECT product, region, amount, qty FROM sales`
- steps：filter `amount > 100` + summary `SUM(amount) OVER (PARTITION BY region) AS total_amount`
- 最终 `generatedSql`：

```sql
SELECT * FROM (
  SELECT *, SUM(amount) OVER (PARTITION BY region) AS total_amount
  FROM (SELECT product, region, amount, qty FROM sales) __src
  WHERE amount > 100
) __t
```

## 10. 错误排查建议

- `42200`：先校验 `generatedSql` 在对应数据源类型下是否合法（窗口函数各库支持不同）。
- `40400`：确认 `dataSourceId` / `id` 是否存在、是否在当前租户下。
- 若服务端选择「自行重拼」，请确保与前端 `buildDatasetSQL` 产出语义一致，否则预览与运行时结果会偏差。

## 附录 A. 数据库表结构（通用 DDL）

> 供后端建库参考。字段与上文各接口的请求/响应字段一一对齐。DDL 为**通用写法**（varchar / bigint / timestamp / json / text），不绑定具体数据库方言；`timestamp` 类字段统一用 **Unix 毫秒（bigint）** 存储，与 §2.3 一致。
> 仅覆盖 `datasource`（数据源注册表）与 `dataset`（数据集）两张表，不含账号/租户/权限表。

### 附录 A.1 `datasource` 表（数据源注册表）

对应 §3 `GET /api/datasource/enum`、§3.1 `POST /api/datasource/list`。

```sql
CREATE TABLE datasource (
  id               VARCHAR(64)    NOT NULL,          -- 数据源 id，如 ds-mysql-sales
  name             VARCHAR(128)   NOT NULL,          -- 名称（DataSourceItem.name）
  type             VARCHAR(32)    NOT NULL,          -- mysql / postgres / clickhouse / api
  connection_info  JSON           NOT NULL,          -- 连接信息（前端不持有，仅服务端使用）
  created_at       BIGINT         NOT NULL,          -- 注册时间（ms）
  updated_at       BIGINT         NOT NULL,          -- 更新时间（ms）
  PRIMARY KEY (id)
);
CREATE INDEX idx_datasource_type ON datasource (type);
```

| 列                | 类型         | 约束     | 对应接口字段             |
| ----------------- | ------------ | -------- | ------------------------ |
| `id`              | varchar(64)  | PK       | `DataSourceItem.id`      |
| `name`            | varchar(128) | NOT NULL | `DataSourceItem.name`    |
| `type`            | varchar(32)  | NOT NULL | `DataSourceItem.type`    |
| `connection_info` | json         | NOT NULL | （服务端内部，前端不传） |
| `created_at`      | bigint       | NOT NULL | —                        |
| `updated_at`      | bigint       | NOT NULL | —                        |

> 枚举/列表接口均从此表读取；`type` 建普通索引便于按类型筛选。

### 附录 A.2 `dataset` 表（数据集）

对应 §4 `POST /api/dataset`、§5 `PUT /api/dataset/:id`、§4.0 `POST /api/dataset/list`、§7 `POST /api/dataset/preview`、§8 `POST /api/dataset/execute`。

```sql
CREATE TABLE dataset (
  id               VARCHAR(64)    NOT NULL,          -- 数据集 id（服务端生成）
  name             VARCHAR(128)   NOT NULL,          -- 名称（DatasetConfig.name）
  datasource_id    VARCHAR(64)    NOT NULL,          -- 引用 datasource.id
  sql              TEXT           NOT NULL,          -- base SQL（DatasetConfig.sql）
  transform        JSON           NOT NULL,          -- 加工步骤 { steps: [] }（DatasetConfig.transform）
  generated_sql    TEXT           NOT NULL,          -- 前端组装的完整可执行 SQL（DatasetConfig.generatedSql）
  created_at       BIGINT         NOT NULL,          -- 创建时间（ms，服务端生成）
  updated_at       BIGINT         NOT NULL,          -- 更新时间（ms，乐观锁）
  PRIMARY KEY (id),
  CONSTRAINT fk_dataset_datasource FOREIGN KEY (datasource_id) REFERENCES datasource (id)
);
CREATE INDEX idx_dataset_datasource ON dataset (datasource_id);
CREATE UNIQUE INDEX uk_dataset_name ON dataset (name);   -- 名称唯一，冲突返回 §2.4 的 409
CREATE INDEX idx_dataset_created ON dataset (created_at DESC);  -- 列表排序分页
```

| 列              | 类型         | 约束               | 对应接口字段                 |
| --------------- | ------------ | ------------------ | ---------------------------- |
| `id`            | varchar(64)  | PK                 | `DatasetConfig.id`           |
| `name`          | varchar(128) | NOT NULL, UNIQUE   | `DatasetConfig.name`         |
| `datasource_id` | varchar(64)  | FK → datasource.id | `DatasetConfig.dataSourceId` |
| `sql`           | text         | NOT NULL           | `DatasetConfig.sql`          |
| `transform`     | json         | NOT NULL           | `DatasetConfig.transform`    |
| `generated_sql` | text         | NOT NULL           | `DatasetConfig.generatedSql` |
| `created_at`    | bigint       | NOT NULL           | `DatasetConfig.createdAt`    |
| `updated_at`    | bigint       | NOT NULL           | `DatasetConfig.updatedAt`    |

> - 创建（`POST /api/dataset`）：服务端生成 `id` / `created_at` / `updated_at` 并写入。
> - 更新（`PUT /api/dataset/:id`）：服务端覆写 `updated_at`，并以 `updated_at` 做乐观锁，冲突返回 `409`（§2.4）。
> - 运行时（`POST /api/dataset/execute`）：仅按 `id` 取 `generated_sql` 执行，不读 `sql` / `transform`，也不持有任何连接凭证。

### 附录 A.3 索引与列表查询模式

§3.1 与 §4.0 的列表接口入参为 `ListQuery { page, pageSize, keyword }`（POST body），响应 `data:{ list, total }`。服务端推荐 SQL 模式：

```sql
-- 数据集列表（§4.0，keyword 模糊匹配 name / datasource_id）
SELECT id, name, datasource_id, sql, transform, generated_sql, created_at, updated_at
FROM dataset
WHERE (:kw = '' OR name LIKE CONCAT('%', :kw, '%') OR datasource_id LIKE CONCAT('%', :kw, '%'))
ORDER BY created_at DESC
LIMIT :pageSize OFFSET (:page - 1) * :pageSize;

-- total 计数（同条件）
SELECT COUNT(*) AS total
FROM dataset
WHERE (:kw = '' OR name LIKE CONCAT('%', :kw, '%') OR datasource_id LIKE CONCAT('%', :kw, '%'));
```

- 数据源列表（§3.1）模式同上，表为 `datasource`，keyword 匹配 `name` / `id` / `type`。
- `keyword` 为空时退化为全量查询；`page` / `pageSize` 来自 `ListQuery`。
- `OFFSET` 分页在大数据量下可改用 keyset 分页（`WHERE created_at < :lastCreatedAt ORDER BY created_at DESC`），此处以通用写法示意。

### 附录 A.4 字段对齐小结

| 接口字段                     | → 表列                  | 方向               |
| ---------------------------- | ----------------------- | ------------------ |
| `DataSourceItem.id`          | `datasource.id`         | 读                 |
| `DataSourceItem.name`        | `datasource.name`       | 读                 |
| `DataSourceItem.type`        | `datasource.type`       | 读                 |
| `DatasetConfig.id`           | `dataset.id`            | 读写（服务端生成） |
| `DatasetConfig.name`         | `dataset.name`          | 读写               |
| `DatasetConfig.dataSourceId` | `dataset.datasource_id` | 读写               |
| `DatasetConfig.sql`          | `dataset.sql`           | 读写               |
| `DatasetConfig.transform`    | `dataset.transform`     | 读写               |
| `DatasetConfig.generatedSql` | `dataset.generated_sql` | 读写               |
| `DatasetConfig.createdAt`    | `dataset.created_at`    | 服务端写           |
| `DatasetConfig.updatedAt`    | `dataset.updated_at`    | 服务端写（乐观锁） |

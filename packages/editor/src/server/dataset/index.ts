// 数据集 Service 层（editor 侧：创建 / 保存 / 删除 / 数据源枚举）
// 无真实后端：mock 本地生成 id 与落库；server 模式按下方契约走真实后端接口。
// 运行时取数（mock/server 分支）仍在 jojotaoo_components 的 fetchDatasetResult 中。

import type { DatasetConfig, DataSourceItem, DatasetPreviewResult } from 'jojotaoo_components'
import { buildDatasetSQL, executeDatasetPreview } from 'jojotaoo_components'

// 无真实后端时的内置数据源枚举（mock；真实由平台服务端注册表 GET /api/datasource/enum 提供）
const MOCK_DATA_SOURCES: DataSourceItem[] = [
  { id: 'ds-mysql-sales', name: 'MySQL-销售库', type: 'mysql' },
  { id: 'ds-pg-user', name: 'PostgreSQL-用户库', type: 'postgres' },
  { id: 'ds-ck-traffic', name: 'ClickHouse-流量库', type: 'clickhouse' },
]

// 运行时分支：mock = 前端本地生成/持久化；server = 走真实后端接口
export interface DatasetServiceOptions {
  mode?: 'mock' | 'server'
  requestOriginUrl?: string
}

export type DeleteDatasetOptions = DatasetServiceOptions

export interface CreateDatasetInput {
  name: string
  dataSourceId: string
  sql: string
}

function genId(): string {
  return 'ds-' + Math.random().toString(36).slice(2, 10)
}

async function putDataset(config: DatasetConfig, opts: DatasetServiceOptions): Promise<DatasetConfig> {
  const payload: DatasetConfig = { ...config, generatedSql: buildDatasetSQL(config) }
  if (opts.mode === 'server' && opts.requestOriginUrl) {
    const res = await fetch(`${opts.requestOriginUrl}/api/dataset/${config.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('保存数据集失败')
    return (await res.json()) as DatasetConfig
  }
  return payload
}

// 新建数据集（服务端据此生成 id 并落库；mock 本地生成）
export function createDataset(input: CreateDatasetInput, opts: DatasetServiceOptions = {}): Promise<DatasetConfig> {
  const config: DatasetConfig = {
    id: genId(),
    name: input.name,
    dataSourceId: input.dataSourceId,
    sql: input.sql,
    transform: { steps: [] },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  config.generatedSql = buildDatasetSQL(config)
  if (opts.mode === 'server' && opts.requestOriginUrl) {
    return fetch(`${opts.requestOriginUrl}/api/dataset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    }).then((r) => {
      if (!r.ok) throw new Error('创建数据集失败')
      return r.json() as Promise<DatasetConfig>
    })
  }
  return Promise.resolve(config)
}

// 保存数据集（基础信息或加工步骤变更后统一调用；server 走 PUT）
export function saveDataset(config: DatasetConfig, opts: DatasetServiceOptions = {}): Promise<DatasetConfig> {
  return putDataset({ ...config, updatedAt: Date.now() }, opts)
}

// 删除数据集（server 走 DELETE；mock 仅本地 store 负责移除，这里空操作）
export function deleteDataset(id: string, opts: DeleteDatasetOptions = {}): Promise<void> {
  if (opts.mode === 'server' && opts.requestOriginUrl) {
    return fetch(`${opts.requestOriginUrl}/api/dataset/${id}`, { method: 'DELETE' }).then((r) => {
      if (!r.ok) throw new Error('删除数据集失败')
    })
  }
  return Promise.resolve()
}

// 数据源枚举（mock：返回内置注册表；server 后续可改为 GET {requestOriginUrl}/api/datasource/enum）
export function fetchDataSourceEnum(): Promise<DataSourceItem[]> {
  return Promise.resolve(MOCK_DATA_SOURCES)
}

// 数据集预览（只读计算，不落库）：server 走 POST /api/dataset/preview（完整 config 由后端执行）；
// mock 本地用 executeDatasetPreview 对内置样本表做内存加工。每次加工变化统一走此接口。
export async function previewDataset(
  config: DatasetConfig,
  opts: DatasetServiceOptions = {},
): Promise<DatasetPreviewResult> {
  const payload: DatasetConfig = { ...config, generatedSql: buildDatasetSQL(config) }
  if (opts.mode === 'server' && opts.requestOriginUrl) {
    const res = await fetch(`${opts.requestOriginUrl}/api/dataset/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('预览数据集失败')
    const json = await res.json()
    const data = (json as any)?.data ?? json
    return { sql: data.sql, columns: data.columns, rows: data.rows }
  }
  return executeDatasetPreview(config)
}

/*
  真实后端契约（前端不实现，仅文档）：
    GET  {requestOriginUrl}/api/datasource/enum           -> DataSourceItem[]
    POST {requestOriginUrl}/api/dataset            body:DatasetConfig(含 generatedSql) -> DatasetConfig(含生成 id)
    PUT  {requestOriginUrl}/api/dataset/:id        body:DatasetConfig(含 generatedSql) -> DatasetConfig
    DELETE {requestOriginUrl}/api/dataset/:id                                          -> void
    POST {requestOriginUrl}/api/dataset/preview  body:DatasetConfig(含 generatedSql) -> DatasetPreviewResult
    POST {requestOriginUrl}/api/dataset/execute  body:{ datasetId }  -> { columns, rows }
         前端已在请求体携带 generatedSql（buildDatasetSQL 组装好的完整 SQL）；
         服务端可选择直接用该 SQL 查询，或依据 base sql + transform 自行重新拼装。
         运行时 execute 按 datasetId 解析 dataSourceId 连接 + 使用已存储的 generatedSql 查询，
         前端只发 datasetId，不发送 base SQL / 加工步骤 / 连接凭证。
  */

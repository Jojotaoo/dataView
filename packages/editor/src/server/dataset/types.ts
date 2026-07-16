import type { DataSourceItem, DatasetConfig } from 'jojotaoo_components'

// 运行时分支：mock = 前端本地生成/持久化；server = 走真实后端接口
export interface DatasetServiceOptions {
  mode?: 'mock' | 'server'
  requestOriginUrl?: string
}

// 发给服务端的创建/更新体：不含 id/createdAt/updatedAt（由服务端生成）
export type DatasetWritable = Pick<DatasetConfig, 'name' | 'dataSourceId' | 'sql' | 'transform' | 'generatedSql'>

// 无真实后端时的内置数据源枚举（mock；真实由平台服务端注册表 GET /api/datasource/enum 提供）
export const MOCK_DATA_SOURCES: DataSourceItem[] = [
  { id: 'ds-mysql-sales', name: 'MySQL-销售库', type: 'mysql' },
  { id: 'ds-pg-user', name: 'PostgreSQL-用户库', type: 'postgres' },
  { id: 'ds-ck-traffic', name: 'ClickHouse-流量库', type: 'clickhouse' },
]

// mock 模式本地生成 id（无后端时作为 localStorage 主键）
export function genId(): string {
  return 'ds-' + Math.random().toString(36).slice(2, 10)
}

// 列表查询入参（分页 + 模糊查询；POST body 传参）
export interface ListQuery {
  page: number
  pageSize: number
  keyword?: string
}

// 列表查询响应（统一 data 包：{ list, total }）
export interface ListResult<T> {
  list: T[]
  total: number
}

// mock 分支共用：keyword 过滤 + page/pageSize 切片；total 为过滤后总数
export function paginateFilter<T>(
  items: T[],
  query: ListQuery,
  match: (item: T, keyword: string) => boolean,
): ListResult<T> {
  const keyword = (query.keyword ?? '').trim()
  const filtered = keyword ? items.filter((it) => match(it, keyword)) : items
  const page = Math.max(1, query.page || 1)
  const pageSize = Math.max(1, query.pageSize || 20)
  const start = (page - 1) * pageSize
  return {
    list: filtered.slice(start, start + pageSize),
    total: filtered.length,
  }
}

export type { DatasetConfig } from 'jojotaoo_components'

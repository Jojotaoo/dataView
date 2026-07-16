import type { ChartEditStorage, DatasetConfig } from 'jojotaoo_components'

// 运行时分支：mock = 前端内存存储/持久化；server = 走真实后端接口
export interface ProjectServiceOptions {
  mode?: 'mock' | 'server'
  requestOriginUrl?: string
}

// 项目项（status 为枚举：0=未发布, 1=已发布）
export interface ProjectItem {
  id: string
  name: string
  category: string
  description: string
  status: 0 | 1
  creator: string
  createdAt: number
  updatedAt: number
  schema?: ChartEditStorage
}

// 发给服务端的创建体：不含 id/createdAt/updatedAt/status（由服务端生成）
export type ProjectWritable = Pick<ProjectItem, 'name' | 'category' | 'description'>

// 列表查询入参（分页 + 模糊查询；POST body 传参）
export interface ProjectListQuery {
  page: number
  pageSize: number
  keyword?: string
}

// 列表查询响应（统一 data 包：{ list, total }）
export interface ProjectListResult<T> {
  list: T[]
  total: number
}

// mock 模式本地生成 id（无后端时作为内存主键）
export function genId(): string {
  return 'prj-' + Math.random().toString(36).slice(2, 10)
}

// mock 分支共用：keyword 过滤 + page/pageSize 切片；total 为过滤后总数
export function paginateFilter<T>(
  items: T[],
  query: ProjectListQuery,
  match: (item: T, keyword: string) => boolean,
): ProjectListResult<T> {
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

export type { ChartEditStorage, DatasetConfig } from 'jojotaoo_components'

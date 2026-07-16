import type { DataSourceItem } from 'jojotaoo_components'
import { DatasetServiceOptions, ListQuery, ListResult, MOCK_DATA_SOURCES, paginateFilter } from './types'

// 数据源列表响应体：统一 data 包 { list, total }
export type FetchDataSourceListResponse = ListResult<DataSourceItem>

// 数据源列表（分页 + 模糊查询）：server 走 POST /api/datasource/list；
// mock 本地对内置注册表做 keyword 过滤 + 切片。
export async function fetchDataSourceList(
  query: ListQuery,
  opts: DatasetServiceOptions = {},
): Promise<FetchDataSourceListResponse> {
  if (opts.mode === 'server' && opts.requestOriginUrl) {
    const res = await fetch(`${opts.requestOriginUrl}/api/datasource/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    })
    if (!res.ok) throw new Error('获取数据源列表失败')
    const json = await res.json()
    const data = (json as any)?.data ?? json
    return { list: data.list ?? [], total: data.total ?? 0 }
  }
  return paginateFilter(
    MOCK_DATA_SOURCES,
    query,
    (i, k) => i.name.includes(k) || i.id.includes(k) || i.type.includes(k),
  )
}

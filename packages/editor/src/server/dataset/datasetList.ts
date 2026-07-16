import type { DatasetConfig } from 'jojotaoo_components'
import { useDatasetStore } from '../../stores/dataset'
import { DatasetServiceOptions, ListQuery, ListResult, paginateFilter } from './types'

// 数据集列表响应体：统一 data 包 { list, total }
export type FetchDatasetListResponse = ListResult<DatasetConfig>

// 数据集列表（分页 + 模糊查询）：server 走 POST /api/dataset/list；
// mock 直接复用本地 store（localStorage 持久化）做 keyword 过滤 + 切片，不再另造 mock 数据集。
export async function fetchDatasetList(
  query: ListQuery,
  opts: DatasetServiceOptions = {},
): Promise<FetchDatasetListResponse> {
  if (opts.mode === 'server' && opts.requestOriginUrl) {
    const res = await fetch(`${opts.requestOriginUrl}/api/dataset/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    })
    if (!res.ok) throw new Error('获取数据集列表失败')
    const json = await res.json()
    const data = (json as any)?.data ?? json
    return { list: data.list ?? [], total: data.total ?? 0 }
  }
  const store = useDatasetStore()
  return paginateFilter(store.datasets, query, (i, k) => i.name.includes(k) || i.dataSourceId.includes(k))
}

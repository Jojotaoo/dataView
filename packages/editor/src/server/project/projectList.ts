import type { ProjectItem, ProjectListQuery, ProjectListResult, ProjectServiceOptions } from './types'
import { paginateFilter } from './types'

// 项目列表响应体：统一 data 包 { list, total }
export type FetchProjectListResponse = ProjectListResult<ProjectItem>

// 项目列表（分页 + 模糊查询）：server 走 POST /api/project/list；
// mock 本地对内存 store 做 keyword(name/category) 过滤 + 切片。
export async function fetchProjectList(
  query: ProjectListQuery,
  opts: ProjectServiceOptions = {},
): Promise<FetchProjectListResponse> {
  if (opts.mode === 'server' && opts.requestOriginUrl) {
    const res = await fetch(`${opts.requestOriginUrl}/api/project/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    })
    if (!res.ok) throw new Error('获取项目列表失败')
    const json = await res.json()
    const data = (json as any)?.data ?? json
    return { list: data.list ?? [], total: data.total ?? 0 }
  }
  const { useProjectStore } = await import('../../stores/project')
  const store = useProjectStore()
  return paginateFilter(store.projects, query, (i, k) => i.name.includes(k) || i.category.includes(k))
}

import type { ProjectItem, ProjectServiceOptions } from './types'

// 获取项目响应体
export type GetProjectResponse = ProjectItem

// 获取单个项目（含 schema）
export async function getProject(id: string, opts: ProjectServiceOptions = {}): Promise<GetProjectResponse> {
  if (opts.mode === 'server' && opts.requestOriginUrl) {
    const res = await fetch(`${opts.requestOriginUrl}/api/project/${id}`, { method: 'GET' })
    if (!res.ok) throw new Error('获取项目失败')
    const json = await res.json()
    return (json as any)?.data ?? json
  }
  const { useProjectStore } = await import('../../stores/project')
  debugger
  const store = useProjectStore()
  const item = store.getProject(id)
  if (!item) throw new Error('项目不存在')
  return item
}

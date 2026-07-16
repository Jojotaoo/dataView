import type { ChartEditStorage, ProjectServiceOptions } from './types'

// 发布项目（保存并改状态）响应体
export type PublishProjectResponse = any

// 发布项目：保存当前 schema + 将 status 置为 1（已发布）。server 走 PUT /api/project/:id/publish
export async function publishProjectSchema(
  id: string,
  schema: ChartEditStorage,
  opts: ProjectServiceOptions = {},
): Promise<PublishProjectResponse> {
  if (opts.mode === 'server' && opts.requestOriginUrl) {
    const res = await fetch(`${opts.requestOriginUrl}/api/project/${id}/publish`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schema),
    })
    if (!res.ok) throw new Error('发布项目失败')
    const json = await res.json()
    return (json as any)?.data ?? json
  }
  const { useProjectStore } = await import('../../stores/project')
  const store = useProjectStore()
  store.publishProjectSchema(id, schema)
  return store.getProject(id)
}

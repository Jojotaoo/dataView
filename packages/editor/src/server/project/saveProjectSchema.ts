import type { ChartEditStorage, ProjectServiceOptions } from './types'

// 保存项目 Schema 响应体（回写更新后的项目）
export type SaveProjectSchemaResponse = any

// 保存项目 Schema（仅写 schema 结构，不改 status/元信息）：server 走 PUT /api/project/:id/schema
export async function saveProjectSchema(
  id: string,
  schema: ChartEditStorage,
  opts: ProjectServiceOptions = {},
): Promise<SaveProjectSchemaResponse> {
  if (opts.mode === 'server' && opts.requestOriginUrl) {
    const res = await fetch(`${opts.requestOriginUrl}/api/project/${id}/schema`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schema),
    })
    if (!res.ok) throw new Error('保存项目失败')
    const json = await res.json()
    return (json as any)?.data ?? json
  }
  const { useProjectStore } = await import('../../stores/project')
  const store = useProjectStore()
  store.updateProjectSchema(id, schema)
  return store.getProject(id)
}

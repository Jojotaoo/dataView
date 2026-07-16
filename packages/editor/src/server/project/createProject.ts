import type { ProjectItem, ProjectServiceOptions, ProjectWritable } from './types'

// 创建项目响应体（服务端生成 id/createdAt/updatedAt/status 后回写）
export type CreateProjectResponse = ProjectItem

// 新建项目（id/createdAt/updatedAt/status 由服务端生成；mock 本地生成）
export async function createProject(
  input: ProjectWritable,
  opts: ProjectServiceOptions = {},
): Promise<CreateProjectResponse> {
  if (opts.mode === 'server' && opts.requestOriginUrl) {
    const res = await fetch(`${opts.requestOriginUrl}/api/project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) throw new Error('创建项目失败')
    const json = await res.json()
    return (json as any)?.data ?? json
  }
  const now = Date.now()
  const item: ProjectItem = {
    id: genId(),
    name: input.name,
    category: input.category,
    description: input.description,
    status: 0,
    creator: '',
    createdAt: now,
    updatedAt: now,
  }
  const { useProjectStore } = await import('../../stores/project')
  useProjectStore().addProject(item)
  return item
}

function genId(): string {
  return 'prj-' + Math.random().toString(36).slice(2, 10)
}

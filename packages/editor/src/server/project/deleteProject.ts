import type { ProjectServiceOptions } from './types'

// 删除项目（server 走 DELETE；mock 仅内存移除）
export async function deleteProject(id: string, opts: ProjectServiceOptions = {}): Promise<void> {
  if (opts.mode === 'server' && opts.requestOriginUrl) {
    const res = await fetch(`${opts.requestOriginUrl}/api/project/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('删除项目失败')
    return
  }
  const { useProjectStore } = await import('../../stores/project')
  const store = useProjectStore()
  store.removeProject(id)
}

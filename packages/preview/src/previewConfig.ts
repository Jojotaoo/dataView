import type { ChartEditStorage } from 'jojotaoo_components'

// 服务端地址占位：后续替换为真实后端域名（如通过环境变量注入）
export const PREVIEW_API_ORIGIN = ''

// 默认走 server；仅当 URL query 显式携带 mode=mock 时走 mock/localStorage 逻辑
export function getPreviewMode(search: string): 'server' | 'mock' {
  const params = new URLSearchParams(search)
  return params.get('mode') === 'mock' ? 'mock' : 'server'
}

// 从服务端拉取项目 schema；任意失败（非 ok / 抛错 / 无 schema）返回 null，由调用方回退 localStorage
export async function fetchPreviewSchema(projectId: string): Promise<ChartEditStorage | null> {
  if (!PREVIEW_API_ORIGIN) return null
  try {
    const res = await fetch(`${PREVIEW_API_ORIGIN}/api/project/${projectId}`, { method: 'GET' })
    if (!res.ok) return null
    const json = await res.json()
    const data = (json as any)?.data ?? json
    const schema = data?.schema ?? data
    return schema ?? null
  } catch {
    return null
  }
}

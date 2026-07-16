import { DatasetServiceOptions } from './types'

// 删除数据集（server 走 DELETE；mock 仅本地 store 负责移除，这里空操作）
export async function deleteDataset(id: string, opts: DatasetServiceOptions = {}): Promise<void> {
  if (opts.mode === 'server' && opts.requestOriginUrl) {
    const res = await fetch(`${opts.requestOriginUrl}/api/dataset/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('删除数据集失败')
  }
}

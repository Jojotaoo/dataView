import type { DatasetConfig } from 'jojotaoo_components'
import { buildDatasetSQL } from 'jojotaoo_components'
import { DatasetServiceOptions, DatasetWritable } from './types'

// 更新数据集响应体（服务端写入 updatedAt 后回写）
export type UpdateDatasetResponse = DatasetConfig

function toWritable(config: DatasetConfig): DatasetWritable {
  return {
    name: config.name,
    dataSourceId: config.dataSourceId,
    sql: config.sql,
    transform: config.transform,
    generatedSql: buildDatasetSQL(config),
  }
}

// 保存数据集（基础信息或加工步骤变更后统一调用；server 走 PUT）。
// 请求体仅含可更新字段（不含 id/updatedAt），id 走路径，updatedAt 由服务端写入；
// mock 模式无后端，直接更新本地 config（带 updatedAt 时间戳）。
export async function saveDataset(
  config: DatasetConfig,
  opts: DatasetServiceOptions = {},
): Promise<UpdateDatasetResponse> {
  if (opts.mode === 'server' && opts.requestOriginUrl) {
    const res = await fetch(`${opts.requestOriginUrl}/api/dataset/${config.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toWritable(config)),
    })
    if (!res.ok) throw new Error('保存数据集失败')
    return (await res.json()) as UpdateDatasetResponse
  }
  return { ...config, updatedAt: Date.now() }
}

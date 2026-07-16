import type { DatasetConfig, DatasetPreviewResult } from 'jojotaoo_components'
import { buildDatasetSQL, executeDatasetPreview } from 'jojotaoo_components'
import { DatasetServiceOptions } from './types'

// 数据集预览响应体（只读计算，不落库）
export type PreviewDatasetResponse = DatasetPreviewResult

// 数据集预览（只读计算，不落库）：server 走 POST /api/dataset/preview（完整 config 由后端执行）；
// mock 本地用 executeDatasetPreview 对内置样本表做内存加工。每次加工变化统一走此接口。
export async function previewDataset(
  config: DatasetConfig,
  opts: DatasetServiceOptions = {},
): Promise<PreviewDatasetResponse> {
  const payload: DatasetConfig = { ...config, generatedSql: buildDatasetSQL(config) }
  if (opts.mode === 'server' && opts.requestOriginUrl) {
    const res = await fetch(`${opts.requestOriginUrl}/api/dataset/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('预览数据集失败')
    const json = await res.json()
    const data = (json as any)?.data ?? json
    return { sql: data.sql, columns: data.columns, rows: data.rows }
  }
  return executeDatasetPreview(config)
}

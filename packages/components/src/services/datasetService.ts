// 数据集运行时取数（components 侧唯一实现）
// 创建/保存/删除/数据源枚举已迁移至 editor 的 server/dataset。
// mock 模式依赖 ../mock 的内存加工；server 模式按契约走真实后端 /api/dataset/execute。

import type { DatasetConfig } from '../types/dataset'
import { resolveUrl } from '../composables/useRequestMerge'
import { rowsToEChartsDataset, type EChartsDataset } from '../utils/datasetTransform'
import { executeDatasetPreview } from '../mock'

// 运行时（DataFetchManager）与面板测试按钮（ComponentDatasource）共用的「取数据集数据」逻辑（唯一实现）
export interface DatasetFetchOptions {
  mode?: 'mock' | 'server'
  requestOriginUrl?: string
  resolve?: (id: string) => DatasetConfig | undefined
}

export async function fetchDatasetResult(datasetId: string, opts: DatasetFetchOptions = {}): Promise<EChartsDataset> {
  const mode = opts.mode ?? 'mock'
  if (mode === 'server' && opts.requestOriginUrl) {
    const url = resolveUrl(opts.requestOriginUrl, '/api/dataset/execute')
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datasetId }),
    })
    const json = await res.json()
    const data = (json as any)?.data ?? json
    return rowsToEChartsDataset(data.rows, data.columns)
  }
  const dsConfig = opts.resolve?.(datasetId)
  if (!dsConfig) throw new Error('未找到数据集')
  const result = await executeDatasetPreview(dsConfig)
  return rowsToEChartsDataset(result.rows, result.columns)
}

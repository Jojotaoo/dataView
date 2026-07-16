import type { DatasetConfig } from 'jojotaoo_components'
import { buildDatasetSQL } from 'jojotaoo_components'
import { DatasetServiceOptions, DatasetWritable, MOCK_DATA_SOURCES, genId } from './types'

export interface CreateDatasetInput {
  name: string
  dataSourceId: string
  sql: string
}

// 创建数据集响应体（服务端生成 id/createdAt/updatedAt 后回写）
export type CreateDatasetResponse = DatasetConfig

// 新建数据集（id/createdAt/updatedAt 由服务端生成；mock 本地生成）
export async function createDataset(
  input: CreateDatasetInput,
  opts: DatasetServiceOptions = {},
): Promise<CreateDatasetResponse> {
  if (opts.mode === 'server' && opts.requestOriginUrl) {
    const writable: DatasetWritable = {
      name: input.name,
      dataSourceId: input.dataSourceId,
      sql: input.sql,
      transform: { steps: [] },
      generatedSql: buildDatasetSQL({
        id: '',
        name: input.name,
        dataSourceId: input.dataSourceId,
        sql: input.sql,
        transform: { steps: [] },
      }),
    }
    const res = await fetch(`${opts.requestOriginUrl}/api/dataset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(writable),
    })
    if (!res.ok) throw new Error('创建数据集失败')
    return (await res.json()) as CreateDatasetResponse
  }
  const config: DatasetConfig = {
    id: genId(),
    name: input.name,
    dataSourceId: input.dataSourceId,
    sql: input.sql,
    transform: { steps: [] },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  config.generatedSql = buildDatasetSQL(config)
  return config
}

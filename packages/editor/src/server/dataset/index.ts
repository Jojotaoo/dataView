// 数据集 Service 层（editor 侧）：每个接口独立文件，详见各文件。
// 运行时取数（mock/server 分支）仍在 jojotaoo_components 的 fetchDatasetResult 中。
// 真实后端契约（前端不实现，仅文档）：详见仓库 tech/dataset-api.md
//   GET  {requestOriginUrl}/api/datasource/enum   -> DataSourceItem[]
//   POST {requestOriginUrl}/api/dataset          body:DatasetWritable -> DatasetConfig
//   PUT  {requestOriginUrl}/api/dataset/:id       body:DatasetWritable -> DatasetConfig
//   DELETE {requestOriginUrl}/api/dataset/:id                          -> void
//   POST {requestOriginUrl}/api/dataset/preview  body:DatasetConfig    -> DatasetPreviewResult
//   POST {requestOriginUrl}/api/datasource/list  body:ListQuery        -> { list:DataSourceItem[], total }
//   POST {requestOriginUrl}/api/dataset/list     body:ListQuery        -> { list:DatasetConfig[], total }
//   前端已在请求体携带 generatedSql（buildDatasetSQL 组装好的完整 SQL）；服务端可直接使用或依据 base sql + transform 自行重拼。

export * from './types'
export * from './datasourceEnum'
export * from './datasourceList'
export * from './datasetList'
export * from './createDataset'
export * from './updateDataset'
export * from './deleteDataset'
export * from './previewDataset'

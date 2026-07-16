// 项目 Service 层（editor 侧）：每个接口独立文件，详见各文件。
// 真实后端契约（前端不实现，仅文档）：详见仓库 tech/project-api.md
//   POST   {requestOriginUrl}/api/project              body:ProjectWritable        -> ProjectItem
//   GET    {requestOriginUrl}/api/project/:id                                  -> ProjectItem(含 schema)
//   PUT    {requestOriginUrl}/api/project/:id/schema  body:ChartEditStorage     -> ProjectItem
//   PUT    {requestOriginUrl}/api/project/:id/publish body:ChartEditStorage     -> ProjectItem(status=1)
//   POST   {requestOriginUrl}/api/project/list         body:ProjectListQuery     -> { list:ProjectItem[], total }
//   DELETE {requestOriginUrl}/api/project/:id                                  -> void

export * from './types'
export * from './createProject'
export * from './getProject'
export * from './saveProjectSchema'
export * from './publishProject'
export * from './projectList'
export * from './deleteProject'

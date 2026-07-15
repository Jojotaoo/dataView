// 数据集类型定义（全局资源，平台级）
// 规范双用：服务端据此拼装 SQL；前端据此二次编辑回填。

/** 远端数据源枚举项（mock 返回，真实由平台服务端注册表提供） */
export interface DataSourceItem {
  id: string
  name: string
  type: 'mysql' | 'postgres' | 'clickhouse' | 'api'
}

// —— 过滤（行级 WHERE）——
export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'isNull' | 'notNull'

export interface FilterCondition {
  field: string
  operator: FilterOperator
  value?: string | number | (string | number)[]
  enabled?: boolean
}

export interface FilterStep {
  type: 'filter'
  logic: 'and' | 'or'
  conditions: FilterCondition[]
}

// —— 公式列（结构化表达式，可序列化、可翻译为 SQL）——
export type FormulaExpr =
  | { kind: 'field'; field: string }
  | { kind: 'const'; value: number | string }
  | { kind: 'op'; op: '+' | '-' | '*' | '/'; left: FormulaExpr; right: FormulaExpr }
  | { kind: 'func'; fn: 'ROUND' | 'UPPER' | 'LOWER' | 'CONCAT' | 'COALESCE'; args: FormulaExpr[] }

export interface FormulaColumn {
  name: string
  expression: FormulaExpr
  type?: 'number' | 'string' | 'date'
  enabled?: boolean
}

export interface FormulaStep {
  type: 'formula'
  columns: FormulaColumn[]
}

// —— 汇总列（窗口聚合，不减少行数）——
export type AggregateFunction = 'SUM' | 'AVG' | 'COUNT' | 'MAX' | 'MIN'

export interface SummaryColumn {
  name: string
  function: AggregateFunction
  field: string
  partitionBy?: string[]
  enabled?: boolean
}

export interface SummaryStep {
  type: 'summary'
  columns: SummaryColumn[]
}

// —— 字段设置（最终输出列）——
export interface SelectField {
  source: string // base 列名 或 派生列名
  alias?: string
  enabled: boolean
}

export interface SelectStep {
  type: 'select'
  fields: SelectField[]
}

// —— 排序 ——
export interface SortRule {
  field: string
  order: 'asc' | 'desc'
  enabled?: boolean
}

export interface SortStep {
  type: 'sort'
  rules: SortRule[]
}

export type TransformStep = SelectStep | FilterStep | FormulaStep | SummaryStep | SortStep

export interface DatasetTransform {
  steps: TransformStep[]
}

/** 完整数据集配置（dataset store 全量保存；组件 schema 仅引用其 id） */
export interface DatasetConfig {
  id: string
  name: string
  dataSourceId: string // 仅引用数据源；连接 uri/凭证在服务端注册表，前端不持有
  sql: string // base SQL
  transform: DatasetTransform
  generatedSql?: string // 前端用 buildDatasetSQL 组装好的完整可执行 SQL；服务端可直接使用或自行重拼
  createdAt?: number
  updatedAt?: number
}

/** 预览/执行返回结构 */
export interface DatasetPreviewResult {
  sql: string // 服务端将执行的最终 SQL（mock 由 buildDatasetSQL 生成）
  columns: string[]
  rows: Record<string, unknown>[]
}

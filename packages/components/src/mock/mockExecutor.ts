import type {
  DatasetConfig,
  DatasetPreviewResult,
  FormulaExpr,
  FilterCondition,
  FilterStep,
  SummaryStep,
  SelectStep,
} from '../types/dataset'
import {
  buildDatasetSQL,
  getColumnsFromRows,
  getFilter,
  getFormula,
  getSummary,
  getSelect,
} from '../utils/datasetTransform'
import { MOCK_TABLES } from './mockData'

// mock 模式：用内置样本表作为 base 行，走前端内存加工，附 buildDatasetSQL 作为契约展示
export function executeDatasetPreview(config: DatasetConfig): Promise<DatasetPreviewResult> {
  const baseRows = MOCK_TABLES[config.dataSourceId] ?? []
  return Promise.resolve(applyTransformsInMemory(baseRows, config))
}

function toNum(v: unknown): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return isNaN(n) ? 0 : n
}

function evalExpr(node: FormulaExpr, row: Record<string, unknown>): unknown {
  switch (node.kind) {
    case 'field':
      return row[node.field]
    case 'const':
      return node.value
    case 'op': {
      const l = toNum(evalExpr(node.left, row))
      const r = toNum(evalExpr(node.right, row))
      switch (node.op) {
        case '+':
          return l + r
        case '-':
          return l - r
        case '*':
          return l * r
        case '/':
          return r === 0 ? 0 : l / r
      }
      return 0
    }
    case 'func': {
      const args = node.args.map((a) => evalExpr(a, row))
      switch (node.fn) {
        case 'ROUND': {
          const n = toNum(args[0])
          const d = args.length > 1 ? toNum(args[1]) : 2
          const f = Math.pow(10, d)
          return Math.round(n * f) / f
        }
        case 'UPPER':
          return String(args[0]).toUpperCase()
        case 'LOWER':
          return String(args[0]).toLowerCase()
        case 'CONCAT':
          return args.map((a) => String(a)).join('')
        case 'COALESCE': {
          const found = args.find((a) => a != null && a !== '')
          return found == null ? null : found
        }
      }
      return null
    }
  }
}

function conditionMatches(row: Record<string, unknown>, c: FilterCondition): boolean {
  const v = row[c.field]
  switch (c.operator) {
    case 'isNull':
      return v == null
    case 'notNull':
      return v != null
    case 'eq':
      return String(v) === String(c.value)
    case 'neq':
      return String(v) !== String(c.value)
    case 'gt':
      return toNum(v) > toNum(c.value)
    case 'gte':
      return toNum(v) >= toNum(c.value)
    case 'lt':
      return toNum(v) < toNum(c.value)
    case 'lte':
      return toNum(v) <= toNum(c.value)
    case 'like':
      return String(v).includes(String(c.value))
    case 'in': {
      const arr = Array.isArray(c.value) ? c.value : c.value != null ? [c.value] : []
      return arr.map(String).includes(String(v))
    }
  }
  return true
}

function rowMatches(row: Record<string, unknown>, step: FilterStep): boolean {
  const conditions = step.conditions.filter((c) => c.enabled !== false && c.field)
  if (!conditions.length) return true
  const results = conditions.map((c) => conditionMatches(row, c))
  return step.logic === 'or' ? results.some(Boolean) : results.every(Boolean)
}

function computeSummary(rows: Record<string, unknown>[], col: SummaryStep['columns'][number]): void {
  const groups = new Map<string, Record<string, unknown>[]>()
  if (col.partitionBy && col.partitionBy.length) {
    for (const row of rows) {
      const key = col.partitionBy.map((k) => String(row[k])).join('|')
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(row)
    }
  } else {
    groups.set('', rows)
  }
  for (const group of groups.values()) {
    const vals = group.map((r) => r[col.field]).filter((v) => v != null)
    let agg: unknown = null
    switch (col.function) {
      case 'SUM':
        agg = vals.reduce<number>((a, b) => toNum(a) + toNum(b), 0)
        break
      case 'AVG':
        agg = vals.length ? vals.reduce<number>((a, b) => toNum(a) + toNum(b), 0) / vals.length : 0
        break
      case 'COUNT':
        agg = vals.length
        break
      case 'MAX':
        agg = vals.reduce<unknown>((a, b) => (toNum(a) > toNum(b) ? a : b), vals[0])
        break
      case 'MIN':
        agg = vals.reduce<unknown>((a, b) => (toNum(a) < toNum(b) ? a : b), vals[0])
        break
    }
    for (const row of group) row[col.name] = agg
  }
}

function applySelect(
  rows: Record<string, unknown>[],
  step: SelectStep,
): { rows: Record<string, unknown>[]; columns: string[] } {
  const fields = step.fields.filter((f) => f.enabled)
  const columns = fields.map((f) => (f.alias && f.alias !== f.source ? f.alias : f.source))
  const out = rows.map((row) => {
    const nr: Record<string, unknown> = {}
    for (const f of fields) {
      const key = f.alias && f.alias !== f.source ? f.alias : f.source
      nr[key] = row[f.source]
    }
    return nr
  })
  return { rows: out, columns }
}

// 内存执行（mock：对样本行做 filter -> formula -> summary -> select）
export function applyTransformsInMemory(rows: Record<string, unknown>[], config: DatasetConfig): DatasetPreviewResult {
  const steps = config.transform?.steps ?? []
  let working = rows.map((r) => ({ ...r }))

  const filterStep = getFilter(steps)
  if (filterStep) {
    working = working.filter((row) => rowMatches(row, filterStep))
  }

  const formulaStep = getFormula(steps)
  if (formulaStep) {
    for (const col of formulaStep.columns) {
      if (col.enabled === false) continue
      for (const row of working) row[col.name] = evalExpr(col.expression, row)
    }
  }

  const summaryStep = getSummary(steps)
  if (summaryStep) {
    for (const col of summaryStep.columns) {
      if (col.enabled === false) continue
      computeSummary(working, col)
    }
  }

  let columns: string[]
  const selectStep = getSelect(steps)
  if (selectStep) {
    const res = applySelect(working, selectStep)
    working = res.rows
    columns = res.columns
  } else {
    columns = getColumnsFromRows(working)
  }

  return {
    sql: buildDatasetSQL(config),
    columns,
    rows: working,
  }
}

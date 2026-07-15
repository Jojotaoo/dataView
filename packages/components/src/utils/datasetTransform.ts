// 数据集纯函数层（无副作用、可单测）
// 规范 <-> SQL 的唯一合同实现：buildDatasetSQL / expressionToSQL（mock 与真实后端共用）。
// 内存执行（mock）已迁移至 ./mock/mockExecutor.ts，本文件只保留可共享的 SQL 拼装与行/维度转换。

import type {
  DatasetConfig,
  FormulaExpr,
  FilterCondition,
  FilterStep,
  FormulaStep,
  SummaryStep,
  SelectStep,
  SortStep,
  TransformStep,
  FilterOperator,
} from '../types/dataset'

const SQ = String.fromCharCode(39)
const TAB = String.fromCharCode(9)
const NL = String.fromCharCode(10)

const FILTER_OP_SQL: Record<FilterOperator, string> = {
  eq: '=',
  neq: '<>',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  like: 'LIKE',
  in: 'IN',
  isNull: 'IS NULL',
  notNull: 'IS NOT NULL',
}

function quoteStr(v: string): string {
  return (
    SQ +
    String(v)
      .split(SQ)
      .join(SQ + SQ) +
    SQ
  )
}

function literal(value: unknown): string {
  if (value == null) return 'NULL'
  if (typeof value === 'number') return String(value)
  return quoteStr(String(value))
}

export function getFilter(steps: TransformStep[]): FilterStep | undefined {
  return steps.find((s) => s.type === 'filter') as FilterStep | undefined
}
export function getFormula(steps: TransformStep[]): FormulaStep | undefined {
  return steps.find((s) => s.type === 'formula') as FormulaStep | undefined
}
export function getSummary(steps: TransformStep[]): SummaryStep | undefined {
  return steps.find((s) => s.type === 'summary') as SummaryStep | undefined
}
export function getSelect(steps: TransformStep[]): SelectStep | undefined {
  return steps.find((s) => s.type === 'select') as SelectStep | undefined
}
function getSort(steps: TransformStep[]): SortStep | undefined {
  return steps.find((s) => s.type === 'sort') as SortStep | undefined
}

// —— 公式表达式 -> SQL 片段 ——
export function expressionToSQL(node: FormulaExpr): string {
  switch (node.kind) {
    case 'field':
      return node.field
    case 'const':
      return literal(node.value)
    case 'op':
      return '(' + expressionToSQL(node.left) + ' ' + node.op + ' ' + expressionToSQL(node.right) + ')'
    case 'func': {
      const args = node.args.map(expressionToSQL).join(', ')
      return node.fn + '(' + args + ')'
    }
  }
}

function conditionToSQL(c: FilterCondition): string {
  const f = c.field
  switch (c.operator) {
    case 'isNull':
      return f + ' IS NULL'
    case 'notNull':
      return f + ' IS NOT NULL'
    case 'in': {
      const arr = Array.isArray(c.value) ? c.value : c.value != null ? [c.value] : []
      return f + ' IN (' + arr.map(literal).join(', ') + ')'
    }
    default:
      return f + ' ' + FILTER_OP_SQL[c.operator] + ' ' + literal(c.value)
  }
}

// —— 规范 -> 最终 SQL（合同实现，拼装顺序确定）——
export function buildDatasetSQL(config: DatasetConfig): string {
  const steps = config.transform?.steps ?? []
  const filterStep = getFilter(steps)
  const formulaStep = getFormula(steps)
  const summaryStep = getSummary(steps)
  const selectStep = getSelect(steps)
  const sortStep = getSort(steps)

  const innerSelects: string[] = ['*']
  if (formulaStep) {
    for (const col of formulaStep.columns) {
      if (col.enabled === false) continue
      innerSelects.push('(' + expressionToSQL(col.expression) + ') AS ' + col.name)
    }
  }
  if (summaryStep) {
    for (const col of summaryStep.columns) {
      if (col.enabled === false) continue
      const over =
        col.partitionBy && col.partitionBy.length
          ? ' OVER (PARTITION BY ' + col.partitionBy.join(', ') + ')'
          : ' OVER ()'
      innerSelects.push(col.function + '(' + col.field + ')' + over + ' AS ' + col.name)
    }
  }

  let sql = 'SELECT '
  if (selectStep) {
    const cols = selectStep.fields
      .filter((f) => f.enabled)
      .map((f) => (f.alias && f.alias !== f.source ? f.source + ' AS ' + f.alias : f.source))
    sql += cols.length ? cols.join(', ') : '*'
  } else {
    sql += '*'
  }

  sql += ' FROM ( SELECT ' + innerSelects.join(', ') + ' FROM (' + config.sql + ') __src'

  if (filterStep) {
    const conditions = filterStep.conditions.filter((c) => c.enabled !== false && c.field).map((c) => conditionToSQL(c))
    if (conditions.length) {
      const joiner = filterStep.logic === 'or' ? ' OR ' : ' AND '
      sql += ' WHERE ' + conditions.join(joiner)
    }
  }
  sql += ' ) __t'

  if (sortStep) {
    const rules = sortStep.rules.filter((r) => r.enabled !== false && r.field)
    if (rules.length) {
      sql += ' ORDER BY ' + rules.map((r) => r.field + ' ' + (r.order === 'desc' ? 'DESC' : 'ASC')).join(', ')
    }
  }
  return sql
}

export function getColumnsFromRows(rows: Record<string, unknown>[]): string[] {
  const set: string[] = []
  for (const row of rows) {
    for (const k of Object.keys(row)) {
      if (!set.includes(k)) set.push(k)
    }
  }
  return set
}

export interface EChartsDataset {
  dimensions: string[]
  source: unknown[][]
}

export function rowsToEChartsDataset(rows: Record<string, unknown>[], columns: string[]): EChartsDataset {
  return {
    dimensions: columns,
    source: rows.map((r) => columns.map((c) => r[c] ?? null)),
  }
}

// —— 可选：文本表达式解析（默认 UI 为纯可视化构建器，不直接使用）——
// 支持 + - * / 括号与白名单函数 ROUND/UPPER/LOWER/CONCAT/COALESCE。
type Tok = { t: 'num' | 'ident' | 'op' | 'lp' | 'rp' | 'comma'; v: string }

const FUNCS = ['ROUND', 'UPPER', 'LOWER', 'CONCAT', 'COALESCE']

function tokenize(text: string): Tok[] {
  const toks: Tok[] = []
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (ch === ' ' || ch === TAB || ch === NL) {
      i++
      continue
    }
    if ((ch >= '0' && ch <= '9') || (ch === '.' && i + 1 < text.length && text[i + 1] >= '0' && text[i + 1] <= '9')) {
      let num = ''
      while (i < text.length && ((text[i] >= '0' && text[i] <= '9') || text[i] === '.')) {
        num += text[i]
        i++
      }
      toks.push({ t: 'num', v: num })
      continue
    }
    if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') {
      let id = ''
      while (i < text.length && /[a-zA-Z0-9_]/.test(text[i])) {
        id += text[i]
        i++
      }
      toks.push({ t: 'ident', v: id })
      continue
    }
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      toks.push({ t: 'op', v: ch })
      i++
      continue
    }
    if (ch === '(') {
      toks.push({ t: 'lp', v: ch })
      i++
      continue
    }
    if (ch === ')') {
      toks.push({ t: 'rp', v: ch })
      i++
      continue
    }
    if (ch === ',') {
      toks.push({ t: 'comma', v: ch })
      i++
      continue
    }
    i++
  }
  return toks
}

export function parseExpression(text: string): FormulaExpr {
  const toks = tokenize(text)
  let pos = 0
  const peek = (): Tok | undefined => toks[pos]
  const next = (): Tok | undefined => toks[pos++]

  function parseExpr(): FormulaExpr {
    let left = parseTerm()
    let p = peek()
    while (p && p.t === 'op' && (p.v === '+' || p.v === '-')) {
      next()
      const right = parseTerm()
      left = { kind: 'op', op: p.v as '+' | '-', left, right }
      p = peek()
    }
    return left
  }

  function parseTerm(): FormulaExpr {
    let left = parseFactor()
    let p = peek()
    while (p && p.t === 'op' && (p.v === '*' || p.v === '/')) {
      next()
      const right = parseFactor()
      left = { kind: 'op', op: p.v as '*' | '/', left, right }
      p = peek()
    }
    return left
  }

  function parseFactor(): FormulaExpr {
    const tk = next()
    if (!tk) return { kind: 'const', value: 0 }
    if (tk.t === 'num') return { kind: 'const', value: parseFloat(tk.v) }
    if (tk.t === 'ident') {
      if (FUNCS.includes(tk.v)) {
        const args: FormulaExpr[] = []
        if (peek() && peek()!.t === 'lp') {
          next()
          if (!(peek() && peek()!.t === 'rp')) {
            args.push(parseExpr())
            while (peek() && peek()!.t === 'comma') {
              next()
              args.push(parseExpr())
            }
          }
          if (peek() && peek()!.t === 'rp') next()
        }
        return {
          kind: 'func',
          fn: tk.v as 'ROUND' | 'UPPER' | 'LOWER' | 'CONCAT' | 'COALESCE',
          args,
        }
      }
      return { kind: 'field', field: tk.v }
    }
    if (tk.t === 'lp') {
      const e = parseExpr()
      if (peek() && peek()!.t === 'rp') next()
      return e
    }
    return { kind: 'const', value: 0 }
  }

  return parseExpr()
}

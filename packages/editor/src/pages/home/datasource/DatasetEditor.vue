<template>
  <el-dialog v-model="visible" title="数据加工" fullscreen class="de-dialog">
    <el-alert type="info" :closable="false" show-icon style="margin-bottom: 14px">
      <template #title>加工阶段零代码：右侧步骤条逐步添加数据加工方式，SQL 与配置仅作透明展示</template>
    </el-alert>

    <div class="de-body">
      <!-- 左列：数据加工步骤（每一步 = 一个数据加工操作；末步为添加按钮） -->
      <div class="de-left">
        <aside class="de-steps-col">
          <div class="de-steps-title">数据加工步骤</div>
          <el-steps :active="activeIndex" direction="vertical" class="de-steps">
            <el-step v-for="s in steps" :key="s.id" :title="s.label" @click="selectStepById(s.id)">
              <template #description>
                <el-button link type="danger" size="small" @click.stop="removeStep(s.id)"> 移除 </el-button>
              </template>
            </el-step>
            <el-step title="添加加工步骤" class="de-add-step" @click="addVisible = !addVisible">
              <template #description>
                <el-popover v-model:visible="addVisible" :width="220" trigger="manual">
                  <div class="de-add-menu">
                    <button
                      v-for="t in ADDABLE"
                      :key="t"
                      type="button"
                      class="de-add-item"
                      :disabled="steps.some((s) => s.type === t)"
                      @click="addStep(t)"
                    >
                      {{ OP_META[t].label }}
                      <span v-if="steps.some((s) => s.type === t)" class="de-add-done">已添加</span>
                    </button>
                  </div>
                  <template #reference>
                    <span class="de-add-trigger">点击此处选择加工方式…</span>
                  </template>
                </el-popover>
              </template>
            </el-step>
          </el-steps>
        </aside>

        <!-- 生成的 SQL 与数据集配置 -->
        <section class="de-mod de-mod-c">
          <div class="de-mod-head">生成的 SQL 与数据集配置</div>
          <div class="de-sql-wrap">
            <div class="de-sub-label">SQL</div>
            <el-input :model-value="previewSql" type="textarea" :rows="3" readonly class="de-sql" />
            <div class="de-sub-label">数据集 Config（JSON）</div>
            <el-input :model-value="configJson" type="textarea" :rows="5" readonly class="de-config" />
          </div>
        </section>
      </div>

      <!-- 右：主区（上下文栏 + 配置 3 : 数据表 6） -->
      <div class="de-main">
        <!-- 上下文栏：基础信息只读 -->
        <section class="de-context">
          <div class="de-ctx-item">
            <span class="de-ctx-label">名称</span><span class="de-ctx-val">{{ baseConfig.name || '—' }}</span>
          </div>
          <div class="de-ctx-item">
            <span class="de-ctx-label">数据源</span><span class="de-ctx-val">{{ dataSourceName }}</span>
          </div>
          <div class="de-ctx-item de-ctx-sql">
            <span class="de-ctx-label">SQL</span><code class="de-ctx-code">{{ baseConfig.sql || '—' }}</code>
          </div>
          <div class="de-ctx-actions">
            <el-link type="primary" :underline="false" @click="emit('edit-base', baseConfig)">修改基础信息</el-link>
            <el-button link type="primary" :loading="pulling" @click="pullData">重新拉取</el-button>
          </div>
        </section>

        <!-- Module A：数据加工配置 -->
        <section class="de-mod de-mod-a">
          <el-alert v-if="!activeStep" type="info" :closable="false" show-icon style="margin-bottom: 12px">
            请从右侧步骤条「添加加工步骤」选择一种数据加工方式
          </el-alert>

          <el-card v-if="activeStep && activeStep.type === 'filter'" shadow="never" :header="activeStep.label">
            <el-radio-group v-model="filterLogic" size="small" style="margin-bottom: 10px">
              <el-radio-button value="and">且（同时满足）</el-radio-button>
              <el-radio-button value="or">或（满足其一）</el-radio-button>
            </el-radio-group>
            <div v-for="(c, i) in filterUI" :key="i" class="cond-row">
              <el-checkbox v-model="c.enabled" />
              <el-select v-model="c.field" placeholder="字段" class="cond-field">
                <el-option v-for="f in baseColumns" :key="f" :label="f" :value="f" />
              </el-select>
              <el-select v-model="c.operator" class="cond-op">
                <el-option v-for="o in OP_LABELS" :key="o.value" :label="o.label" :value="o.value" />
              </el-select>
              <template v-if="needValue(c.operator)">
                <el-input v-if="c.operator !== 'in'" v-model="c.valueText" placeholder="值" class="cond-value" />
                <el-input v-else v-model="c.valueText" placeholder="多个值用逗号分隔" class="cond-value" />
              </template>
              <el-button link type="danger" @click="filterUI.splice(i, 1)">删除</el-button>
            </div>
            <el-button link type="primary" @click="addFilter">添加条件</el-button>
          </el-card>

          <el-card v-else-if="activeStep && activeStep.type === 'formula'" shadow="never" :header="activeStep.label">
            <div v-for="(col, i) in formulaUI" :key="i" class="formula-block">
              <el-divider v-if="i" />
              <div class="formula-head">
                <el-input v-model="col.name" placeholder="列名" class="formula-name" />
                <el-checkbox v-model="col.enabled">启用</el-checkbox>
                <el-button link type="danger" @click="formulaUI.splice(i, 1)">删除</el-button>
              </div>
              <el-radio-group v-model="col.mode" size="small" style="margin: 8px 0">
                <el-radio-button value="op">二元运算</el-radio-button>
                <el-radio-button value="func">函数</el-radio-button>
              </el-radio-group>
              <template v-if="col.mode === 'op'">
                <div class="formula-expr">
                  <OperandEditor v-model="col.left" :fields="baseColumns" />
                  <el-select v-model="col.op" class="formula-op">
                    <el-option label="+" value="+" />
                    <el-option label="-" value="-" />
                    <el-option label="×" value="*" />
                    <el-option label="÷" value="/" />
                  </el-select>
                  <OperandEditor v-model="col.right" :fields="baseColumns" />
                </div>
              </template>
              <template v-else>
                <div class="formula-expr">
                  <el-select v-model="col.fn" class="formula-fn" @change="onFnChange(col)">
                    <el-option v-for="f in FUNC_LABELS" :key="f.value" :label="f.label" :value="f.value" />
                  </el-select>
                  <OperandEditor v-for="(a, ai) in col.args" :key="ai" v-model="col.args[ai]" :fields="baseColumns" />
                </div>
              </template>
            </div>
            <el-button link type="primary" @click="addFormula">添加计算列</el-button>
          </el-card>

          <el-card v-else-if="activeStep && activeStep.type === 'summary'" shadow="never" :header="activeStep.label">
            <div v-for="(col, i) in summaryStep.columns" :key="i" class="formula-block">
              <el-divider v-if="i" />
              <div class="formula-head">
                <el-input v-model="col.name" placeholder="列名" class="formula-name" />
                <el-checkbox v-model="col.enabled">启用</el-checkbox>
                <el-button link type="danger" @click="summaryStep.columns.splice(i, 1)">删除</el-button>
              </div>
              <div class="summary-expr">
                <el-select v-model="col.function" class="summary-fn">
                  <el-option v-for="a in AGG_LABELS" :key="a.value" :label="a.label" :value="a.value" />
                </el-select>
                <el-select v-model="col.field" placeholder="统计字段" class="summary-field">
                  <el-option v-for="f in baseColumns" :key="f" :label="f" :value="f" />
                </el-select>
                <el-select
                  v-model="col.partitionBy"
                  multiple
                  collapse-tags
                  placeholder="分组依据（可空）"
                  class="summary-part"
                >
                  <el-option v-for="f in baseColumns" :key="f" :label="f" :value="f" />
                </el-select>
              </div>
              <div class="summary-tip">对整表做统计，不改变行数</div>
            </div>
            <el-button link type="primary" @click="addSummary">添加汇总列</el-button>
          </el-card>

          <el-card v-else-if="activeStep && activeStep.type === 'sort'" shadow="never" :header="activeStep.label">
            <div v-for="(r, i) in sortStep.rules" :key="i" class="cond-row">
              <el-checkbox v-model="r.enabled" />
              <el-select v-model="r.field" placeholder="字段" class="cond-field">
                <el-option v-for="f in baseColumns" :key="f" :label="f" :value="f" />
              </el-select>
              <el-radio-group v-model="r.order" size="small">
                <el-radio-button value="asc">升序</el-radio-button>
                <el-radio-button value="desc">降序</el-radio-button>
              </el-radio-group>
              <el-button link type="danger" @click="sortStep.rules.splice(i, 1)">删除</el-button>
            </div>
            <el-button link type="primary" @click="addSort">添加排序</el-button>
          </el-card>

          <el-card v-else-if="activeStep && activeStep.type === 'select'" shadow="never" :header="activeStep.label">
            <el-checkbox-group v-model="selectedSources" class="select-fields">
              <div v-for="f in availableColumns" :key="f" class="select-field-row">
                <el-checkbox :value="f">{{ f }}</el-checkbox>
                <el-input
                  v-if="isSelected(f)"
                  v-model="aliasMap[f]"
                  size="small"
                  placeholder="显示别名（可选）"
                  class="select-alias"
                />
              </div>
            </el-checkbox-group>
            <el-button link type="primary" @click="syncSelectStep">应用字段选择</el-button>
          </el-card>
        </section>

        <!-- Module B：加工后数据表格 -->
        <section class="de-mod de-mod-b">
          <div class="de-mod-head">加工后数据预览</div>
          <div class="de-table-wrap">
            <el-table :data="previewRows" border size="small" height="100%" empty-text="正在拉取基础数据…">
              <el-table-column v-for="col in previewColumns" :key="col" :prop="col" :label="col" />
            </el-table>
          </div>
        </section>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="save">保存数据集</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchDataSourceEnum } from '../../../server/dataset'
import { executeDatasetPreview, getColumnsFromRows, MOCK_TABLES } from 'jojotaoo_components'
import OperandEditor from './OperandEditor.vue'
import type {
  DatasetConfig,
  DataSourceItem,
  SelectStep,
  FilterStep,
  FormulaStep,
  SummaryStep,
  SortStep,
  TransformStep,
  FormulaExpr,
  FormulaColumn,
  FilterCondition,
  FilterOperator,
  AggregateFunction,
} from 'jojotaoo_components'

// —— 局部 UI 模型 ——
interface OperandUI {
  kind: 'field' | 'const'
  field: string
  value: number
}
interface FormulaUI {
  name: string
  enabled: boolean
  mode: 'op' | 'func'
  op: '+' | '-' | '*' | '/'
  left: OperandUI
  right: OperandUI
  fn: 'ROUND' | 'UPPER' | 'LOWER' | 'CONCAT' | 'COALESCE'
  args: OperandUI[]
}
interface FilterUI {
  field: string
  operator: FilterOperator
  valueText: string
  enabled: boolean
}
type StepType = 'filter' | 'formula' | 'summary' | 'sort' | 'select'
interface OpStep {
  id: string
  type: StepType
  label: string
}

const OP_META: Record<StepType, { label: string }> = {
  filter: { label: '筛选数据' },
  formula: { label: '新增计算列' },
  summary: { label: '新增汇总列' },
  sort: { label: '排序' },
  select: { label: '选择展示字段' },
}
const ADDABLE: StepType[] = ['filter', 'formula', 'summary', 'sort', 'select']

const OP_LABELS: { value: FilterOperator; label: string }[] = [
  { value: 'eq', label: '等于' },
  { value: 'neq', label: '不等于' },
  { value: 'gt', label: '大于' },
  { value: 'gte', label: '大于等于' },
  { value: 'lt', label: '小于' },
  { value: 'lte', label: '小于等于' },
  { value: 'like', label: '包含' },
  { value: 'in', label: '属于其中' },
  { value: 'isNull', label: '为空' },
  { value: 'notNull', label: '不为空' },
]
const AGG_LABELS: { value: AggregateFunction; label: string }[] = [
  { value: 'SUM', label: '求和' },
  { value: 'AVG', label: '平均值' },
  { value: 'COUNT', label: '计数' },
  { value: 'MAX', label: '最大值' },
  { value: 'MIN', label: '最小值' },
]
const FUNC_LABELS: { value: FormulaUI['fn']; label: string }[] = [
  { value: 'ROUND', label: '四舍五入' },
  { value: 'UPPER', label: '转大写' },
  { value: 'LOWER', label: '转小写' },
  { value: 'CONCAT', label: '拼接' },
  { value: 'COALESCE', label: '空值替换' },
]

const visible = ref(false)
const baseConfig = ref<DatasetConfig>({
  id: '',
  name: '',
  dataSourceId: '',
  sql: '',
  transform: { steps: [] },
})
const steps = ref<OpStep[]>([])
const activeStepId = ref<string>('')
const addVisible = ref(false)
const dataSources = ref<DataSourceItem[]>([])
const baseColumns = ref<string[]>([])
const pulling = ref(false)

const activeStep = computed(() => steps.value.find((s) => s.id === activeStepId.value))
const activeIndex = computed(() => {
  const i = steps.value.findIndex((s) => s.id === activeStepId.value)
  return i < 0 ? steps.value.length : i
})
const dataSourceName = computed(() => {
  const ds = dataSources.value.find((d) => d.id === baseConfig.value.dataSourceId)
  return ds?.name ?? baseConfig.value.dataSourceId ?? '—'
})

const selectStep = reactive<SelectStep>({ type: 'select', fields: [] })
const filterLogic = ref<'and' | 'or'>('and')
const filterUI = ref<FilterUI[]>([])
const formulaUI = ref<FormulaUI[]>([])
const summaryStep = reactive<SummaryStep>({ type: 'summary', columns: [] })
const sortStep = reactive<SortStep>({ type: 'sort', rules: [] })

// 选择展示字段：勾选项 -> selectStep
const selectedSources = ref<string[]>([])
const aliasMap = reactive<Record<string, string>>({})

const preview = ref<{ columns: string[]; rows: Record<string, unknown>[]; sql: string } | null>(null)

const availableColumns = computed(() => {
  const derived = [
    ...formulaUI.value.filter((c) => c.enabled).map((c) => c.name),
    ...summaryStep.columns.filter((c) => c.enabled !== false).map((c) => c.name),
  ]
  return [...baseColumns.value, ...derived]
})

const previewColumns = computed(() => preview.value?.columns ?? [])
const previewRows = computed(() => preview.value?.rows ?? [])
const previewSql = computed(() => preview.value?.sql ?? '')
const configJson = computed(() => JSON.stringify(buildConfig(), null, 2))

function selectStepById(id: string) {
  activeStepId.value = id
  addVisible.value = false
}

function addStep(type: StepType) {
  const exist = steps.value.find((s) => s.type === type)
  if (exist) {
    activeStepId.value = exist.id
  } else {
    const id = genId()
    steps.value.push({ id, type, label: OP_META[type].label })
    activeStepId.value = id
    if (type === 'select') {
      selectStep.fields = baseColumns.value.map((c) => ({ source: c, enabled: true }))
      selectedSources.value = [...baseColumns.value]
    }
  }
  addVisible.value = false
}

function removeStep(id: string) {
  const s = steps.value.find((x) => x.id === id)
  if (!s) return
  if (s.type === 'filter') {
    filterUI.value = []
    filterLogic.value = 'and'
  } else if (s.type === 'formula') {
    formulaUI.value = []
  } else if (s.type === 'summary') {
    summaryStep.columns = []
  } else if (s.type === 'sort') {
    sortStep.rules = []
  } else if (s.type === 'select') {
    selectStep.fields = []
    selectedSources.value = []
    for (const k of Object.keys(aliasMap)) delete aliasMap[k]
  }
  steps.value = steps.value.filter((x) => x.id !== id)
  activeStepId.value = steps.value[0]?.id ?? ''
  refreshPreview()
}

function genId(): string {
  return 'ds-' + Math.random().toString(36).slice(2, 10)
}

function newOperand(): OperandUI {
  return { kind: 'field', field: '', value: 0 }
}

function needValue(op: FilterOperator): boolean {
  return op !== 'isNull' && op !== 'notNull'
}

function isSelected(f: string): boolean {
  return selectedSources.value.includes(f)
}

function addFilter() {
  filterUI.value.push({ field: '', operator: 'eq', valueText: '', enabled: true })
}
function addFormula() {
  formulaUI.value.push({
    name: '',
    enabled: true,
    mode: 'op',
    op: '+',
    left: newOperand(),
    right: newOperand(),
    fn: 'ROUND',
    args: [newOperand(), newOperand()],
  })
}
function addSummary() {
  summaryStep.columns.push({
    name: '',
    function: 'SUM',
    field: '',
    partitionBy: [],
    enabled: true,
  })
}
function addSort() {
  sortStep.rules.push({ field: '', order: 'asc', enabled: true })
}
function onFnChange(col: FormulaUI) {
  if (col.fn === 'ROUND' || col.fn === 'CONCAT') {
    if (col.args.length < 2) col.args = [newOperand(), newOperand()]
  } else {
    col.args = [newOperand()]
  }
}

function operandToExpr(op: OperandUI): FormulaExpr {
  if (op.kind === 'const') return { kind: 'const', value: Number(op.value) || 0 }
  return { kind: 'field', field: op.field || '' }
}

function operandFromExpr(e: FormulaExpr): OperandUI {
  if (e.kind === 'const') return { kind: 'const', field: '', value: Number(e.value) || 0 }
  return { kind: 'field', field: e.kind === 'field' ? e.field : '', value: 0 }
}

function toFormulaColumn(ui: FormulaUI): FormulaColumn {
  const expr: FormulaExpr =
    ui.mode === 'func'
      ? { kind: 'func', fn: ui.fn, args: ui.args.map(operandToExpr) }
      : { kind: 'op', op: ui.op, left: operandToExpr(ui.left), right: operandToExpr(ui.right) }
  return { name: ui.name, enabled: ui.enabled !== false, expression: expr }
}

function toFilterCondition(ui: FilterUI): FilterCondition {
  let value: string | number | string[] = ui.valueText
  if (ui.operator === 'in') {
    value = ui.valueText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  } else if (ui.valueText !== '' && !isNaN(Number(ui.valueText))) {
    value = Number(ui.valueText)
  }
  return { field: ui.field, operator: ui.operator, value, enabled: ui.enabled !== false }
}

function buildConfig(): DatasetConfig {
  const steps: TransformStep[] = []
  const filterStep: FilterStep = {
    type: 'filter',
    logic: filterLogic.value,
    conditions: filterUI.value.map(toFilterCondition),
  }
  if (filterStep.conditions.length) steps.push(filterStep)
  const formulaStep: FormulaStep = {
    type: 'formula',
    columns: formulaUI.value.map(toFormulaColumn),
  }
  if (formulaStep.columns.length) steps.push(formulaStep)
  if (selectStep.fields.length) steps.push({ ...selectStep })
  if (summaryStep.columns.length) steps.push(summaryStep)
  if (sortStep.rules.length) steps.push(sortStep)
  return {
    id: baseConfig.value.id,
    name: baseConfig.value.name,
    dataSourceId: baseConfig.value.dataSourceId,
    sql: baseConfig.value.sql,
    createdAt: baseConfig.value.createdAt,
    updatedAt: baseConfig.value.updatedAt,
    transform: { steps },
  }
}

function syncSelectStep() {
  selectStep.fields = availableColumns.value
    .filter((c) => selectedSources.value.includes(c))
    .map((c) => ({
      source: c,
      alias: aliasMap[c] && aliasMap[c] !== c ? aliasMap[c] : undefined,
      enabled: true,
    }))
  refreshPreview()
}

async function refreshPreview() {
  if (!baseColumns.value.length) return
  const cfg = buildConfig()
  preview.value = await executeDatasetPreview(cfg)
}

async function pullData() {
  if (!baseConfig.value.dataSourceId) return
  pulling.value = true
  try {
    const rows = MOCK_TABLES[baseConfig.value.dataSourceId] ?? []
    baseColumns.value = getColumnsFromRows(rows)
    await refreshPreview()
  } finally {
    pulling.value = false
  }
}

function resetLocal() {
  baseColumns.value = []
  selectedSources.value = []
  for (const k of Object.keys(aliasMap)) delete aliasMap[k]
  selectStep.fields = []
  filterLogic.value = 'and'
  filterUI.value = []
  formulaUI.value = []
  summaryStep.columns = []
  sortStep.rules = []
  preview.value = null
  steps.value = []
  activeStepId.value = ''
  addVisible.value = false
}

function isStepActive(s: TransformStep): boolean {
  switch (s.type) {
    case 'select':
      return (s.fields?.length ?? 0) > 0
    case 'filter':
      return (s.conditions?.length ?? 0) > 0
    case 'formula':
      return (s.columns?.length ?? 0) > 0
    case 'summary':
      return (s.columns?.length ?? 0) > 0
    case 'sort':
      return (s.rules?.length ?? 0) > 0
    default:
      return false
  }
}

function buildStepsFromConfig(cfg: DatasetConfig) {
  const t = cfg.transform?.steps ?? []
  const order: StepType[] = ['filter', 'formula', 'summary', 'sort', 'select']
  steps.value = order
    .filter((type) => t.some((s) => s.type === type && isStepActive(s)))
    .map((type) => ({ id: genId(), type, label: OP_META[type].label }))
  activeStepId.value = steps.value[0]?.id ?? ''
}

function loadFromConfig(cfg: DatasetConfig) {
  const stepsData = cfg.transform?.steps ?? []
  const sel = stepsData.find((s) => s.type === 'select') as SelectStep | undefined
  const fil = stepsData.find((s) => s.type === 'filter') as FilterStep | undefined
  const frm = stepsData.find((s) => s.type === 'formula') as FormulaStep | undefined
  const sum = stepsData.find((s) => s.type === 'summary') as SummaryStep | undefined
  const srt = stepsData.find((s) => s.type === 'sort') as SortStep | undefined

  selectStep.fields = sel ? [...sel.fields] : []
  selectedSources.value = sel ? sel.fields.map((f) => f.source) : []
  for (const k of Object.keys(aliasMap)) delete aliasMap[k]
  if (sel) {
    for (const f of sel.fields) {
      if (f.alias && f.alias !== f.source) aliasMap[f.source] = f.alias
    }
  }
  filterLogic.value = fil?.logic ?? 'and'
  filterUI.value = (fil?.conditions ?? []).map((c) => ({
    field: c.field,
    operator: c.operator,
    valueText: Array.isArray(c.value) ? c.value.join(',') : String(c.value ?? ''),
    enabled: c.enabled !== false,
  }))
  formulaUI.value = (frm?.columns ?? []).map((col) => {
    const ui: FormulaUI = {
      name: col.name,
      enabled: col.enabled !== false,
      mode: 'op',
      op: '+',
      left: newOperand(),
      right: newOperand(),
      fn: 'ROUND',
      args: [newOperand(), newOperand()],
    }
    const e = col.expression
    if (e.kind === 'func') {
      ui.mode = 'func'
      ui.fn = e.fn
      ui.args = e.args.map(operandFromExpr)
    } else if (e.kind === 'op') {
      ui.mode = 'op'
      ui.op = e.op
      ui.left = operandFromExpr(e.left)
      ui.right = operandFromExpr(e.right)
    }
    return ui
  })
  summaryStep.columns = sum ? [...sum.columns] : []
  sortStep.rules = srt ? [...srt.rules] : []
}

async function open(config: DatasetConfig) {
  baseConfig.value = config
  resetLocal()
  loadFromConfig(config)
  buildStepsFromConfig(config)
  dataSources.value = await fetchDataSourceEnum()
  await pullData()
  visible.value = true
}

function save() {
  if (!baseConfig.value.name.trim()) {
    ElMessage.warning('请先填写数据集名称（基础信息）')
    return
  }
  if (!baseConfig.value.dataSourceId) {
    ElMessage.warning('请先选择数据源（基础信息）')
    return
  }
  syncSelectStep()
  const cfg = buildConfig()
  cfg.updatedAt = Date.now()
  if (!cfg.createdAt) cfg.createdAt = Date.now()
  emit('saved', cfg)
  visible.value = false
}

const emit = defineEmits<{
  (e: 'saved', config: DatasetConfig): void
  (e: 'edit-base', config: DatasetConfig): void
}>()

// 任意加工改动实时刷新预览（已拉取数据后）
watch(
  [selectStep, filterLogic, filterUI, formulaUI, summaryStep, sortStep],
  () => {
    if (baseColumns.value.length) refreshPreview()
  },
  { deep: true },
)

defineExpose({ open })
</script>

<style scoped>
.de-body {
  display: flex;
  gap: 16px;
  flex: 1 1 0;
  min-height: 0;
}

.de-left {
  flex: 2 1 0;
  min-height: 0;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-right: 1px solid #1a2844;
  padding-right: 8px;
}

.de-steps-col {
  flex: 1 1 0;
  min-height: 0;
  overflow: auto;
}

.de-steps-col :deep(.el-steps) {
  height: auto;
}

.de-steps-col :deep(.el-step) {
  flex: none;
}

.de-steps-title {
  font-size: 13px;
  color: #a6adc8;
  font-weight: 600;
  margin-bottom: 10px;
}

.de-add-step :deep(.el-step__title) {
  font-size: 13px;
}
.de-add-trigger {
  font-size: 12px;
  color: #2b6ff2;
  cursor: pointer;
}
.de-add-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.de-add-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  color: #cdd6f4;
  font-size: 13px;
  cursor: pointer;
}
.de-add-item:hover:not(:disabled) {
  background: #45475a;
}
.de-add-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.de-add-done {
  font-size: 11px;
  color: #6c7086;
}

.de-main {
  flex: 8 1 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  min-width: 0;
}

.de-context {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px 24px;
  background: #0f1728;
  border: 1px solid #1a2844;
  border-radius: 8px;
  padding: 10px 14px;
}
.de-ctx-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #cdd6f4;
  min-width: 0;
}
.de-ctx-label {
  color: #8a9bb5;
  flex-shrink: 0;
}
.de-ctx-val {
  font-weight: 600;
}
.de-ctx-sql {
  flex: 1 1 240px;
  min-width: 0;
}
.de-ctx-code {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 12px;
  color: #a6adc8;
  background: #131c2e;
  border-radius: 4px;
  padding: 2px 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.de-ctx-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.de-mod {
  min-height: 0;
  background: #0f1728;
  border: 1px solid #1a2844;
  border-radius: 8px;
  padding: 14px;
}

.de-mod-a {
  flex: 3 1 0;
  overflow: auto;
}

.de-mod-b {
  flex: 6 1 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.de-mod-c {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.de-mod-head {
  font-size: 13px;
  color: #a6adc8;
  font-weight: 600;
  margin-bottom: 8px;
}

.de-table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.de-sql-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.de-sub-label {
  font-size: 12px;
  color: #8a9bb5;
}

.de-sql,
.de-config {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 11px;
}

.cond-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.cond-field {
  width: 130px;
}
.cond-op {
  width: 110px;
}
.cond-value {
  flex: 1;
}
.formula-block {
  padding: 4px 0;
}
.formula-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.formula-name {
  width: 160px;
}
.formula-expr {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.formula-op,
.formula-fn {
  width: 90px;
}
.summary-expr {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.summary-fn {
  width: 110px;
}
.summary-field {
  width: 130px;
}
.summary-part {
  width: 220px;
}
.summary-tip {
  font-size: 12px;
  color: #8a9bb5;
  margin-top: 4px;
}
.select-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  align-items: center;
}
.select-field-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.select-alias {
  width: 120px;
}
</style>

<style>
.de-dialog.el-dialog {
  display: flex;
  flex-direction: column;
}
.de-dialog .el-dialog__header {
  flex-shrink: 0;
}
.de-dialog .el-dialog__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 12px 20px;
  display: flex;
  flex-direction: column;
}
.de-dialog .el-dialog__footer {
  flex-shrink: 0;
}
</style>

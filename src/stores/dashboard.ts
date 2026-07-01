import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  EditCanvasConfigType,
  RequestGlobalConfigType,
  RequestConfigType,
  DataPondItem,
  CanvasComponent,
} from '../types'
import {
  DEFAULT_ATTR,
  DEFAULT_STYLES,
  DEFAULT_STATUS,
  DEFAULT_PREVIEW,
  DEFAULT_CHART_STYLE,
} from '../types'
import type { EventsType, InteractActionItem, InteractEventItem } from '../types/events'
import { useIdGenerator } from '../composables/useId'
import { componentDefinitions } from '../config/componentDefinitions'
import { rectsIntersect, findInGroupList, removeFromGroupList } from './utils'
import { applyTheme, type ChartThemePreset } from '../config/chartThemes'

export const useDashboardStore = defineStore('dashboard', () => {
  const components = ref<CanvasComponent[]>([])
  const selectedId = ref<string | null>(null)
  const selectedIds = ref<string[]>([])
  const isPreviewMode = ref(false)

  const editCanvasConfig = ref<EditCanvasConfigType>({
    projectName: '可视化大屏',
    width: 1920,
    height: 1080,
    background: '#11111b',
    backgroundImage: null,
    filterShow: false,
    opacity: 1,
    saturate: 1,
    contrast: 1,
    hueRotate: 0,
    brightness: 1,
    blendMode: 'normal',
    customTheme: null,
  })

  const requestGlobalConfig = ref<RequestGlobalConfigType>({
    requestOriginUrl: '',
    requestInterval: 30,
    requestIntervalUnit: 'second',
    requestHeader: {},
    requestDataPond: [],
  })

  const selectedComponent = computed(() => {
    if (!selectedId.value) return null
    return findComponent(selectedId.value)
  })

  const generateId = useIdGenerator()

  function addComponent(key: string) {
    const def = componentDefinitions.find(d => d.key === key)
    if (!def) return

    const id = generateId()
    const offset = components.value.length * 30
    const comp: CanvasComponent = {
      id,
      key: def.key,
      props: structuredClone(def.defaultProps),
      chartConfig: {
        key: def.key,
        chartKey: def.chartKey,
        conKey: def.conKey,
        title: def.title,
        category: def.category,
        categoryName: def.categoryName,
        package: def.package,
        chartFrame: def.chartFrame,
        image: def.image,
        icon: def.icon,
      },
      attr: {
        ...DEFAULT_ATTR,
        x: 50 + offset,
        y: 50 + offset,
        w: 400,
        h: 320,
        zIndex: components.value.length,
      },
      styles: { ...DEFAULT_STYLES },
      status: { ...DEFAULT_STATUS },
      preview: { ...DEFAULT_PREVIEW },
      option: structuredClone(def.defaultOption),
      chartStyle: structuredClone(DEFAULT_CHART_STYLE),
      interactActions: def.defaultInteractActions ? structuredClone(def.defaultInteractActions) : [],
      request: {
        requestDataType: 0,
        requestHttpType: 'get',
        requestUrl: '',
        requestInterval: null,
        requestIntervalUnit: 'second',
        requestParamsBodyType: 'none',
        requestParams: {
          Params: {},
          Header: {},
          Body: {
            'form-data': {},
            'x-www-form-urlencoded': {},
            json: '',
            xml: '',
          },
        },
      },
    }
    components.value.push(comp)
    selectedId.value = comp.id
    selectedIds.value = [comp.id]
  }

  function removeComponent(id: string) {
    const index = components.value.findIndex(c => c.id === id)
    if (index !== -1) {
      components.value.splice(index, 1)
      if (id === selectedId.value) {
        selectedId.value = components.value[0]?.id ?? null
        selectedIds.value = []
      }
      return
    }
    for (const group of components.value) {
      if (group.groupList && removeFromGroupList(group.groupList, id)) {
        if (id === selectedId.value) {
          selectedId.value = null
          selectedIds.value = []
        }
        return
      }
    }
  }

  function selectComponent(id: string | null) {
    selectedId.value = id
    if (id === null) {
      selectedIds.value = []
    } else {
      selectedIds.value = [id]
    }
  }

  function toggleSelectComponent(id: string) {
    const idx = selectedIds.value.indexOf(id)
    if (idx >= 0) {
      selectedIds.value.splice(idx, 1)
    } else {
      selectedIds.value.push(id)
    }
    if (selectedIds.value.length === 1) {
      selectedId.value = selectedIds.value[0]
    } else if (selectedIds.value.length > 1) {
      selectedId.value = id
    } else {
      selectedId.value = null
    }
  }

  function selectComponentsByRect(x: number, y: number, w: number, h: number) {
    const rect = { x, y, w, h }
    selectedIds.value = components.value
      .filter(c => rectsIntersect(rect, { x: c.attr.x, y: c.attr.y, w: c.attr.w, h: c.attr.h }))
      .map(c => c.id)
    if (selectedIds.value.length === 0) {
      selectedId.value = null
    } else {
      selectedId.value = selectedIds.value[selectedIds.value.length - 1]
    }
  }

  function clearSelection() {
    selectedIds.value = []
    selectedId.value = null
  }

  function setPreviewMode(value: boolean) {
    isPreviewMode.value = value
  }

  function updateComponentProp(id: string, key: string, value: any) {
    const comp = findComponent(id)
    if (comp) {
      comp.props[key] = value
    }
  }

  function updateComponentTitle(id: string, title: string) {
    const comp = findComponent(id)
    if (comp) comp.chartConfig.title = title
  }

  function updateComponentProps(id: string, props: Record<string, any>) {
    const comp = findComponent(id)
    if (comp) {
      comp.props = { ...comp.props, ...props }
    }
  }

  function updateComponentPosition(id: string, x: number, y: number) {
    const comp = findComponent(id)
    if (comp) {
      comp.attr.x = x
      comp.attr.y = y
    }
  }

  function updateComponentSize(id: string, w: number, h: number) {
    const comp = findComponent(id)
    if (comp) {
      comp.attr.w = w
      comp.attr.h = h
    }
  }

  function updateCanvasConfig(config: Partial<EditCanvasConfigType>) {
    Object.assign(editCanvasConfig.value, config)
  }

  function updateRequestGlobalConfig(config: Partial<RequestGlobalConfigType>) {
    Object.assign(requestGlobalConfig.value, config)
  }

  function findComponent(id: string) {
    for (const comp of components.value) {
      if (comp.id === id) return comp
      if (comp.groupList) {
        const found = findInGroupList(comp.groupList, id)
        if (found) return found as CanvasComponent
      }
    }
    return null
  }

  function updateComponentAttr(id: string, key: keyof typeof DEFAULT_ATTR, value: number) {
    const comp = findComponent(id)
    if (comp) (comp.attr as any)[key] = value
  }

  function updateComponentStyle(id: string, key: string, value: number | string) {
    const comp = findComponent(id)
    if (comp) (comp.styles as any)[key] = value
  }

  function updateComponentOption(id: string, key: string, value: any) {
    const comp = findComponent(id)
    if (comp) comp.option[key] = value
  }

  function updateChartStyle(id: string, path: string, value: any) {
    const comp = findComponent(id)
    if (!comp || !comp.chartStyle) return
    const keys = path.split('.')
    let target: any = comp.chartStyle
    for (let i = 0; i < keys.length - 1; i++) {
      target = target[keys[i]]
    }
    target[keys[keys.length - 1]] = value
  }

  function applyThemeToAll(preset: ChartThemePreset) {
    function applyToComp(comp: CanvasComponent) {
      if (comp.chartStyle) {
        const updated = applyTheme(comp.chartStyle, preset)
        Object.assign(comp.chartStyle, updated)
      }
      comp.groupList?.forEach(child => {
        if (child.chartStyle) {
          const updated = applyTheme(child.chartStyle, preset)
          Object.assign(child.chartStyle, updated)
        }
      })
    }
    components.value.forEach(applyToComp)
  }

  function saveCustomTheme(preset: ChartThemePreset) {
    editCanvasConfig.value.customTheme = preset
  }

  function toggleComponentStatus(id: string, statusKey: 'lock' | 'hide') {
    const comp = findComponent(id)
    if (comp) comp.status[statusKey] = !comp.status[statusKey]
  }

  function toggleComponentPreviewOverflow(id: string) {
    const comp = findComponent(id)
    if (comp) comp.preview.overFlowHidden = !comp.preview.overFlowHidden
  }

  function toggleComponentFilterShow(id: string) {
    const comp = findComponent(id)
    if (comp) comp.styles.filterShow = !comp.styles.filterShow
  }

  function updateComponentFilter(id: string, value: string) {
    const comp = findComponent(id)
    if (comp) comp.filter = value
  }

  function updateOptionDatasetDimension(id: string, index: number, value: string) {
    const comp = findComponent(id)
    if (comp) {
      const dims = comp.option.dataset?.dimensions
      if (dims) {
        const clone = [...dims]
        clone[index] = value
        comp.option.dataset.dimensions = clone
      }
    }
  }

  function updateOptionDatasetCell(id: string, rowIndex: number, colIndex: number, value: string) {
    const comp = findComponent(id)
    if (comp) {
      const src = comp.option.dataset?.source
      if (src?.[rowIndex]) {
        const currentVal = src[rowIndex][colIndex]
        const newVal = typeof currentVal === 'number' ? Number(value) : value
        const newRow = [...src[rowIndex]]
        newRow[colIndex] = newVal
        const newSource = [...src]
        newSource[rowIndex] = newRow
        comp.option.dataset.source = newSource
      }
    }
  }

  function addOptionDatasetRow(id: string) {
    const comp = findComponent(id)
    if (comp) {
      const ds = comp.option.dataset
      if (!ds) return
      const colCount = ds.dimensions?.length ?? 2
      ds.source = [...ds.source, Array(colCount).fill('')]
    }
  }

  function removeOptionDatasetRow(id: string, rowIndex: number) {
    const comp = findComponent(id)
    if (comp) {
      const src = comp.option.dataset?.source
      if (src) {
        comp.option.dataset.source = src.filter((_: unknown, i: number) => i !== rowIndex)
      }
    }
  }

  function groupSelectedComponents() {
    if (selectedIds.value.length < 2) return
    const ids = new Set(selectedIds.value)
    const selected = components.value.filter(c => ids.has(c.id))
    if (selected.length < 2) return

    const minX = Math.min(...selected.map(c => c.attr.x))
    const minY = Math.min(...selected.map(c => c.attr.y))
    const maxX = Math.max(...selected.map(c => c.attr.x + c.attr.w))
    const maxY = Math.max(...selected.map(c => c.attr.y + c.attr.h))

    const id = generateId()
    const group: CanvasComponent = {
      id,
      key: 'group',
      isGroup: true,
      props: {},
      chartConfig: {
        key: 'group',
        chartKey: 'group',
        conKey: '',
        title: '分组',
        category: '',
        categoryName: '',
        package: '',
        chartFrame: 'common',
        image: '',
      },
      attr: {
        x: minX, y: minY, w: maxX - minX, h: maxY - minY,
        offsetX: 0, offsetY: 0, zIndex: components.value.length,
      },
      styles: { ...DEFAULT_STYLES },
      status: { ...DEFAULT_STATUS },
      preview: { ...DEFAULT_PREVIEW },
      option: {},
      groupList: selected.map(c => ({
        ...c,
        attr: { ...c.attr, x: c.attr.x - minX, y: c.attr.y - minY },
      })) as CanvasComponent[],
    }

    const idSet = new Set(selected.map(c => c.id))
    components.value = components.value.filter(c => !idSet.has(c.id))
    components.value.push(group)

    selectedIds.value = [id]
    selectedId.value = id
  }

  function ungroupComponent(groupId: string) {
    const comp = components.value.find(c => c.id === groupId)
    if (!comp || !comp.isGroup || !comp.groupList) return

    const absChildren = comp.groupList.map(child => ({
      ...child,
      props: (child as any).props ?? {},
      attr: { ...child.attr, x: child.attr.x + comp.attr.x, y: child.attr.y + comp.attr.y },
    })) as CanvasComponent[]

    const idx = components.value.findIndex(c => c.id === groupId)
    if (idx >= 0) {
      components.value.splice(idx, 1, ...absChildren)
    }

    selectedIds.value = []
    selectedId.value = null
  }

  function moveComponentDelta(id: string, dx: number, dy: number, baseX: number, baseY: number, pageW?: number, pageH?: number) {
    const comp = findComponent(id)
    if (!comp) return
    comp.attr.x = Math.round(Math.max(0, Math.min(baseX + dx, (pageW ?? 9999) - comp.attr.w)))
    comp.attr.y = Math.round(Math.max(0, Math.min(baseY + dy, (pageH ?? 9999) - comp.attr.h)))
  }

  function resizeComponentDelta(id: string, dw: number, dh: number, baseW: number, baseH: number, maxW?: number, maxH?: number) {
    const comp = findComponent(id)
    if (!comp) return
    comp.attr.w = Math.max(100, Math.min(baseW + dw, maxW ?? 9999))
    comp.attr.h = Math.max(60, Math.min(baseH + dh, maxH ?? 9999))
  }

  function addDataPond(item: DataPondItem) {
    requestGlobalConfig.value.requestDataPond.push(item)
  }

  function updateDataPond(id: string, item: Partial<DataPondItem>) {
    const pond = requestGlobalConfig.value.requestDataPond.find(p => p.dataPondId === id)
    if (pond) {
      Object.assign(pond, item)
    }
  }

  function removeDataPond(id: string) {
    const idx = requestGlobalConfig.value.requestDataPond.findIndex(p => p.dataPondId === id)
    if (idx >= 0) {
      requestGlobalConfig.value.requestDataPond.splice(idx, 1)
    }
  }

  function updateComponentRequest(id: string, request: Partial<RequestConfigType>) {
    const comp = findComponent(id)
    if (comp && comp.request) {
      Object.assign(comp.request, request)
    }
  }

  const interactFilters = ref<Record<string, Record<string, any>>>({})
  const interactDataModified = new Set<string>()

  function updateComponentEvents(id: string, events: EventsType) {
    const comp = findComponent(id)
    if (comp) comp.events = events
  }

  function updateComponentInteractActions(id: string, actions: InteractActionItem[]) {
    const comp = findComponent(id)
    if (comp) comp.interactActions = actions
  }

  function addInteractEvent(id: string, event: InteractEventItem) {
    const comp = findComponent(id)
    if (!comp) return
    if (!comp.events) comp.events = {}
    if (!comp.events.interactEvents) comp.events.interactEvents = []
    comp.events.interactEvents.push(event)
  }

  function removeInteractEvent(id: string, index: number) {
    const comp = findComponent(id)
    if (comp?.events?.interactEvents) {
      comp.events.interactEvents.splice(index, 1)
    }
  }

  function updateInteractEvent(id: string, index: number, patch: Partial<InteractEventItem>) {
    const comp = findComponent(id)
    if (comp?.events?.interactEvents?.[index]) {
      Object.assign(comp.events.interactEvents[index], patch)
    }
  }

  function ensureStructuredOverrides(target: any) {
    if (!target.interactOverrides) {
      target.interactOverrides = { params: {}, body: {} }
      return
    }
    if (!target.interactOverrides.params && !target.interactOverrides.body) {
      target.interactOverrides = { params: target.interactOverrides, body: {} }
    }
  }

  function applyInteractAction(targetId: string, method: string, value: any) {
    if (method === 'setFilter') {
      const currentFilters = interactFilters.value[targetId] || {}
      let newFilters: Record<string, any>
      if (typeof value === 'object' && value !== null) {
        newFilters = { ...currentFilters, ...value }
      } else {
        newFilters = { ...currentFilters, _primary: value }
      }
      interactFilters.value = { ...interactFilters.value, [targetId]: newFilters }
    } else if (method === 'setData') {
      const target = findComponent(targetId)
      if (target) {
        target.option.dataset = value
        interactDataModified.add(targetId)
      }
    } else if (method === 'clearFilter') {
      const { [targetId]: _, ...rest } = interactFilters.value
      interactFilters.value = rest
    } else if (method === 'setRequestParams') {
      const target = findComponent(targetId)
      if (target) {
        ensureStructuredOverrides(target)
        Object.assign(target.interactOverrides!.params, value)
      }
    } else if (method === 'setRequestBody') {
      const target = findComponent(targetId)
      if (target) {
        ensureStructuredOverrides(target)
        Object.assign(target.interactOverrides!.body, value)
      }
    } else if (method === 'clearOverrides') {
      const target = findComponent(targetId)
      if (target) target.interactOverrides = { params: {}, body: {} }
    } else if (method === 'setRequestUrl') {
      const target = findComponent(targetId)
      if (target?.request) {
        target.request.requestUrl = value
      }
    }
  }

  function clearInteractFilters(targetId?: string) {
    if (targetId) {
      const { [targetId]: _, ...rest } = interactFilters.value
      interactFilters.value = rest
      if (interactDataModified.has(targetId)) {
        const target = findComponent(targetId)
        if (target?.option) target.option.dataset = { dimensions: [], source: [] }
        interactDataModified.delete(targetId)
      }
    } else {
      interactFilters.value = {}
      interactDataModified.clear()
    }
  }

  return {
    components,
    selectedId,
    selectedIds,
    selectedComponent,
    isPreviewMode,
    componentDefinitions,
    editCanvasConfig,
    requestGlobalConfig,
    addComponent,
    removeComponent,
    selectComponent,
    toggleSelectComponent,
    selectComponentsByRect,
    clearSelection,
    setPreviewMode,
    groupSelectedComponents,
    ungroupComponent,
    updateComponentProp,
    updateComponentProps,
    updateComponentTitle,
    updateComponentPosition,
    updateComponentSize,
    updateCanvasConfig,
    updateRequestGlobalConfig,
    findComponent,
    updateComponentAttr,
    updateComponentStyle,
    updateComponentOption,
    updateChartStyle,
    applyThemeToAll,
    saveCustomTheme,
    toggleComponentStatus,
    toggleComponentPreviewOverflow,
    toggleComponentFilterShow,
    updateComponentFilter,
    moveComponentDelta,
    resizeComponentDelta,
    updateOptionDatasetDimension,
    updateOptionDatasetCell,
    addOptionDatasetRow,
    removeOptionDatasetRow,
    addDataPond,
    updateDataPond,
    removeDataPond,
    updateComponentRequest,
    interactFilters,
    updateComponentEvents,
    updateComponentInteractActions,
    addInteractEvent,
    removeInteractEvent,
    updateInteractEvent,
    applyInteractAction,
    clearInteractFilters,
  }
})

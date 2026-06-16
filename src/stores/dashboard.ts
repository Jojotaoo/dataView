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
} from '../types'
import { useIdGenerator } from '../composables/useId'
import { componentDefinitions } from '../config/componentDefinitions'
import { rectsIntersect, findInGroupList, removeFromGroupList } from './utils'

export const useDashboardStore = defineStore('dashboard', () => {
  const components = ref<CanvasComponent[]>([])
  const selectedId = ref<string | null>(null)
  const selectedIds = ref<string[]>([])

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
    rotateZ: 0,
    rotateX: 0,
    rotateY: 0,
    skewX: 0,
    skewY: 0,
    blendMode: 'normal',
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
        x: 50,
        y: 50,
        w: 400,
        h: 320,
        zIndex: components.value.length,
      },
      styles: { ...DEFAULT_STYLES },
      status: { ...DEFAULT_STATUS },
      preview: { ...DEFAULT_PREVIEW },
      option: structuredClone(def.defaultOption),
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

  function updateComponentProp(id: string, key: string, value: any) {
    const comp = findComponent(id)
    if (comp) {
      comp.props[key] = value
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

  return {
    components,
    selectedId,
    selectedIds,
    selectedComponent,
    componentDefinitions,
    editCanvasConfig,
    requestGlobalConfig,
    addComponent,
    removeComponent,
    selectComponent,
    toggleSelectComponent,
    selectComponentsByRect,
    clearSelection,
    groupSelectedComponents,
    ungroupComponent,
    updateComponentProp,
    updateComponentPosition,
    updateComponentSize,
    updateCanvasConfig,
    updateRequestGlobalConfig,
    findComponent,
    updateComponentAttr,
    updateComponentStyle,
    updateComponentOption,
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
  }
})

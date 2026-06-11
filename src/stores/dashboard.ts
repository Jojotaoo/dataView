import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  CreateComponentType,
  EditCanvasConfigType,
  RequestGlobalConfigType,
  ChartConfigType,
} from '../types'
import { DEFAULT_ATTR, DEFAULT_STYLES, DEFAULT_STATUS, DEFAULT_PREVIEW } from '../types'

export interface CanvasComponent extends CreateComponentType {
  parentId: string | null
  props: Record<string, any>
}

function rectsIntersect(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
  return !(b.x > a.x + a.w || b.x + b.w < a.x || b.y > a.y + a.h || b.y + b.h < a.y)
}

function findInGroupList(list: CreateComponentType[], id: string): CreateComponentType | null {
  for (const item of list) {
    if (item.id === id) return item
    if (item.groupList) {
      const found = findInGroupList(item.groupList, id)
      if (found) return found
    }
  }
  return null
}

export const useDashboardStore = defineStore('dashboard', () => {
  const components = ref<CanvasComponent[]>([])
  const selectedId = ref<string | null>(null)
  const selectedIds = ref<string[]>([])
  const counter = ref(0)
  const dropTargetParentId = ref<string | null>(null)

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
  })

  const selectedComponent = computed(() => {
    if (!selectedId.value) return null
    return findComponent(selectedId.value)
  })

  const componentDefinitions: (ChartConfigType & { name: string; icon: string; defaultOption: Record<string, any>; defaultProps: Record<string, any> })[] = [
    {
      key: 'container',
      chartKey: 'VContainer',
      conKey: 'VCContainer',
      title: '容器',
      name: '容器',
      category: 'Containers',
      categoryName: '容器',
      package: 'Informations',
      chartFrame: 'common',
      image: 'container.png',
      icon: '📦',
      defaultOption: {},
      defaultProps: {
        bgColor: 'rgba(30, 30, 46, 0.6)',
        borderColor: '#89b4fa',
      },
    },
    {
      key: 'BarCommon',
      chartKey: 'VBarCommon',
      conKey: 'VCBarCommon',
      title: '柱状图',
      name: '柱状图',
      category: 'Bars',
      categoryName: '柱状图',
      package: 'Charts',
      chartFrame: 'echarts',
      image: 'bar.png',
      icon: '📊',
      defaultOption: {
        title: '柱状图',
        dataset: {
          dimensions: ['类别', '销量'],
          source: [
            ['一月', 120],
            ['二月', 200],
            ['三月', 150],
            ['四月', 80],
            ['五月', 70],
            ['六月', 110],
          ],
        },
      },
      defaultProps: {},
    },
    {
      key: 'LineCommon',
      chartKey: 'VLineCommon',
      conKey: 'VCLineCommon',
      title: '折线图',
      name: '折线图',
      category: 'Lines',
      categoryName: '折线图',
      package: 'Charts',
      chartFrame: 'echarts',
      image: 'line.png',
      icon: '📈',
      defaultOption: {
        title: '折线图',
        dataset: {
          dimensions: ['月份', '访问量'],
          source: [
            ['一月', 820],
            ['二月', 932],
            ['三月', 901],
            ['四月', 1290],
            ['五月', 1330],
            ['六月', 1320],
          ],
        },
      },
      defaultProps: {},
    },
  ]

  const rootComponents = computed(() =>
    components.value.filter(c => !c.parentId)
  )

  function getChildren(parentId: string) {
    return components.value.filter(c => c.parentId === parentId)
  }

  function generateId(): string {
    counter.value++
    return `comp-${Date.now()}-${counter.value}`
  }

  function addComponent(key: string, parentId?: string) {
    const def = componentDefinitions.find(d => d.key === key)
    if (!def) return

    const id = generateId()
    const comp: CanvasComponent = {
      id,
      key: def.key,
      parentId: parentId ?? null,
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
        x: parentId ? 10 : 50,
        y: parentId ? 10 : 50,
        w: key === 'container' ? 500 : 400,
        h: key === 'container' ? 400 : 320,
        zIndex: components.value.length,
      },
      styles: { ...DEFAULT_STYLES },
      status: { ...DEFAULT_STATUS },
      preview: { ...DEFAULT_PREVIEW },
      option: structuredClone(def.defaultOption),
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

  function removeFromGroupList(list: CreateComponentType[], id: string): boolean {
    const idx = list.findIndex(c => c.id === id)
    if (idx >= 0) {
      list.splice(idx, 1)
      return true
    }
    for (const item of list) {
      if (item.groupList && removeFromGroupList(item.groupList, id)) {
        return true
      }
    }
    return false
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
      .filter(c => !c.parentId && rectsIntersect(rect, { x: c.attr.x, y: c.attr.y, w: c.attr.w, h: c.attr.h }))
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
      parentId: null,
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
      parentId: child.parentId ?? null,
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
    comp.attr.w = Math.max(comp.key === 'container' ? 80 : 100, Math.min(baseW + dw, maxW ?? 9999))
    comp.attr.h = Math.max(comp.key === 'container' ? 40 : 60, Math.min(baseH + dh, maxH ?? 9999))
  }

  return {
    components,
    selectedId,
    selectedIds,
    selectedComponent,
    componentDefinitions,
    editCanvasConfig,
    requestGlobalConfig,
    dropTargetParentId,
    rootComponents,
    getChildren,
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
  }
})

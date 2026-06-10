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

export const useDashboardStore = defineStore('dashboard', () => {
  const components = ref<CanvasComponent[]>([])
  const selectedId = ref<string | null>(null)
  const counter = ref(0)

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

  const selectedComponent = computed(() =>
    components.value.find(c => c.id === selectedId.value) ?? null
  )

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
      props: JSON.parse(JSON.stringify(def.defaultProps)),
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
      option: JSON.parse(JSON.stringify(def.defaultOption)),
    }
    components.value.push(comp)
    selectedId.value = comp.id
  }

  function removeComponent(id: string) {
    const idsToRemove = [id, ...components.value.filter(c => c.parentId === id).map(c => c.id)]
    idsToRemove.forEach(i => {
      const index = components.value.findIndex(c => c.id === i)
      if (index !== -1) components.value.splice(index, 1)
    })
    if (idsToRemove.includes(selectedId.value!)) {
      selectedId.value = components.value[0]?.id ?? null
    }
  }

  function selectComponent(id: string | null) {
    selectedId.value = id
  }

  function updateComponentProp(id: string, key: string, value: any) {
    const comp = components.value.find(c => c.id === id)
    if (comp) {
      comp.props[key] = value
    }
  }

  function updateComponentPosition(id: string, x: number, y: number) {
    const comp = components.value.find(c => c.id === id)
    if (comp) {
      comp.attr.x = x
      comp.attr.y = y
    }
  }

  function updateComponentSize(id: string, w: number, h: number) {
    const comp = components.value.find(c => c.id === id)
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

  return {
    components,
    selectedId,
    selectedComponent,
    componentDefinitions,
    editCanvasConfig,
    requestGlobalConfig,
    rootComponents,
    getChildren,
    addComponent,
    removeComponent,
    selectComponent,
    updateComponentProp,
    updateComponentPosition,
    updateComponentSize,
    updateCanvasConfig,
    updateRequestGlobalConfig,
  }
})

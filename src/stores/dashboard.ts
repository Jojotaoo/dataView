import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CanvasComponent, ComponentDefinition, PageConfig } from '../types'

export const useDashboardStore = defineStore('dashboard', () => {
  const components = ref<CanvasComponent[]>([])
  const selectedId = ref<string | null>(null)
  const counter = ref(0)

  const pageConfig = ref<PageConfig>({
    width: 1920,
    height: 1080,
    bgColor: '#11111b',
    bgImage: '',
  })

  const selectedComponent = computed(() =>
    components.value.find(c => c.id === selectedId.value) ?? null
  )

  const componentDefinitions: ComponentDefinition[] = [
    {
      type: 'container',
      name: '容器',
      icon: '📦',
      isContainer: true,
      props: [
        { label: '背景色', key: 'bgColor', type: 'color', defaultValue: '#1e1e2e' },
        { label: '边框色', key: 'borderColor', type: 'color', defaultValue: '#89b4fa' },
      ],
      defaultProps: {
        bgColor: 'rgba(30, 30, 46, 0.6)',
        borderColor: '#89b4fa',
      },
    },
    {
      type: 'bar-chart',
      name: '柱状图',
      icon: '📊',
      props: [
        { label: '标题', key: 'title', type: 'text', defaultValue: '柱状图' },
        { label: '背景色', key: 'bgColor', type: 'color', defaultValue: '#1e1e2e' },
      ],
      defaultProps: {
        title: '柱状图',
        bgColor: '#1e1e2e',
        data: [
          { label: '一月', value: 120 },
          { label: '二月', value: 200 },
          { label: '三月', value: 150 },
          { label: '四月', value: 80 },
          { label: '五月', value: 70 },
          { label: '六月', value: 110 },
        ],
      },
    },
  ]

  const rootComponents = computed(() =>
    components.value.filter(c => !c.parentId)
  )

  function getChildren(parentId: string) {
    return components.value.filter(c => c.parentId === parentId)
  }

  function addComponent(type: string, parentId?: string) {
    const def = componentDefinitions.find(d => d.type === type)
    if (!def) return
    counter.value++
    const isContainer = def.isContainer
    const comp: CanvasComponent = {
      id: `comp-${counter.value}`,
      type: def.type,
      name: def.name,
      props: { ...def.defaultProps },
      parentId: parentId ?? null,
      x: parentId ? 10 : 20,
      y: parentId ? 10 : 20,
      width: isContainer ? 500 : 400,
      height: isContainer ? 400 : 320,
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
      comp.x = x
      comp.y = y
    }
  }

  function updatePageConfig(config: Partial<PageConfig>) {
    Object.assign(pageConfig.value, config)
  }

  function updateComponentSize(id: string, w: number, h: number) {
    const comp = components.value.find(c => c.id === id)
    if (comp) {
      comp.width = w
      comp.height = h
    }
  }

  return {
    components,
    selectedId,
    selectedComponent,
    componentDefinitions,
    pageConfig,
    rootComponents,
    getChildren,
    addComponent,
    removeComponent,
    selectComponent,
    updateComponentProp,
    updateComponentPosition,
    updateComponentSize,
    updatePageConfig,
  }
})

import { computed } from 'vue'
import { useDashboardStore, type ChartEditStorage, type CreateComponentType } from 'jojotaoo_components'
import { useDatasetStore } from '../stores/dataset'

export function collectDatasetIds(components: CreateComponentType[]): string[] {
  const ids = new Set<string>()
  const walk = (list: CreateComponentType[]) => {
    for (const c of list) {
      if (c.request?.requestDataType === 3 && c.request.requestDatasetId) {
        ids.add(c.request.requestDatasetId)
      }
      if (c.groupList && c.groupList.length) walk(c.groupList)
    }
  }
  walk(components)
  return [...ids]
}

// 单一 schema 序列化源：编辑器的「预览导出」与「SchemaPanel 检视」共用，避免两套分叉
export function useChartSchema() {
  const store = useDashboardStore()
  const datasetStore = useDatasetStore()

  const datasetBindings = computed(() =>
    datasetStore.datasets.filter((d) => collectDatasetIds(store.components as CreateComponentType[]).includes(d.id)),
  )

  const schema = computed<ChartEditStorage>(() => ({
    editCanvasConfig: { ...store.editCanvasConfig },
    requestGlobalConfig: { ...store.requestGlobalConfig },
    componentList: store.components.map((c) => ({
      id: c.id,
      key: c.key,
      chartConfig: { ...c.chartConfig },
      attr: { ...c.attr },
      styles: { ...c.styles },
      status: { ...c.status },
      preview: { ...c.preview },
      filter: c.filter,
      option: c.option,
      chartStyle: c.chartStyle,
      isGroup: c.isGroup,
      groupList: c.groupList ? JSON.parse(JSON.stringify(c.groupList)) : undefined,
      request: c.request ? JSON.parse(JSON.stringify(c.request)) : undefined,
      events: c.events ? JSON.parse(JSON.stringify(c.events)) : undefined,
      interactActions: c.interactActions ? JSON.parse(JSON.stringify(c.interactActions)) : undefined,
      props: c.props ? JSON.parse(JSON.stringify(c.props)) : undefined,
    })),
    datasetBindings: datasetBindings.value,
  }))

  return { schema, datasetBindings }
}

import { useDashboardStore } from '../stores/dashboard'

export function useInteractClear() {
  const store = useDashboardStore()

  /**
   * 清空指定源组件配置的所有 click 交互的目标组件的交互状态
   * @param sourceComponentId 配置了交互的源组件 ID（如地图组件）
   */
  function clearTargetInteractions(sourceComponentId: string) {
    const comp = store.findComponent(sourceComponentId)
    if (!comp?.events?.interactEvents) return

    const clickEvents = comp.events.interactEvents.filter(e => e.interactOn === 'click')

    for (const evt of clickEvents) {
      const targetIds = evt.interactComponentIds?.length
        ? evt.interactComponentIds
        : (evt.interactComponentId ? [evt.interactComponentId] : [])

      for (const targetId of targetIds) {
        store.clearInteractFilters(targetId)
        const target = store.findComponent(targetId)
        if (target) target.interactOverrides = {}
      }
    }
  }

  return { clearTargetInteractions }
}

import { type Ref } from 'vue'
import { useDashboardStore } from '../stores/dashboard'

export function useInteractDispatch(componentId: Ref<string>) {
  const store = useDashboardStore()

  function dispatch(eventName: string, params: Record<string, any>) {
    const comp = store.findComponent(componentId.value)
    if (!comp?.events?.interactEvents) return

    const matches = comp.events.interactEvents.filter(e => e.interactOn === eventName)
    for (const match of matches) {
      const targetIds = getTargetIds(match)
      for (const targetId of targetIds) {
        const target = store.findComponent(targetId)
        if (!target) continue

        for (const [method, expr] of Object.entries(match.interactFn)) {
          const value = resolveExpr(expr, params)
          store.applyInteractAction(target.id, method, value)
        }
      }
    }
  }

  function getTargetIds(match: { interactComponentId?: string; interactComponentIds?: string[] }): string[] {
    if (match.interactComponentIds && match.interactComponentIds.length > 0) {
      return match.interactComponentIds
    }
    if (match.interactComponentId) {
      return [match.interactComponentId]
    }
    return []
  }

  function resolveExpr(expr: string, params: Record<string, any>): any {
    if (expr in params) return params[expr]
    try {
      return new Function('params', `return ${expr}`)(params)
    } catch {
      return {}
    }
  }

  return { dispatch }
}

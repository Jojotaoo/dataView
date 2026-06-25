import { type Ref } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import type { CanvasComponent } from '../types'

interface ContextMenuState {
  show: boolean
  x: number
  y: number
  isGroup: boolean
  ctxId: string | null
}

export function useCanvasInteraction(ctxMenu: Ref<ContextMenuState>) {
  const store = useDashboardStore()

  function onDraggableChange(evt: any) {
    if (evt.added) {
      const item = evt.added.element
      if (item && item._clone) {
        store.components.splice(evt.added.newIndex, 1)
        store.addComponent(item.key)
      }
    }
  }

  function onComponentClick(event: MouseEvent, id: string) {
    if (event.ctrlKey || event.metaKey) {
      store.toggleSelectComponent(id)
    } else {
      store.selectComponent(id)
    }
  }

  function findParentGroup(id: string): CanvasComponent | null {
    for (const comp of store.components) {
      if (comp.groupList && comp.groupList.some(c => c.id === id)) {
        return comp
      }
    }
    return null
  }

  function onContextMenu(event: MouseEvent) {
    const compEl = (event.target as HTMLElement).closest('[data-comp-id]')
    let isGroup = false
    let ctxId: string | null = null

    if (compEl) {
      const id = compEl.getAttribute('data-comp-id')
      if (id) {
        store.selectComponent(id)
        ctxId = id
        const comp = store.components.find(c => c.id === id)
        if (comp) {
          isGroup = comp.key === 'group'
        } else {
          const parentGroup = findParentGroup(id)
          if (parentGroup) {
            isGroup = true
            ctxId = parentGroup.id
          }
        }
      }
    } else if (store.selectedId) {
      ctxId = store.selectedId
      const comp = store.components.find(c => c.id === store.selectedId)
      if (comp) {
        isGroup = comp.key === 'group'
      } else {
        const parentGroup = findParentGroup(store.selectedId)
        if (parentGroup) {
          isGroup = true
          ctxId = parentGroup.id
        }
      }
    }

    ctxMenu.value = {
      show: true,
      x: event.clientX,
      y: event.clientY,
      isGroup,
      ctxId,
    }
  }

  function handleGroup() {
    ctxMenu.value.show = false
    store.groupSelectedComponents()
  }

  function handleUngroup() {
    ctxMenu.value.show = false
    if (ctxMenu.value.ctxId) {
      store.ungroupComponent(ctxMenu.value.ctxId)
    }
  }

  function handleDelete() {
    ctxMenu.value.show = false
    if (ctxMenu.value.ctxId) {
      store.removeComponent(ctxMenu.value.ctxId)
    }
  }

  return {
    onDraggableChange,
    onComponentClick,
    onContextMenu,
    handleGroup,
    handleUngroup,
    handleDelete,
    findParentGroup,
  }
}

import { ref, type Ref } from 'vue'

interface DragState {
  id: string
  startX: number
  startY: number
  compX: number
  compY: number
}

export function useCanvasDrag(
  scale: Ref<number>,
  moveComponent: (id: string, dx: number, dy: number, baseX: number, baseY: number) => void,
) {
  const dragState = ref<DragState | null>(null)

  function startDrag(event: MouseEvent, id: string, compX: number, compY: number) {
    dragState.value = { id, startX: event.clientX, startY: event.clientY, compX, compY }
    window.addEventListener('mousemove', onDragMove)
    window.addEventListener('mouseup', onDragEnd)
    window.addEventListener('blur', onDragEnd)
  }

  function onDragMove(event: MouseEvent) {
    if (!dragState.value) return
    const dx = (event.clientX - dragState.value.startX) / scale.value
    const dy = (event.clientY - dragState.value.startY) / scale.value
    moveComponent(dragState.value.id, dx, dy, dragState.value.compX, dragState.value.compY)
  }

  function onDragEnd() {
    dragState.value = null
    window.removeEventListener('mousemove', onDragMove)
    window.removeEventListener('mouseup', onDragEnd)
    window.removeEventListener('blur', onDragEnd)
  }

  function cleanup() {
    dragState.value = null
    window.removeEventListener('mousemove', onDragMove)
    window.removeEventListener('mouseup', onDragEnd)
    window.removeEventListener('blur', onDragEnd)
  }

  return { dragState, startDrag, cleanup }
}

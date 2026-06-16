import { ref, type Ref } from 'vue'

interface SelRect {
  x: number
  y: number
  w: number
  h: number
}

export function useBoxSelect(
  scale: Ref<number>,
  selectByRect: (x: number, y: number, w: number, h: number) => void,
  clearSelection: () => void,
) {
  const selRect = ref<SelRect | null>(null)
  let selStart: { x: number; y: number } | null = null
  let didDrag = false

  function onCanvasMouseDown(event: MouseEvent) {
    if (event.button !== 0) return
    didDrag = false
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    selStart = {
      x: (event.clientX - rect.left) / scale.value,
      y: (event.clientY - rect.top) / scale.value,
    }
    window.addEventListener('mousemove', onSelectionMouseMove)
    window.addEventListener('mouseup', onSelectionMouseUp)
  }

  function onSelectionMouseMove(event: MouseEvent) {
    if (!selStart) return
    didDrag = true
    const gridEl = document.querySelector('.canvas-grid')
    if (!gridEl) return
    const rect = gridEl.getBoundingClientRect()
    const mx = (event.clientX - rect.left) / scale.value
    const my = (event.clientY - rect.top) / scale.value
    selRect.value = {
      x: Math.min(mx, selStart.x),
      y: Math.min(my, selStart.y),
      w: Math.abs(mx - selStart.x),
      h: Math.abs(my - selStart.y),
    }
  }

  function onSelectionMouseUp() {
    if (didDrag && selRect.value) {
      selectByRect(selRect.value.x, selRect.value.y, selRect.value.w, selRect.value.h)
    } else {
      clearSelection()
    }
    selStart = null
    selRect.value = null
    window.removeEventListener('mousemove', onSelectionMouseMove)
    window.removeEventListener('mouseup', onSelectionMouseUp)
  }

  function cleanup() {
    selStart = null
    selRect.value = null
    window.removeEventListener('mousemove', onSelectionMouseMove)
    window.removeEventListener('mouseup', onSelectionMouseUp)
  }

  return { selRect, onCanvasMouseDown, cleanup }
}

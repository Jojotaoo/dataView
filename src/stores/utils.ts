import type { CreateComponentType } from '../types'

export function rectsIntersect(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  return !(b.x > a.x + a.w || b.x + b.w < a.x || b.y > a.y + a.h || b.y + b.h < a.y)
}

export function findInGroupList(list: CreateComponentType[], id: string): CreateComponentType | null {
  for (const item of list) {
    if (item.id === id) return item
    if (item.groupList) {
      const found = findInGroupList(item.groupList, id)
      if (found) return found
    }
  }
  return null
}

export function removeFromGroupList(list: CreateComponentType[], id: string): boolean {
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

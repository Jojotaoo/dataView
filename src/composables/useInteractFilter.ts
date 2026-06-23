import { type Ref, computed } from 'vue'
import { useDashboardStore } from '../stores/dashboard'

export function useInteractFilter(
  componentId: Ref<string>,
  dimensions: Ref<string[]>,
  source: Ref<any[][]>
) {
  const store = useDashboardStore()

  const filteredSource = computed(() => {
    const filters = store.interactFilters[componentId.value]
    if (!filters || Object.keys(filters).length === 0) return source.value

    return source.value.filter(row => {
      return Object.entries(filters).every(([key, value]) => {
        if (key === '_primary') {
          return row.some(cell => String(cell) === String(value))
        }
        const colIndex = dimensions.value.indexOf(key)
        if (colIndex === -1) return true
        return String(row[colIndex]) === String(value)
      })
    })
  })

  return { filteredSource }
}

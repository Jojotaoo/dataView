import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { DatasetConfig } from 'jojotaoo_components'

const STORAGE_KEY = 'jojotaoo_dataset_store'

function loadFromStorage(): DatasetConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as DatasetConfig[]) : []
  } catch {
    return []
  }
}

export const useDatasetStore = defineStore('dataset', () => {
  const datasets = ref<DatasetConfig[]>(loadFromStorage())

  watch(
    datasets,
    (val) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
      } catch {
        /* ignore quota errors */
      }
    },
    { deep: true },
  )

  function getDataset(id: string): DatasetConfig | undefined {
    return datasets.value.find((d) => d.id === id)
  }

  function addDataset(config: DatasetConfig): void {
    datasets.value.push(config)
  }

  function updateDataset(config: DatasetConfig): void {
    const idx = datasets.value.findIndex((d) => d.id === config.id)
    if (idx >= 0) {
      datasets.value[idx] = config
    } else {
      datasets.value.push(config)
    }
  }

  function removeDataset(id: string): void {
    datasets.value = datasets.value.filter((d) => d.id !== id)
  }

  // 供独立预览 hydrate：用项目内嵌的数据集快照覆盖内存（仅 mock 本地解析用）
  function hydrate(snapshots: DatasetConfig[] | undefined): void {
    if (!snapshots || !snapshots.length) return
    for (const snap of snapshots) {
      const idx = datasets.value.findIndex((d) => d.id === snap.id)
      if (idx >= 0) datasets.value[idx] = snap
      else datasets.value.push(snap)
    }
  }

  return { datasets, getDataset, addDataset, updateDataset, removeDataset, hydrate }
})

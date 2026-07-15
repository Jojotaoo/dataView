<script setup lang="ts">
import { provide } from 'vue'
import { useDatasetStore } from './stores/dataset'

const datasetStore = useDatasetStore()

// mock 模式：把 editor 的 dataset store 按 id 暴露给共享库的 DataFetchManager
provide('datasetResolver', (id: string) => datasetStore.getDataset(id))
</script>

<template>
  <router-view />
</template>

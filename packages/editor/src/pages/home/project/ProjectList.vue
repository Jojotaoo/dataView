<template>
  <div class="project-list-wrap">
    <ProjectToolbar
      v-model:search-value="searchValue"
      v-model:status-filter="statusFilter"
      :total-count="filteredProjects.length"
      :selected-count="selectedCount"
      @create="$emit('createProject')"
    />
    <ProjectTable
      :projects="filteredProjects"
      @edit="$emit('editProject', $event)"
      @selection-change="handleSelectionChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ProjectToolbar from './ProjectToolbar.vue'
import ProjectTable from './ProjectTable.vue'
import type { ProjectItem } from './ProjectTable.vue'

const searchValue = ref('')
const statusFilter = ref('all')
const selectedRows = ref<ProjectItem[]>([])

const projects = ref<ProjectItem[]>([
  {
    id: '1',
    name: '2026Q2资管战情',
    category: '资管',
    status: 'published',
    creator: '张明',
    createdAt: '2026-06-01',
    updatedAt: '10分钟前',
  },
  {
    id: '2',
    name: '全球汇率监控 v3',
    category: '外汇',
    status: 'unpublished',
    creator: '李丽',
    createdAt: '2026-06-05',
    updatedAt: '2小时前',
  },
  {
    id: '3',
    name: '北向资金动态看板',
    category: '资金',
    status: 'published',
    creator: '王磊',
    createdAt: '2026-05-28',
    updatedAt: '5小时前',
  },
  {
    id: '4',
    name: '债券收益率曲线分析',
    category: '固收',
    status: 'unpublished',
    creator: '陈静',
    createdAt: '2026-05-15',
    updatedAt: '昨天',
  },
  {
    id: '5',
    name: '大宗商品风险敞口',
    category: '商品',
    status: 'published',
    creator: '赵岩',
    createdAt: '2026-06-08',
    updatedAt: '昨天',
  },
])

const filteredProjects = computed(() => {
  return projects.value.filter((p) => {
    const matchSearch = !searchValue.value || p.name.includes(searchValue.value)
    const matchStatus = statusFilter.value === 'all' || p.status === statusFilter.value
    return matchSearch && matchStatus
  })
})

const selectedCount = computed(() => selectedRows.value.length)

function handleSelectionChange(rows: ProjectItem[]) {
  selectedRows.value = rows
}

defineEmits<{
  createProject: []
  editProject: [id: string]
}>()
</script>

<style scoped>
.project-list-wrap {
  padding: 20px 28px 28px 28px;
}
</style>

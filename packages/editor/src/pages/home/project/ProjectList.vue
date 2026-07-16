<template>
  <div class="project-list-wrap">
    <ProjectToolbar
      v-model:search-value="searchValue"
      v-model:status-filter="statusFilter"
      :total-count="total"
      :selected-count="selectedCount"
      @create="$emit('createProject')"
    />
    <ProjectTable
      :projects="list"
      :loading="loading"
      @edit="$emit('editProject', $event)"
      @delete="handleDelete"
      @selection-change="handleSelectionChange"
    />
    <el-pagination
      v-if="total > 0"
      class="pl-pager"
      background
      layout="total, sizes, prev, pager, next"
      :total="total"
      :page-size="query.pageSize"
      :current-page="query.page"
      :page-sizes="[10, 20, 50, 100]"
      @current-change="onPageChange"
      @size-change="onSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import ProjectToolbar from './ProjectToolbar.vue'
import ProjectTable from './ProjectTable.vue'
import type { ProjectItem } from './ProjectTable.vue'
import { fetchProjectList, deleteProject, type ProjectServiceOptions } from '../../../server/project'
import { useDashboardStore } from 'jojotaoo_components'

const searchValue = ref('')
const statusFilter = ref('all')
const selectedRows = ref<ProjectItem[]>([])
const list = ref<ProjectItem[]>([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ page: 1, pageSize: 20, keyword: '' })

const store = useDashboardStore()
const emit = defineEmits<{
  createProject: []
  editProject: [id: string]
}>()

function serviceOpts(): ProjectServiceOptions {
  return {
    mode: store.requestGlobalConfig.datasetMode ?? 'mock',
    requestOriginUrl: store.requestGlobalConfig.requestOriginUrl,
  }
}

async function load() {
  loading.value = true
  try {
    query.keyword = searchValue.value
    const res = await fetchProjectList({ ...query }, serviceOpts())
    list.value = res.list
    total.value = res.total
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '获取项目列表失败')
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: string) {
  try {
    await deleteProject(id, serviceOpts())
    ElMessage.success('已删除')
    load()
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '删除项目失败')
  }
}

const selectedCount = ref(0)
function handleSelectionChange(rows: ProjectItem[]) {
  selectedRows.value = rows
  selectedCount.value = rows.length
}

function onPageChange(page: number) {
  query.page = page
  load()
}

function onSizeChange(size: number) {
  query.pageSize = size
  query.page = 1
  load()
}

onMounted(load)

defineExpose({ load })
</script>

<style scoped>
.project-list-wrap {
  padding: 20px 28px 28px 28px;
}

.pl-pager {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>

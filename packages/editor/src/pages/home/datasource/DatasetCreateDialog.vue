<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑基础信息' : '新建数据集'"
    :width="520"
    class="dc-dialog"
    @closed="onClosed"
  >
    <el-form label-width="92px" :model="form">
      <el-form-item label="数据集名称" required>
        <el-input v-model="form.name" placeholder="如：销售汇总" />
      </el-form-item>
      <el-form-item label="数据源" required>
        <el-select v-model="form.dataSourceId" placeholder="选择数据源" style="width: 100%">
          <el-option v-for="ds in dataSources" :key="ds.id" :label="ds.name" :value="ds.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="基础 SQL">
        <el-input v-model="form.sql" type="textarea" :rows="3" placeholder="SELECT * FROM sales" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="confirm">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useDashboardStore } from 'jojotaoo_components'
import { fetchDataSourceEnum, createDataset, saveDataset, type DatasetServiceOptions } from '../../../server/dataset'
import type { DataSourceItem, DatasetConfig } from 'jojotaoo_components'

const visible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const dataSources = ref<DataSourceItem[]>([])
const existing = ref<DatasetConfig | null>(null)

const form = reactive<{ name: string; dataSourceId: string; sql: string }>({
  name: '',
  dataSourceId: '',
  sql: '',
})

const store = useDashboardStore()

function serviceOpts(): DatasetServiceOptions {
  return {
    mode: store.requestGlobalConfig.datasetMode ?? 'mock',
    requestOriginUrl: store.requestGlobalConfig.requestOriginUrl,
  }
}

function open(mode: 'create' | 'edit', base?: DatasetConfig) {
  isEdit.value = mode === 'edit'
  existing.value = base ?? null
  form.name = base?.name ?? ''
  form.dataSourceId = base?.dataSourceId ?? ''
  form.sql = base?.sql ?? ''
  visible.value = true
  fetchDataSourceEnum().then((list) => (dataSources.value = list))
}

async function confirm() {
  if (!form.name.trim()) {
    ElMessage.warning('请填写数据集名称')
    return
  }
  if (!form.dataSourceId) {
    ElMessage.warning('请选择数据源')
    return
  }
  submitting.value = true
  try {
    if (isEdit.value && existing.value) {
      const next: DatasetConfig = {
        ...existing.value,
        name: form.name.trim(),
        dataSourceId: form.dataSourceId,
        sql: form.sql,
        updatedAt: Date.now(),
      }
      const saved = await saveDataset(next, serviceOpts())
      visible.value = false
      emit('confirm', saved)
    } else {
      const created = await createDataset(
        { name: form.name.trim(), dataSourceId: form.dataSourceId, sql: form.sql },
        serviceOpts(),
      )
      visible.value = false
      emit('confirm', created)
    }
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '操作失败')
  } finally {
    submitting.value = false
  }
}

function onClosed() {
  existing.value = null
}

const emit = defineEmits<{ (e: 'confirm', config: DatasetConfig): void }>()

defineExpose({ open })
</script>

<style scoped>
.dc-dialog :deep(.el-dialog__body) {
  padding-top: 10px;
}
</style>
<!-- 
  现在处理项目列表页面交互和接口，点击新建项目 弹出一个弹窗，填写项目名称，项目分类，项目描述，点击确认后跳转到editor页面，editor页面，页面路由后面加一个ID又服务端生成的，editor有一个保存的按钮，点击保存后调用保存接口保存schema结构
-->

<template>
  <el-dialog v-model="visible" title="新建项目" :width="520" class="pc-dialog" @closed="onClosed">
    <el-form label-width="92px" :model="form">
      <el-form-item label="项目名称" required>
        <el-input v-model="form.name" placeholder="如：2026Q2资管战情" />
      </el-form-item>
      <el-form-item label="项目分类">
        <el-input v-model="form.category" placeholder="如：资管 / 外汇（自由文本）" />
      </el-form-item>
      <el-form-item label="项目描述">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="项目说明（可选）" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="confirm">确认创建</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useDashboardStore } from 'jojotaoo_components'
import { createProject, type ProjectServiceOptions, type ProjectItem } from '../../../server/project'

const visible = ref(false)
const submitting = ref(false)

const form = reactive<{ name: string; category: string; description: string }>({
  name: '',
  category: '',
  description: '',
})

const store = useDashboardStore()

function serviceOpts(): ProjectServiceOptions {
  return {
    mode: store.requestGlobalConfig.datasetMode ?? 'mock',
    requestOriginUrl: store.requestGlobalConfig.requestOriginUrl,
  }
}

function open() {
  form.name = ''
  form.category = ''
  form.description = ''
  visible.value = true
}

async function confirm() {
  if (!form.name.trim()) {
    ElMessage.warning('请填写项目名称')
    return
  }
  submitting.value = true
  try {
    const created = await createProject(
      { name: form.name.trim(), category: form.category.trim(), description: form.description.trim() },
      serviceOpts(),
    )
    visible.value = false
    emit('created', created)
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '创建项目失败')
  } finally {
    submitting.value = false
  }
}

function onClosed() {
  /* 表单已在 open 时重置 */
}

const emit = defineEmits<{ (e: 'created', item: ProjectItem): void }>()

defineExpose({ open })
</script>

<style scoped>
.pc-dialog :deep(.el-dialog__body) {
  padding-top: 10px;
}
</style>

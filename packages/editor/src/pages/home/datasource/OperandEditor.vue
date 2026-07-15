<template>
  <span class="operand-editor">
    <el-select v-model="model.kind" class="operand-kind" @change="onKindChange">
      <el-option label="字段" value="field" />
      <el-option label="数字" value="const" />
    </el-select>
    <el-select
      v-if="model.kind === 'field'"
      v-model="model.field"
      filterable
      placeholder="选择字段"
      class="operand-field"
    >
      <el-option v-for="f in fields" :key="f" :label="f" :value="f" />
    </el-select>
    <el-input-number v-else v-model="model.value" :controls="false" class="operand-value" />
  </span>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

interface OperandModel {
  kind: 'field' | 'const'
  field: string
  value: number
}

const props = defineProps<{
  modelValue: OperandModel
  fields: string[]
}>()

const emit = defineEmits<{ (e: 'update:modelValue', v: OperandModel): void }>()

const model = reactive<OperandModel>({ ...props.modelValue })

function sync() {
  emit('update:modelValue', { ...model })
}

function onKindChange() {
  sync()
}

watch(
  () => props.modelValue,
  (v) => {
    model.kind = v.kind
    model.field = v.field
    model.value = v.value
  },
  { deep: true },
)
watch(model, sync, { deep: true })
</script>

<style scoped>
.operand-editor {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.operand-kind {
  width: 80px;
}
.operand-field {
  width: 140px;
}
.operand-value {
  width: 120px;
}
</style>

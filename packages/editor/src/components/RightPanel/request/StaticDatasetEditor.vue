<template>
  <div class="dataset-editor">
    <div class="section-subtitle">数据集 (Dataset)</div>
    <div class="prop-group">
      <label class="prop-label">维度</label>
      <div class="dimension-row">
        <input
          v-for="(dim, di) in dataset.dimensions"
          :key="di"
          type="text" class="prop-input dim-input"
          :value="dim"
          @input="emit('updateDimension', di, ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
    <div class="prop-group">
      <label class="prop-label">数据表</label>
      <div class="data-table">
        <div class="table-header">
          <span v-for="dim in dataset.dimensions" :key="dim" class="th">{{ dim }}</span>
          <span class="th th-action"></span>
        </div>
        <div v-for="(row, ri) in dataset.source" :key="ri" class="table-row">
          <input
            v-for="(cell, ci) in row"
            :key="ci"
            type="text" class="prop-input cell-input"
            :value="cell"
            @input="emit('updateCell', ri, ci, ($event.target as HTMLInputElement).value)"
          />
          <button class="cell-remove" @click="emit('removeRow', ri)">✕</button>
        </div>
      </div>
      <button class="add-btn" @click="emit('addRow')">+ 添加行</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  dataset: {
    dimensions: string[]
    source: any[][]
  }
}>()

const emit = defineEmits<{
  (e: 'updateDimension', index: number, value: string): void
  (e: 'updateCell', rowIndex: number, colIndex: number, value: string): void
  (e: 'addRow'): void
  (e: 'removeRow', rowIndex: number): void
}>()
</script>

<style scoped>
.dataset-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.section-subtitle {
  font-size: 11px;
  font-weight: 500;
  color: #89b4fa;
  margin: 4px 0;
}
.prop-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.prop-label {
  font-size: 11px;
  color: #a6adc8;
  font-weight: 500;
}
.dimension-row { display: flex; gap: 4px; }
.dim-input { flex: 1; font-size: 11px; }
.prop-input {
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 12px;
  color: #cdd6f4;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
}
.prop-input:focus { border-color: #89b4fa; }
.data-table {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 240px;
  overflow-y: auto;
}
.table-header {
  display: flex;
  gap: 4px;
  padding: 4px 0;
  border-bottom: 1px solid #45475a;
  margin-bottom: 2px;
}
.th {
  flex: 1;
  font-size: 10px;
  color: #6c7086;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0 4px;
}
.th-action { flex: 0 0 24px; }
.table-row { display: flex; gap: 4px; align-items: center; }
.cell-input { flex: 1; font-size: 11px; padding: 4px 6px; }
.cell-remove {
  flex: 0 0 24px;
  height: 24px;
  background: none;
  border: none;
  color: #6c7086;
  cursor: pointer;
  font-size: 11px;
  border-radius: 4px;
  transition: all 0.15s;
}
.cell-remove:hover { background: #f38ba8; color: #1e1e2e; }
.add-btn {
  padding: 4px 8px;
  background: #313244;
  border: 1px dashed #45475a;
  border-radius: 4px;
  color: #6c7086;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}
.add-btn:hover {
  background: #45475a;
  color: #cdd6f4;
  border-color: #89b4fa;
}
</style>

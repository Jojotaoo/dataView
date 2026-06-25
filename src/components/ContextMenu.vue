<template>
  <div class="cm-backdrop" @click="$emit('close')" @contextmenu.prevent="$emit('close')">
    <div class="cm-menu" :style="{ left: x + 'px', top: y + 'px' }" @click.stop>
      <button
        class="cm-item"
        :class="{ disabled: !canGroup }"
        :disabled="!canGroup"
        @click="emit('group')"
      >分组</button>
      <button
        class="cm-item"
        :class="{ disabled: !canUngroup }"
        :disabled="!canUngroup"
        @click="emit('ungroup')"
      >取消分组</button>
      <button class="cm-item delete" @click="emit('delete')">删除</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  group: []
  ungroup: []
  delete: []
  close: []
}>()

defineProps<{
  x: number
  y: number
  canGroup: boolean
  canUngroup: boolean
}>()
</script>

<style scoped>
.cm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
}

.cm-menu {
  position: fixed;
  z-index: 2001;
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  padding: 4px 0;
  min-width: 140px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.cm-item {
  display: block;
  width: 100%;
  padding: 8px 16px;
  background: none;
  border: none;
  color: #cdd6f4;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
}

.cm-item:hover:not(.disabled) {
  background: #45475a;
}

.cm-item.disabled {
  color: #6c7086;
  cursor: default;
}

.cm-item.delete:hover {
  background: #f38ba8;
  color: #1e1e2e;
}
</style>

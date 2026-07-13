<template>
  <div class="ds-stats">
    <div v-for="stat in stats" :key="stat.label" class="ds-stat">
      <div class="ds-label">{{ stat.label }}</div>
      <div class="ds-value" :class="stat.color">{{ stat.value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const stats = reactive([
  { label: '数据源总数', value: 12, color: 'blue' },
  { label: '在线', value: 8, color: 'green' },
  { label: '离线', value: 3, color: 'gold' },
  { label: '异常', value: 1, color: 'red' },
])
</script>

<style scoped>
.ds-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.ds-stat {
  background: #0f1728;
  border: 1px solid #1a2844;
  border-radius: 8px;
  padding: 14px 18px;
}

.ds-label {
  font-size: 13px;
  color: #8a9bb5;
}

.ds-value {
  font-size: 26px;
  font-weight: 700;
  font-family: 'Inter', monospace;
  margin-top: 4px;
}

.ds-value.green {
  color: #00e676;
}
.ds-value.blue {
  color: #2b6ff2;
}
.ds-value.gold {
  color: #d4af37;
}
.ds-value.red {
  color: #ff2d4a;
}
</style>

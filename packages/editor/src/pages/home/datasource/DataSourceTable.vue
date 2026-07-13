<template>
  <div class="ds-table-wrap">
    <div class="ds-toolbar">
      <el-button type="primary">
        <el-icon><Plus /></el-icon>
        添加数据源
      </el-button>
      <el-button plain>
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>
    <el-empty description="数据源管理功能开发中...">
      <template #image>
        <el-icon :size="64" color="#1A2844"><DataLine /></el-icon>
      </template>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { Plus, Refresh, DataLine } from '@element-plus/icons-vue'
</script>

<style scoped>
.ds-table-wrap {
  background: #0f1728;
  border: 1px solid #1a2844;
  border-radius: 8px;
  padding: 20px;
}

.ds-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
</style>

<template>
  <div class="datasource-wrap">
    <DataSourceStats />
    <DataSourceTable />
  </div>
</template>

<script setup lang="ts">
import DataSourceStats from './DataSourceStats.vue'
import DataSourceTable from './DataSourceTable.vue'
</script>

<style scoped>
.datasource-wrap {
  padding: 20px 28px 28px 28px;
}
</style>

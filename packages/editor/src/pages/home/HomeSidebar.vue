<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <el-icon :size="26" color="#2B6FF2"><Monitor /></el-icon>
      <span class="logo-text">大屏智造</span>
    </div>
    <div class="sidebar-nav">
      <div
        v-for="item in menuItems"
        :key="item.key"
        class="nav-item"
        :class="{ active: activeMenu === item.key }"
        @click="$emit('select', item.key)"
      >
        <el-icon :size="16"><component :is="item.icon" /></el-icon>
        <span>{{ item.label }}</span>
      </div>
    </div>
    <div class="sidebar-bottom">
      <div class="nav-item disabled">
        <el-icon :size="16"><Setting /></el-icon>
        <span>设置</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Monitor, Compass, List, DataLine, Setting } from '@element-plus/icons-vue'
import { reactive } from 'vue'

defineProps<{
  activeMenu: string
}>()

defineEmits<{
  select: [key: string]
}>()

const menuItems = reactive([
  { key: 'intro', label: '大屏介绍', icon: Compass },
  { key: 'project', label: '项目列表', icon: List },
  { key: 'datasource', label: '数据源管理', icon: DataLine },
])
</script>

<style scoped>
.sidebar {
  width: 210px;
  background: #080c16;
  border-right: 1px solid #1a2844;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100vh;
  position: sticky;
  top: 0;
  padding: 24px 0 20px 0;
  z-index: 10;
}

.sidebar-logo {
  padding: 0 20px 28px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 1px;
  border-bottom: 1px solid #1a2844;
  margin-bottom: 16px;
}

.logo-text {
  background: linear-gradient(135deg, #2b6ff2, #7b68ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sidebar-nav {
  flex: 1;
}

.nav-item {
  padding: 12px 20px;
  margin: 2px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #8a9bb5;
  cursor: pointer;
  transition: 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  position: relative;
}

.nav-item:hover {
  background: rgba(43, 111, 242, 0.08);
  color: #e8edf2;
}

.nav-item.active {
  background: rgba(43, 111, 242, 0.12);
  color: #2b6ff2;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 30%;
  height: 40%;
  width: 3px;
  background: #2b6ff2;
  border-radius: 0 4px 4px 0;
  box-shadow: 0 0 14px rgba(43, 111, 242, 0.5);
}

.sidebar-bottom {
  margin-top: auto;
  border-top: 1px solid #1a2844;
  padding-top: 16px;
}

.nav-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .sidebar {
    width: 64px;
    padding: 20px 0 16px 0;
  }

  .sidebar-logo {
    padding: 0 0 20px 0;
    justify-content: center;
  }

  .logo-text {
    display: none;
  }

  .nav-item {
    justify-content: center;
    padding: 12px;
    margin: 2px 6px;
  }

  .nav-item span {
    display: none;
  }

  .nav-item.active::before {
    display: none;
  }

  .sidebar-bottom .nav-item span {
    display: none;
  }
}
</style>

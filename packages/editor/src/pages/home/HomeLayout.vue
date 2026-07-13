<template>
  <div class="home-layout">
    <HomeSidebar :active-menu="activeMenu" @select="activeMenu = $event" />
    <div class="main-wrapper">
      <header class="topbar">
        <div class="breadcrumb">
          <el-icon color="#2B6FF2"><HomeFilled /></el-icon>
          大屏智造 / <span>{{ currentPageTitle }}</span>
        </div>
        <div class="topbar-actions">
          <el-icon class="topbar-icon"><Search /></el-icon>
          <el-icon class="topbar-icon"><Bell /></el-icon>
          <div class="avatar">管</div>
        </div>
      </header>
      <div class="content">
        <IntroPanel v-if="activeMenu === 'intro'" @create-project="goToEditor" />
        <ProjectList v-else-if="activeMenu === 'project'" @create-project="goToEditor" @edit-project="goToEditor" />
        <DataSourceManager v-else-if="activeMenu === 'datasource'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { HomeFilled, Search, Bell } from '@element-plus/icons-vue'
import HomeSidebar from './HomeSidebar.vue'
import IntroPanel from './intro/IntroPanel.vue'
import ProjectList from './project/ProjectList.vue'
import DataSourceManager from './datasource/DataSourceManager.vue'

const router = useRouter()
const activeMenu = ref('intro')

const menuTitleMap: Record<string, string> = {
  intro: '大屏介绍',
  project: '项目列表',
  datasource: '数据源管理',
}

const currentPageTitle = computed(() => menuTitleMap[activeMenu.value] || '大屏介绍')

function goToEditor() {
  router.push('/editor')
}
</script>

<style scoped>
.home-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #080c16;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100vh;
  overflow: hidden;
}

.topbar {
  height: 60px;
  background: rgba(8, 12, 22, 0.92);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(43, 111, 242, 0.15);
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  z-index: 5;
}

.breadcrumb {
  font-size: 14px;
  color: #8a9bb5;
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb span {
  color: #e8edf2;
  font-weight: 600;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  color: #8a9bb5;
}

.topbar-icon {
  font-size: 18px;
  cursor: pointer;
  transition: 0.3s ease;
}

.topbar-icon:hover {
  color: #e8edf2;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2b6ff2, #7b68ee);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.content {
  flex: 1;
  overflow-y: auto;
}

@media (max-width: 600px) {
  .topbar {
    padding: 0 16px;
  }
}
</style>

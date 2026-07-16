import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ChartEditStorage, ProjectItem } from '../server/project'

// 项目内存 store：mock 模式仅内存、不持久化（刷新即丢）；server 模式由真实后端落库。
export const useProjectStore = defineStore('project', () => {
  const projects = ref<ProjectItem[]>([])

  function getProject(id: string): ProjectItem | undefined {
    return projects.value.find((p) => p.id === id)
  }

  function addProject(item: ProjectItem): void {
    projects.value.push(item)
  }

  function updateProjectSchema(id: string, schema: ChartEditStorage): void {
    const item = projects.value.find((p) => p.id === id)
    if (item) {
      item.schema = schema
      item.updatedAt = Date.now()
    }
  }

  // 发布：写 schema + status=1 + 刷新 updatedAt
  function publishProjectSchema(id: string, schema: ChartEditStorage): void {
    const item = projects.value.find((p) => p.id === id)
    if (item) {
      item.schema = schema
      item.status = 1
      item.updatedAt = Date.now()
    }
  }

  function removeProject(id: string): void {
    projects.value = projects.value.filter((p) => p.id !== id)
  }

  return { projects, getProject, addProject, updateProjectSchema, publishProjectSchema, removeProject }
})

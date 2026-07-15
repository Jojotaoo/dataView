import type { RequestConfigType } from './request'
import type { CreateComponentType } from './component'
import type { ChartThemePreset } from '../config/chartThemes'
import type { DatasetConfig } from './dataset'

export interface EditCanvasConfigType {
  projectName: string
  width: number
  height: number
  background: string
  backgroundImage: string | null
  filterShow: boolean
  opacity: number
  saturate: number
  contrast: number
  hueRotate: number
  brightness: number
  blendMode: string
  customTheme: ChartThemePreset | null
}

export interface DataPondItem {
  dataPondId: string
  dataPondName: string
  dataPondRequestConfig: RequestConfigType
}

export interface RequestGlobalConfigType {
  requestOriginUrl: string
  requestInterval: number
  requestIntervalUnit: 'second' | 'minute' | 'hour' | 'day'
  requestHeader: Record<string, string>
  requestDataPond: DataPondItem[]
  datasetMode?: 'mock' | 'server' // 数据集运行时：前端算(mock) 或 服务端拼装SQL(server)
}

export interface ChartEditStorage {
  editCanvasConfig: EditCanvasConfigType
  requestGlobalConfig: RequestGlobalConfigType
  componentList: CreateComponentType[]
  datasetBindings?: DatasetConfig[] // 仅含组件引用到的数据集快照，供独立预览可移植
}

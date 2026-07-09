import type { RequestConfigType } from './request'
import type { CreateComponentType } from './component'
import type { ChartThemePreset } from '../config/chartThemes'

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
}

export interface ChartEditStorage {
  editCanvasConfig: EditCanvasConfigType
  requestGlobalConfig: RequestGlobalConfigType
  componentList: CreateComponentType[]
}

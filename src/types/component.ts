import type { RequestConfigType } from './request'
import type { ChartConfigType } from './request'
import type { EventsType, InteractActionItem } from './events'

export interface AttrType {
  x: number
  y: number
  w: number
  h: number
  offsetX: number
  offsetY: number
  zIndex: number
}

export const DEFAULT_ATTR: AttrType = {
  x: 50,
  y: 50,
  w: 500,
  h: 300,
  offsetX: 0,
  offsetY: 0,
  zIndex: 0,
}

export interface StylesType {
  filterShow: boolean
  opacity: number
  saturate: number
  contrast: number
  hueRotate: number
  brightness: number
  rotateZ: number
  rotateX: number
  rotateY: number
  skewX: number
  skewY: number
  blendMode: string
  animations: string[]
}

export const DEFAULT_STYLES: StylesType = {
  filterShow: false,
  opacity: 1,
  saturate: 1,
  contrast: 1,
  hueRotate: 0,
  brightness: 1,
  rotateZ: 0,
  rotateX: 0,
  rotateY: 0,
  skewX: 0,
  skewY: 0,
  blendMode: 'normal',
  animations: [],
}

export interface StatusType {
  lock: boolean
  hide: boolean
}

export const DEFAULT_STATUS: StatusType = {
  lock: false,
  hide: false,
}

export interface PreviewType {
  overFlowHidden: boolean
}

export const DEFAULT_PREVIEW: PreviewType = {
  overFlowHidden: false,
}

export interface CreateComponentType {
  id: string
  key: string
  isGroup?: boolean
  chartConfig: ChartConfigType
  attr: AttrType
  styles: StylesType
  status: StatusType
  filter?: string
  preview: PreviewType
  events?: EventsType
  interactActions?: InteractActionItem[]
  request?: RequestConfigType
  option: Record<string, any>
  groupList?: CreateComponentType[]
}

export interface CanvasComponent extends CreateComponentType {
  props: Record<string, any>
}

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

export interface ChartStyleConfig {
  themeName: string
  grid: {
    top: number
    bottom: number
    left: number
    right: number
  }
  titleStyle: {
    show: boolean
    fontSize: number
    color: string
    left: number | string
    top: number | string
  }
  legend: {
    show: boolean
    orient: 'horizontal' | 'vertical'
    left: number | string
    top: number | string
    fontSize: number
    icon: 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond'
    textColor: string
  }
  xAxis: {
    show: boolean
    name: string
    labelFontSize: number
    labelRotate: number
    lineColor: string
    labelColor: string
  }
  yAxis: {
    show: boolean
    name: string
    labelFontSize: number
    min: number | null
    max: number | null
    splitLineShow: boolean
    splitLineColor: string
    labelColor: string
  }
  series: {
    smooth: boolean
    symbol: string
    symbolSize: number
    barWidth: number | string
    barBorderRadius: number
    lineWidth: number
    showArea: boolean
    showLabel: boolean
    labelFontSize: number
    color: string
    colorEnd: string
    colorList: string[]
    areaOpacityStart: number
    areaOpacityEnd: number
    labelColor: string
    pieRadius: number
    pieRoseType: boolean
    pieLabelPosition: 'inside' | 'outside' | 'center'
  }
  tooltip: {
    show: boolean
    trigger: 'axis' | 'item' | 'none'
    backgroundColor: string
    borderColor: string
    textColor: string
  }
  backgroundColor: string
}

export const DEFAULT_CHART_STYLE: ChartStyleConfig = {
  themeName: 'catppuccin',
  grid: { top: 10, bottom: 30, left: 10, right: 10 },
  titleStyle: { show: true, fontSize: 14, color: '#cdd6f4', left: 'center', top: 8 },
  legend: { show: true, orient: 'horizontal', left: 'center', top: 38, fontSize: 11, icon: 'circle', textColor: '#cdd6f4' },
  xAxis: { show: true, name: '', labelFontSize: 11, labelRotate: 0, lineColor: '#45475a', labelColor: '#a6adc8' },
  yAxis: { show: true, name: '', labelFontSize: 11, min: null, max: null, splitLineShow: true, splitLineColor: '#313244', labelColor: '#a6adc8' },
  series: {
    smooth: true, symbol: 'circle', symbolSize: 8,
    barWidth: '50%', barBorderRadius: 4, lineWidth: 3,
    showArea: true, showLabel: true, labelFontSize: 11,
    color: '#89b4fa', colorEnd: '#45475a',
    colorList: ['#89b4fa', '#f38ba8', '#a6e3a1', '#fab387', '#cba6f7', '#94e2d5', '#f9e2af', '#74c7ec'],
    areaOpacityStart: 0.4, areaOpacityEnd: 0.02,
    labelColor: '#cdd6f4',
    pieRadius: 0, pieRoseType: false, pieLabelPosition: 'outside',
  },
  tooltip: { show: true, trigger: 'axis', backgroundColor: '#313244', borderColor: '#45475a', textColor: '#cdd6f4' },
  backgroundColor: 'transparent',
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
  chartStyle?: ChartStyleConfig
  groupList?: CreateComponentType[]
}

export interface CanvasComponent extends CreateComponentType {
  props: Record<string, any>
}

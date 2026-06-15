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
  rotateZ: number
  rotateX: number
  rotateY: number
  skewX: number
  skewY: number
  blendMode: string
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

export interface ChartConfigType {
  key: string
  chartKey: string
  conKey: string
  title: string
  category: string
  categoryName: string
  package: string
  chartFrame: string
  image: string
  redirectComponent?: string
  dataset?: any
  disabled?: boolean
  icon?: string
}

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

export interface BaseEventType {
  click?: string
  dblclick?: string
  mouseenter?: string
  mouseleave?: string
}

export interface AdvancedEventType {
  vnodeMounted?: string
  vnodeBeforeMount?: string
}

export interface InteractEventItem {
  interactOn: string
  interactComponentId: string
  interactFn: Record<string, string>
}

export interface InteractActionItem {
  interactType: string
  interactName: string
  componentEmitEvents: Record<string, { value: string; label: string }[]>
}

export interface EventsType {
  baseEvent?: BaseEventType
  advancedEvents?: AdvancedEventType
  interactEvents?: InteractEventItem[]
}

export interface RequestBodyType {
  'form-data': Record<string, string>
  'x-www-form-urlencoded': Record<string, string>
  json: string
  xml: string
}

export interface ComponentRequestConfigType {
  requestDataType: 0 | 1 | 2
  requestUrl?: string
  requestHttpType?: 'get' | 'post' | 'put' | 'delete' | 'patch'
  requestContentType?: number
  requestParamsBodyType?: string
  requestSQLContent?: { sql: string }
  requestParams?: {
    Params: Record<string, string>
    Header: Record<string, string>
    Body: RequestBodyType
  }
  requestInterval?: number | null
  requestIntervalUnit?: string
  requestDataPondId?: string
}

export interface RequestConfigType extends ComponentRequestConfigType {}

export interface CreateComponentType {
  id: string
  key: string
  parentId?: string | null
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

export interface ChartEditStorage {
  editCanvasConfig: EditCanvasConfigType
  requestGlobalConfig: RequestGlobalConfigType
  componentList: CreateComponentType[]
}

export interface RequestBodyType {
  'form-data': Record<string, string>
  'x-www-form-urlencoded': Record<string, string>
  json: string
  xml: string
}

export const RequestDataTypeEnum = {
  STATIC: 0,
  AJAX: 1,
  POND: 2,
  DATASET: 3,
} as const

export interface ComponentRequestConfigType {
  requestDataType: 0 | 1 | 2 | 3
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
  requestDatasetId?: string
}

export interface RequestConfigType extends ComponentRequestConfigType {}

export const DEFAULT_REQUEST: RequestConfigType = {
  requestDataType: 0,
  requestHttpType: 'get',
  requestUrl: '',
  requestInterval: null,
  requestIntervalUnit: 'second',
  requestParamsBodyType: 'none',
  requestParams: {
    Params: {},
    Header: {},
    Body: {
      'form-data': {},
      'x-www-form-urlencoded': {},
      json: '',
      xml: '',
    },
  },
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

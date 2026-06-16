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

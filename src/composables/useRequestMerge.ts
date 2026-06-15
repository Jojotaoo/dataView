import type { RequestConfigType, RequestGlobalConfigType } from '../types'

export interface MergedRequestConfig {
  url: string
  method: string
  headers: Record<string, string>
  params: Record<string, any>
  body: any
  polling: {
    interval: number
    unit: string
  } | null
}

export function mergeRequestConfig(
  componentConfig: RequestConfigType,
  globalConfig: RequestGlobalConfigType
): MergedRequestConfig | null {
  if (componentConfig.requestDataType === 0) {
    return null
  }

  const url = resolveUrl(
    globalConfig.requestOriginUrl,
    componentConfig.requestUrl ?? ''
  )

  const headers = {
    ...globalConfig.requestHeader,
    ...(componentConfig.requestParams?.Header ?? {}),
  }

  const params = componentConfig.requestParams?.Params ?? {}

  const body = getBodyByType(
    componentConfig.requestParamsBodyType ?? 'none',
    componentConfig.requestParams?.Body
  )

  const pollingInterval = componentConfig.requestInterval ?? globalConfig.requestInterval
  const pollingUnit = componentConfig.requestIntervalUnit ?? globalConfig.requestIntervalUnit

  return {
    url,
    method: componentConfig.requestHttpType ?? 'get',
    headers,
    params,
    body,
    polling: {
      interval: pollingInterval,
      unit: pollingUnit,
    },
  }
}

export function resolveUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, '')
  const p = path.replace(/^\/+/, '')
  return p ? `${base}/${p}` : base
}

export function resolveUrlWithTemplate(
  template: string,
  context: Record<string, any>
): string {
  if (!template.includes('${')) {
    return template
  }

  const keys = Object.keys(context)
  const values = Object.values(context)
  return new Function(...keys, `return \`${template}\``)(...values)
}

export function getBodyByType(
  type: string,
  bodyConfig?: {
    'form-data': Record<string, any>
    'x-www-form-urlencoded': Record<string, any>
    json: string
    xml: string
  }
): any {
  if (!bodyConfig) return undefined

  switch (type) {
    case 'json':
      try {
        return JSON.parse(bodyConfig.json || '{}')
      } catch {
        return {}
      }
    case 'xml':
      return bodyConfig.xml
    case 'form-data':
      return bodyConfig['form-data']
    case 'x-www-form-urlencoded':
      return bodyConfig['x-www-form-urlencoded']
    case 'none':
    default:
      return undefined
  }
}

export function executeFilter(
  responseData: any,
  fullResponse: any,
  filterFn: string | null
): any {
  if (!filterFn) return responseData

  try {
    const fn = new Function('data', 'res', filterFn)
    return fn(responseData, fullResponse)
  } catch (error) {
    console.error('[Filter] Execute filter function failed:', error)
    return responseData
  }
}

export function toMilliseconds(interval: number, unit: string): number {
  const multipliers: Record<string, number> = {
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
  }
  return interval * (multipliers[unit] ?? 1000)
}

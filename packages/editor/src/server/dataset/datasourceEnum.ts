import type { DataSourceItem } from 'jojotaoo_components'
import { MOCK_DATA_SOURCES } from './types'

// 数据源枚举响应体
export type FetchDataSourceEnumResponse = DataSourceItem[]

// 数据源枚举（mock：返回内置注册表；server 后续可改为 GET {requestOriginUrl}/api/datasource/enum）
export async function fetchDataSourceEnum(): Promise<FetchDataSourceEnumResponse> {
  return Promise.resolve(MOCK_DATA_SOURCES)
}

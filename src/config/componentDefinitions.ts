import type { ChartConfigType } from '../types'

export type ComponentDefinition = ChartConfigType & {
  name: string
  icon: string
  defaultOption: Record<string, any>
  defaultProps: Record<string, any>
}

export const componentDefinitions: ComponentDefinition[] = [
  {
    key: 'BarCommon',
    chartKey: 'VBarCommon',
    conKey: 'VCBarCommon',
    title: '柱状图',
    name: '柱状图',
    category: 'Bars',
    categoryName: '柱状图',
    package: 'Charts',
    chartFrame: 'echarts',
    image: 'bar.png',
    icon: '📊',
    defaultOption: {
      title: '柱状图',
      dataset: {
        dimensions: ['类别', '销量'],
        source: [
          ['一月', 120],
          ['二月', 200],
          ['三月', 150],
          ['四月', 80],
          ['五月', 70],
          ['六月', 110],
        ],
      },
    },
    defaultProps: {},
  },
  {
    key: 'LineCommon',
    chartKey: 'VLineCommon',
    conKey: 'VCLineCommon',
    title: '折线图',
    name: '折线图',
    category: 'Lines',
    categoryName: '折线图',
    package: 'Charts',
    chartFrame: 'echarts',
    image: 'line.png',
    icon: '📈',
    defaultOption: {
      title: '折线图',
      dataset: {
        dimensions: ['月份', '访问量'],
        source: [
          ['一月', 820],
          ['二月', 932],
          ['三月', 901],
          ['四月', 1290],
          ['五月', 1330],
          ['六月', 1320],
        ],
      },
    },
    defaultProps: {},
  },
]

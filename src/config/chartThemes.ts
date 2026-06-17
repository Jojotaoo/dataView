import type { ChartStyleConfig } from '../types'

export interface ChartThemePreset {
  name: string
  label: string
  colors: {
    titleColor: string
    legendTextColor: string
    axisLineColor: string
    axisLabelColor: string
    splitLineColor: string
    seriesColor: string
    seriesColorEnd: string
    seriesColorList: string[]
    areaOpacityStart: number
    areaOpacityEnd: number
    labelColor: string
    tooltipBg: string
    tooltipBorder: string
    tooltipTextColor: string
    backgroundColor: string
  }
}

export const CHART_THEMES: ChartThemePreset[] = [
  {
    name: 'catppuccin',
    label: 'Catppuccin',
    colors: {
      titleColor: '#cdd6f4',
      legendTextColor: '#cdd6f4',
      axisLineColor: '#45475a',
      axisLabelColor: '#a6adc8',
      splitLineColor: '#313244',
      seriesColor: '#89b4fa',
      seriesColorEnd: '#45475a',
      seriesColorList: ['#89b4fa', '#f38ba8', '#a6e3a1', '#fab387', '#cba6f7', '#94e2d5', '#f9e2af', '#74c7ec'],
      areaOpacityStart: 0.4,
      areaOpacityEnd: 0.02,
      labelColor: '#cdd6f4',
      tooltipBg: '#313244',
      tooltipBorder: '#45475a',
      tooltipTextColor: '#cdd6f4',
      backgroundColor: 'transparent',
    },
  },
  {
    name: 'dracula',
    label: 'Dracula',
    colors: {
      titleColor: '#f8f8f2',
      legendTextColor: '#f8f8f2',
      axisLineColor: '#6272a4',
      axisLabelColor: '#bd93f9',
      splitLineColor: '#44475a',
      seriesColor: '#bd93f9',
      seriesColorEnd: '#44475a',
      seriesColorList: ['#bd93f9', '#ff79c6', '#50fa7b', '#ffb86c', '#8be9fd', '#f1fa8c', '#ff5555', '#6272a4'],
      areaOpacityStart: 0.4,
      areaOpacityEnd: 0.02,
      labelColor: '#f8f8f2',
      tooltipBg: '#282a36',
      tooltipBorder: '#6272a4',
      tooltipTextColor: '#f8f8f2',
      backgroundColor: 'transparent',
    },
  },
  {
    name: 'solarized',
    label: 'Solarized',
    colors: {
      titleColor: '#839496',
      legendTextColor: '#839496',
      axisLineColor: '#586e75',
      axisLabelColor: '#93a1a1',
      splitLineColor: '#073642',
      seriesColor: '#268bd2',
      seriesColorEnd: '#073642',
      seriesColorList: ['#268bd2', '#dc322f', '#859900', '#b58900', '#6c71c4', '#2aa198', '#cb4b16', '#93a1a1'],
      areaOpacityStart: 0.35,
      areaOpacityEnd: 0.02,
      labelColor: '#839496',
      tooltipBg: '#002b36',
      tooltipBorder: '#586e75',
      tooltipTextColor: '#839496',
      backgroundColor: 'transparent',
    },
  },
  {
    name: 'nord',
    label: 'Nord',
    colors: {
      titleColor: '#eceff4',
      legendTextColor: '#eceff4',
      axisLineColor: '#4c566a',
      axisLabelColor: '#d8dee9',
      splitLineColor: '#3b4252',
      seriesColor: '#88c0d0',
      seriesColorEnd: '#3b4252',
      seriesColorList: ['#88c0d0', '#bf616a', '#a3be8c', '#ebcb8b', '#b48ead', '#81a1c1', '#d08770', '#e5e9f0'],
      areaOpacityStart: 0.35,
      areaOpacityEnd: 0.02,
      labelColor: '#eceff4',
      tooltipBg: '#2e3440',
      tooltipBorder: '#4c566a',
      tooltipTextColor: '#eceff4',
      backgroundColor: 'transparent',
    },
  },
  {
    name: 'onedark',
    label: 'One Dark',
    colors: {
      titleColor: '#abb2bf',
      legendTextColor: '#abb2bf',
      axisLineColor: '#3e4451',
      axisLabelColor: '#9198a5',
      splitLineColor: '#2c323c',
      seriesColor: '#61afef',
      seriesColorEnd: '#282c34',
      seriesColorList: ['#61afef', '#e06c75', '#98c379', '#e5c07b', '#c678dd', '#56b6c2', '#d19a66', '#abb2bf'],
      areaOpacityStart: 0.4,
      areaOpacityEnd: 0.02,
      labelColor: '#abb2bf',
      tooltipBg: '#282c34',
      tooltipBorder: '#3e4451',
      tooltipTextColor: '#abb2bf',
      backgroundColor: 'transparent',
    },
  },
  {
    name: 'gruvbox',
    label: 'Gruvbox',
    colors: {
      titleColor: '#ebdbb2',
      legendTextColor: '#ebdbb2',
      axisLineColor: '#504945',
      axisLabelColor: '#d5c4a1',
      splitLineColor: '#3c3836',
      seriesColor: '#fabd2f',
      seriesColorEnd: '#282828',
      seriesColorList: ['#fabd2f', '#fb4934', '#b8bb26', '#fe8019', '#d3869b', '#8ec07c', '#d65d0e', '#ebdbb2'],
      areaOpacityStart: 0.35,
      areaOpacityEnd: 0.02,
      labelColor: '#ebdbb2',
      tooltipBg: '#282828',
      tooltipBorder: '#504945',
      tooltipTextColor: '#ebdbb2',
      backgroundColor: 'transparent',
    },
  },
  {
    name: 'tokyonight',
    label: 'Tokyo Night',
    colors: {
      titleColor: '#c0caf5',
      legendTextColor: '#c0caf5',
      axisLineColor: '#3b4261',
      axisLabelColor: '#a9b1d6',
      splitLineColor: '#1f2335',
      seriesColor: '#7aa2f7',
      seriesColorEnd: '#1a1b26',
      seriesColorList: ['#7aa2f7', '#f7768e', '#9ece6a', '#e0af68', '#bb9af7', '#7dcfff', '#ff9e64', '#c0caf5'],
      areaOpacityStart: 0.4,
      areaOpacityEnd: 0.02,
      labelColor: '#c0caf5',
      tooltipBg: '#1a1b26',
      tooltipBorder: '#3b4261',
      tooltipTextColor: '#c0caf5',
      backgroundColor: 'transparent',
    },
  },
  {
    name: 'rosepine',
    label: 'Rose Pine',
    colors: {
      titleColor: '#e0def4',
      legendTextColor: '#e0def4',
      axisLineColor: '#31748f',
      axisLabelColor: '#9ccfd8',
      splitLineColor: '#1f1d30',
      seriesColor: '#ebbcba',
      seriesColorEnd: '#191724',
      seriesColorList: ['#ebbcba', '#eb6f92', '#31748f', '#f6c177', '#c4a7e7', '#9ccfd8', '#c4a7e7', '#e0def4'],
      areaOpacityStart: 0.35,
      areaOpacityEnd: 0.02,
      labelColor: '#e0def4',
      tooltipBg: '#191724',
      tooltipBorder: '#31748f',
      tooltipTextColor: '#e0def4',
      backgroundColor: 'transparent',
    },
  },
  {
    name: 'custom',
    label: '自定义',
    colors: {
      titleColor: '#cdd6f4',
      legendTextColor: '#cdd6f4',
      axisLineColor: '#45475a',
      axisLabelColor: '#a6adc8',
      splitLineColor: '#313244',
      seriesColor: '#89b4fa',
      seriesColorEnd: '#45475a',
      seriesColorList: ['#89b4fa', '#f38ba8', '#a6e3a1', '#fab387', '#cba6f7', '#94e2d5', '#f9e2af', '#74c7ec'],
      areaOpacityStart: 0.4,
      areaOpacityEnd: 0.02,
      labelColor: '#cdd6f4',
      tooltipBg: '#313244',
      tooltipBorder: '#45475a',
      tooltipTextColor: '#cdd6f4',
      backgroundColor: 'transparent',
    },
  },
]

export function applyTheme(style: ChartStyleConfig, preset: ChartThemePreset): ChartStyleConfig {
  const c = preset.colors
  return {
    ...style,
    themeName: preset.name,
    backgroundColor: c.backgroundColor,
    titleStyle: { ...style.titleStyle, color: c.titleColor },
    legend: { ...style.legend, textColor: c.legendTextColor },
    xAxis: { ...style.xAxis, lineColor: c.axisLineColor, labelColor: c.axisLabelColor },
    yAxis: { ...style.yAxis, splitLineColor: c.splitLineColor, labelColor: c.axisLabelColor },
    series: {
      ...style.series,
      color: c.seriesColor,
      colorEnd: c.seriesColorEnd,
      colorList: c.seriesColorList,
      areaOpacityStart: c.areaOpacityStart,
      areaOpacityEnd: c.areaOpacityEnd,
      labelColor: c.labelColor,
    },
    tooltip: {
      ...style.tooltip,
      backgroundColor: c.tooltipBg,
      borderColor: c.tooltipBorder,
      textColor: c.tooltipTextColor,
    },
  }
}

export function getThemeByName(name: string): ChartThemePreset | undefined {
  return CHART_THEMES.find(t => t.name === name)
}

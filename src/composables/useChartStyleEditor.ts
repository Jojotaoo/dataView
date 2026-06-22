import { computed } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import { CHART_THEMES } from '../config/chartThemes'

export function useChartStyleEditor() {
  const store = useDashboardStore()
  const comp = computed(() => store.selectedComponent!)

  function onChartStyle(path: string, value: any) {
    if (!store.selectedComponent) return
    store.updateChartStyle(store.selectedComponent.id, path, value)
  }

  function numVal(event: Event) {
    return Number((event.target as HTMLInputElement).value)
  }

  function posUnit(val: number | string | undefined): string {
    return typeof val === 'string' ? '%' : 'px'
  }

  function posNumVal(val: number | string | undefined): string {
    if (typeof val === 'number') return String(val)
    if (typeof val === 'string') return val.replace('%', '')
    return ''
  }

  function onPosChange(path: string, numStr: string, unit: string) {
    if (numStr === '' || numStr === null) return
    const n = Number(numStr)
    if (isNaN(n)) return
    onChartStyle(path, unit === '%' ? `${n}%` : n)
  }

  function onPosUnitChange(path: string, currentVal: number | string | undefined, newUnit: string) {
    const n = posNumVal(currentVal)
    if (n === '') return
    onChartStyle(path, newUnit === '%' ? `${n}%` : Number(n))
  }

  function maybeNull(event: Event) {
    const v = (event.target as HTMLInputElement).value
    return v === '' ? null : Number(v)
  }

  function onThemeChange(event: Event) {
    const themeName = (event.target as HTMLSelectElement).value
    if (themeName === 'custom') {
      const custom = store.editCanvasConfig.customTheme
      if (custom) {
        store.applyThemeToAll(custom)
      }
    } else {
      const preset = CHART_THEMES.find(t => t.name === themeName)
      if (preset) {
        store.applyThemeToAll(preset)
      }
    }
  }

  function saveCurrentAsCustomTheme() {
    if (!comp.value?.chartStyle) return
    const cs = comp.value.chartStyle
    const customPreset = {
      name: 'custom',
      label: '自定义',
      colors: {
        titleColor: cs.titleStyle.color,
        legendTextColor: cs.legend.textColor,
        axisLineColor: cs.xAxis.lineColor,
        axisLabelColor: cs.xAxis.labelColor,
        splitLineColor: cs.yAxis.splitLineColor,
        seriesColor: cs.series.color,
        seriesColorEnd: cs.series.colorEnd,
        seriesColorList: cs.series.colorList,
        areaOpacityStart: cs.series.areaOpacityStart,
        areaOpacityEnd: cs.series.areaOpacityEnd,
        labelColor: cs.series.labelColor,
        tooltipBg: cs.tooltip.backgroundColor,
        tooltipBorder: cs.tooltip.borderColor,
        tooltipTextColor: cs.tooltip.textColor,
        backgroundColor: cs.backgroundColor,
      },
    }
    store.saveCustomTheme(customPreset)
  }

  function onPaletteColor(idx: number, color: string) {
    const list = [...(comp.value?.chartStyle?.series.colorList ?? [])]
    list[idx] = color
    onChartStyle('series.colorList', list)
  }

  function addPaletteColor() {
    const list = [...(comp.value?.chartStyle?.series.colorList ?? [])]
    if (list.length >= 10) return
    list.push('#89b4fa')
    onChartStyle('series.colorList', list)
  }

  function removePaletteColor(idx: number) {
    const list = [...(comp.value?.chartStyle?.series.colorList ?? [])]
    if (list.length <= 1) return
    list.splice(idx, 1)
    onChartStyle('series.colorList', list)
  }

  return {
    comp,
    onChartStyle,
    numVal,
    posUnit,
    posNumVal,
    onPosChange,
    onPosUnitChange,
    maybeNull,
    onThemeChange,
    saveCurrentAsCustomTheme,
    onPaletteColor,
    addPaletteColor,
    removePaletteColor,
    CHART_THEMES,
  }
}

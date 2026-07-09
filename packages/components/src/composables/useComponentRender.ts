import type { Component } from 'vue'
import type { CreateComponentType } from '../types'
import BarChart from '../components/charts/BarChart.vue'
import LineChart from '../components/charts/LineChart.vue'
import PieChart from '../components/charts/PieChart.vue'
import PieGridChart from '../components/charts/PieGridChart.vue'
import MapChart from '../components/charts/MapChart.vue'
import ScrollList from '../components/charts/ScrollList.vue'
import RiskScrollList from '../components/charts/RiskScrollList.vue'
import TextDisplay from '../components/charts/TextDisplay.vue'
import ImageDisplay from '../components/charts/ImageDisplay.vue'
import HeaderLineChart from '../components/charts/HeaderLineChart.vue'
import DateTimeDisplay from '../components/charts/DateTimeDisplay.vue'
import BackgroundCard from '../components/charts/BackgroundCard.vue'

export const componentMap: Record<string, Component> = {
  BarCommon: BarChart,
  LineCommon: LineChart,
  PieCommon: PieChart,
  PieGrid: PieGridChart,
  HeilongjiangMap: MapChart,
  ScrollList: ScrollList,
  RiskScrollList: RiskScrollList,
  TextDisplay: TextDisplay,
  ImageDisplay: ImageDisplay,
  HeaderLine: HeaderLineChart,
  DateTimeDisplay: DateTimeDisplay,
  BackgroundCard: BackgroundCard,
}

export function getComponentProps(comp: CreateComponentType) {
  const props = (comp as any).props ?? {}
  return {
    componentId: comp.id,
    option: comp.option,
    width: comp.attr.w,
    height: comp.attr.h,
    chartStyle: comp.chartStyle,
    bgColor: props.bgColor,
    scrollProps: props,
    textProps: props,
    bgProps: props,
    imageProps: props,
    lineProps: props,
    riskProps: props,
    datetimeProps: props,
    geoKey: 'heilongjiang',
  }
}

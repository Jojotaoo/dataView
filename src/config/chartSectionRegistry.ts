import type { Component } from 'vue'
import BasicInfoSection from '../components/RightPanel/chart-props/BasicInfoSection.vue'
import TransformSection from '../components/RightPanel/chart-props/TransformSection.vue'
import StatusSection from '../components/RightPanel/chart-props/StatusSection.vue'
import FilterSection from '../components/RightPanel/chart-props/FilterSection.vue'
import ChartTitleSection from '../components/RightPanel/chart-props/ChartTitleSection.vue'
import ThemePresetSection from '../components/RightPanel/chart-props/ThemePresetSection.vue'
import GridSection from '../components/RightPanel/chart-props/GridSection.vue'
import TitleStyleSection from '../components/RightPanel/chart-props/TitleStyleSection.vue'
import LegendSection from '../components/RightPanel/chart-props/LegendSection.vue'
import XAxisSection from '../components/RightPanel/chart-props/XAxisSection.vue'
import YAxisSection from '../components/RightPanel/chart-props/YAxisSection.vue'
import SeriesSection from '../components/RightPanel/chart-props/SeriesSection.vue'
import TooltipSection from '../components/RightPanel/chart-props/TooltipSection.vue'
import BackgroundColorSection from '../components/RightPanel/chart-props/BackgroundColorSection.vue'
import BackgroundCardProps from '../components/RightPanel/chart-props/BackgroundCardProps.vue'
import RiskScrollListProps from '../components/RightPanel/chart-props/RiskScrollListProps.vue'
import ImageDisplayProps from '../components/RightPanel/chart-props/ImageDisplayProps.vue'

export const universalSections: Component[] = [
  BasicInfoSection,
  TransformSection,
  StatusSection,
  FilterSection,
]

const axisEChartsSections: Component[] = [
  ChartTitleSection,
  ThemePresetSection,
  GridSection,
  TitleStyleSection,
  LegendSection,
  XAxisSection,
  YAxisSection,
  SeriesSection,
  TooltipSection,
  BackgroundColorSection,
]

const nonAxisEChartsSections: Component[] = [
  ChartTitleSection,
  ThemePresetSection,
  TitleStyleSection,
  LegendSection,
  SeriesSection,
  TooltipSection,
  BackgroundColorSection,
]

export const chartSectionRegistry: Record<string, Component[]> = {
  BarCommon: axisEChartsSections,
  LineCommon: axisEChartsSections,
  PieCommon: nonAxisEChartsSections,
  PieGrid: nonAxisEChartsSections,
  HeilongjiangMap: nonAxisEChartsSections,
  ScrollList: [SeriesSection],
  TextDisplay: [SeriesSection],
  BackgroundCard: [BackgroundCardProps],
  RiskScrollList: [RiskScrollListProps],
  ImageDisplay: [ImageDisplayProps],
}

<template>
  <div class="panel-content">
    <div class="section-title">基本信息</div>
    <div class="prop-form">
      <div class="prop-group">
        <label class="prop-label">组件名称</label>
        <div class="prop-value-static">{{ comp.chartConfig.title }}</div>
      </div>
      <div class="prop-group">
        <label class="prop-label">组件类型</label>
        <div class="prop-value-static">{{ comp.key }}</div>
      </div>
    </div>

    <div class="section-title">位置与尺寸</div>
    <div class="prop-grid">
      <div class="prop-group">
        <label class="prop-label">X (px)</label>
        <input type="number" class="prop-input" :value="comp.attr.x" @input="updateAttr('x', $event)" />
      </div>
      <div class="prop-group">
        <label class="prop-label">Y (px)</label>
        <input type="number" class="prop-input" :value="comp.attr.y" @input="updateAttr('y', $event)" />
      </div>
      <div class="prop-group">
        <label class="prop-label">宽度 (px)</label>
        <input type="number" class="prop-input" :value="comp.attr.w" @input="updateAttr('w', $event)" />
      </div>
      <div class="prop-group">
        <label class="prop-label">高度 (px)</label>
        <input type="number" class="prop-input" :value="comp.attr.h" @input="updateAttr('h', $event)" />
      </div>
    </div>

    <div class="section-title">状态控制</div>
    <div class="prop-form">
      <div class="prop-group row">
        <label class="prop-label">锁定</label>
        <label class="switch">
          <input type="checkbox" :checked="comp.status.lock" @change="toggleStatus('lock')" />
          <span class="switch-slider"></span>
        </label>
      </div>
      <div class="prop-group row">
        <label class="prop-label">隐藏</label>
        <label class="switch">
          <input type="checkbox" :checked="comp.status.hide" @change="toggleStatus('hide')" />
          <span class="switch-slider"></span>
        </label>
      </div>
      <div class="prop-group row">
        <label class="prop-label">预览裁剪</label>
        <label class="switch">
          <input type="checkbox" :checked="comp.preview.overFlowHidden" @change="togglePreviewOverflow()" />
          <span class="switch-slider"></span>
        </label>
      </div>
    </div>

    <div class="section-title">滤镜与变换</div>
    <div class="prop-form">
      <div class="prop-group row">
        <label class="prop-label">启用滤镜</label>
        <label class="switch">
          <input type="checkbox" :checked="comp.styles.filterShow" @change="toggleFilterShow()" />
          <span class="switch-slider"></span>
        </label>
      </div>
      <template v-if="comp.styles.filterShow">
        <div class="prop-group">
          <label class="prop-label">不透明度 ({{ comp.styles.opacity }})</label>
          <input type="range" min="0" max="1" step="0.05" class="prop-range" :value="comp.styles.opacity" @input="updateStyle('opacity', parseFloat(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">饱和度 ({{ comp.styles.saturate }})</label>
          <input type="range" min="0" max="5" step="0.1" class="prop-range" :value="comp.styles.saturate" @input="updateStyle('saturate', parseFloat(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">对比度 ({{ comp.styles.contrast }})</label>
          <input type="range" min="0" max="5" step="0.1" class="prop-range" :value="comp.styles.contrast" @input="updateStyle('contrast', parseFloat(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">色相旋转 ({{ comp.styles.hueRotate }}deg)</label>
          <input type="range" min="0" max="360" step="1" class="prop-range" :value="comp.styles.hueRotate" @input="updateStyle('hueRotate', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">亮度 ({{ comp.styles.brightness }})</label>
          <input type="range" min="0" max="5" step="0.1" class="prop-range" :value="comp.styles.brightness" @input="updateStyle('brightness', parseFloat(($event.target as HTMLInputElement).value))" />
        </div>
      </template>
      <div class="prop-group">
        <label class="prop-label">Z 轴旋转 ({{ comp.styles.rotateZ }}deg)</label>
        <input type="range" min="-180" max="180" step="1" class="prop-range" :value="comp.styles.rotateZ" @input="updateStyle('rotateZ', parseInt(($event.target as HTMLInputElement).value))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">X 轴旋转 ({{ comp.styles.rotateX }}deg)</label>
        <input type="range" min="-180" max="180" step="1" class="prop-range" :value="comp.styles.rotateX" @input="updateStyle('rotateX', parseInt(($event.target as HTMLInputElement).value))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">Y 轴旋转 ({{ comp.styles.rotateY }}deg)</label>
        <input type="range" min="-180" max="180" step="1" class="prop-range" :value="comp.styles.rotateY" @input="updateStyle('rotateY', parseInt(($event.target as HTMLInputElement).value))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">X 倾斜 ({{ comp.styles.skewX }}deg)</label>
        <input type="range" min="-90" max="90" step="1" class="prop-range" :value="comp.styles.skewX" @input="updateStyle('skewX', parseInt(($event.target as HTMLInputElement).value))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">Y 倾斜 ({{ comp.styles.skewY }}deg)</label>
        <input type="range" min="-90" max="90" step="1" class="prop-range" :value="comp.styles.skewY" @input="updateStyle('skewY', parseInt(($event.target as HTMLInputElement).value))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">混合模式</label>
        <select class="prop-select" :value="comp.styles.blendMode" @change="updateStyle('blendMode', ($event.target as HTMLSelectElement).value)">
          <option v-for="m in blendModes" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>
    </div>

    <div class="section-title">图表配置</div>
    <div class="prop-form">
      <div class="prop-group">
        <label class="prop-label">标题</label>
        <input type="text" class="prop-input" :value="comp.option.title" @input="updateOption('title', ($event.target as HTMLInputElement).value)" />
      </div>
    </div>

    <div class="section-title">图表样式</div>
    <div class="chart-style-panel">
      <details class="style-section" :open="true">
        <summary class="style-summary">布局</summary>
        <div class="prop-grid">
          <div class="prop-group">
            <label class="prop-label">上边距</label>
            <input type="number" class="prop-input" :value="comp.chartStyle?.grid.top" @input="onChartStyle('grid.top', numVal($event))" />
          </div>
          <div class="prop-group">
            <label class="prop-label">下边距</label>
            <input type="number" class="prop-input" :value="comp.chartStyle?.grid.bottom" @input="onChartStyle('grid.bottom', numVal($event))" />
          </div>
          <div class="prop-group">
            <label class="prop-label">左边距</label>
            <input type="number" class="prop-input" :value="comp.chartStyle?.grid.left" @input="onChartStyle('grid.left', numVal($event))" />
          </div>
          <div class="prop-group">
            <label class="prop-label">右边距</label>
            <input type="number" class="prop-input" :value="comp.chartStyle?.grid.right" @input="onChartStyle('grid.right', numVal($event))" />
          </div>
        </div>
      </details>

      <details class="style-section">
        <summary class="style-summary">标题样式</summary>
        <div class="prop-form">
          <div class="prop-group row">
            <label class="prop-label">显示标题</label>
            <label class="switch">
              <input type="checkbox" :checked="comp.chartStyle?.titleStyle.show" @change="onChartStyle('titleStyle.show', ($event.target as HTMLInputElement).checked)" />
              <span class="switch-slider"></span>
            </label>
          </div>
          <div class="prop-group">
            <label class="prop-label">字号</label>
            <input type="number" class="prop-input" :value="comp.chartStyle?.titleStyle.fontSize" @input="onChartStyle('titleStyle.fontSize', numVal($event))" />
          </div>
          <div class="prop-group">
            <label class="prop-label">颜色</label>
            <input type="text" class="prop-input" :value="comp.chartStyle?.titleStyle.color" @input="onChartStyle('titleStyle.color', ($event.target as HTMLInputElement).value)" />
          </div>
          <div class="prop-label" style="margin-top: 4px;">位置</div>
          <div class="prop-grid">
            <div class="prop-group">
              <label class="prop-label">水平</label>
              <select class="prop-select" :value="typeof comp.chartStyle?.titleStyle.left === 'string' && !comp.chartStyle?.titleStyle.left.endsWith('%') ? comp.chartStyle?.titleStyle.left : ''" @change="onChartStyle('titleStyle.left', ($event.target as HTMLSelectElement).value || undefined)">
                <option value="">自定义</option>
                <option value="left">左</option>
                <option value="center">居中</option>
                <option value="right">右</option>
              </select>
              <div class="prop-input-group">
                <input type="number" class="prop-input" placeholder="值" :value="posNumVal(comp.chartStyle?.titleStyle.left)" @input="onPosChange('titleStyle.left', ($event.target as HTMLInputElement).value, posUnit(comp.chartStyle?.titleStyle.left))" />
                <select class="prop-select-sm" :value="posUnit(comp.chartStyle?.titleStyle.left)" @change="onPosUnitChange('titleStyle.left', comp.chartStyle?.titleStyle.left, ($event.target as HTMLSelectElement).value)">
                  <option value="px">px</option>
                  <option value="%">%</option>
                </select>
              </div>
            </div>
            <div class="prop-group">
              <label class="prop-label">垂直</label>
              <select class="prop-select" :value="typeof comp.chartStyle?.titleStyle.top === 'string' && !comp.chartStyle?.titleStyle.top.endsWith('%') ? comp.chartStyle?.titleStyle.top : ''" @change="onChartStyle('titleStyle.top', ($event.target as HTMLSelectElement).value || undefined)">
                <option value="">自定义</option>
                <option value="top">上</option>
                <option value="middle">居中</option>
                <option value="bottom">下</option>
              </select>
              <div class="prop-input-group">
                <input type="number" class="prop-input" placeholder="值" :value="posNumVal(comp.chartStyle?.titleStyle.top)" @input="onPosChange('titleStyle.top', ($event.target as HTMLInputElement).value, posUnit(comp.chartStyle?.titleStyle.top))" />
                <select class="prop-select-sm" :value="posUnit(comp.chartStyle?.titleStyle.top)" @change="onPosUnitChange('titleStyle.top', comp.chartStyle?.titleStyle.top, ($event.target as HTMLSelectElement).value)">
                  <option value="px">px</option>
                  <option value="%">%</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </details>

      <details class="style-section">
        <summary class="style-summary">图例</summary>
        <div class="prop-form">
          <div class="prop-group row">
            <label class="prop-label">显示图例</label>
            <label class="switch">
              <input type="checkbox" :checked="comp.chartStyle?.legend.show" @change="onChartStyle('legend.show', ($event.target as HTMLInputElement).checked)" />
              <span class="switch-slider"></span>
            </label>
          </div>
          <div class="prop-group">
            <label class="prop-label">排列方向</label>
            <select class="prop-select" :value="comp.chartStyle?.legend.orient" @change="onChartStyle('legend.orient', ($event.target as HTMLSelectElement).value)">
              <option value="horizontal">水平</option>
              <option value="vertical">垂直</option>
            </select>
          </div>
          <div class="prop-label" style="margin-top: 4px;">位置</div>
          <div class="prop-grid">
            <div class="prop-group">
              <label class="prop-label">水平</label>
              <select class="prop-select" :value="typeof comp.chartStyle?.legend.left === 'string' && !comp.chartStyle?.legend.left.endsWith('%') ? comp.chartStyle?.legend.left : ''" @change="onChartStyle('legend.left', ($event.target as HTMLSelectElement).value || undefined)">
                <option value="">自定义</option>
                <option value="left">左</option>
                <option value="center">居中</option>
                <option value="right">右</option>
              </select>
              <div class="prop-input-group">
                <input type="number" class="prop-input" placeholder="值" :value="posNumVal(comp.chartStyle?.legend.left)" @input="onPosChange('legend.left', ($event.target as HTMLInputElement).value, posUnit(comp.chartStyle?.legend.left))" />
                <select class="prop-select-sm" :value="posUnit(comp.chartStyle?.legend.left)" @change="onPosUnitChange('legend.left', comp.chartStyle?.legend.left, ($event.target as HTMLSelectElement).value)">
                  <option value="px">px</option>
                  <option value="%">%</option>
                </select>
              </div>
            </div>
            <div class="prop-group">
              <label class="prop-label">垂直</label>
              <select class="prop-select" :value="typeof comp.chartStyle?.legend.top === 'string' && !comp.chartStyle?.legend.top.endsWith('%') ? comp.chartStyle?.legend.top : ''" @change="onChartStyle('legend.top', ($event.target as HTMLSelectElement).value || undefined)">
                <option value="">自定义</option>
                <option value="top">上</option>
                <option value="middle">居中</option>
                <option value="bottom">下</option>
              </select>
              <div class="prop-input-group">
                <input type="number" class="prop-input" placeholder="值" :value="posNumVal(comp.chartStyle?.legend.top)" @input="onPosChange('legend.top', ($event.target as HTMLInputElement).value, posUnit(comp.chartStyle?.legend.top))" />
                <select class="prop-select-sm" :value="posUnit(comp.chartStyle?.legend.top)" @change="onPosUnitChange('legend.top', comp.chartStyle?.legend.top, ($event.target as HTMLSelectElement).value)">
                  <option value="px">px</option>
                  <option value="%">%</option>
                </select>
              </div>
            </div>
          </div>

          <div class="prop-group">
            <label class="prop-label">字号</label>
            <input type="number" class="prop-input" :value="comp.chartStyle?.legend.fontSize" @input="onChartStyle('legend.fontSize', numVal($event))" />
          </div>
          <div class="prop-group">
            <label class="prop-label">图标形状</label>
            <select class="prop-select" :value="comp.chartStyle?.legend.icon" @change="onChartStyle('legend.icon', ($event.target as HTMLSelectElement).value)">
              <option value="circle">圆</option>
              <option value="rect">方块</option>
              <option value="roundRect">圆角方块</option>
              <option value="triangle">三角</option>
              <option value="diamond">菱形</option>
            </select>
          </div>
        </div>
      </details>

      <details class="style-section">
        <summary class="style-summary">X 轴</summary>
        <div class="prop-form">
          <div class="prop-group row">
            <label class="prop-label">显示 X 轴</label>
            <label class="switch">
              <input type="checkbox" :checked="comp.chartStyle?.xAxis.show" @change="onChartStyle('xAxis.show', ($event.target as HTMLInputElement).checked)" />
              <span class="switch-slider"></span>
            </label>
          </div>
          <div class="prop-group">
            <label class="prop-label">名称</label>
            <input type="text" class="prop-input" :value="comp.chartStyle?.xAxis.name" @input="onChartStyle('xAxis.name', ($event.target as HTMLInputElement).value)" />
          </div>
          <div class="prop-group">
            <label class="prop-label">标签字号</label>
            <input type="number" class="prop-input" :value="comp.chartStyle?.xAxis.labelFontSize" @input="onChartStyle('xAxis.labelFontSize', numVal($event))" />
          </div>
          <div class="prop-group">
            <label class="prop-label">标签旋转 ({{ comp.chartStyle?.xAxis.labelRotate }}°)</label>
            <input type="range" min="-90" max="90" step="1" class="prop-range" :value="comp.chartStyle?.xAxis.labelRotate" @input="onChartStyle('xAxis.labelRotate', parseInt(($event.target as HTMLInputElement).value))" />
          </div>
        </div>
      </details>

      <details class="style-section">
        <summary class="style-summary">Y 轴</summary>
        <div class="prop-form">
          <div class="prop-group row">
            <label class="prop-label">显示 Y 轴</label>
            <label class="switch">
              <input type="checkbox" :checked="comp.chartStyle?.yAxis.show" @change="onChartStyle('yAxis.show', ($event.target as HTMLInputElement).checked)" />
              <span class="switch-slider"></span>
            </label>
          </div>
          <div class="prop-group">
            <label class="prop-label">名称</label>
            <input type="text" class="prop-input" :value="comp.chartStyle?.yAxis.name" @input="onChartStyle('yAxis.name', ($event.target as HTMLInputElement).value)" />
          </div>
          <div class="prop-group">
            <label class="prop-label">标签字号</label>
            <input type="number" class="prop-input" :value="comp.chartStyle?.yAxis.labelFontSize" @input="onChartStyle('yAxis.labelFontSize', numVal($event))" />
          </div>
          <div class="prop-group">
            <label class="prop-label">最小值</label>
            <input type="number" class="prop-input" :value="comp.chartStyle?.yAxis.min" @input="onChartStyle('yAxis.min', maybeNull($event))" />
          </div>
          <div class="prop-group">
            <label class="prop-label">最大值</label>
            <input type="number" class="prop-input" :value="comp.chartStyle?.yAxis.max" @input="onChartStyle('yAxis.max', maybeNull($event))" />
          </div>
          <div class="prop-group row">
            <label class="prop-label">显示分割线</label>
            <label class="switch">
              <input type="checkbox" :checked="comp.chartStyle?.yAxis.splitLineShow" @change="onChartStyle('yAxis.splitLineShow', ($event.target as HTMLInputElement).checked)" />
              <span class="switch-slider"></span>
            </label>
          </div>
        </div>
      </details>

      <details class="style-section">
        <summary class="style-summary">系列</summary>
        <div class="prop-form">
          <template v-if="comp.key === 'BarCommon'">
            <div class="prop-group">
              <label class="prop-label">柱宽度</label>
              <input type="text" class="prop-input" :value="comp.chartStyle?.series.barWidth" @input="onChartStyle('series.barWidth', ($event.target as HTMLInputElement).value)" />
            </div>
            <div class="prop-group">
              <label class="prop-label">圆角</label>
              <input type="number" class="prop-input" :value="comp.chartStyle?.series.barBorderRadius" @input="onChartStyle('series.barBorderRadius', numVal($event))" />
            </div>
          </template>
          <template v-if="comp.key === 'LineCommon'">
            <div class="prop-group row">
              <label class="prop-label">平滑曲线</label>
              <label class="switch">
                <input type="checkbox" :checked="comp.chartStyle?.series.smooth" @change="onChartStyle('series.smooth', ($event.target as HTMLInputElement).checked)" />
                <span class="switch-slider"></span>
              </label>
            </div>
            <div class="prop-group">
              <label class="prop-label">数据点形状</label>
              <select class="prop-select" :value="comp.chartStyle?.series.symbol" @change="onChartStyle('series.symbol', ($event.target as HTMLSelectElement).value)">
                <option value="circle">圆</option>
                <option value="rect">方块</option>
                <option value="roundRect">圆角方块</option>
                <option value="triangle">三角</option>
                <option value="diamond">菱形</option>
                <option value="none">无</option>
              </select>
            </div>
            <div class="prop-group">
              <label class="prop-label">数据点大小</label>
              <input type="number" class="prop-input" :value="comp.chartStyle?.series.symbolSize" @input="onChartStyle('series.symbolSize', numVal($event))" />
            </div>
            <div class="prop-group">
              <label class="prop-label">线条粗细</label>
              <input type="number" class="prop-input" :value="comp.chartStyle?.series.lineWidth" @input="onChartStyle('series.lineWidth', numVal($event))" />
            </div>
            <div class="prop-group row">
              <label class="prop-label">面积填充</label>
              <label class="switch">
                <input type="checkbox" :checked="comp.chartStyle?.series.showArea" @change="onChartStyle('series.showArea', ($event.target as HTMLInputElement).checked)" />
                <span class="switch-slider"></span>
              </label>
            </div>
          </template>
          <div class="prop-group row">
            <label class="prop-label">显示标签</label>
            <label class="switch">
              <input type="checkbox" :checked="comp.chartStyle?.series.showLabel" @change="onChartStyle('series.showLabel', ($event.target as HTMLInputElement).checked)" />
              <span class="switch-slider"></span>
            </label>
          </div>
          <div class="prop-group">
            <label class="prop-label">标签字号</label>
            <input type="number" class="prop-input" :value="comp.chartStyle?.series.labelFontSize" @input="onChartStyle('series.labelFontSize', numVal($event))" />
          </div>
        </div>
      </details>

      <details class="style-section">
        <summary class="style-summary">Tooltip</summary>
        <div class="prop-form">
          <div class="prop-group row">
            <label class="prop-label">显示 Tooltip</label>
            <label class="switch">
              <input type="checkbox" :checked="comp.chartStyle?.tooltip.show" @change="onChartStyle('tooltip.show', ($event.target as HTMLInputElement).checked)" />
              <span class="switch-slider"></span>
            </label>
          </div>
          <div class="prop-group">
            <label class="prop-label">触发方式</label>
            <select class="prop-select" :value="comp.chartStyle?.tooltip.trigger" @change="onChartStyle('tooltip.trigger', ($event.target as HTMLSelectElement).value)">
              <option value="axis">坐标轴</option>
              <option value="item">数据项</option>
              <option value="none">无</option>
            </select>
          </div>
        </div>
      </details>

      <div class="prop-group" style="margin-top: 8px;">
        <label class="prop-label">背景色</label>
        <input type="text" class="prop-input" :value="comp.chartStyle?.backgroundColor" @input="onChartStyle('backgroundColor', ($event.target as HTMLInputElement).value)" />
      </div>
    </div>

    <div class="section-title">数据过滤</div>
    <div class="prop-form">
      <div class="prop-group">
        <label class="prop-label">过滤表达式</label>
        <textarea class="prop-textarea" rows="3" placeholder="data.filter(item => item.value > 100)" :value="comp.filter" @input="updateFilter(($event.target as HTMLTextAreaElement).value)"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardStore } from '../../stores/dashboard'

const store = useDashboardStore()
const comp = computed(() => store.selectedComponent!)

const blendModes = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
  'color-dodge', 'color-burn', 'hard-light', 'soft-light',
  'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity',
]

function updateAttr(key: string, event: Event) {
  if (!store.selectedComponent) return
  const value = Number((event.target as HTMLInputElement).value)
  if (isNaN(value)) return
  store.updateComponentAttr(store.selectedComponent.id, key as any, value)
}

function updateStyle(key: string, value: number | string) {
  if (!store.selectedComponent) return
  store.updateComponentStyle(store.selectedComponent.id, key, value)
}

function updateOption(key: string, value: any) {
  if (!store.selectedComponent) return
  store.updateComponentOption(store.selectedComponent.id, key, value)
}

function updateFilter(value: string) {
  if (!store.selectedComponent) return
  store.updateComponentFilter(store.selectedComponent.id, value)
}

function toggleStatus(key: 'lock' | 'hide') {
  if (!store.selectedComponent) return
  store.toggleComponentStatus(store.selectedComponent.id, key)
}

function togglePreviewOverflow() {
  if (!store.selectedComponent) return
  store.toggleComponentPreviewOverflow(store.selectedComponent.id)
}

function toggleFilterShow() {
  if (!store.selectedComponent) return
  store.toggleComponentFilterShow(store.selectedComponent.id)
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

function onChartStyle(path: string, value: any) {
  if (!store.selectedComponent) return
  store.updateChartStyle(store.selectedComponent.id, path, value)
}
</script>

<style scoped>
.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #89b4fa;
  margin: 16px 0 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #313244;
  user-select: none;
}
.section-title:first-child { margin-top: 0; }
.prop-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.prop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.prop-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.prop-group.row {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.prop-label {
  font-size: 11px;
  color: #a6adc8;
  font-weight: 500;
}
.prop-value-static {
  font-size: 12px;
  color: #cdd6f4;
  padding: 6px 0;
}
.prop-input {
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 12px;
  color: #cdd6f4;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
}
.prop-input:focus { border-color: #89b4fa; }
.prop-select {
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 12px;
  color: #cdd6f4;
  outline: none;
  cursor: pointer;
}
.prop-range {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: #45475a;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}
.prop-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  background: #89b4fa;
  border-radius: 50%;
  cursor: pointer;
}
.prop-textarea {
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 12px;
  color: #cdd6f4;
  outline: none;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  resize: vertical;
  width: 100%;
}
.prop-textarea:focus { border-color: #89b4fa; }
.chart-style-panel {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.style-section {
  border: 1px solid #313244;
  border-radius: 6px;
  overflow: hidden;
}
.style-summary {
  font-size: 11px;
  font-weight: 600;
  color: #a6adc8;
  padding: 6px 8px;
  background: #181825;
  cursor: pointer;
  user-select: none;
  transition: color 0.15s;
  list-style: none;
}
.style-summary::-webkit-details-marker { display: none; }
.style-summary:hover { color: #cdd6f4; }
.style-section[open] .style-summary {
  border-bottom: 1px solid #313244;
  color: #89b4fa;
}
.style-section .prop-form,
.style-section .prop-grid {
  padding: 8px;
}
.switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  flex-shrink: 0;
}
.switch input { opacity: 0; width: 0; height: 0; }
.switch-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #45475a;
  border-radius: 20px;
  transition: 0.2s;
}
.switch-slider::before {
  content: '';
  position: absolute;
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background: #cdd6f4;
  border-radius: 50%;
  transition: 0.2s;
}
.switch input:checked + .switch-slider { background: #89b4fa; }
.switch input:checked + .switch-slider::before { transform: translateX(16px); }
.add-btn {
  padding: 4px 8px;
  background: #313244;
  border: 1px dashed #45475a;
  border-radius: 4px;
  color: #6c7086;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}
.add-btn:hover {
  background: #45475a;
  color: #cdd6f4;
  border-color: #89b4fa;
}
.prop-input-group {
  display: flex;
  gap: 4px;
}
.prop-input-group .prop-input {
  flex: 1;
  min-width: 0;
}
.prop-select-sm {
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  padding: 4px 4px;
  font-size: 11px;
  color: #cdd6f4;
  outline: none;
  cursor: pointer;
  width: 44px;
  flex-shrink: 0;
}
</style>

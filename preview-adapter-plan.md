# 大屏预览适配方案

## 一、业务背景

当前预览器的 `PreviewRenderer` 组件渲染画布时，直接以设计稿的绝对像素值进行渲染（如 1920×1080px）。当用户显示器分辨率小于设计稿，或在大屏终端（4K/8K）上显示时，会出现以下问题：

1. **小分辨率设备**：页面超出视口，出现横向/纵向滚动条，无法一屏展示。
2. **大分辨率设备**：画布仅占屏幕一角，四周留下大量空白，视觉效果差。
3. **比例不一致**：不同分辨率下组件拉伸变形，破坏设计美感。

## 二、设计目标

1. **自适应缩放**：预览画面始终完整、清晰地显示在可视区域内。
2. **保持比例**：严格按设计稿宽高比等比例缩放，绝不拉伸变形。
3. **矢量清晰**：利用 CSS `transform: scale()`，文字和矢量图表自动保持清晰。
4. **居中优雅**：空白区域自动用项目背景色填充，无突兀黑边。
5. **窗口响应**：支持浏览器缩放/全屏切换时实时更新。

## 三、技术选型

### 3.1 核心方案：CSS Transform Scale（业界主流）

大屏可视化领域，业界主流方案是 **用顶层容器 CSS Transform Scale 模拟缩放**：`transform: scale(x)` + `transform-origin: center center`，而不是直接修改所有组件的 px 数值，而是通过整体缩放一个父容器来实现适配。

**选择理由**：

| 方案 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| **Scale (选中)** | `transform: scale()` 对整个容器缩放 | 代码侵入小；支持矢量图形和字体清晰度保持；兼容所有组件（包括 ECharts Canvas）；业界主流 | 对 `position: fixed` 的内嵌页不友好（本项目预览器无此问题） |
| **Rem / %** | 所有尺寸改用 rem/百分比 | 精确控制每个元素 | 侵入性极大，需重写所有组件样式 |
| **window.devicePixelRatio** | 用 Canvas DPI 缩放 | 对 Canvas 有效 | 对 DOM 元素无效，不适用于混合渲染场景 |

### 3.2 缩放策略

采用 **Full-Contain** 策略：

```
scale = min(viewportW / designW, viewportH / designH)
```

- 始终保持设计稿完整可见。
- 空白区域用项目背景色填充，绝不拉伸裁剪。

## 四、实现方案

### 4.1 数据结构调研

从 `src/types/canvas.ts` 中确认设计稿尺寸来源：

```ts
export interface EditCanvasConfigType {
  projectName: string
  width: number      // -> 设计稿宽度，默认 1920
  height: number     // -> 设计稿高度，默认 1080
  background: string
  backgroundImage: string | null
  // ...
}
```

从 `src/components/PreviewRenderer.vue` 中确认目标容器：

```vue
<div class="preview-stage" :style="canvasStyle">
  <!-- 所有 preview-component 的根节点 -->
</div>
```

### 4.2 具体改动步骤

#### 步骤 1：新增 `usePreviewScale` Composable

在 `src/composables/usePreviewScale.ts` 中创建响应式缩放逻辑：

```ts
import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function usePreviewScale(
  designWidth: Ref<number>,
  designHeight: Ref<number>,
  containerRef: Ref<HTMLElement | undefined>
) {
  const scale = ref(1)

  function updateScale() {
    if (!containerRef.value) return
    const { clientWidth, clientHeight } = containerRef.value
    scale.value = Math.min(
      clientWidth / designWidth.value,
      clientHeight / designHeight.value
    )
  }

  onMounted(() => {
    updateScale()
    window.addEventListener('resize', updateScale)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateScale)
  })

  return { scale }
}
```

**注意**：使用 `window.addEventListener('resize')` 而非 `ResizeObserver`，因为监听整个 window 的尺寸变化更轻量，且能覆盖所有视口变化场景（浏览器缩放、全屏切换、显示器切换）。

#### 步骤 2：改造 `PreviewRenderer.vue`

1. 新增 `wrapRef` 和 `scale` 变量。
2. 引入中间层 `.preview-wrap`，负责背景填充和居中。
3. 舞台 `.preview-stage` 固定设计稿尺寸，应用 `transform: scale()`。

```vue
<template>
  <div class="preview-overlay">
    <div class="preview-header">
      <h2 class="preview-title">{{ schema.editCanvasConfig.projectName }} - 预览</h2>
      <button class="exit-btn" @click="$emit('close')">✕ 退出预览</button>
    </div>
    <div class="preview-wrap" ref="wrapRef">
      <div class="preview-stage" :style="stageStyle">
        <!-- ... components unchanged ... -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePreviewScale } from '../composables/usePreviewScale'

const wrapRef = ref<HTMLDivElement>()
const { scale } = usePreviewScale(
  computed(() => props.schema.editCanvasConfig.width),
  computed(() => props.schema.editCanvasConfig.height),
  wrapRef
)

const stageStyle = computed(() => ({
  width: props.schema.editCanvasConfig.width + 'px',
  height: props.schema.editCanvasConfig.height + 'px',
  backgroundColor: props.schema.editCanvasConfig.background,
  backgroundImage: props.schema.editCanvasConfig.backgroundImage
    ? `url(${props.schema.editCanvasConfig.backgroundImage})`
    : undefined,
  backgroundSize: props.schema.editCanvasConfig.backgroundImage ? 'cover' : undefined,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  filter: /* ... unchanged ... */,
  mixBlendMode: /* ... unchanged ... */,
  transform: `scale(${scale.value})`,
  transformOrigin: 'center center',
  flexShrink: 0,
}))
</script>
```

#### 步骤 3：调整 CSS

```css
.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #11111b;
  display: flex;
  flex-direction: column;
}

.preview-wrap {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-stage {
  position: relative;
}
```

移出原 `canvasStyle` 中的 `width`/`height` 属性，改为在 `.preview-stage` 上通过 `style` 绑定设计稿尺寸；原 `canvasStyle` 改为 `stageStyle`，移除 `margin: 0 auto` 和 `flex: 1`。

### 4.3 关键兼容性处理

1. **ECharts 清晰度**：
   - ECharts 使用 Canvas 渲染，`transform: scale()` 缩放后，底层 Canvas 像素数不变，清晰度由 `window.devicePixelRatio` 保证。本方案**无需调整 ECharts 清晰度**。

2. **组件内部字体/图片**：
   - 字体：矢量渲染，缩放后依然清晰。
   - 图片：建议使用高分辨率素材（2x 或 4x），由 CSS 缩放保证清晰度。

3. **嵌套组件 `GroupPreview`**：
   - `GroupPreview` 内部继续使用 `px` 单位，不需要改动。`transform: scale()` 作用于父容器，其内部所有子元素自动继承缩放。

4. **预览器内的组件交互（如点击）坐标偏移**：
   - 组件处于 `transform: scale()` 容器内，事件冒泡/捕获正常，不影响交互逻辑。

### 4.4 窗口响应性

`usePreviewScale` 已绑定 `window.addEventListener('resize')`，浏览器放大缩小、F11 全屏等场景自动重算比例，无需刷新。

## 五、运行效果预览

| 场景 | 表现 |
|------|------|
| **设计稿 1920×1080，视口 1920×1080** | `scale = 1`，1:1 完美呈现 |
| **视口 1366×768** | `scale ≈ 0.71`，画布整体缩小，完整显示，无滚动条 |
| **视口 3840×2160 (4K)** | `scale = 2`，画布放大 2 倍，内容清晰，完美铺满 |
| **视口 2560×1440 (16:9)** | `scale ≈ 1.33`，等比放大并居中 |

## 六、风险评估与应对

| 风险点 | 等级 | 应对措施 |
|--------|------|----------|
| 浏览器整体缩放加此缩放双重影响 | 低 | `scale` 基于 `clientWidth`，不受系统缩放影响 |
| 旋转屏幕（横竖屏切换） | 低 | 已绑定 `resize` 事件，自动重算 |
| 预览器内的组件交互（点击坐标偏移） | 低 | 组件处于 `scale` 容器内，事件冒泡/捕获正常 |

## 七、实施记录

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `src/composables/usePreviewScale.ts` | 新增 | 核心缩放逻辑 Composable |
| `src/components/PreviewRenderer.vue` | 修改 | 应用缩放逻辑，调整模板和样式 |
| `src/composables/useEventListener.ts` | 无需改动 | 已有工具封装，直接复用 |

## 八、完整代码实现

### 8.1 新增：`src/composables/usePreviewScale.ts`

```ts
import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function usePreviewScale(
  designWidth: Ref<number>,
  designHeight: Ref<number>,
  containerRef: Ref<HTMLElement | undefined>
) {
  const scale = ref(1)

  function updateScale() {
    if (!containerRef.value) return
    const { clientWidth, clientHeight } = containerRef.value
    scale.value = Math.min(
      clientWidth / designWidth.value,
      clientHeight / designHeight.value
    )
  }

  onMounted(() => {
    updateScale()
    window.addEventListener('resize', updateScale)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateScale)
  })

  return { scale }
}
```

### 8.2 改造：`src/components/PreviewRenderer.vue`

#### 模板改动

```vue
<template>
  <div class="preview-overlay">
    <div class="preview-header">
      <h2 class="preview-title">{{ schema.editCanvasConfig.projectName }} - 预览</h2>
      <button class="exit-btn" @click="$emit('close')">✕ 退出预览</button>
    </div>
    <div class="preview-wrap" ref="wrapRef">
      <div
        class="preview-stage"
        :style="stageStyle"
      >
        <div
          v-for="comp in rootComponents"
          :key="comp.id"
          class="preview-component"
          :class="{ hidden: comp.status.hide }"
          :style="componentStyle(comp)"
        >
          <!-- ... 所有组件渲染保持不变 ... -->
        </div>
      </div>
    </div>
  </div>
</template>
```

#### Script 改动

```vue
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { CSSProperties } from 'vue'
import { useEventListener } from '../composables/useEventListener'
import { useDashboardStore } from '../stores/dashboard'
import { usePreviewScale } from '../composables/usePreviewScale'
// ... 其他 imports ...

const props = defineProps<{
  schema: ChartEditStorage
}>()

const emit = defineEmits<{
  close: []
}>()

const store = useDashboardStore()

onMounted(() => store.setPreviewMode(true))
onUnmounted(() => store.setPreviewMode(false))

useEventListener(window, 'keydown', (event: Event) => {
  if ((event as KeyboardEvent).key === 'Escape') emit('close')
})

// 新增：预览缩放逻辑
const wrapRef = ref<HTMLDivElement>()
const { scale } = usePreviewScale(
  computed(() => props.schema.editCanvasConfig.width),
  computed(() => props.schema.editCanvasConfig.height),
  wrapRef
)

// 原 canvasStyle 改为 stageStyle，应用 scale
const stageStyle = computed((): CSSProperties => ({
  width: props.schema.editCanvasConfig.width + 'px',
  height: props.schema.editCanvasConfig.height + 'px',
  backgroundColor: props.schema.editCanvasConfig.background,
  backgroundImage: props.schema.editCanvasConfig.backgroundImage
    ? `url(${props.schema.editCanvasConfig.backgroundImage})`
    : undefined,
  backgroundSize: props.schema.editCanvasConfig.backgroundImage ? 'cover' : undefined,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  filter: props.schema.editCanvasConfig.filterShow
    ? `opacity(${props.schema.editCanvasConfig.opacity}) saturate(${props.schema.editCanvasConfig.saturate}) contrast(${props.schema.editCanvasConfig.contrast}) hue-rotate(${props.schema.editCanvasConfig.hueRotate}deg) brightness(${props.schema.editCanvasConfig.brightness})`
    : undefined,
  mixBlendMode: props.schema.editCanvasConfig.blendMode !== 'normal'
    ? (props.schema.editCanvasConfig.blendMode as CSSProperties['mixBlendMode'])
    : undefined,
  transform: `scale(${scale.value})`,
  transformOrigin: 'center center',
  flexShrink: 0,
}))

// componentStyle 保持不变 ...
</script>
```

#### CSS 改动

```css
.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #11111b;
  display: flex;
  flex-direction: column;
}

.preview-wrap {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-stage {
  position: relative;
}

.preview-header { /* ... unchanged ... */ }
.preview-component { /* ... unchanged ... */ }
.preview-component.hidden { display: none; }
.preview-empty { /* ... unchanged ... */ }
```

## 九、总结

此方案基于 **CSS Transform Scale**，是 DataV、SugarBI、阿里 DataWorks 等主流可视化平台的标准适配做法。

**优势总结**：
- **零侵入组件代码**：`GroupPreview`、`BarChart` 等几十个组件无需改动。
- **等比缩放**：严格保持设计稿比例，视觉无变形。
- **矢量清晰**：ECharts Canvas 和文字清晰锐利。
- **实现极简**：仅新增 1 个 Composable，修改 1 个 Vue 组件。

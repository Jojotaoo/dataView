<template>
  <div class="datetime-wrap" :style="wrapStyle">
    <span v-if="showYear" class="dt-part">{{ year }}年</span>
    <span v-if="showDate" class="dt-part">{{ month }}月{{ day }}日</span>
    <span v-if="showWeekday" class="dt-part">{{ weekday }}</span>
    <span v-if="showTime" class="dt-part">{{ hour }}:{{ minute }}:{{ second }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  componentId?: string
  option?: Record<string, any>
  width?: number
  height?: number
  datetimeProps?: Record<string, any>
}>(), {
  componentId: '',
  option: () => ({}),
  width: 400,
  height: 60,
  datetimeProps: () => ({}),
})

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const dp = computed(() => props.datetimeProps ?? {})

const showYear = computed(() => dp.value.showYear !== false)
const showDate = computed(() => dp.value.showDate !== false)
const showWeekday = computed(() => dp.value.showWeekday !== false)
const showTime = computed(() => dp.value.showTime !== false)
const autoUpdate = computed(() => dp.value.autoUpdate !== false)
const refreshInterval = computed(() => dp.value.refreshInterval ?? 1000)

const year = computed(() => now.value.getFullYear())
const month = computed(() => String(now.value.getMonth() + 1).padStart(2, '0'))
const day = computed(() => String(now.value.getDate()).padStart(2, '0'))
const hour = computed(() => String(now.value.getHours()).padStart(2, '0'))
const minute = computed(() => String(now.value.getMinutes()).padStart(2, '0'))
const second = computed(() => String(now.value.getSeconds()).padStart(2, '0'))

const weekdayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const weekday = computed(() => weekdayNames[now.value.getDay()])

const wrapStyle = computed(() => ({
  fontSize: (dp.value.fontSize ?? 24) + 'px',
  color: dp.value.textColor ?? '#cdd6f4',
  justifyContent: dp.value.textAlign === 'left' ? 'flex-start' : dp.value.textAlign === 'right' ? 'flex-end' : 'center',
}))

function startTimer() {
  stopTimer()
  if (autoUpdate.value) {
    timer = setInterval(() => {
      now.value = new Date()
    }, refreshInterval.value)
  }
}

function stopTimer() {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

watch([autoUpdate, refreshInterval], () => {
  startTimer()
})

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.datetime-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  font-weight: 500;
}

.dt-part {
  line-height: 1;
}
</style>

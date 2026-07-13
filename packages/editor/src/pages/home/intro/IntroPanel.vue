<template>
  <section class="hero-section">
    <div class="hero-bg-numbers">
      <span class="num">+2.34%</span>
      <span class="num">$ 1,284.50</span>
      <span class="num">▲ 0.87%</span>
      <span class="num">¥ 7.24</span>
      <span class="num">+1.2M</span>
      <span class="num">98.6%</span>
      <span class="num">3.2x</span>
      <span class="num">$ 42.6B</span>
      <span class="num">▼ -0.32%</span>
      <span class="num">2.4ms</span>
      <span class="num">▲ 1.56%</span>
      <span class="num">$ 3,210</span>
    </div>

    <div class="hero-content">
      <div class="hero-tag">
        <el-icon :size="8" color="#00E676"><CircleCheck /></el-icon>
        下一代数据可视化平台
      </div>

      <h1 class="hero-title">
        智造<br />
        <span class="highlight">金融级</span> 大屏<br />
        <span class="highlight-gold">实时 · 精密 · 决策</span>
      </h1>

      <p class="hero-sub">
        为金融机构打造的下一代大屏可视化平台。<br />
        毫秒级数据响应，军工级渲染精度，让每一帧数据都为决策而生。
      </p>

      <div class="hero-actions">
        <el-button type="primary" size="large" @click="$emit('createProject')">
          <el-icon><Position /></el-icon>
          开始创建
        </el-button>
        <el-button size="large" plain>
          <el-icon><VideoPlay /></el-icon>
          观看演示
        </el-button>
        <span class="hero-check">
          <el-icon color="#00E676"><CircleCheck /></el-icon>
          已服务 50+ 金融机构
        </span>
      </div>

      <div class="hero-metrics">
        <div class="hero-metric">
          <span class="number">128+</span>
          <span class="label">大屏项目</span>
        </div>
        <div class="hero-metric">
          <span class="number">12</span>
          <span class="label">数据源类型</span>
        </div>
        <div class="hero-metric">
          <span class="number">99.9%</span>
          <span class="label">系统可用性</span>
        </div>
        <div class="hero-metric">
          <span class="number">&lt;15ms</span>
          <span class="label">平均延迟</span>
        </div>
      </div>
    </div>

    <div class="hero-visual">
      <div class="viz-grid">
        <div class="viz-ring-wrap">
          <div class="ring-mini">
            <svg viewBox="0 0 40 40">
              <circle class="ring-track" cx="20" cy="20" r="18" />
              <circle class="ring-progress blue" cx="20" cy="20" r="18" stroke-dasharray="113" stroke-dashoffset="28" />
            </svg>
            <span class="rlabel">实时</span>
          </div>
          <div class="ring-mini">
            <svg viewBox="0 0 40 40">
              <circle class="ring-track" cx="20" cy="20" r="18" />
              <circle class="ring-progress cyan" cx="20" cy="20" r="18" stroke-dasharray="113" stroke-dashoffset="45" />
            </svg>
            <span class="rlabel">延迟</span>
          </div>
          <div class="ring-mini">
            <svg viewBox="0 0 40 40">
              <circle class="ring-track" cx="20" cy="20" r="18" />
              <circle class="ring-progress gold" cx="20" cy="20" r="18" stroke-dasharray="113" stroke-dashoffset="68" />
            </svg>
            <span class="rlabel">精度</span>
          </div>
        </div>

        <div class="viz-item">
          <div class="viz-label"><span>系统负载</span><span class="val">43%</span></div>
          <div class="bar"><div class="fill" style="width: 43%"></div></div>
        </div>
        <div class="viz-item">
          <div class="viz-label"><span>数据吞吐</span><span class="val">1.2M/s</span></div>
          <div class="bar"><div class="fill gold" style="width: 78%"></div></div>
        </div>
        <div class="viz-item">
          <div class="viz-label"><span>连接数</span><span class="val">236</span></div>
          <div class="bar"><div class="fill green" style="width: 62%"></div></div>
        </div>
        <div class="viz-item">
          <div class="viz-label"><span>告警</span><span class="val" style="color: #d4af37">3</span></div>
          <div class="bar"><div class="fill red" style="width: 12%"></div></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Position, VideoPlay, CircleCheck } from '@element-plus/icons-vue'

defineEmits<{
  createProject: []
}>()
</script>

<style scoped>
.hero-section {
  position: relative;
  display: flex;
  align-items: center;
  gap: clamp(24px, 4vw, 80px);
  min-height: 100%;
  overflow: hidden;
  max-width: 1600px;
  margin: 0 auto;
  padding: clamp(30px, 4vw, 80px) clamp(20px, 3vw, 60px);
}

.hero-bg-numbers {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.hero-bg-numbers .num {
  position: absolute;
  font-size: clamp(28px, 3vw, 52px);
  font-weight: 800;
  color: rgba(43, 111, 242, 0.04);
  white-space: nowrap;
  font-family: 'Inter', monospace;
}

.hero-bg-numbers .num:nth-child(1) {
  top: 8%;
  left: 5%;
}
.hero-bg-numbers .num:nth-child(2) {
  top: 15%;
  right: 12%;
  font-size: clamp(34px, 3.5vw, 60px);
}
.hero-bg-numbers .num:nth-child(3) {
  top: 35%;
  left: 20%;
}
.hero-bg-numbers .num:nth-child(4) {
  top: 55%;
  right: 25%;
  font-size: clamp(26px, 2.8vw, 48px);
}
.hero-bg-numbers .num:nth-child(5) {
  top: 70%;
  left: 8%;
}
.hero-bg-numbers .num:nth-child(6) {
  top: 80%;
  right: 8%;
  font-size: clamp(30px, 3.2vw, 56px);
}
.hero-bg-numbers .num:nth-child(7) {
  top: 25%;
  left: 45%;
}
.hero-bg-numbers .num:nth-child(8) {
  top: 60%;
  left: 55%;
  font-size: clamp(32px, 3.4vw, 58px);
}
.hero-bg-numbers .num:nth-child(9) {
  top: 45%;
  left: 70%;
}
.hero-bg-numbers .num:nth-child(10) {
  top: 85%;
  left: 35%;
  font-size: clamp(24px, 2.6vw, 44px);
}
.hero-bg-numbers .num:nth-child(11) {
  top: 10%;
  left: 60%;
}
.hero-bg-numbers .num:nth-child(12) {
  top: 50%;
  left: 30%;
  font-size: clamp(26px, 2.8vw, 48px);
}

.hero-content {
  position: relative;
  z-index: 1;
  flex: 1;
  max-width: clamp(350px, 38vw, 650px);
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: clamp(12px, 0.85vw, 16px);
  color: #8a9bb5;
  border: 1px solid #1a2844;
  border-radius: 20px;
  padding: 6px 16px;
  margin-bottom: clamp(16px, 2vw, 32px);
}

.hero-title {
  font-size: clamp(24px, 3.5vw, 60px);
  font-weight: 800;
  line-height: 1.15;
  color: #e8edf2;
  margin-bottom: clamp(12px, 1.5vw, 24px);
  letter-spacing: -0.5px;
}

.hero-title .highlight {
  color: #2b6ff2;
}

.hero-title .highlight-gold {
  color: #d4af37;
  font-size: clamp(16px, 1.6vw, 32px);
  font-weight: 600;
}

.hero-sub {
  font-size: clamp(13px, 1vw, 18px);
  line-height: 1.7;
  color: #8a9bb5;
  margin-bottom: clamp(20px, 3vw, 48px);
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1vw, 16px);
  margin-bottom: clamp(20px, 3vw, 60px);
  flex-wrap: wrap;
}

.hero-check {
  font-size: clamp(12px, 0.85vw, 15px);
  color: #4a6080;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 4px;
}

.hero-metrics {
  display: flex;
  gap: clamp(16px, 2.5vw, 48px);
}

.hero-metric {
  display: flex;
  flex-direction: column;
}

.hero-metric .number {
  font-size: clamp(20px, 1.8vw, 40px);
  font-weight: 700;
  color: #e8edf2;
  font-family: 'Inter', monospace;
}

.hero-metric .label {
  font-size: clamp(11px, 0.85vw, 15px);
  color: #4a6080;
  margin-top: 4px;
}

.hero-visual {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.viz-grid {
  width: clamp(220px, 18vw, 380px);
  background: rgba(15, 23, 40, 0.8);
  border: 1px solid #1a2844;
  border-radius: 8px;
  padding: clamp(14px, 1.2vw, 24px);
  backdrop-filter: blur(10px);
}

.viz-ring-wrap {
  display: flex;
  gap: clamp(12px, 1vw, 20px);
  margin-bottom: clamp(12px, 1.2vw, 24px);
  justify-content: center;
}

.ring-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.ring-mini svg {
  width: clamp(32px, 2.5vw, 48px);
  height: clamp(32px, 2.5vw, 48px);
}

.ring-track {
  fill: none;
  stroke: #1a2844;
  stroke-width: 3;
}

.ring-progress {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: center;
}

.ring-progress.blue {
  stroke: #2b6ff2;
}
.ring-progress.cyan {
  stroke: #00e5ff;
}
.ring-progress.gold {
  stroke: #d4af37;
}

.rlabel {
  font-size: clamp(10px, 0.7vw, 13px);
  color: #4a6080;
}

.viz-item {
  margin-bottom: clamp(8px, 0.8vw, 16px);
}

.viz-label {
  display: flex;
  justify-content: space-between;
  font-size: clamp(11px, 0.8vw, 14px);
  color: #8a9bb5;
  margin-bottom: 6px;
}

.viz-label .val {
  font-weight: 600;
  font-family: 'Inter', monospace;
}

.bar {
  height: clamp(3px, 0.3vw, 6px);
  background: #1a2844;
  border-radius: 2px;
  overflow: hidden;
}

.fill {
  height: 100%;
  background: #2b6ff2;
  border-radius: 2px;
  transition: width 1s ease;
}

.fill.gold {
  background: #d4af37;
}
.fill.green {
  background: #00e676;
}
.fill.red {
  background: #ff2d4a;
}

@media (max-width: 1200px) {
  .hero-section {
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(16px, 2vw, 40px);
    padding: clamp(20px, 3vw, 40px) clamp(16px, 3vw, 32px);
  }

  .hero-content {
    max-width: 100%;
  }

  .hero-visual {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .viz-grid {
    width: 100%;
    max-width: clamp(280px, 40vw, 420px);
  }

  .hero-bg-numbers .num {
    display: none;
  }

  .hero-bg-numbers .num:nth-child(1),
  .hero-bg-numbers .num:nth-child(2),
  .hero-bg-numbers .num:nth-child(3),
  .hero-bg-numbers .num:nth-child(4) {
    display: block;
  }

  .hero-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-check {
    margin-left: 0;
    margin-top: 8px;
  }

  .hero-bg-numbers .num:nth-child(n + 5) {
    display: none !important;
  }
}
</style>

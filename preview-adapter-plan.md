# 地图选中区域呼吸灯效果实现方案

## 一、需求概述

在地图组件中，用户点击某个市区后，该区域被选中并产生呼吸灯动画效果（光晕周期性闪烁），提升交互体验和视觉反馈。

---

## 二、技术选型

| 项目 | 方案 |
|------|------|
| 图表库 | ECharts 5.x |
| 地图数据 | 中国地图 GeoJSON（`china.js`） |
| 核心实现 | `graphic` 组件 + `keyframeAnimation` 关键帧动画 |
| 坐标转换 | `chart.convertToPixel()` 经纬度转像素坐标 |

**方案优势：**
- ✅ 纯配置实现，无需 `setInterval` 定时器
- ✅ GPU 加速渲染，性能优异
- ✅ 动画流畅自然，支持自定义曲线
- ✅ 可叠加多层图形，创造丰富视觉效果

---

## 三、实现思路

```
用户点击地图区域
       ↓
获取区域名称 & 中心经纬度
       ↓
经纬度 → 像素坐标转换
       ↓
在坐标位置创建 graphic 图形（圆形）
       ↓
配置 keyframeAnimation 关键帧动画
       ↓
图形半径 & 阴影周期变化 → 呼吸灯效果
       ↓
点击其他区域 → 清除旧图形 + 创建新图形
```

---

## 四、核心实现代码

### 4.1 基础地图配置

```javascript
// 省份中心坐标映射表
const centerMap = {
    '广东': [113.23, 23.12],
    '江苏': [118.78, 32.06],
    '浙江': [120.15, 30.28],
    '山东': [117.00, 36.65],
    '河南': [113.65, 34.76],
    '四川': [104.06, 30.67],
    '湖北': [114.30, 30.60],
    '湖南': [112.98, 28.11],
    '福建': [119.30, 26.08],
    '安徽': [117.27, 31.86],
    // ... 更多省份
};

// ECharts 配置
const option = {
    tooltip: { trigger: 'item' },
    visualMap: {
        min: 0,
        max: 100,
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],
        calculable: true,
        inRange: {
            color: ['#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43']
        }
    },
    series: [{
        type: 'map',
        map: 'china',
        roam: true,
        data: data,
        label: { show: true, color: '#333', fontSize: 10 },
        itemStyle: {
            areaColor: '#e0e0e0',
            borderColor: '#fff',
            borderWidth: 1
        },
        emphasis: {
            label: { show: true, color: '#fff' },
            itemStyle: {
                areaColor: '#f46d43',
                borderColor: '#fff',
                borderWidth: 2
            }
        }
    }],
    graphic: []  // 动态填充呼吸灯图形
};
```

### 4.2 创建呼吸灯图形

```javascript
function createBreathGraphic(centerGeo, name, chart) {
    // 经纬度转像素坐标
    const pixel = chart.convertToPixel('series', centerGeo);
    if (!pixel || isNaN(pixel[0]) || isNaN(pixel[1])) {
        console.warn('坐标转换失败:', name);
        return null;
    }

    return {
        id: 'breathLight_' + name,
        type: 'circle',
        shape: {
            cx: pixel[0],
            cy: pixel[1],
            r: 25
        },
        style: {
            fill: 'rgba(244, 109, 67, 0.25)',
            stroke: 'rgba(244, 109, 67, 0.8)',
            lineWidth: 3,
            shadowBlur: 40,
            shadowColor: 'rgba(244, 109, 67, 0.9)'
        },
        keyframeAnimation: {
            duration: 1800,
            loop: true,
            keyframes: [
                {
                    percent: 0,
                    shape: { r: 18 },
                    style: {
                        shadowBlur: 15,
                        opacity: 0.5,
                        fill: 'rgba(244, 109, 67, 0.15)'
                    }
                },
                {
                    percent: 0.5,
                    shape: { r: 45 },
                    style: {
                        shadowBlur: 70,
                        opacity: 1.0,
                        fill: 'rgba(244, 109, 67, 0.35)'
                    }
                },
                {
                    percent: 1,
                    shape: { r: 18 },
                    style: {
                        shadowBlur: 15,
                        opacity: 0.5,
                        fill: 'rgba(244, 109, 67, 0.15)'
                    }
                }
            ]
        },
        z: 100,
        zlevel: 1
    };
}
```

### 4.3 交互事件绑定

```javascript
let currentName = null;

myChart.on('click', function (params) {
    // 点击空白区域 → 清除呼吸灯
    if (!params || params.componentType !== 'series') {
        myChart.setOption({ graphic: [] });
        currentName = null;
        return;
    }

    const name = params.name;
    const center = centerMap[name];
    if (!center) {
        console.warn('未找到省份中心:', name);
        return;
    }

    // 点击同一区域 → 取消选中
    if (currentName === name) {
        myChart.setOption({ graphic: [] });
        currentName = null;
        return;
    }

    // 移除旧图形 → 创建新图形
    myChart.setOption({ graphic: [] });
    const graphic = createBreathGraphic(center, name, myChart);
    if (graphic) {
        myChart.setOption({ graphic: [graphic] });
        currentName = name;
    }
});
```

### 4.4 窗口自适应处理

```javascript
// 监听窗口变化，重新定位呼吸灯
let resizeTimer = null;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        myChart.resize();
        // 如果有选中的区域，重新创建呼吸灯
        if (currentName && centerMap[currentName]) {
            const center = centerMap[currentName];
            myChart.setOption({ graphic: [] });
            const graphic = createBreathGraphic(center, currentName, myChart);
            if (graphic) {
                myChart.setOption({ graphic: [graphic] });
            }
        }
    }, 300);
});
```

---

## 五、完整 HTML 示例

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>地图呼吸灯 - graphic 实现</title>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5/map/js/china.js"></script>
    <style>
        * { margin: 0; padding: 0; }
        body { background: #1a1a2e; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        #map { width: 95vw; height: 90vh; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        // ===== 完整代码（包含上述所有模块） =====
        // 此处粘贴 4.1 ~ 4.4 全部代码
        // ...
    </script>
</body>
</html>
```

---

## 六、样式自定义指南

### 6.1 呼吸颜色配置

| 主题 | fill | stroke | shadowColor |
|------|------|--------|-------------|
| 🔥 火焰橙 | `rgba(244, 109, 67, 0.25)` | `rgba(244, 109, 67, 0.8)` | `rgba(244, 109, 67, 0.9)` |
| 💙 科技蓝 | `rgba(52, 152, 219, 0.25)` | `rgba(52, 152, 219, 0.8)` | `rgba(52, 152, 219, 0.9)` |
| 💜 梦幻紫 | `rgba(155, 89, 182, 0.25)` | `rgba(155, 89, 182, 0.8)` | `rgba(155, 89, 182, 0.9)` |
| 🟢 生命绿 | `rgba(46, 204, 113, 0.25)` | `rgba(46, 204, 113, 0.8)` | `rgba(46, 204, 113, 0.9)` |
| 🌟 金色 | `rgba(255, 215, 0, 0.25)` | `rgba(255, 215, 0, 0.8)` | `rgba(255, 215, 0, 0.9)` |

### 6.2 呼吸节奏调节

```javascript
keyframeAnimation: {
    duration: 1200,      // 数值越小，呼吸越快
    loop: true,
    keyframes: [
        { percent: 0, shape: { r: 15 }, style: { shadowBlur: 10, opacity: 0.4 } },
        { percent: 0.5, shape: { r: 50 }, style: { shadowBlur: 80, opacity: 1.0 } },
        { percent: 1, shape: { r: 15 }, style: { shadowBlur: 10, opacity: 0.4 } }
    ]
}
```

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `duration` | 单次呼吸周期（毫秒） | 1500 ~ 2000 |
| `r` 范围 | 光晕扩散大小 | 15 ~ 50 |
| `shadowBlur` 范围 | 发光强度 | 10 ~ 80 |

### 6.3 多层呼吸效果（叠加图形）

```javascript
// 同时创建两个同心圆，相位差 180°
const graphic = [
    {
        id: 'breathOuter',
        type: 'circle',
        shape: { cx: x, cy: y, r: 20 },
        style: { fill: 'rgba(244,109,67,0.1)', stroke: 'rgba(244,109,67,0.4)', lineWidth: 2 },
        keyframeAnimation: {
            duration: 2000,
            loop: true,
            keyframes: [
                { percent: 0, shape: { r: 20 }, style: { opacity: 0.3 } },
                { percent: 0.5, shape: { r: 60 }, style: { opacity: 0.8 } },
                { percent: 1, shape: { r: 20 }, style: { opacity: 0.3 } }
            ]
        }
    },
    {
        id: 'breathInner',
        type: 'circle',
        shape: { cx: x, cy: y, r: 10 },
        style: { fill: 'rgba(244,109,67,0.6)', stroke: 'rgba(244,109,67,0.9)', lineWidth: 3 },
        keyframeAnimation: {
            duration: 2000,
            loop: true,
            delay: 1000,  // 延迟 1 秒，形成交替
            keyframes: [
                { percent: 0, shape: { r: 10 }, style: { opacity: 1.0 } },
                { percent: 0.5, shape: { r: 25 }, style: { opacity: 0.4 } },
                { percent: 1, shape: { r: 10 }, style: { opacity: 1.0 } }
            ]
        }
    }
];
```

---

## 七、方案对比

| 对比项 | graphic 方式 | setInterval 方式 |
|--------|-------------|------------------|
| 实现方式 | 纯配置 + 关键帧动画 | JavaScript 定时器 |
| 性能 | ⭐⭐⭐⭐⭐（GPU 加速） | ⭐⭐⭐（频繁 setOption 重绘） |
| 动画流畅度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 代码维护性 | ⭐⭐⭐⭐⭐（声明式） | ⭐⭐⭐（命令式） |
| 适用场景 | 生产环境、复杂交互 | 快速原型、简单需求 |

---

## 八、注意事项

1. **坐标转换依赖地图加载完成**：需确保 `china.js` 加载完毕后再执行 `convertToPixel`
2. **graphic 的 z 层级**：设置 `z: 100, zlevel: 1` 确保显示在地图上层
3. **窗口缩放适配**：`resize` 后需重新计算坐标（见 4.4）
4. **重复点击优化**：点击同一区域应取消呼吸灯（toggle 效果）
5. **中心点坐标精度**：建议使用 GeoJSON 中 `properties.center` 或 `cp` 字段

---

## 九、扩展能力

- **支持市级地图**：替换 `china.js` 为对应城市 GeoJSON，调整 `centerMap` 映射表
- **支持多点呼吸**：存储多个 `graphic` 对象，同时渲染
- **支持自定义形状**：将 `type: 'circle'` 替换为 `'rect'`、`'polygon'` 或 SVG `'path'`
- **支持渐变色**：`style.fill` 使用 `new echarts.graphic.LinearGradient()`
- **支持点击反馈**：结合 `emphasis` 高亮 + `graphic` 光晕，双重反馈

---

## 十、相关资源

| 资源 | 链接 |
|------|------|
| ECharts 官方文档 | https://echarts.apache.org/zh/option.html#graphic |
| 中国地图 GeoJSON | https://cdn.jsdelivr.net/npm/echarts@5/map/js/china.js |
| graphic 关键帧动画 | https://echarts.apache.org/zh/option.html#graphic.elements.keyframeAnimation |
| convertToPixel API | https://echarts.apache.org/zh/api.html#echartsInstance.convertToPixel |

---

*文档版本：1.0 | 更新日期：2026-07-07*
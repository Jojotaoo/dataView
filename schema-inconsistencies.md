# Schema 不一致检查报告

对比 `.opencode/skills/schemadesign/SKILL.md`（文档）与 `src/types/index.ts` + 运行时代码（代码），发现 **7 处不一致**。

---

## 1. `requestGlobalConfig` 结构差异

**文档 §3.2** 描述全局配置有 `requestParams`：
```json
{
  "requestParams": {
    "Params": { "TOKEN": "XXX" },
    "Header": { "Authorization": "Bearer xxx" },
    "Body": { "form-data": {}, "json": "", "xml": "" }
  }
}
```

**代码 `RequestGlobalConfigType`**（`src/types/index.ts:27-33`）：
```typescript
{
  requestOriginUrl: string
  requestInterval: number
  requestIntervalUnit: 'second' | 'minute' | 'hour' | 'day'
  requestHeader: Record<string, string>   // 只有扁平 header
  requestDataPond: DataPondItem[]
}
```

- 文档用 `requestParams`（含 Params / Header / Body），代码用 `requestHeader: Record<string,string>`
- 缺少全局级别的 URL Params 和 Body 存储

**修复方向**：统一为一套结构，或修改文档以匹配代码实现。

---

## 2. 文档缺少 `requestDataPond` 定义

**代码** 完整实现了共享数据池：
- `RequestGlobalConfigType.requestDataPond: DataPondItem[]`
- `DataPondItem { dataPondId, dataPondName, dataPondRequestConfig }`

**文档 §3** 提到"共享数据池"一词，但未描述其存储结构。

---

## 3. 组件 `request` 缺少 `requestDataPondId`

**代码 `ComponentRequestConfigType`**（`src/types/index.ts:172`）：
```typescript
requestDataPondId?: string
```

**文档 §4.9** 的字段表中没有该字段。
文档已描述 `requestDataType: 2` 代表数据池，但未说明组件如何关联到某个数据池。

---

## 4. `parentId` 无文档

**代码 `CreateComponentType`**（`src/types/index.ts:180`）：
```typescript
parentId?: string | null
```
用于 Container 父容器 → 子组件关系。

**文档 §4** 无任何提及。

---

## 5. `editCanvasConfig` 只记录了 5/17 个字段

**文档 §2** 只记录了：
- `projectName`, `width`, `height`, `background`, `backgroundImage`

**代码 `EditCanvasConfigType`**（`src/types/index.ts:1-19`），另有 12 个未记录：
- `filterShow`, `opacity`, `saturate`, `contrast`, `hueRotate`, `brightness`
- `blendMode`

---

## 6. 文档示例拼写错误：`charConfig` → `chartConfig`

**文档 §4.11** 分组组件 JSON 示例中：
```json
"charConfig": {  // 错误，少 t
    "key": "group",
    ...
}
```
**代码** 使用 `chartConfig`。

---

## 7. 序列化遗漏 `request` / `events` / `interactActions`

**文档 §4** 为 `CreateComponentType` 定义了这三个字段。

**代码** `SchemaPanel.vue` 和 `App.vue`（`src/App.vue:39-52`）的 `componentList.map()` 中只序列化了：
- `id, key, parentId, chartConfig, attr, styles, status, preview, filter, option, isGroup, groupList`

缺少 **`request`、`events`、`interactActions`** 三个字段，导出/预览时数据丢失。

---

## 汇总

| # | 位置 | 问题 | 严重度 |
|---|------|------|--------|
| 1 | `requestGlobalConfig` | 文档用 `requestParams`，代码用 `requestHeader` | 高 |
| 2 | `requestGlobalConfig` | `requestDataPond` 无文档 | 中 |
| 3 | 组件 `request` | `requestDataPondId` 无文档 | 中 |
| 4 | `CreateComponentType` | `parentId` 无文档 | 低 |
| 5 | `editCanvasConfig` | 5/17 字段有文档 | 高 |
| 6 | 文档示例 | `charConfig` 拼写错误 | 低 |
| 7 | 序列化 | `request`/`events`/`interactActions` 被遗漏 | 高 |

# 项目功能实现方案（Project Feature Implementation Plan）

> 范围：项目列表 / 新建弹窗 / 编辑器路由(`/editor/:id`) / 保存 Schema / 发布（保存并改状态）。
> 接口契约见 `tech/project-api.md`；本文件为**代码实现方案**。
> **已剔除「状态过滤」功能**：列表不做按 未发布/已发布 的筛选项（保留状态列的展示）。

## 0. 全局约定

- 接口层全部位于 `packages/editor/src/server/project/`，**每个 API 一个文件** + `types.ts` + `index.ts` barrel，严格镜像 `server/dataset/`。
- `ProjectServiceOptions { mode?: 'mock'|'server'; requestOriginUrl?: string }`；server 走真实接口，mock 走**内存 store（不持久化，刷新即丢）**。
- ID 由服务端生成：新建 → `POST /api/project` 返回 `id` → 跳 `/editor/:id`。
- `status` 枚举：`0`=未发布，`1`=已发布。
- 保存/发布载荷均为 `ChartEditStorage`（`useChartSchema().schema`）。
- 编辑器内 `serviceOpts()` 读 `useDashboardStore().requestGlobalConfig.datasetMode / requestOriginUrl`。

## 1. Service 层 `server/project/`

### 1.1 `types.ts`

- `ProjectServiceOptions`
- `ProjectItem { id; name; category; description; status: 0|1; creator; createdAt; updatedAt; schema?: ChartEditStorage }`
- `ProjectWritable = Pick<ProjectItem,'name'|'category'|'description'>`
- 复用 dataset 的 `ListQuery` / `ListResult` / `paginateFilter`（从 `../dataset/types` 导入）
- 重新导出 `ChartEditStorage`（来自 `jojotaoo_components`）
- `genId()`

### 1.2 各 API 单文件

| 文件                   | 函数                                     | server                         | mock                                 |
| ---------------------- | ---------------------------------------- | ------------------------------ | ------------------------------------ |
| `createProject.ts`     | `createProject(input, opts)`             | `POST /api/project`            | 内存新建 `genId()`+时间戳 `status=0` |
| `getProject.ts`        | `getProject(id, opts)`                   | `GET /api/project/:id`         | 内存取（含 schema）                  |
| `saveProjectSchema.ts` | `saveProjectSchema(id, schema, opts)`    | `PUT /api/project/:id/schema`  | 内存写 schema+updatedAt              |
| `publishProject.ts`    | `publishProjectSchema(id, schema, opts)` | `PUT /api/project/:id/publish` | 内存写 schema+status=1+updatedAt     |
| `projectList.ts`       | `fetchProjectList(query, opts)`          | `POST /api/project/list`       | 内存过滤(name/category)+分页         |
| `deleteProject.ts`     | `deleteProject(id, opts)`                | `DELETE /api/project/:id`      | 内存移除                             |

- 统一：`if (opts.mode==='server' && opts.requestOriginUrl) { fetch(...) } else { 内存 }`；`throw new Error('xxx失败')`。
- server 响应：`(await res.json())?.data ?? json`。

### 1.3 `index.ts`

- `export *` 全部；顶部注释补发布端点契约。

## 2. 内存 Store `stores/project.ts`

- `ref<ProjectItem[]>`（无 localStorage）。
- `getProject / addProject / updateProjectSchema / publishProjectSchema / removeProject`。
- `publishProjectSchema(id, schema)`：写 schema + `status=1` + `updatedAt=Date.now()`。

## 3. 新建弹窗 `ProjectCreateDialog.vue`（新增）

- 字段：项目名称(必填校验)、项目分类(自由文本)、项目描述(textarea)。
- 确认 `:loading` → `createProject(...)` → `emit('created', item)`。
- 接入：`ProjectToolbar`「新建项目」、`IntroPanel`「开始创建」改为打开弹窗。

## 4. 路由 `router/index.ts`

- `/editor` → `/editor/:id`（name 仍 `Editor`）。

## 5. 列表页联动

### 5.1 `HomeLayout.vue`

- `openCreate()`：开 `ProjectCreateDialog`，`@created` → `router.push('/editor/'+item.id)`。
- `editProject(id)` → `router.push('/editor/'+id)`。

### 5.2 `ProjectList.vue`

- 数据改由 `fetchProjectList({page,pageSize,keyword}, serviceOpts())` 驱动；分页/总数用接口 `total`。
- 行删除 → `deleteProject` → 重拉；查看/编辑 → `emit('editProject', id)`。

### 5.3 `ProjectTable.vue`

- `ProjectItem.status` 改 `0|1`；状态列：`0`→未发布(info)，`1`→已发布(success)。
- 删除/编辑图标接 emit。

### 5.4 `ProjectToolbar.vue`

- 「新建项目」`@create` 改为触发父级开弹窗。

## 6. 编辑器 `EditorPage.vue`

### 6.1 进入加载（onMounted）

- `id = route.params.id`；空 → 禁用保存/发布 + 提示。
- `getProject(id)` → 有 schema：`store.loadSchema(schema)` + `store.updateCanvasConfig({projectName})`；无 schema：空白画布。
- 404 → `ElMessage.error('项目不存在')`。

### 6.2 顶栏按钮（`.header-actions`，保留「预览」）

- 「💾 保存」→ `saveProjectSchema(id, schema.value)` → `ElMessage.success('已保存')`。
- 「🚀 发布」→ `publishProjectSchema(id, schema.value)` → `ElMessage.success('已发布')`。
- 两按钮 `:disabled="!id"` `:loading`。
- `schema` 来自 `useChartSchema().schema`。

## 7. 交互行为总览（用户视角）

1. 首页/介绍页/列表「新建」→ 弹窗(名称/分类/描述)。
2. 确认 → `createProject` → 拿 `id` → 跳 `/editor/:id`（空白画布）。
3. 编辑器拖组件配数据 → 「保存」存 schema（status 不变）→ 已保存。
4. 「发布」→ 存 schema + `status=1` → 已发布（幂等）。
5. 回列表 → 状态标签随保存/发布变化。
6. 列表编辑 → `/editor/:id` 还原画布（mock 仅当前会话；server 落库）。
7. 列表删除 → `deleteProject` → 刷新。

**mock 注意**：仅内存，刷新即丢（符合已确认决策）；server 落库可恢复。

## 8. 验证

- `pnpm build` + `pnpm format:check` 通过。
- 手动（mock）：新建→跳编辑→拖组件→保存→发布→回列表看状态；编辑重进还原；删除生效。
- 类型核对：`ProjectItem.status` 全仓统一 `0|1`（`ProjectTable`/`ProjectList` 硬编码需同步）。

## 9. 执行顺序

1. `server/project/` (types + 6 单文件 + index)
2. `stores/project.ts`
3. `ProjectCreateDialog.vue` + 接入 Toolbar/IntroPanel/HomeLayout
4. `router/index.ts` `/editor/:id`
5. `ProjectList/Table/Toolbar` 改造
6. `EditorPage.vue` 加载 + 保存 + 发布

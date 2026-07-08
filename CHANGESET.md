# Changesets 发包流程

## 包概览

| 包名 | `private` | 发版 | 说明 |
|------|-----------|------|------|
| `@demo/components` | ❌ | ✅ | 组件库：图表、store、composables |
| `@demo/preview` | ❌ | ✅ | 预览页面：PreviewPage（依赖 components） |
| `@demo/editor` | ✅ | ❌ | SPA 编辑器应用（不发版） |

## 版本策略

**独立版本** — `@demo/components` 和 `@demo/preview` 各自独立版本号。

- `@demo/preview` 依赖 `@demo/components`（`workspace:*`），发布时 pnpm 自动替换为实际版本号
- 修改 components 时，只需要给 components 加 changeset；preview 如果同时改了，也加自己的 changeset

## 日常开发流程

```
git checkout -b feat/xxx
  → 改代码
  → pnpm changeset          ← 选改了的包，选变更类型，写 changelog
  → git add .
  → git commit -m "feat: xxx"
  → git push
  → 提 PR → merge
```

### 创建 changeset

```bash
pnpm changeset
```

交互式操作：
1. 选择本次改动的包（空格选中，回车确认）
2. 选择变更类型：

| 类型 | 对应 version bump | 适用场景 |
|------|-------------------|----------|
| `patch` | `0.0.x` | bug 修复、小优化 |
| `minor` | `0.x.0` | 新功能、不破坏兼容 |
| `major` | `x.0.0` | 破坏性变更 |

3. 输入 changelog 描述（会写入 `CHANGELOG.md`）

生成的 changeset 文件在 `.changeset/` 目录下，一个 markdown 文件：

```
.changeset/tasty-bears-wave.md
---
'@demo/components': minor
---

添加地图呼吸灯功能
```

### 多包同时改动

如果一次 PR 同时改了 components 和 preview：

```bash
pnpm changeset
# 空格选中 @demo/components 和 @demo/preview
# 各选各自的变更类型
# 写各自的 changelog
```

## 发版流程（维护者操作）

```bash
# 1. 消费 changesets — bump 版本 + 生成 CHANGELOG
pnpm version-packages

# 2. 检查生成的版本号和 CHANGELOG
git diff

# 3. 提交版本变更
git add .
git commit -m "chore: version packages"

# 4. 构建 + 发布 npm
pnpm release
```

执行顺序：

```
pnpm version-packages
  → changeset version
    → 删除 .changeset/*.md
    → 更新 packages/*/package.json 版本号
    → 生成/更新 CHANGELOG.md
  → pnpm install（更新 lockfile）

pnpm release
  → vue-tsc -b
  → vite build packages/editor
  → npm publish packages/components
  → npm publish packages/preview
```

## 包发布内容

`"files": ["dist"]` — 只发布 `dist/` 目录到 npm：

- `dist/index.js` — ESM 入口
- `dist/index.cjs` — CJS 入口
- `dist/index.d.ts` — 类型声明
- 组件 `.vue.d.ts` 声明文件

开发时通过 `main`/`exports` 的 `src/` 路径由 pnpm workspace 解析源码。
发布时 `publishConfig` 覆盖为 `dist/` 路径。

## Beta 预发布

在 feature 分支上测试阶段，可以用 changesets 的 `pre` 模式打 beta 版本，不干扰正式版本线。

### 进入 Beta 模式

```bash
pnpm changeset pre enter beta
```

该命令在 `.changeset/pre.json` 中记录状态，后续 `version-packages` 生成的版本号如 `0.0.1-beta.0`。

### 首次打 Beta 包

```bash
# 前提：工作区已有 .changeset/*.md（通过 pnpm changeset 创建）
# 1. 进入 beta 预发布模式
pnpm changeset pre enter beta

# 2. 消费 changesets — 生成版本号（如 0.0.1-beta.0）
pnpm version-packages

# 3. 构建 + 发布到 npm
pnpm release
```

发布后 npm 上出现 `@demo/components@0.0.1-beta.0`、`@demo/preview@0.0.1-beta.0`。

### 迭代修复

```bash
# 改代码 → 创建新的 changeset
pnpm changeset

# 重新版本化（beta 模式下自动递增）
# .changeset/*.md 不会被删除，积累到退出 beta 后统一消费
# 版本号推进：beta.0 → beta.1 → beta.2 ...
pnpm version-packages

# 重新发布
pnpm release
```

**注意**：beta 模式下 `version-packages` 不会删除 `.md` changeset 文件，版本号迭代但内容积累。退出 beta 后才会一次性消费。

### 退出 Beta → 发正式版

```bash
# 1. 退出 beta 模式（删除 .changeset/pre.json）
pnpm changeset pre exit

# 2. 消费所有积累的 changesets → 生成正式版本号
#    例如 0.0.1-beta.2 → 0.1.0
pnpm version-packages

# 3. 提交版本变更
git add .
git commit -m "chore: release v0.1.0"

# 4. 合并到 master 后发布正式版
git checkout master
git merge feat/xxx
pnpm release
```

### 完整示例

```bash
# === 开发阶段 ===
git checkout -b feat/dark-mode
# 改代码 ...

# 创建 changeset
pnpm changeset
# → select @demo/components → minor → "支持暗色模式"

# === 打 beta 测试 ===
pnpm changeset pre enter beta
pnpm version-packages
pnpm release
# → npm 上出现 @demo/components@0.0.1-beta.0

# === 修复 ===
# 改代码 ...
pnpm changeset
pnpm version-packages
pnpm release
# → @demo/components@0.0.1-beta.1

# === 发正式版 ===
pnpm changeset pre exit
pnpm version-packages
# → @demo/components@0.1.0
git add . && git commit -m "chore: release v0.1.0"
git push origin feat/dark-mode
# 提 PR → 合并到 master
git checkout master
pnpm release
```

### 关键约束

| 行为 | Beta 模式下 | 正常模式 |
|------|-------------|----------|
| 版本号 | `0.0.1-beta.0` | `0.0.1` |
| changeset .md 文件 | 保留不删 | 消费后删除 |
| 多个 changeset 合并 | 累积到退出后统一生效 | 立即合并为一个版本 |
| 发布 tag | beta | latest |

## 首次发布

```bash
# 确认 npm 登录
npm whoami
# 如未登录：
npm login --registry=https://registry.npmjs.org

# 创建初始 changeset
pnpm changeset

# 发版
pnpm version-packages
pnpm release
```

> 首次发布前确保包名 `@demo/components` 在 npm 上未被占用（或属于您的 scope）。

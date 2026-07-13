# AGENTS.md

## Monorepo Structure

pnpm workspaces with 3 packages:

| Package               | npm name              | Role                                                          |
| --------------------- | --------------------- | ------------------------------------------------------------- |
| `packages/components` | `jojotaoo_components` | Shared types, Pinia store, composables, chart components      |
| `packages/editor`     | `jojotaoo_editor`     | Main editor app (three-column UI, drag/drop, property panels) |
| `packages/preview`    | `jojotaoo_preview`    | Standalone preview container                                  |

Editor depends on both components and preview via `workspace:*`. Changes to types/store/composables affect all packages.

## Commands

```bash
pnpm dev              # Vite dev server (serves packages/editor)
pnpm build            # vue-tsc -b && vite build packages/editor
pnpm preview          # vite preview packages/editor
pnpm format           # Prettier: auto-format all files
pnpm format:check     # Prettier: check formatting (CI-friendly)
pnpm stylelint        # Stylelint: check CSS
pnpm stylelint:fix    # Stylelint: auto-fix CSS
```

Root scripts target `packages/editor` directly. Each package also has its own build:

- `packages/components`: `tsc --build --clean && tsc && vite build`
- `packages/preview`: `tsc --build --clean && tsc && vite build`
- `packages/editor`: `tsc && vite build`

Always run `pnpm build` from root before committing — it checks TypeScript and Vite together. Pre-commit hooks run Prettier + lint-staged automatically.

**Commit messages**: Must follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, etc.). Enforced by commitlint via `.husky/commit-msg`.

Release workflow uses changesets: `pnpm changeset` → `pnpm version-packages` → `pnpm release`.

## Stack

Vue 3 Composition API + `<script setup>` + Pinia + Vite + TypeScript. ECharts v6, vue3-sketch-ruler v3, vuedraggable v4, Element Plus. All styles scoped, Catppuccin Mocha palette. `tsconfig.json` enforces `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`. No test framework.

## Architecture

Three-column layout: **LeftPanel** (component library, drag source via vuedraggable clone) → **CanvasArea** (editing canvas with SketchRule ruler + zoom) → **RightPanel** (tabs: `props`/`request` when component selected, `page`/`schema`/`request` when none).

Router (`packages/editor/src/router`): `/` → EditorPage, `/preview` → PreviewPage (from `jojotaoo_preview`).

All state mutations go through Pinia store (`packages/components/src/stores/dashboard.ts`). No direct state manipulation outside store actions.

**Entrypoint**: `packages/editor/src/main.ts` mounts App with Pinia + Element Plus + vue-router.

## Critical Quirks

### Two parent-child models (DO NOT CONFUSE)

| Model         | Field                                                       | Storage                       | Rendering                                                        |
| ------------- | ----------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------- |
| **Container** | `parentId: string` on child in flat array                   | `components[]`                | `Container.vue` via `getChildren(parentId)` filters `components` |
| **Group**     | `isGroup: true` + nested `groupList: CreateComponentType[]` | Inside group component object | `GroupComponent.vue` iterates `component.groupList`              |

These are separate and non-interchangeable. Container children live in the flat `components` array. Group children live inside the group's `groupList`. Schema §4.11 (`.opencode/skills/schemadesign/SKILL.md`) is authoritative for group model.

### Group children are NOT draggable/resizable

Children inside `groupList` render at relative positions but have **no drag or resize handlers**. The group itself is moved/resized as a single component on the canvas. Children only support click (selection for property editing) and right-click (context menu).

### Group children coordinates

Children in `groupList` have `attr.x/y` **relative to the group's top-left corner**. On ungroup, `ungroupComponent` converts back to absolute canvas coordinates by adding the group's `attr.x/y`. Conversely, `groupSelectedComponents` subtracts `minX/minY` to make them relative.

### Ruler `transform` breaks `position: fixed`

vue3-sketch-ruler applies `transform: matrix(...)` on `div.canvasedit`, which creates a new CSS containing block. Any `position: fixed` descendant (like ContextMenu) is positioned relative to that transformed element, not the viewport. **Always render `position: fixed` elements outside `<SketchRule>`, either as siblings or via `<Teleport to="body">`**.

### Schema serialization is in SchemaPanel.vue only

Schema field mapping lives in `packages/editor/src/components/RightPanel/SchemaPanel.vue`'s `currentSchema` computed. Currently maps: `id`, `key`, `chartConfig`, `attr`, `styles`, `status`, `preview`, `filter`, `option`, `chartStyle`, `isGroup`, `groupList`, `request`, `events`, `interactActions`, `props`.

Adding a new field to `CreateComponentType` requires updating this map in SchemaPanel.vue AND the corresponding load logic in `store.loadSchema()`.

### `tech/README.md` shows an outdated schema format

The schema illustrated in `tech/README.md` uses an old `page`/`pageConfig`/`components[].type` shape. The actual schema follows `ChartEditStorage`/`CreateComponentType` in `packages/components/src/types/index.ts`. Do not treat `tech/README.md` as authoritative for schema structure.

### ECharts first-row type inference

`<input type="text">` returns strings. If the user edits a first-row value in a numeric dataset column, ECharts re-infers the column type from the first row. A string first row breaks `yAxis: { type: 'value' }`. The fix in `updateOptionDatasetCell` checks `typeof currentVal === 'number'` and coerces via `Number(value)` to preserve the numeric type.

### ECharts `setOption` must use `{ notMerge: true }`

In `useECharts.ts`, `chartInstance.value.setOption(buildOption(), { notMerge: true })`. Without this, ECharts merges options and data edits may not reflect correctly.

### All updates go through recursive `findComponent`

Functions like `updateComponentProp`, `updateComponentPosition`, `updateComponentSize`, `updateComponentOption`, etc. all use `findComponent(id)` which recursively searches the root `components` array and all `groupList`s. This means editing properties of a group child works transparently.

## Type System

All types live in `packages/components/src/types/`:

- **`CreateComponentType`** (`component.ts`): Base schema type. Fields: `id`, `key`, `isGroup?`, `chartConfig`, `attr`, `styles`, `status`, `filter?`, `preview`, `events?`, `interactActions?`, `interactOverrides?`, `request?`, `option`, `chartStyle?`, `groupList?`.
- **`CanvasComponent`** (`component.ts`): Extends `CreateComponentType` adding **required** `props: Record<string, any>`. Used for components in the store's `components` ref.
- **`ChartEditStorage`** (`canvas.ts`): Top-level schema shape `{ editCanvasConfig, requestGlobalConfig, componentList }`.
- **`EditCanvasConfigType`** (`canvas.ts`): Canvas config with `projectName`, `width`, `height`, `background`, `backgroundImage`, plus 7 filter/transform fields (`filterShow`, `opacity`, `saturate`, `contrast`, `hueRotate`, `brightness`, `blendMode`) and `customTheme`.

## Group Implementation Details

- `groupSelectedComponents`: Removes selected items from `components` array, creates a new group with `isGroup: true` + `groupList` containing the items at relative coords. Must **preserve** original `parentId` and `props` via `...c` spread.
- `ungroupComponent`: Spreads children from `groupList` back to `components` array at absolute coords. Must **preserve** `parentId` and `props`. Adds group offset to child `x/y`.
- `findComponent`: Iterates root `components` array, then recurses into each comp's `groupList` via `findInGroupList`.
- `removeComponent`: Checks root array first, then recurses via `removeFromGroupList`.
- `GroupComponent.vue` is self-recursive: renders child `GroupComponent` if `child.isGroup`.
- `GroupPreview.vue` mirrors `GroupComponent` template without selection/drag decorators.

## Key Files

| File                                                           | Role                                                                  |
| -------------------------------------------------------------- | --------------------------------------------------------------------- |
| `packages/components/src/stores/dashboard.ts`                  | Pinia store, all actions, recursive helpers                           |
| `packages/components/src/types/component.ts`                   | `CreateComponentType`, `CanvasComponent`, `ChartStyleConfig`          |
| `packages/components/src/types/canvas.ts`                      | `EditCanvasConfigType`, `ChartEditStorage`, `RequestGlobalConfigType` |
| `packages/components/src/composables/useECharts.ts`            | ECharts init/resize/update composable                                 |
| `packages/components/src/config/componentDefinitions.ts`       | Component registry (key → default config)                             |
| `packages/editor/src/components/CanvasArea.vue`                | Canvas with ruler, drag/drop, box selection, context menu             |
| `packages/editor/src/components/LeftPanel.vue`                 | Component library sidebar                                             |
| `packages/editor/src/components/RightPanel/index.vue`          | Right panel with tabs                                                 |
| `packages/editor/src/components/RightPanel/SchemaPanel.vue`    | Schema serialization (clipboard copy + apply)                         |
| `packages/components/src/components/charts/GroupComponent.vue` | Group rendering in editor (recursive)                                 |
| `packages/components/src/components/charts/GroupPreview.vue`   | Group rendering in preview                                            |
| `packages/editor/src/components/ContextMenu.vue`               | Right-click Group/Ungroup menu                                        |
| `.opencode/skills/schemadesign/SKILL.md`                       | Authoritative schema reference (§4.11 for group model)                |

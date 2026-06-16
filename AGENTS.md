# AGENTS.md

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # tsc && vite build (MUST pass both)
npm run preview   # vite preview
```

Always run `npm run build` to check both TypeScript and Vite before committing. There are no separate test, lint, or typecheck commands.

## Stack

Vue 3 Composition API + `<script setup>` + Pinia + Vite + TypeScript. ECharts v6, vue3-sketch-ruler v3, vuedraggable v4. All styles scoped, Catppuccin Mocha palette. `tsconfig.json` enforces `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`. No test framework.

## Architecture

Three-column layout: **LeftPanel** (component library, drag source via vuedraggable clone) → **CanvasArea** (editing canvas with SketchRule ruler + zoom) → **RightPanel** (tabs: `props`/`request` when component selected, `page`/`schema`/`request` when none).

All state mutations go through Pinia store (`src/stores/dashboard.ts`). No direct state manipulation outside store actions.

**Entrypoint**: `src/main.ts` mounts App with Pinia. `src/App.vue` orchestrates the three panels and preview overlay.

## Critical Quirks

### Two parent-child models (DO NOT CONFUSE)

| Model | Field | Storage | Rendering |
|-------|-------|---------|-----------|
| **Container** | `parentId: string` on child in flat array | `components[]` | `Container.vue` via `getChildren(parentId)` filters `components` |
| **Group** | `isGroup: true` + nested `groupList: CreateComponentType[]` | Inside group component object | `GroupComponent.vue` iterates `component.groupList` |

These are separate and non-interchangeable. Container children live in the flat `components` array. Group children live inside the group's `groupList`. Schema §4.11 is authoritative for group model.

### Group children are NOT draggable/resizable

Children inside `groupList` render at relative positions but have **no drag or resize handlers**. The group itself is moved/resized as a single component on the canvas. Children only support click (selection for property editing) and right-click (context menu).

### Group children coordinates

Children in `groupList` have `attr.x/y` **relative to the group's top-left corner**. On ungroup, `ungroupComponent` converts back to absolute canvas coordinates by adding the group's `attr.x/y`. Conversely, `groupSelectedComponents` subtracts `minX/minY` to make them relative.

### Ruler `transform` breaks `position: fixed`

vue3-sketch-ruler applies `transform: matrix(...)` on `div.canvasedit`, which creates a new CSS containing block. Any `position: fixed` descendant (like ContextMenu) is positioned relative to that transformed element, not the viewport. **Always render `position: fixed` elements outside `<SketchRule>`, either as siblings or via `<Teleport to="body">`**.

### Serializer field map duplication

Both `src/components/RightPanel/SchemaPanel.vue` and `src/App.vue` build schema objects via **explicit field maps** inside `store.components.map(c => ({...}))`. Adding a new field to `CreateComponentType` requires updating **both** locations. Currently the map includes: `id`, `key`, `parentId`, `chartConfig`, `attr`, `styles`, `status`, `preview`, `filter`, `option`, `isGroup`, `groupList`.

**Known missing**: `events`, `interactActions`, `request` — defined on `CreateComponentType` but NOT serialized. Adding them requires updating both files identically.

### `skills/schema.skill.md` has documentation gaps

The schema doc §2 (`editCanvasConfig`) only documents 5 of 12 fields. The code's `EditCanvasConfigType` has 7 additional canvas-level filter/transform fields (`filterShow`, `opacity`, `saturate`, `contrast`, `hueRotate`, `brightness`, `blendMode`) not mentioned in the doc. The `parentId` field on `CreateComponentType` is also undocumented in the schema.

### `tech/README.md` shows an outdated schema format

The schema illustrated in `tech/README.md` uses an old `page`/`pageConfig`/`components[].type` shape. The actual schema follows `ChartEditStorage`/`CreateComponentType` in `src/types/index.ts`. Do not treat `tech/README.md` as authoritative for schema structure.

### ECharts first-row type inference

`<input type="text">` returns strings. If the user edits a first-row value in a numeric dataset column, ECharts re-infers the column type from the first row. A string first row breaks `yAxis: { type: 'value' }`. The fix in `updateOptionDatasetCell` checks `typeof currentVal === 'number'` and coerces via `Number(value)` to preserve the numeric type.

### ECharts `setOption` must use `{ notMerge: true }`

In `useECharts.ts`, `chartInstance.value.setOption(buildOption(), { notMerge: true })`. Without this, ECharts merges options and data edits may not reflect correctly.

### All updates go through recursive `findComponent`

Functions like `updateComponentProp`, `updateComponentPosition`, `updateComponentSize`, `updateComponentOption`, etc. all use `findComponent(id)` which recursively searches the root `components` array and all `groupList`s. This means editing properties of a group child works transparently.

## Type System

- **`CreateComponentType`** (`src/types/index.ts`): Base schema type. All fields: `id`, `key`, `parentId?`, `isGroup?`, `chartConfig`, `attr`, `styles`, `status`, `filter?`, `preview`, `events?`, `interactActions?`, `request?`, `option`, `groupList?`.
- **`CanvasComponent`** (`src/stores/dashboard.ts`): Runtime extension of `CreateComponentType` adding **required** `parentId: string | null` and `props: Record<string, any>`. Used for components in the store's `components` ref. Group children in `groupList` are typed as `CreateComponentType[]` but at runtime may be `CanvasComponent`-equivalent objects (from spread).
- **`ChartEditStorage`** (`src/types/index.ts`): Top-level schema shape `{ editCanvasConfig, requestGlobalConfig, componentList }`.

## Group Implementation Details

- `groupSelectedComponents`: Removes selected items from `components` array, creates a new group with `isGroup: true` + `groupList` containing the items at relative coords. Must **preserve** original `parentId` and `props` via `...c` spread.
- `ungroupComponent`: Spreads children from `groupList` back to `components` array at absolute coords. Must **preserve** `parentId` and `props`. Adds group offset to child `x/y`.
- `findComponent`: Iterates root `components` array, then recurses into each comp's `groupList` via `findInGroupList`.
- `removeComponent`: Checks root array first, then recurses via `removeFromGroupList`.
- `GroupComponent.vue` is self-recursive: renders child `GroupComponent` if `child.isGroup`.
- `GroupPreview.vue` mirrors `GroupComponent` template without selection/drag decorators.

## Key Files

| File | Role |
|------|------|
| `src/stores/dashboard.ts` | Pinia store, all actions, `CanvasComponent` type, recursive helpers |
| `src/types/index.ts` | Schema type definitions (`CreateComponentType`, `ChartEditStorage`, etc.) |
| `src/composables/useECharts.ts` | ECharts init/resize/update composable |
| `src/components/CanvasArea.vue` | Canvas with ruler, drag/drop, box selection, context menu |
| `src/components/charts/GroupComponent.vue` | Group rendering in editor (recursive) |
| `src/components/charts/GroupPreview.vue` | Group rendering in preview |
| `src/components/ContextMenu.vue` | Right-click Group/Ungroup menu |
| `src/components/RightPanel/SchemaPanel.vue` | Schema serialization (clipboard copy) |
| `src/App.vue` | Preview schema construction, three-panel layout |
| `skills/schema.skill.md` | Authoritative schema reference (§4.11 for group model) |

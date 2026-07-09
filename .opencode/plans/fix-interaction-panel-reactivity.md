# Fix: InteractionPanel Reactivity Issue

## Root Cause

`InteractionPanel.vue` uses a **plain function** `getInteractEvents()` instead of a **computed property** to derive the interact events list. This breaks Vue's dependency tracking:

1. When `events` is initially `undefined`, `comp.value.events?.interactEvents` short-circuits via optional chaining, so Vue **never tracks `interactEvents`** as a dependency
2. When `events` is later assigned (`c.events = { interactEvents: [] }`), Vue detects the change to `events` and re-renders, but the dependency on the inner `interactEvents` array is not properly established
3. The `version` ref hack partially compensates (forces re-render on add/remove), but doesn't help with mutations to existing items' properties (v-model changes on selects)
4. Result: UI only updates when switching tabs (which causes a full re-mount via `v-if`/`v-show` toggling)

## Fix

Replace the plain function + version hack with a proper `computed` property, following standard Vue reactivity patterns.

### File: `src/components/RightPanel/InteractionPanel.vue`

1. **Remove `version` ref** - no longer needed
2. **Replace `getInteractEvents()` function with a computed property**:
   ```ts
   const interactEvents = computed(() => comp.value.events?.interactEvents ?? [])
   ```
3. **Remove `void version.value` dependency** - the computed handles this
4. **Remove `version.value++`** from `addInteract()` and `removeInteract()`
5. **Update template** - replace `getInteractEvents()` calls with `interactEvents`

### Verification

- Add an interaction → card should appear immediately
- Remove an interaction → card should disappear immediately
- Change select values (interactOn, _method, etc.) → conditional sections should toggle immediately
- Switch tabs and back → state should persist (no data loss)

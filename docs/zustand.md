# Zustand Documentation

> **Library:** zustand v5.0.8
> **Official Repo:** https://github.com/pmndrs/zustand

Zustand is a small, fast, and scalable state-management solution for React applications, offering a simple API based on hooks without boilerplate.

---

## Installation

```bash
npm install zustand
# or
bun add zustand
```

---

## Basic Usage

### Creating a Simple Store

```typescript
import { create } from 'zustand'

interface BearState {
  bears: number
  increase: (by: number) => void
}

const useBearStore = create<BearState>((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}))
```

### Using the Store in Components

```tsx
function BearCounter() {
  const bears = useBearStore((state) => state.bears)
  return <h1>{bears} around here...</h1>
}

function Controls() {
  const increase = useBearStore((state) => state.increase)
  return <button onClick={() => increase(1)}>Add bear</button>
}
```

---

## Middleware

### Persist Middleware

Save and restore store data from localStorage/sessionStorage:

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface MyState {
  bears: number
  addABear: () => void
}

export const useBearStore = create<MyState>()(
  persist(
    (set, get) => ({
      bears: 0,
      addABear: () => set({ bears: get().bears + 1 }),
    }),
    {
      name: 'food-storage', // unique name for localStorage key
      storage: createJSONStorage(() => sessionStorage), // optional, defaults to localStorage
    },
  ),
)
```

**Partial Persistence:**

```typescript
persist(
  (set) => ({
    context: {
      position: { x: 0, y: 0 },
    },
    actions: {
      setPosition: (position) => set({ context: { position } }),
    },
  }),
  {
    name: 'position-storage',
    partialize: (state) => ({ context: state.context }), // Only persist 'context'
  },
)
```

### DevTools Middleware

Integrate with Redux DevTools for debugging:

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {} from '@redux-devtools/extension' // required for devtools typing

const useBearStore = create<BearState>()(
  devtools(
    (set) => ({
      bears: 0,
      increase: (by) => set((state) => ({ bears: state.bears + by }), undefined, 'bears/increase'),
    }),
  ),
)
```

**Named Actions:**

```typescript
set(
  (state) => ({ bears: state.bears + 1 }),
  undefined,
  'bears/addBear' // Action name in DevTools
)
```

**Multiple Stores:**

```typescript
const useStore1 = create(devtools((set) => ..., { name: 'Store1', store: 'store1' }))
const useStore2 = create(devtools((set) => ..., { name: 'Store2', store: 'store2' }))
```

### Combining Middleware

```typescript
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const useBearStore = create<BearState>()(
  devtools(
    persist(
      (set) => ({
        bears: 0,
        increase: (by) => set((state) => ({ bears: state.bears + by })),
      }),
      { name: 'bear-storage' },
    ),
  ),
)
```

---

## Advanced Patterns

### State Migrations (Versioning)

Handle schema changes when persisting data:

```typescript
export const useBoundStore = create(
  persist(
    (set, get) => ({
      newField: 0, // renamed from 'oldField' in version 0
    }),
    {
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          persistedState.newField = persistedState.oldField
          delete persistedState.oldField
        }
        return persistedState
      },
    },
  ),
)
```

### Custom Merge Strategy

Use deep merging to prevent data loss in nested objects:

```typescript
import createDeepMerge from '@fastify/deepmerge'

const deepMerge = createDeepMerge({ all: true })

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 },
      setPosition: (position) => set({ position }),
    }),
    {
      name: 'position-storage',
      merge: (persisted, current) => deepMerge(current, persisted) as never,
    },
  ),
)
```

### Immer Middleware

Simplify state updates with mutable-like syntax:

```typescript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type State = {
  count: number
}

type Actions = {
  increment: (qty: number) => void
  decrement: (qty: number) => void
}

export const useCountStore = create<State & Actions>()(
  immer((set) => ({
    count: 0,
    increment: (qty: number) =>
      set((state) => {
        state.count += qty // Direct mutation with Immer
      }),
    decrement: (qty: number) =>
      set((state) => {
        state.count -= qty
      }),
  })),
)
```

---

## Vanilla Store (No React)

```typescript
import { createStore } from 'zustand/vanilla'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()((set) => ({
  position: { x: 0, y: 0 },
  setPosition: (position) => set({ position }),
}))

// Subscribe to changes
const render = (state: PositionStore) => {
  console.log('new position', state.position)
}

positionStore.subscribe(render)

// Get current state
positionStore.getState().setPosition({ x: 100, y: 200 })
```

---

## Best Practices

### 1. Keep Actions Separate from State

```typescript
// ❌ Don't mix actions and state
const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

// ✅ Separate state and actions
type State = {
  user: User | null
}

type Actions = {
  setUser: (user: User) => void
}

const useStore = create<State & Actions>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
```

### 2. Use Selectors for Performance

```typescript
// ❌ Re-renders on any state change
const { bears, increase } = useBearStore()

// ✅ Only re-renders when 'bears' changes
const bears = useBearStore((state) => state.bears)
const increase = useBearStore((state) => state.increase)
```

### 3. Skip Hydration for SSR

```typescript
const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 },
      setPosition: (position) => set({ position }),
    }),
    {
      name: 'position-storage',
      skipHydration: true, // Don't hydrate automatically on init
    },
  ),
)

// Manually rehydrate after mount
useEffect(() => {
  positionStore.persist.rehydrate()
}, [])
```

---

## Migration Notes (v4 → v5)

### Initial State Persistence

**v4:** Initial state was automatically stored at creation time.

```javascript
// v4 - random count was stored immediately
const useCountStore = create(
  persist(
    () => ({
      count: Math.floor(Math.random() * 1000),
    }),
    { name: 'count' },
  ),
)
```

**v5:** Explicit `setState()` required for dynamic initial values.

```javascript
// v5 - must call setState manually
const useCountStore = create(
  persist(
    () => ({ count: 0 }),
    { name: 'count' },
  ),
)
useCountStore.setState({
  count: Math.floor(Math.random() * 1000),
})
```

---

## Common Patterns

### Slices Pattern

Split large stores into smaller, manageable slices:

```typescript
import { create, StateCreator } from 'zustand'

type BearSlice = {
  bears: number
  addBear: () => void
}

type FishSlice = {
  fishes: number
  addFish: () => void
}

type JungleStore = BearSlice & FishSlice

const createBearSlice: StateCreator<JungleStore, [], [], BearSlice> = (set) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
})

const createFishSlice: StateCreator<JungleStore, [], [], FishSlice> = (set) => ({
  fishes: 0,
  addFish: () => set((state) => ({ fishes: state.fishes + 1 })),
})

const useJungleStore = create<JungleStore>()((...a) => ({
  ...createBearSlice(...a),
  ...createFishSlice(...a),
}))
```

---

## Resources

- **Official Docs:** https://docs.pmnd.rs/zustand
- **GitHub:** https://github.com/pmndrs/zustand
- **TypeScript Guide:** https://docs.pmnd.rs/zustand/guides/typescript

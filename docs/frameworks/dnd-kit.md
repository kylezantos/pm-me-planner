# @dnd-kit Documentation

> **Library:** @dnd-kit/core v6.3.1, @dnd-kit/sortable v10.0.0
> **Official Repo:** https://github.com/clauderic/dnd-kit

A lightweight, modular, performant, accessible, and extensible drag & drop toolkit for React.

---

## Installation

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
# or
bun add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Optional Modifiers:**

```bash
npm install @dnd-kit/modifiers
```

---

## Core Concepts

### Basic Drag and Drop

```tsx
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'

function Draggable() {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable',
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
      Drag me
    </button>
  )
}

function Droppable() {
  const { isOver, setNodeRef } = useDroppable({
    id: 'droppable',
  })

  const style = {
    color: isOver ? 'green' : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}>
      Drop here
    </div>
  )
}

export default function App() {
  return (
    <DndContext>
      <Draggable />
      <Droppable />
    </DndContext>
  )
}
```

---

## Sortable Lists

### Basic Sortable

```tsx
import { DndContext, closestCenter } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'

function SortableItem({ id }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {id}
    </div>
  )
}

export default function SortableList() {
  const [items, setItems] = useState(['1', '2', '3', '4', '5'])

  function handleDragEnd(event) {
    const { active, over } = event

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id)
        const newIndex = items.indexOf(over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((id) => (
          <SortableItem key={id} id={id} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

---

## Drag Overlay

Show a custom drag preview that follows the cursor:

```tsx
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { useState } from 'react'

function App() {
  const [activeId, setActiveId] = useState(null)

  return (
    <DndContext
      onDragStart={(event) => setActiveId(event.active.id)}
      onDragEnd={() => setActiveId(null)}
    >
      {/* Your draggable items */}

      <DragOverlay>
        {activeId ? <div>Dragging {activeId}</div> : null}
      </DragOverlay>
    </DndContext>
  )
}
```

---

## Modifiers

Modifiers allow you to dynamically modify the movement coordinates during drag operations.

### Built-in Modifiers

```tsx
import { DndContext } from '@dnd-kit/core'
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
  restrictToParentElement,
} from '@dnd-kit/modifiers'

function App() {
  return (
    <DndContext modifiers={[restrictToVerticalAxis]}>
      {/* Only allow vertical dragging */}
    </DndContext>
  )
}
```

**Available Built-in Modifiers:**

- `restrictToVerticalAxis` - Restrict movement to vertical only
- `restrictToHorizontalAxis` - Restrict movement to horizontal only
- `restrictToWindowEdges` - Keep draggable within window bounds
- `restrictToParentElement` - Keep draggable within parent element
- `restrictToFirstScrollableAncestor` - Restrict to scrollable ancestor

### Snap to Grid Modifier

```tsx
import { createSnapModifier } from '@dnd-kit/modifiers'

const gridSize = 20 // pixels
const snapToGridModifier = createSnapModifier(gridSize)

function App() {
  return <DndContext modifiers={[snapToGridModifier]}>{/* ... */}</DndContext>
}
```

### Custom Modifier

```typescript
const gridSize = 20

function snapToGrid(args) {
  const { transform } = args

  return {
    ...transform,
    x: Math.ceil(transform.x / gridSize) * gridSize,
    y: Math.ceil(transform.y / gridSize) * gridSize,
  }
}

// Use it
<DndContext modifiers={[snapToGrid]}>{/* ... */}</DndContext>
```

---

## Sensors

Sensors detect input methods for initiating drag operations.

### Pointer Sensor

```tsx
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'

function App() {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Drag must move 8px before activating
      },
    })
  )

  return <DndContext sensors={sensors}>{/* ... */}</DndContext>
}
```

### Mouse & Touch Sensors

```tsx
import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'

function App() {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  return <DndContext sensors={sensors}>{/* ... */}</DndContext>
}
```

### Keyboard Sensor

```tsx
import { KeyboardSensor } from '@dnd-kit/core'

const sensors = useSensors(useSensor(KeyboardSensor))
```

---

## Collision Detection

Determine when draggable items overlap with droppable areas.

```tsx
import {
  closestCenter,
  closestCorners,
  rectIntersection,
  pointerWithin,
} from '@dnd-kit/core'

function App() {
  return (
    <DndContext collisionDetection={closestCenter}>
      {/* Uses center-to-center distance */}
    </DndContext>
  )
}
```

**Available Algorithms:**

- `closestCenter` - Distance between centers (default for sortable)
- `closestCorners` - Closest corner to corner distance
- `rectIntersection` - Rectangle overlap detection
- `pointerWithin` - Pointer is within droppable bounds

---

## Sortable Strategies

Control how items are positioned during sorting:

```tsx
import {
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  rectSwappingStrategy,
} from '@dnd-kit/sortable'

<SortableContext items={items} strategy={verticalListSortingStrategy}>
  {/* Vertical list */}
</SortableContext>
```

**Available Strategies:**

- `verticalListSortingStrategy` - Vertical lists
- `horizontalListSortingStrategy` - Horizontal lists
- `rectSortingStrategy` - Grid layouts (items can move in any direction)
- `rectSwappingStrategy` - Grid with swapping behavior

---

## Accessibility

dnd-kit is built with accessibility in mind:

### Keyboard Navigation

- `Space` - Pick up/drop draggable
- `Arrow keys` - Move draggable
- `Escape` - Cancel drag

### Screen Reader Announcements

```tsx
import { DndContext, announcements } from '@dnd-kit/core'

const customAnnouncements = {
  onDragStart(id) {
    return `Picked up draggable item ${id}.`
  },
  onDragOver(id, overId) {
    return `Draggable item ${id} was moved over droppable area ${overId}.`
  },
  onDragEnd(id, overId) {
    return `Draggable item ${id} was dropped over droppable area ${overId}`
  },
  onDragCancel(id) {
    return `Dragging was cancelled. Draggable item ${id} was dropped.`
  },
}

function App() {
  return (
    <DndContext accessibility={{ announcements: customAnnouncements }}>
      {/* ... */}
    </DndContext>
  )
}
```

---

## Common Patterns

### Multiple Containers (Kanban Board)

```tsx
import { DndContext, rectIntersection } from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'

function KanbanBoard() {
  const [containers, setContainers] = useState({
    todo: ['1', '2'],
    inProgress: ['3'],
    done: ['4', '5'],
  })

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return

    const activeContainer = findContainer(active.id)
    const overContainer = findContainer(over.id)

    if (!activeContainer || !overContainer) return

    if (activeContainer !== overContainer) {
      // Move between containers
      setContainers((containers) => {
        const activeItems = containers[activeContainer]
        const overItems = containers[overContainer]

        return {
          ...containers,
          [activeContainer]: activeItems.filter((item) => item !== active.id),
          [overContainer]: [...overItems, active.id],
        }
      })
    } else {
      // Reorder within container
      const items = containers[activeContainer]
      const oldIndex = items.indexOf(active.id)
      const newIndex = items.indexOf(over.id)

      setContainers((containers) => ({
        ...containers,
        [activeContainer]: arrayMove(items, oldIndex, newIndex),
      }))
    }
  }

  return (
    <DndContext collisionDetection={rectIntersection} onDragEnd={handleDragEnd}>
      {Object.keys(containers).map((containerId) => (
        <SortableContext key={containerId} items={containers[containerId]}>
          {/* Render container and items */}
        </SortableContext>
      ))}
    </DndContext>
  )
}
```

---

## Performance Tips

1. **Use CSS transforms** - Avoid layout thrashing by using transforms
2. **Memoize components** - Use `React.memo()` for sortable items
3. **Limit drag overlay complexity** - Keep drag previews lightweight
4. **Use appropriate collision detection** - Choose the right algorithm for your use case

---

## Resources

- **Official Docs:** https://docs.dndkit.com
- **GitHub:** https://github.com/clauderic/dnd-kit
- **Examples:** https://master--5fc05e08a4a65d0021ae0bf2.chromatic.com

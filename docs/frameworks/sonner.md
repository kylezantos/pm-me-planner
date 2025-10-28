# Sonner Documentation

> **Library:** sonner v2.0.7
> **Official Repo:** https://github.com/emilkowalski/sonner

An opinionated toast component for React. Minimal, customizable, and accessible.

---

## Installation

```bash
npm install sonner
# or
bun add sonner
```

---

## Basic Setup

### 1. Add Toaster Component

Add the `<Toaster />` component to your app's root:

```tsx
import { Toaster } from 'sonner'

export default function App() {
  return (
    <div>
      <Toaster />
      {/* Your app content */}
    </div>
  )
}
```

### 2. Display Toast Notifications

```tsx
import { toast } from 'sonner'

function MyComponent() {
  return (
    <button onClick={() => toast('Event has been created')}>
      Create Event
    </button>
  )
}
```

---

## Toast Types

### Success

```tsx
toast.success('Data saved successfully')
```

### Error

```tsx
toast.error('Failed to save data')

// With description
toast.error('Failed to delete item', {
  description: error.message,
})
```

### Warning

```tsx
toast.warning('Event start time cannot be earlier than 8am')
```

### Info

```tsx
toast.info('Be at the area 10 minutes before the event time')
```

### Loading

```tsx
const toastId = toast.loading('Uploading file...')
```

---

## Advanced Usage

### Toast with Description

```tsx
toast('Event has been created', {
  description: 'Monday, January 3rd at 6:00pm',
})
```

### Update Existing Toast

```tsx
const toastId = toast.loading('Uploading file...')

try {
  await uploadFile()
  toast.success('File uploaded', { id: toastId })
} catch (error) {
  toast.error('Upload failed', { id: toastId })
}
```

### Custom Duration

```tsx
toast('This will disappear in 10 seconds', {
  duration: 10000,
})

// Infinite duration (manual dismiss only)
toast('This toast will stay on screen forever', {
  duration: Infinity,
})
```

### Dismiss Toasts

```tsx
// Dismiss specific toast
const toastId = toast('Persistent message', {
  duration: Infinity,
})

setTimeout(() => {
  toast.dismiss(toastId)
}, 5000)

// Dismiss all toasts
toast.dismiss()
```

---

## Promise-based Toasts

Handle async operations with automatic state updates:

```tsx
import { toast } from 'sonner'

function AsyncOperation() {
  const fetchData = () =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ name: 'Sonner' })
      }, 2000)
    })

  const handleFetch = () => {
    toast.promise(fetchData, {
      loading: 'Loading...',
      success: (data) => `${data.name} data loaded successfully`,
      error: 'Failed to load data',
    })
  }

  return <button onClick={handleFetch}>Fetch Data</button>
}
```

### Extended Promise Options

```tsx
toast.promise(fetchUser, {
  loading: 'Loading user...',
  success: (data) => ({
    message: `Welcome ${data.name}!`,
    description: data.email,
    duration: 5000,
  }),
  error: (error) => ({
    message: 'Failed to load user',
    description: error.message,
  }),
  finally: () => {
    console.log('Promise completed')
  },
})
```

---

## Custom Content

### Custom JSX Toast

```tsx
toast(
  <div style={{ color: 'blue', fontWeight: 'bold' }}>
    <h3>Custom Toast</h3>
    <p>This is a completely custom toast</p>
  </div>
)
```

### Headless Custom Toast

Full control with access to the toast object:

```tsx
toast.custom((t) => (
  <div>
    This is a custom component{' '}
    <button onClick={() => toast.dismiss(t)}>close</button>
  </div>
))
```

### Custom Elements in Title/Description

```tsx
toast(
  () => (
    <>
      View{' '}
      <a href="https://google.com" target="_blank">
        Animation on the Web
      </a>
    </>
  ),
  {
    description: () => <button>This is a button element!</button>,
  }
)
```

---

## Styling

### Individual Toast Styling

```tsx
toast('Custom styled toast', {
  style: {
    background: '#1e40af',
    color: 'white',
    border: '2px solid #3b82f6',
  },
  className: 'my-custom-toast',
  classNames: {
    title: 'text-lg font-bold',
    description: 'text-sm',
    actionButton: 'bg-blue-500',
    cancelButton: 'bg-gray-500',
    closeButton: 'bg-red-500',
  },
})
```

### Tailwind CSS Styling

```tsx
// Individual toast
toast('Hello World', {
  unstyled: true,
  classNames: {
    toast: 'bg-blue-400',
    title: 'text-red-400 text-2xl',
    description: 'text-red-400',
    actionButton: 'bg-zinc-400',
    cancelButton: 'bg-orange-400',
    closeButton: 'bg-lime-400',
  },
})

// Global toast type styling
<Toaster
  toastOptions={{
    unstyled: true,
    classNames: {
      error: 'bg-red-400',
      success: 'text-green-400',
      warning: 'text-yellow-400',
      info: 'bg-blue-400',
    },
  }}
/>
```

### Custom Icons

```tsx
// Individual toast
toast('Hello World', {
  icon: <MyIcon />,
})

// Global icon customization
<Toaster
  icons={{
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }}
/>
```

---

## Toaster Configuration

Configure global options for all toasts:

```tsx
import { Toaster } from 'sonner'

function App() {
  return (
    <div>
      <Toaster
        position="bottom-right"
        duration={3000}
        visibleToasts={5}
        expand={true}
        richColors={true}
        closeButton={true}
        toastOptions={{
          className: 'my-toast',
          descriptionClassName: 'my-toast-description',
          style: {
            background: 'white',
            color: 'black',
          },
        }}
      />
    </div>
  )
}
```

### Toaster Props

```typescript
interface ToasterProps {
  // Position on screen
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

  // Theme
  theme?: 'light' | 'dark' | 'system'
  richColors?: boolean // Enhanced colors for toast types

  // Display
  visibleToasts?: number // Max visible toasts (default: 3)
  expand?: boolean // Expand on hover

  // Spacing
  offset?: string | number // Distance from screen edge
  gap?: number // Space between toasts

  // Controls
  closeButton?: boolean // Show close button
  duration?: number // Default duration (ms)

  // Styling
  toastOptions?: ToastOptions
  className?: string
  style?: React.CSSProperties
}
```

### Toast Options API

```typescript
interface ToastOptions {
  description?: string
  duration?: number
  position?: Position

  // Actions
  action?: {
    label: string
    onClick: () => void
  }
  cancel?: {
    label: string
    onClick: () => void
  }

  // Callbacks
  onDismiss?: (toast: Toast) => void
  onAutoClose?: (toast: Toast) => void

  // Styling
  className?: string
  classNames?: {
    toast?: string
    title?: string
    description?: string
    actionButton?: string
    cancelButton?: string
    closeButton?: string
  }
  style?: React.CSSProperties
  unstyled?: boolean

  // Visual
  icon?: React.ReactNode
  closeButton?: boolean
  dismissible?: boolean
  invert?: boolean // Dark toast in light mode (vice versa)
}
```

---

## Action Buttons

```tsx
toast('Event created', {
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo'),
  },
})

// With cancel button
toast('Are you sure?', {
  action: {
    label: 'Confirm',
    onClick: () => console.log('Confirmed'),
  },
  cancel: {
    label: 'Cancel',
    onClick: () => console.log('Cancelled'),
  },
})
```

---

## Hooks

### useSonner

Access current toast state:

```tsx
import { useSonner } from 'sonner'

function ToastMonitor() {
  const { toasts } = useSonner()

  return (
    <div>
      <p>Active toasts: {toasts.length}</p>
      <ul>
        {toasts.map((toast) => (
          <li key={toast.id}>{toast.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

---

## Common Patterns

### Form Submission Feedback

```tsx
async function handleSubmit(data) {
  const toastId = toast.loading('Saving...')

  try {
    await api.save(data)
    toast.success('Saved successfully!', { id: toastId })
  } catch (error) {
    toast.error('Failed to save', {
      id: toastId,
      description: error.message,
    })
  }
}
```

### Multi-step Process

```tsx
async function processData() {
  const toastId = toast.loading('Step 1/3: Validating...')

  await validate()
  toast.loading('Step 2/3: Processing...', { id: toastId })

  await process()
  toast.loading('Step 3/3: Saving...', { id: toastId })

  await save()
  toast.success('Complete!', { id: toastId })
}
```

---

## Best Practices

1. **Use appropriate toast types** - Match the toast type to the message intent
2. **Keep messages concise** - Short titles with optional descriptions
3. **Provide context** - Use descriptions for additional details
4. **Handle loading states** - Update loading toasts to success/error
5. **Limit visible toasts** - Use `visibleToasts` to prevent overwhelming the UI
6. **Consider duration** - Short messages can dismiss quickly, important ones should stay longer

---

## Resources

- **Official Site:** https://sonner.emilkowal.ski
- **GitHub:** https://github.com/emilkowalski/sonner
- **NPM:** https://www.npmjs.com/package/sonner

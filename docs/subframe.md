# Subframe Documentation

> **Library:** @subframe/core
> **Official Site:** https://www.subframe.com
> **Documentation:** https://docs.subframe.com

Subframe is a visual design-to-code tool that generates production-ready React + Tailwind components. Design in the visual editor, sync components to your codebase via CLI.

---

## What is Subframe?

Subframe bridges the gap between design and code by:
- Providing a visual editor to design components
- Generating clean React + TypeScript + Tailwind code
- Syncing components one-way from Subframe to your codebase
- Supporting custom business logic via wrapper patterns
- Maintaining design system consistency

**Key Principle:** Subframe components are generated artifacts that you don't edit directly. All customization happens through props, slots, or wrapper components.

---

## Installation

### 1. Initialize Subframe in Your Project

```bash
npx @subframe/cli@latest init
```

This command:
- Adds `@subframe/core` dependency to `package.json`
- Creates `subframe.config.json` configuration file
- Sets up the `@/subframe` import alias
- Configures Tailwind to include Subframe styles

### 2. Project Setup

The CLI will prompt for:
- **Project ID** - From your Subframe dashboard (format: `5552d0b05337`)
- **Component output directory** - Default: `src/subframe` (recommended)
- **Tailwind config location** - Auto-detected or specify path

### 3. Configuration File

`subframe.config.json` example:
```json
{
  "projectId": "5552d0b05337",
  "outputDir": "src/subframe",
  "tailwindConfig": "tailwind.config.js"
}
```

---

## Syncing Components

### One-Way Sync Model

**Important:** Subframe uses a one-way sync from design tool → codebase. You should NOT edit generated component files directly.

```bash
npx @subframe/cli@latest sync
```

This command:
- Fetches latest component definitions from Subframe
- Generates/updates React components in your output directory
- Preserves your custom wrapper components
- Updates types and styles

**Workflow:**
1. Design/edit components in Subframe visual editor
2. Run `npx @subframe/cli@latest sync` in your project
3. Generated components appear in `src/subframe/components/`
4. Import and use components in your app

---

## Using Components

### Import Pattern

```tsx
import { Button } from '@/subframe/components/Button'
import { Card } from '@/subframe/components/Card'
import { TextField } from '@/subframe/components/TextField'

function MyComponent() {
  return (
    <Card>
      <TextField label="Email" placeholder="you@example.com" />
      <Button>Submit</Button>
    </Card>
  )
}
```

**Import Alias:**
- `@/subframe` is configured during `init`
- Maps to your component output directory (e.g., `src/subframe`)
- Update `tsconfig.json` paths if needed:

```json
{
  "compilerOptions": {
    "paths": {
      "@/subframe/*": ["./src/subframe/*"]
    }
  }
}
```

---

## Props and Slots

Subframe components use two customization mechanisms:

### Props

Standard React props for configuration:

```tsx
<Button
  variant="primary"
  size="large"
  disabled={false}
  loading={isSubmitting}
  onClick={handleClick}
>
  Click me
</Button>
```

### Slots

Named insertion points for custom content:

```tsx
<Card>
  <Card.Header>
    <h2>Custom Header</h2>
  </Card.Header>
  <Card.Content>
    <p>Main content goes here</p>
  </Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

**Slot Pattern:**
- Slots are React children with specific names
- Allow structural customization without breaking the design
- Defined in the Subframe visual editor

---

## Adding Business Logic

### Wrapper Component Pattern

Since you can't edit generated components, create wrapper components for custom behavior:

```tsx
// src/components/SubmitButton.tsx
import { Button } from '@/subframe/components/Button'
import { useState } from 'react'

interface SubmitButtonProps {
  onSubmit: () => Promise<void>
  children: React.ReactNode
}

export function SubmitButton({ onSubmit, children }: SubmitButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      await onSubmit()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button loading={loading} onClick={handleClick}>
      {children}
    </Button>
  )
}
```

**Usage:**
```tsx
<SubmitButton onSubmit={handleFormSubmit}>
  Save Changes
</SubmitButton>
```

### Composition Pattern

Combine Subframe components with your own logic:

```tsx
import { TextField } from '@/subframe/components/TextField'
import { useForm } from 'react-hook-form'

function LoginForm() {
  const { register, handleSubmit } = useForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register('email')}
        label="Email"
        type="email"
      />
      <TextField
        {...register('password')}
        label="Password"
        type="password"
      />
    </form>
  )
}
```

---

## Theme Configuration

### Tailwind Integration

Subframe components use Tailwind utility classes. Extend the theme in `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/subframe/**/*.{js,ts,jsx,tsx}', // Include Subframe components
  ],
  theme: {
    extend: {
      colors: {
        // Subframe design tokens
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          500: '#737373',
          900: '#171717',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### Design Tokens

Subframe generates CSS custom properties for design system values:

```css
/* Generated by Subframe */
:root {
  --color-brand-primary: #0ea5e9;
  --color-brand-secondary: #0284c7;
  --spacing-base: 1rem;
  --radius-default: 0.5rem;
  --font-body: 'Inter', sans-serif;
}
```

**Access in components:**
```tsx
<div style={{ color: 'var(--color-brand-primary)' }}>
  Themed content
</div>
```

---

## Dark Mode

### Setup

Subframe supports dark mode via CSS variables and Tailwind's dark mode:

**1. Configure Tailwind:**

```js
// tailwind.config.js
export default {
  darkMode: 'class', // or 'media'
  // ... rest of config
}
```

**2. Define Dark Mode Variables:**

```css
/* styles/globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
}
```

**3. Apply Dark Mode Class:**

```tsx
// App.tsx or Layout component
import { useEffect, useState } from 'react'

function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div>
      <button onClick={() => setDarkMode(!darkMode)}>
        Toggle Dark Mode
      </button>
      {/* Your app content */}
    </div>
  )
}
```

### Subframe Components & Dark Mode

Generated components automatically support dark mode variants when you:
1. Design dark mode variants in Subframe editor
2. Run `sync` to update components
3. Apply `dark` class to root element

---

## Common Patterns

### Form Building

```tsx
import { TextField } from '@/subframe/components/TextField'
import { Button } from '@/subframe/components/Button'
import { Select } from '@/subframe/components/Select'

function UserForm() {
  return (
    <form>
      <TextField
        label="Full Name"
        placeholder="John Doe"
        required
      />
      <TextField
        label="Email"
        type="email"
        placeholder="john@example.com"
        required
      />
      <Select
        label="Role"
        options={[
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'User' },
        ]}
      />
      <Button type="submit" variant="primary">
        Create User
      </Button>
    </form>
  )
}
```

### Layout Components

```tsx
import { Stack } from '@/subframe/components/Stack'
import { Container } from '@/subframe/components/Container'

function Dashboard() {
  return (
    <Container maxWidth="lg">
      <Stack spacing={4} direction="vertical">
        <h1>Dashboard</h1>
        <Stack spacing={2} direction="horizontal">
          <MetricCard title="Users" value={1234} />
          <MetricCard title="Revenue" value="$12.3K" />
        </Stack>
      </Stack>
    </Container>
  )
}
```

### Modal Dialogs

```tsx
import { Dialog } from '@/subframe/components/Dialog'
import { Button } from '@/subframe/components/Button'
import { useState } from 'react'

function DeleteConfirmation() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="danger">
        Delete
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Dialog.Header>
          <h2>Confirm Deletion</h2>
        </Dialog.Header>
        <Dialog.Content>
          <p>Are you sure you want to delete this item?</p>
        </Dialog.Content>
        <Dialog.Footer>
          <Button onClick={() => setOpen(false)} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="danger">
            Delete
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  )
}
```

---

## Best Practices

### 1. Never Edit Generated Components

```bash
# ❌ DON'T
vim src/subframe/components/Button.tsx

# ✅ DO
# Create wrapper in src/components/
vim src/components/PrimaryButton.tsx
```

**Why:** The next `sync` will overwrite your changes.

### 2. Use Wrapper Components for Logic

```tsx
// ❌ Don't add logic to generated components
<Button onClick={async () => { /* complex logic */ }}>
  Submit
</Button>

// ✅ Create a wrapper with encapsulated logic
<SubmitButton onSubmit={handleSubmit}>
  Submit
</SubmitButton>
```

### 3. Sync Regularly

```bash
# Add to package.json scripts
{
  "scripts": {
    "sync": "npx @subframe/cli@latest sync",
    "dev": "npm run sync && vite"
  }
}
```

### 4. Version Control

**Commit generated components:**
```bash
git add src/subframe/
git commit -m "Update Subframe components"
```

**Why:** Team members can use components without running sync.

### 5. Component Organization

```
src/
├── subframe/              # Generated Subframe components (commit these)
│   └── components/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── TextField.tsx
├── components/            # Your custom components
│   ├── SubmitButton.tsx  # Wrapper around Subframe Button
│   └── LoginForm.tsx     # Composition of Subframe components
└── pages/
    └── Dashboard.tsx     # Uses both Subframe and custom components
```

---

## TypeScript Support

Subframe generates full TypeScript definitions:

```tsx
// Generated types are included
import { Button, ButtonProps } from '@/subframe/components/Button'

// Type-safe props
const props: ButtonProps = {
  variant: 'primary', // Type-checked
  size: 'large',
  disabled: false,
}

// Type-safe slots
<Card>
  <Card.Header>{/* Only accepts valid slot content */}</Card.Header>
</Card>
```

---

## Troubleshooting

### Sync Fails

**Issue:** `Error: Project not found`

**Solution:**
```bash
# Verify project ID in subframe.config.json
cat subframe.config.json

# Re-run init if needed
npx @subframe/cli@latest init
```

### Import Errors

**Issue:** `Cannot find module '@/subframe/components/Button'`

**Solution:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/subframe/*": ["./src/subframe/*"]
    }
  }
}
```

### Tailwind Styles Not Applied

**Issue:** Component renders but has no styling

**Solution:**
```js
// tailwind.config.js
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/subframe/**/*.{js,ts,jsx,tsx}', // ← Add this line
  ],
}
```

---

## CLI Commands

```bash
# Initialize Subframe in project
npx @subframe/cli@latest init

# Sync components from Subframe
npx @subframe/cli@latest sync

# Sync with specific project ID
npx @subframe/cli@latest sync --project-id abc123

# Check CLI version
npx @subframe/cli@latest --version

# Get help
npx @subframe/cli@latest --help
```

---

## Resources

- **Official Site:** https://www.subframe.com
- **Documentation:** https://docs.subframe.com
- **Visual Editor:** https://app.subframe.com
- **Examples:** https://subframe.com/examples
- **Discord Community:** https://discord.gg/subframe

# React Router Documentation

> **Library:** react-router-dom v7.9.4
> **Official Repo:** https://github.com/remix-run/react-router

Multi-strategy router for React, bridging React 18 to 19. Supports both library and framework modes.

---

## Installation

```bash
npm install react-router react-router-dom
# or
bun add react-router react-router-dom
```

---

## Basic Routing

### Declarative Routes (JSX)

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/teams/:teamId" element={<Team />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### Object-based Routes (createBrowserRouter)

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: 'shows/:showId',
        element: <Show />,
        loader: ({ params }) => fetch(`/api/show/${params.showId}.json`),
      },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}
```

---

## Navigation

### Link Component

```tsx
import { Link } from 'react-router-dom'

function Header() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/concerts/salt-lake-city">Concerts</Link>
    </nav>
  )
}
```

### NavLink (with Active Styles)

```tsx
import { NavLink } from 'react-router-dom'

function Navigation() {
  return (
    <nav>
      <NavLink
        to="/"
        end
        className={({ isActive }) => (isActive ? 'active' : '')}
      >
        Home
      </NavLink>
      <NavLink to="/trending" end>
        Trending
      </NavLink>
      <NavLink to="/account">Account</NavLink>
    </nav>
  )
}
```

### Programmatic Navigation

```tsx
import { useNavigate } from 'react-router-dom'

function LoginPage() {
  const navigate = useNavigate()

  return (
    <form
      onSubmit={() => {
        // After successful login
        navigate('/dashboard')
      }}
    >
      {/* form fields */}
    </form>
  )
}
```

**Navigation Options:**

```tsx
// Simple path
navigate('/some/route')

// With query params
navigate('/some/route?search=param')

// With object (advanced)
navigate({
  pathname: '/some/route',
  search: '?search=param',
  hash: '#hash',
  state: { some: 'state' },
})

// Go back/forward
navigate(-1) // Go back
navigate(1) // Go forward
```

---

## Route Parameters

### Dynamic Segments

```tsx
<Route path="/teams/:teamId" element={<Team />} />
```

**Access params with useParams:**

```tsx
import { useParams } from 'react-router-dom'

function Team() {
  const { teamId } = useParams()
  // teamId is available here
  return <h1>Team {teamId}</h1>
}
```

### Multiple Parameters

```tsx
<Route path="/c/:categoryId/p/:productId" element={<Product />} />
```

```tsx
function Product() {
  const { categoryId, productId } = useParams()
  // Both params available
}
```

### Catch-all (Splat) Routes

```tsx
<Route path="/files/*" element={<Files />} />
```

```tsx
function Files() {
  const params = useParams()
  const filepath = params['*'] // Everything after /files/
  return <div>File: {filepath}</div>
}
```

---

## Data Loading (Framework Mode)

### Loaders

Fetch data before rendering:

```tsx
import { createBrowserRouter, useLoaderData } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/teams/:teamId',
    loader: async ({ params }) => {
      const team = await fetchTeam(params.teamId)
      return { name: team.name }
    },
    element: <Team />,
  },
])

function Team() {
  const data = useLoaderData()
  return <h1>{data.name}</h1>
}
```

### Actions (Form Submission)

```tsx
const router = createBrowserRouter([
  {
    path: '/projects',
    action: async ({ request }) => {
      const formData = await request.formData()
      const project = await createProject(formData)
      return redirect(`/projects/${project.id}`)
    },
  },
])
```

**Use with Form component:**

```tsx
import { Form } from 'react-router-dom'

function CreateProject() {
  return (
    <Form method="post" action="/projects">
      <input type="text" name="title" />
      <button type="submit">Create</button>
    </Form>
  )
}
```

---

## Hooks

### useNavigate

```tsx
const navigate = useNavigate()

// Usage
navigate('/dashboard')
navigate(-1) // Go back
```

### useParams

```tsx
const { teamId, userId } = useParams()
```

### useLocation

```tsx
import { useLocation } from 'react-router-dom'

function Component() {
  const location = useLocation()
  // location.pathname
  // location.search
  // location.hash
  // location.state
}
```

### useSearchParams

```tsx
import { useSearchParams } from 'react-router-dom'

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q')

  const updateSearch = (value) => {
    setSearchParams({ q: value })
  }

  return (
    <input
      value={query || ''}
      onChange={(e) => updateSearch(e.target.value)}
    />
  )
}
```

### useNavigation

Track navigation state:

```tsx
import { useNavigation } from 'react-router-dom'

function Component() {
  const navigation = useNavigation()

  if (navigation.state === 'loading') {
    return <div>Loading...</div>
  }

  // navigation.state: "idle" | "loading" | "submitting"
  // navigation.location
  // navigation.formData
}
```

### useLoaderData

```tsx
const data = useLoaderData()
// Data from route's loader function
```

### useActionData

```tsx
const actionData = useActionData()
// Data returned from route's action function
```

---

## Forms

### Declarative Form Submission

```tsx
import { Form } from 'react-router-dom'

function SearchForm() {
  return (
    <Form action="/search">
      <input type="text" name="q" />
      <button type="submit">Search</button>
    </Form>
  )
}
```

**GET vs POST:**

```tsx
// GET form (appends params to URL)
<Form action="/search">
  {/* submits to /search?q=value */}
</Form>

// POST form (calls action function)
<Form method="post" action="/projects">
  {/* calls /projects action */}
</Form>
```

---

## Fetchers

Submit data without navigation (for modals, inline updates):

```tsx
import { useFetcher } from 'react-router-dom'

function TaskItem({ task }) {
  const fetcher = useFetcher()
  const isDeleting = fetcher.state !== 'idle'

  return (
    <li>
      <h2>{task.title}</h2>
      <fetcher.Form method="post" action="/delete-task">
        <input type="hidden" name="id" value={task.id} />
        <button disabled={isDeleting} type="submit">
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </fetcher.Form>
    </li>
  )
}
```

---

## Redirects

### From Loaders

```tsx
import { redirect } from 'react-router-dom'

export async function loader({ request }) {
  const user = await getUser(request)
  if (!user) {
    return redirect('/login')
  }
  return { userName: user.name }
}
```

### From Actions

```tsx
export async function action({ request }) {
  const formData = await request.formData()
  const project = await createProject(formData)
  return redirect(`/projects/${project.id}`)
}
```

---

## Nested Routes

```tsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
        children: [
          {
            path: 'stats',
            element: <Stats />,
          },
          {
            path: 'settings',
            element: <Settings />,
          },
        ],
      },
    ],
  },
])
```

**Parent component uses `<Outlet />`:**

```tsx
import { Outlet } from 'react-router-dom'

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <nav>
        <Link to="stats">Stats</Link>
        <Link to="settings">Settings</Link>
      </nav>
      <Outlet /> {/* Child routes render here */}
    </div>
  )
}
```

---

## Error Handling

```tsx
import { useRouteError } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: 'teams/:teamId',
        element: <Team />,
        loader: async ({ params }) => {
          const team = await fetchTeam(params.teamId)
          if (!team) {
            throw new Response('Not Found', { status: 404 })
          }
          return team
        },
      },
    ],
  },
])

function ErrorBoundary() {
  const error = useRouteError()

  if (error.status === 404) {
    return <div>Team not found</div>
  }

  return <div>Something went wrong</div>
}
```

---

## Index Routes

Default child route when parent path matches exactly:

```tsx
const router = createBrowserRouter([
  {
    path: '/projects',
    element: <ProjectsLayout />,
    children: [
      {
        index: true, // Renders at /projects
        element: <ProjectsList />,
      },
      {
        path: ':projectId', // Renders at /projects/:projectId
        element: <ProjectDetail />,
      },
    ],
  },
])
```

---

## Route Configuration Best Practices

### 1. Type-Safe Routes

```tsx
import type { Route } from './+types/team'

export async function loader({ params }: Route.LoaderArgs) {
  // Params are type-safe
  const team = await fetchTeam(params.teamId)
  return { name: team.name }
}

export default function Component({ loaderData }: Route.ComponentProps) {
  // loaderData is typed
  return <h1>{loaderData.name}</h1>
}
```

### 2. Lazy Loading Routes

```tsx
const router = createBrowserRouter([
  {
    path: '/dashboard',
    lazy: () => import('./routes/dashboard'),
  },
])

// In routes/dashboard.tsx
export async function loader() {
  /* ... */
}
export function Component() {
  /* ... */
}
```

### 3. Data Revalidation

```tsx
const router = createBrowserRouter([
  {
    path: '/posts/:id',
    loader: postLoader,
    shouldRevalidate: ({ currentUrl, nextUrl }) => {
      // Only revalidate if id changed
      return currentUrl.pathname !== nextUrl.pathname
    },
  },
])
```

---

## Common Patterns

### Protected Routes

```tsx
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

// Usage
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Search with Query Params

```tsx
function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  return (
    <input
      value={query}
      onChange={(e) => {
        setSearchParams({ q: e.target.value })
      }}
    />
  )
}
```

### Pagination

```tsx
function ProductsList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1')

  return (
    <div>
      {/* Products list */}
      <button onClick={() => setSearchParams({ page: page - 1 })}>
        Previous
      </button>
      <button onClick={() => setSearchParams({ page: page + 1 })}>
        Next
      </button>
    </div>
  )
}
```

---

## Migration from v5/v6

### Key Changes

1. **Component → element**
   ```tsx
   // v5
   <Route path="/" component={Home} />

   // v7
   <Route path="/" element={<Home />} />
   ```

2. **Switch → Routes**
   ```tsx
   // v5
   <Switch>...</Switch>

   // v7
   <Routes>...</Routes>
   ```

3. **useHistory → useNavigate**
   ```tsx
   // v5
   const history = useHistory()
   history.push('/dashboard')

   // v7
   const navigate = useNavigate()
   navigate('/dashboard')
   ```

---

## Resources

- **Official Docs:** https://reactrouter.com
- **GitHub:** https://github.com/remix-run/react-router
- **Migration Guide:** https://reactrouter.com/upgrading
- **API Reference:** https://reactrouter.com/api

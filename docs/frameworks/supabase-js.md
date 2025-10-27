# Supabase JavaScript Client Documentation

> **Source:** Context7 - `/supabase/supabase-js`
> **Last Updated:** 2025-10-18

## Overview

Supabase JS is an isomorphic JavaScript client for Supabase, enabling seamless interaction with your database and backend services from various JavaScript environments.

## Installation

```bash
npm install @supabase/supabase-js
```

## Initialization

### Basic Client Setup

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xyzcompany.supabase.co',
  'public-anon-key'
)
```

### With Custom Fetch

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xyzcompany.supabase.co',
  'public-anon-key',
  {
    fetch: (...args) => fetch(...args),
  }
)
```

### Client Options (TypeScript)

```typescript
type SupabaseClientOptions = {
  autoRefreshToken?: boolean;
  cookieOptions?: SupabaseAuthClientOptions["cookieOptions"];
  detectSessionInUrl?: boolean;
  fetch?: Fetch;
  headers?: GenericObject;
  localStorage?: SupabaseAuthClientOptions["localStorage"];
  multiTab?: boolean;
  persistSession?: boolean;
  realtime?: RealtimeClientOptions;
  schema?: string;
  shouldThrowOnError?: boolean;
};
```

## Database Operations

### Select Data

```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('columns')
```

### Insert Data

```typescript
const { data, error } = await supabase
  .from('table_name')
  .insert([
    { column1: 'value1', column2: 'value2' }
  ])
```

### Update Data

```typescript
const { data, error } = await supabase
  .from('table_name')
  .update({ column1: 'new_value' })
  .eq('id', 1)
```

### Delete Data

```typescript
const { data, error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', 1)
```

## Authentication

### Sign Up

```javascript
const { user, error } = await supabase.auth.signUp({
  email: 'someone@email.com',
  password: 'password',
})
```

### Sign In

```javascript
const { user, error } = await supabase.auth.signIn({
  email: 'someone@email.com',
  password: 'password',
})
```

### Sign Out

```javascript
await supabase.auth.signOut()
```

### Phone Authentication

#### Sign Up with Phone

```typescript
const { data, error } = await supabase.auth.signUpWithPhone(
  '+1234567890',
  'password',
  {
    captchaToken: 'your_captcha_token_here',
    data: {
      first_name: 'John',
      last_name: 'Doe'
    }
  }
)
```

#### Verify OTP

```typescript
const { session, user, error } = await supabase.auth.verifyOTP({
  phone: '+1234567890',
  token: '123456',
  type: 'phone_signin'
})
```

### Update User

```typescript
const { data, error } = await supabase.auth.updateUser({
  email: 'new.email@example.com',
  phone: '+1987654321',
  user_metadata: {
    display_name: 'New User Name'
  }
})
```

### Get Current User

```typescript
const { data: { user } } = await supabase.auth.getUser()
```

## Realtime Subscriptions

### Basic Subscription

```typescript
const channel = supabase
  .channel('realtime:public:todos')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'todos' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

### Subscribe to Specific Events

```typescript
// Listen for INSERT events
supabase
  .from('table_name')
  .on('INSERT', (payload) => {
    console.log('New record:', payload.new)
  })
  .subscribe()

// Listen for UPDATE events
supabase
  .from('table_name')
  .on('UPDATE', (payload) => {
    console.log('Updated:', payload.new)
    console.log('Previous:', payload.old)
  })
  .subscribe()

// Listen for DELETE events
supabase
  .from('table_name')
  .on('DELETE', (payload) => {
    console.log('Deleted:', payload.old)
  })
  .subscribe()

// Listen for all events
supabase
  .from('table_name')
  .on('*', (payload) => {
    console.log('Change:', payload)
  })
  .subscribe()
```

### Realtime Payload Structure

```typescript
interface RealtimePayload<T> {
  commit_timestamp: string;
  errors: string[] | null;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T;  // The new record (INSERT and UPDATE)
  old: T;  // The previous record (UPDATE and DELETE)
  schema: string;
  table: string;
}
```

### Managing Subscriptions

```typescript
// Get all subscriptions
const subscriptions = supabase.getSubscriptions()

// Remove specific subscription
await supabase.removeSubscription(subscription)

// Remove all subscriptions
await supabase.removeAllSubscriptions()
```

### Realtime Client Configuration

```javascript
const supabase = createClient(
  'http://127.0.0.1:54321',
  'your-anon-key',
  {
    realtime: {
      transport: window.WebSocket,
      heartbeatIntervalMs: 500,
    },
  }
)
```

## Storage Constants

```typescript
const STORAGE_KEY = 'supabase.auth.token'
```

## TypeScript Types

### Event Types

```typescript
type SupabaseEventTypes = "INSERT" | "UPDATE" | "DELETE" | "*";

type AuthChangeEvent =
  | "PASSWORD_RECOVERY"
  | "SIGNED_IN"
  | "SIGNED_OUT"
  | "TOKEN_REFRESHED"
  | "USER_UPDATED"
  | "USER_DELETED"

type EmailOTPType =
  | "signup"
  | "invite"
  | "magiclink"
  | "recovery"
  | "email_change"
```

## Browser Usage

### UMD via CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
<script>
  const { createClient } = supabase
  const _supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
  console.log('Supabase Instance: ', _supabase)
</script>
```

### ESM via CDN

```html
<script type="module">
  import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
  const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
  console.log('Supabase Instance: ', supabase)
</script>
```

## Migration Notes (v1 to v2)

### Authentication Methods

```javascript
// Old (v1)
await supabase.auth.signup('someone@email.com', 'password')
await supabase.auth.login('someone@email.com', 'password')
await supabase.auth.logout()

// New (v2)
await supabase.auth.signUp({ email: 'someone@email.com', password: 'password' })
await supabase.auth.signIn({ email: 'someone@email.com', password: 'password' })
await supabase.auth.signOut()
```

## Best Practices

1. **Always handle errors** - Check for error objects in responses
2. **Use TypeScript** - Leverage type safety with generated types
3. **Secure your keys** - Never expose service role keys in client code
4. **Implement RLS** - Use Row Level Security for data protection
5. **Subscribe efficiently** - Clean up subscriptions when components unmount
6. **Use transactions** - For operations that must succeed or fail together

## Resources

- Official Documentation: https://supabase.com/docs
- JavaScript Client Docs: https://supabase.com/docs/reference/javascript
- GitHub: https://github.com/supabase/supabase-js

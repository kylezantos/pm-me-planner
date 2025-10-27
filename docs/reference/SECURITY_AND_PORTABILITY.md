# Security & Portability Architecture

**Version:** 1.0
**Last Updated:** 2025-10-17
**Purpose:** Ensure PM Me Planner is secure, portable, and easy for others to set up with their own credentials

---

## Core Principles

1. **Zero Credentials in Code** - No API keys, passwords, or tokens ever committed to git
2. **Easy Handoff** - Anyone can clone the repo and run it with their own accounts
3. **Clear Documentation** - Setup instructions are straightforward and complete
4. **Separation of Concerns** - Development, staging, and production environments are isolated

---

## File Structure & Git Strategy

### Files That Are NEVER Committed

```
.env                          # Local environment variables
.env.local                    # Local overrides
.env.production              # Production secrets
credentials.json             # Google OAuth credentials file
token.json                   # Google OAuth access/refresh tokens
*.db                         # SQLite databases (if used for local dev)
*.sqlite                     # SQLite databases
.supabase/.env               # Supabase local development config
tauri.conf.json.local        # Local Tauri config overrides
```

### Files That ARE Committed (Templates)

```
.env.example                 # Template showing all required env vars
.gitignore                   # Comprehensive ignore rules
SETUP_GUIDE.md              # Step-by-step setup for new developers
SECURITY_AND_PORTABILITY.md # This document
```

---

## Environment Variables Strategy

### Development vs Production

We'll use Vite's environment variable system:

**Development (.env.local):**
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx
```

**Backend-only environment (.env for Tauri/Rust):**
```bash
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_REDIRECT_URI=http://localhost:1420/oauth/callback
CALENDAR_TOKEN_SECRET=change_me
```

**Production (Tauri build):**
- Environment variables injected at build time
- Or stored in OS keychain/secure storage via Tauri plugins

### Variable Naming Convention

- `VITE_` prefix = Available in frontend React code (non-sensitive only)
- No prefix = Backend/Rust only (Tauri commands, keep secrets here)
- Sensitive data (client secrets, encryption keys) **must not** use `VITE_`

---

## Google OAuth Credentials Management

### Setup Process

1. **Developer creates their own Google Cloud project**
2. **Downloads OAuth credentials JSON**
3. **Stores it locally** (git-ignored location)
4. **App reads from local file** or environment variable

### Two Approaches:

#### Approach 1: File-Based (Simpler)
```
/credentials/
  google-oauth.json          # Git-ignored
  google-oauth.example.json  # Committed template
```

#### Approach 2: Environment Variable (More Portable)
```bash
# Frontend (.env.local)
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:1420/oauth/callback

# Backend (.env or OS keychain)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_REDIRECT_URI=http://localhost:1420/oauth/callback
CALENDAR_TOKEN_SECRET=change_me
```

**Recommendation:** Use environment variables split between frontend and backend for portability and security

---

## Supabase Configuration

### Local Development

Each developer creates their own Supabase project and uses their own credentials:

```bash
# .env.local
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # For admin operations
```

### Database Schema Migrations

**Committed to repo:**
- `supabase/migrations/*.sql` - All schema changes
- `supabase/seed.sql` - Sample data for testing

**Workflow:**
1. Developer runs migrations locally against their own Supabase project
2. Migrations are version-controlled and shared
3. Each developer's data is isolated to their own project

---

## Tauri Security Considerations

### Secure Storage for Tokens

Use Tauri's secure storage plugins for sensitive data:

```rust
// Store OAuth tokens securely in OS keychain
use tauri_plugin_store::StoreBuilder;

// Example: Store Google OAuth refresh token
store.set("google_refresh_token", token);
```

### API Endpoint Restrictions

Tauri allows calling Rust commands from frontend:

```rust
#[tauri::command]
async fn get_supabase_key() -> String {
    // Only accessible from Tauri app, not external JS
    std::env::var("SUPABASE_SERVICE_ROLE_KEY").unwrap()
}
```

This keeps service role keys out of frontend code.

---

## .gitignore Configuration

### Comprehensive .gitignore

```gitignore
# Environment Variables
.env
.env.local
.env.production
.env.*.local

# Google OAuth
credentials.json
token.json
oauth-credentials/

# Supabase
.supabase/.env
.supabase/.temp/

# Tauri
src-tauri/target/
src-tauri/Cargo.lock

# Databases
*.db
*.sqlite
*.sqlite3

# Logs
*.log
logs/

# OS Files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Build artifacts
dist/
dist-ssr/
src-tauri/target/
```

---

## Setup Documentation Structure

### SETUP_GUIDE.md (To Be Created)

Will include:

1. **Prerequisites**
   - Node.js installation
   - Rust installation
   - Supabase account creation
   - Google Cloud project setup

2. **Environment Setup**
   - Copy `.env.example` to `.env.local`
   - Fill in Supabase credentials
   - Add Google OAuth credentials
   - Optional: Add Anthropic API key

3. **Database Setup**
   - Run Supabase migrations
   - Seed test data

4. **First Run**
   - `npm install`
   - `npm run tauri dev`

5. **Google Calendar Connection**
   - OAuth flow walkthrough
   - Connecting multiple calendars

---

## Credential Handoff Checklist

When sharing the repo with someone else:

### What You Do:
- [ ] Remove all `.env*` files from your local copy
- [ ] Verify `.gitignore` is properly configured
- [ ] Ensure no credentials in committed code
- [ ] Update `.env.example` with all required variables
- [ ] Document any special setup steps in SETUP_GUIDE.md
- [ ] Test clean clone in fresh directory

### What They Do:
- [ ] Clone repository
- [ ] Copy `.env.example` to `.env.local`
- [ ] Create their own Supabase project
- [ ] Run Supabase migrations
- [ ] Create their own Google Cloud project
- [ ] Download OAuth credentials
- [ ] Add credentials to `.env.local`
- [ ] Run `npm install`
- [ ] Run `npm run tauri dev`

---

## Multi-User Scenarios

### Scenario 1: Open Source Release
- **Public repo** with no credentials
- Users follow SETUP_GUIDE.md
- Each user has isolated data in their own Supabase project

### Scenario 2: Team Development
- **Private repo** with shared Supabase project
- Each developer has own Google OAuth credentials
- Shared database for collaboration (optional)
- Use Supabase Row Level Security (RLS) for multi-user access

### Scenario 3: Your Personal Use
- **Private repo**
- Your credentials in `.env.local` (git-ignored)
- Your Supabase project
- Your Google Calendar connections

---

## Security Best Practices

### 1. Never Log Sensitive Data
```typescript
// BAD
console.log('Supabase key:', import.meta.env.VITE_SUPABASE_ANON_KEY);

// GOOD
console.log('Supabase connection:', !!import.meta.env.VITE_SUPABASE_ANON_KEY ? 'configured' : 'missing');
```

### 2. Validate Environment Variables on Startup
```typescript
// src/lib/env.ts
export function validateEnv() {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_GOOGLE_CLIENT_ID',
  ];

  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}
```

### 3. Use Supabase Row Level Security (RLS)
```sql
-- Only users can access their own data
CREATE POLICY "Users can only access their own blocks"
ON block_instances
FOR ALL
USING (auth.uid() = user_id);
```

### 4. Rotate Credentials Regularly
- Google OAuth: Can be revoked/regenerated in Google Cloud Console
- Supabase keys: Can be reset in Supabase dashboard
- Document rotation process in SETUP_GUIDE.md

---

## Testing Portability

### Before First Commit:
1. Clone repo to a new directory
2. Follow SETUP_GUIDE.md from scratch
3. Verify app runs with new credentials
4. Check that no credentials leak in git history

### Automated Checks:
```bash
# Check for accidentally committed secrets
npm install -D @secretlint/secretlint-rule-preset-recommend
npx secretlint "**/*"

# Verify .env files are ignored
git status --ignored | grep ".env"
```

---

## Future Considerations

### Phase 11+ Enhancements:
- **Backup/Restore**: Export/import settings without credentials
- **Multi-Profile**: Switch between work/personal profiles
- **Credential Vault**: Use 1Password/Bitwarden CLI for credential management
- **CI/CD**: GitHub Actions with encrypted secrets

---

## Related Documentation

- **implementation-plan.md** - Overall project plan
- **SETUP_GUIDE.md** - Step-by-step setup (to be created in Phase 1)
- **DATABASE_SCHEMA.md** - Database structure (to be created in Phase 2)
- **.env.example** - Environment variable template (to be created in Phase 1)

---

**Document Status:** Initial Plan
**Next Steps:** Implement in Phase 1 during project setup

# Subframe Integration Guide

This document outlines the procedures and best practices for integrating Subframe UI components into the PM Me Planner project.

## Quick Reference

**For PM Me Planner Developers:**
- **Initialize Subframe**: `npx @subframe/cli@latest init -p 5552d0b05337`
- **Sync Components**: `npx @subframe/cli@latest sync`
- **Example Code**: See `subframe-page-code.md` for full dashboard page export
- **Import Path**: Components will be available at `@/ui/components/*` (configurable)

## Overview

Subframe is a design-to-code platform that works with TypeScript, React, and Tailwind CSS. It uses two distinct workflows:
1. **Component Syncing** - CLI-based automatic sync for design system components (source of truth in Subframe)
2. **Page Copy/Paste** - Manual copy/paste for pages that require business logic and customization

## Prerequisites

- TypeScript
- React
- Tailwind CSS
- Node.js with npm/yarn/pnpm/bun

## Initial Installation

**Quick Start for PM Me Planner:**
If you're setting up this specific project, skip to [Step 4: Project-Specific Setup](#step-4-project-specific-setup) which uses the project-specific command.

### Step 1: Run Subframe CLI Init (Generic)

For reference, the generic Subframe initialization command is:

```bash
npx @subframe/cli@latest init
```

**Note:** For PM Me Planner, use the project-specific command in Step 4 instead.

### Step 2: Authentication

When prompted, visit `https://app.subframe.com/cli/auth` to get your access token:

```
> No existing credentials found.
> To get new credentials, please visit the following URL in your web browser:
> https://app.subframe.com/cli/auth

> You will need to login then enter the provided credentials below.
? Access token ›
```

Copy and paste your access token from the browser.

### Step 3: Configuration

Accept defaults or customize as needed:

```
Where should the Subframe components be synced to? › ./src
Configure an alias for the subframe component directory (e.g. @/ui) › @/ui/*
Do you want Subframe to configure your Tailwind config? › (Y/n)
Would you like to sync all of your Subframe components? › (Y/n)
Would you like to install dependencies? › (Y/n)
```

**Recommended settings for this project:**
- Component directory: `./src/ui`
- Alias: `@/ui/*`
- Auto-configure Tailwind: Yes
- Sync all components: Yes
- Install dependencies: Yes

### Step 4: Project-Specific Setup

For the PM Me Planner project, use the project-specific initialization command:

```bash
npx @subframe/cli@latest init -p 5552d0b05337
```

This command:
- Connects to the PM Me Planner Subframe project (`5552d0b05337`)
- Automatically configures the correct project settings
- Syncs all components from the shared design system
- Ensures consistency across all development environments

**Note:** This command replaces the generic `init` command in Step 1 for this project. New developers should use this command instead.

## Component Workflow (Synced Components)

Components are the building blocks of your design system and are **automatically synced** from Subframe to your codebase.

### Using Components in Code

1. Open Subframe and click the **Components** tab in the top nav
2. Click on the component you want (in left sidebar or middle panel)
3. Copy the import and usage code
4. Paste into your React files

**Example:**
```tsx
import { Button } from "@/ui/components/Button";

function MyPage() {
  return <Button variant="primary">Click me</Button>;
}
```

### Syncing Component Updates

When you make changes to components in Subframe, sync them to your codebase:

```bash
npx @subframe/cli@latest sync
```

**Key Principles:**
- ✅ Subframe is the **source of truth** for components
- ✅ Changes in Subframe automatically sync to code
- ❌ Don't manually edit synced component files (changes will be overwritten)
- ✅ Customize components via props and composition, not by editing source

### When to Sync

- After creating new components in Subframe
- After modifying existing component designs
- After updating component props or variants
- When pulling changes from team members' Subframe updates

## Page Workflow (Copy/Paste)

Pages are **never synced automatically** because they require custom business logic and refactoring.

### Exporting Pages from Subframe

1. Open the page editor in Subframe
2. Click **Code** in the top-right nav to open the code panel
3. By default, shows code for the entire page
4. Optionally, select individual elements to get code for just that selection

**The code panel shows:**
1. Snippet to install/sync required components
2. List of imports
3. Generated React + Tailwind CSS code

### Adding Pages to Your Codebase

1. **Copy the component install/sync snippet** (if new components are needed):
   ```bash
   npx @subframe/cli@latest sync
   ```

2. **Copy the imports** and add to your page file:
   ```tsx
   import { Button } from "@/ui/components/Button";
   import { Card } from "@/ui/components/Card";
   // ... etc
   ```

3. **Copy the generated JSX** and paste into your page component

4. **Refactor and customize:**
   - Add state management (useState, useReducer, Zustand, etc.)
   - Connect to APIs and data sources
   - Add event handlers and business logic
   - Integrate with routing
   - Add TypeScript types for props and data

### Example: PM Me Planner Dashboard Page

The file `subframe-page-code.md` contains the full exported code for the PM Me Planner dashboard page from Subframe. This serves as a reference example of what a complete page export looks like.

**Key observations from the exported code:**

1. **"use client" directive**: Exported as Next.js client component (can be removed for other frameworks)

2. **Component imports**: All Subframe components are imported from `@/ui/components/`:
   ```tsx
   import { Avatar } from "@/ui/components/Avatar";
   import { Button } from "@/ui/components/Button";
   import { TextField } from "@/ui/components/TextField";
   // ... etc
   ```
   **Note:** Update the import alias to match your configuration (e.g., `@/subframe/components/`)

3. **Icon imports**: Feather icons from `@subframe/core`:
   ```tsx
   import { FeatherHome } from "@subframe/core";
   import { FeatherSettings } from "@subframe/core";
   ```

4. **Component structure**: The page is a complete, self-contained React component with:
   - Sidebar navigation (SidebarRailWithIcons)
   - Task backlog panel (left side)
   - Calendar view (main area)
   - All placeholder content and styling

**How to use this exported code:**

1. Create a new page file: `src/pages/Dashboard.tsx`
2. Copy the entire content from `subframe-page-code.md`
3. Update the import paths if needed (the example already uses `@/ui/components/*`)
4. Remove `"use client"` if not using Next.js
5. Replace placeholder event handlers with real functionality:
   ```tsx
   // Before (exported)
   onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}

   // After (with business logic)
   onClick={handleAddTask}
   ```
6. Connect to your Supabase data:
   ```tsx
   // Replace hardcoded tasks with real data
   const { data: tasks } = useQuery(['tasks'], fetchTasks);
   ```
7. Add state management for interactive features
8. Integrate with your routing and navigation

See `subframe-page-code.md` for the complete exported code example.

### Updating Pages After Design Changes

If you modify the design in Subframe after exporting:

**Option 1: Selective Re-export (Recommended)**
1. Select only the changed elements in Subframe
2. Copy the code for just that selection
3. Replace the corresponding section in your code

**Option 2: Full Re-export**
1. Re-export the entire page
2. Manually merge your business logic back in
3. More time-consuming, use sparingly

**Option 3: Manual Code Changes**
- For small changes (spacing, colors, text), many developers find it faster to edit code directly
- Good for minor tweaks that don't require designer involvement

### Best Practices for Page Management

- ✅ Do all major design iterations in Subframe before first export
- ✅ Plan your page structure and component usage upfront
- ✅ Use Subframe components (not hardcoded HTML) for easier updates
- ✅ Keep business logic separate from presentation where possible
- ✅ Comment sections that were exported from Subframe for easy identification
- ❌ Avoid frequent full page re-exports (merge conflicts and lost work)
- ❌ Don't expect pages to stay in sync like components

## Workflow Integration with PM Me Planner

### Component Organization

```
src/
├── ui/                 # Synced Subframe components (auto-generated)
│   └── components/
│       ├── Avatar.tsx
│       ├── Button.tsx
│       ├── TextField.tsx
│       └── ...
├── components/         # Custom app components
│   ├── Calendar/
│   ├── BlockManager/
│   └── ...
├── pages/             # App pages (copy/paste from Subframe + custom logic)
│   ├── Dashboard.tsx
│   ├── BlockEditor.tsx
│   └── ...
└── lib/               # Utilities, API clients, types
```

**Import Path Configuration:**

During initialization, you'll configure an alias for Subframe components. For PM Me Planner, we use:
- Directory: `./src/ui`
- Alias: `@/ui/*`

This means imports will look like:
```tsx
import { Button } from "@/ui/components/Button";
import { Avatar } from "@/ui/components/Avatar";
```

The alias must be configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/ui/*": ["./src/ui/*"]
    }
  }
}
```

### Development Workflow

1. **Design Phase**
   - Create/update components in Subframe
   - Design page layouts in Subframe
   - Get design approval before export

2. **Initial Implementation**
   - Run `npx @subframe/cli@latest sync` to get latest components
   - Copy/paste page code from Subframe
   - Add to version control

3. **Feature Development**
   - Add business logic to pages
   - Connect to Supabase, Google Calendar APIs
   - Add state management with Zustand/Jotai
   - Implement Tauri commands for native features

4. **Design Updates**
   - Sync component changes: `npx @subframe/cli@latest sync`
   - For page changes: selective re-export and merge
   - Test thoroughly after merging design updates

### Version Control

**Files to Commit:**
- ✅ Synced component files (`src/ui/`)
- ✅ Page files with custom logic (`src/pages/`)
- ✅ Subframe configuration (`.subframe/sync.json`)
- ✅ Updated Tailwind config (if modified by Subframe)

**Merge Conflict Strategy:**
- **Component files**: Accept incoming changes (Subframe is source of truth)
- **Page files**: Carefully merge (your business logic is source of truth)
- **Config files**: Review changes, may need manual merge

### Team Collaboration

When working with multiple Claude Code agents or team members:

1. **Before starting work**: `npx @subframe/cli@latest sync`
2. **After Subframe changes**: Communicate to team, run sync
3. **Page exports**: Coordinate to avoid duplicate work
4. **Component usage**: Always import from `@/ui/components/`, never copy/paste component code

## Troubleshooting

### Installation Issues

If `npx @subframe/cli@latest init` fails, try:

1. Check prerequisites (Node.js, TypeScript, React, Tailwind)
2. Ensure you're in the project root
3. Verify network connectivity for authentication
4. Consult framework-specific guides:
   - [Next.js](https://docs.subframe.com/framework-guides/nextjs)
   - [Vite](https://docs.subframe.com/framework-guides/vite)
   - [Astro](https://docs.subframe.com/framework-guides/astro)
   - [Manual setup](https://docs.subframe.com/framework-guides/manual)

### Component Import Errors

If components fail to import:

1. Verify the alias is configured in `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/ui/*": ["./src/ui/*"]
       }
     }
   }
   ```

2. Run `npx @subframe/cli@latest sync` to ensure components are up to date

3. Check that `@subframe/core` is installed in `package.json`

### Styling Issues

If Tailwind classes aren't working:

1. Ensure Subframe configured your `tailwind.config.js` during init
2. Verify the content paths include Subframe components:
   ```js
   module.exports = {
     content: [
       "./src/**/*.{js,ts,jsx,tsx}",
       "./src/ui/**/*.{js,ts,jsx,tsx}",
     ],
     // ...
   }
   ```

3. Restart your dev server after config changes

## Disabling Sync

If you need to temporarily disable automatic syncing:

See [Disabling sync documentation](https://docs.subframe.com/developing/disabling-sync) for details.

## Additional Resources

- [Subframe Documentation](https://docs.subframe.com/)
- [Installation Guide](https://docs.subframe.com/installation)
- [Using Components](https://docs.subframe.com/developing/using-components)
- [Copy & Paste Pages](https://docs.subframe.com/developing/copy-paste-pages)
- [Adding Business Logic](https://docs.subframe.com/developing/adding-business-logic)
- [Props and Slots](https://docs.subframe.com/developing/props-and-slots)

## Summary: Key Takeaways

**Components (Synced):**
- ✅ Source of truth: Subframe
- ✅ Update method: CLI sync
- ❌ Don't manually edit synced files

**Pages (Copy/Paste):**
- ✅ Source of truth: Your codebase
- ✅ Update method: Selective re-export or manual edits
- ✅ Add business logic freely

**General:**
- Always sync components before starting work
- Design iterations happen in Subframe before export
- Keep pages and components conceptually separate
- Use Subframe components in pages for consistency and easier updates

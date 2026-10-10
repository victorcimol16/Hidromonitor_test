# AI Rules & Project Guidelines

## Tech Stack
- **React 19**: Modern UI library utilizing concurrent features, improved hooks, and native support for document metadata.
- **TypeScript**: Strongly typed JavaScript ensuring type safety, robust interfaces, and self-documenting code across the application.
- **TanStack Start**: Full-stack React framework powered by TanStack Router, TanStack Query, and Nitro, supporting Server-Side Rendering (SSR) and server functions.
- **TanStack Router**: Fully type-safe routing with automatic route tree generation, nested layouts, and search parameter validation.
- **TanStack Query (React Query)**: Powerful asynchronous state management, caching, and data fetching for server state.
- **Tailwind CSS v4**: Utility-first CSS framework for rapid, responsive, and modern styling with native CSS variables.
- **Supabase**: Backend-as-a-Service (BaaS) providing PostgreSQL database, authentication, and real-time subscriptions.
- **@modelcontextprotocol/sdk**: Official MCP SDK powering the `/mcp` endpoint that lets AI agents read/manage the signed-in user's data.

There is no component library (no shadcn/ui, no Radix, no icon library) and no form library. Every screen is hand-rolled Tailwind + plain React state. This is deliberate — see the rules below before reaching for a new dependency.

---

## Library Usage Rules

### 1. Routing & Navigation
- **What to use**: **TanStack Router** (`@tanstack/react-router`).
- **Rules**:
  - Define routes in `src/routes/` using file-based routing (e.g., `src/routes/index.tsx`, `src/routes/auth.login.tsx`). Deep dynamic hierarchies use directory nesting (e.g., `src/routes/_authenticated/dashboard/condominios/$condominioId/index.tsx`).
  - Use `createFileRoute` to define routes. Keep route files thin — they wire up `head`/`validateSearch`/params and render a component from `src/features/*`; the actual UI and logic live in the feature folder, not the route file.
  - Use the `<Link>` component from `@tanstack/react-router` for all internal navigation.
  - Do **NOT** install or use React Router or other routing libraries.

### 2. Data Fetching & Server State
- **What to use**: **TanStack Query** (`@tanstack/react-query`).
- **Rules**:
  - Use `useMutation` for Supabase auth/data calls (see `src/features/auth/hooks/*`) and `useQuery` for real backend reads (see `src/features/dashboard/hooks/useReadings.ts`).
  - Keep server state synchronized using query invalidation (`queryClient.invalidateQueries`) or a Supabase Realtime subscription (see `useReadings.ts`).
  - Do **NOT** use `useEffect` for data fetching.
  - Client-only mock data with no backend yet (e.g. `useCondominios`, `useBlocos`, `useDispositivos` in `src/features/dashboard/hooks/`) is the one exception: a small `useState` + `localStorage` hook, shaped like the real table it stands in for, so swapping in a real Supabase-backed query later is a drop-in change.

### 3. Database & Authentication
- **What to use**: **Supabase** (`@supabase/supabase-js`).
- **Rules**:
  - Use the pre-configured Supabase client in `src/integrations/supabase/client.ts` for client-side database queries and authentication.
  - Use `src/integrations/supabase/client.server.ts` for server-side operations.
  - Leverage Supabase Auth for user registration, login, and session management.
  - The MCP endpoint (`src/routes/mcp.ts`, `src/lib/mcp/`) validates bearer tokens directly against Supabase Auth (`verify-bearer-token.ts`) — the Supabase project's own OAuth 2.1 Server issues those tokens, not this app.

### 4. Styling & Layout
- **What to use**: **Tailwind CSS v4**, applied directly — no component library sits between Tailwind and the markup.
- **Rules**:
  - Use Tailwind utility classes for all layouts, spacing, colors, and typography. Reference theme tokens (`bg-card`, `text-muted-foreground`, `border-input`, etc.) defined in `src/styles.css`, not raw hex, except for the handful of literal brand hex values already centralized in `src/lib/brand.ts`.
  - Keep custom CSS to a minimum. If custom styles or animations are needed, add them to `src/styles.css` using Tailwind directives.
  - Ensure responsive design using Tailwind's responsive modifiers (`sm:`, `md:`, `lg:`, etc.).
  - **Before writing a new styled element, check for an existing hand-rolled primitive first**: `AuthInput`/`AuthButton` (`src/features/auth/components/`), `SelectField`, `Modal`, `ConfirmDialog`, `StatTile`, `EmptyState`, `WidgetCard` (`src/features/dashboard/components/`). If you find yourself copy-pasting the same className string into a third file, that's the signal to extract a shared component instead — don't let the same visual pattern drift across files.

### 5. Icons
- **What to use**: Hand-rolled SVG icon components in `src/components/icons/`, exported from the shared `index.ts` barrel.
- **Rules**:
  - Each icon is a small function component (`(props: React.SVGProps<SVGSVGElement>) => <svg {...props}>...</svg>`) following the existing files as a template — `stroke="currentColor"`, `strokeWidth="2"`, `strokeLinecap`/`strokeLinejoin="round"`, default `18`–`20`px.
  - Do **NOT** install an icon library (Lucide, Heroicons, etc.). Add new icons by following the pattern already in `src/components/icons/`.

### 6. Forms & Validation
- **What to use**: Plain React `useState` per field, with validation written inline in the submit handler (see `LoginForm`, `SignupForm`, `DeviceForm`, `CondominioForm`).
- **Rules**:
  - Do **NOT** install React Hook Form or `@hookform/resolvers`. There's no shadcn `<Form>` wrapper to integrate with.
  - **Zod** (`zod`) is used, but not for form state — it validates TanStack Router search params (`validateSearch`) and MCP tool input schemas. Keep using it there; don't wire it into forms unless the project actually adopts a form library later.

### 7. State Management
- **What to use**: Built-in React state, TanStack Router search params, and TanStack Query.
- **Rules**:
  - Use `useState` and `useReducer` for local, component-specific UI state.
  - Use TanStack Router search parameters for URL-driven state (e.g., pagination, filters, active tabs).
  - Use TanStack Query for server-derived state; use the `localStorage`-hook pattern (see §2) for mocked data that doesn't have a backend yet.
  - Do **NOT** introduce Redux, Zustand, or other global state managers unless explicitly requested.

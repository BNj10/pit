# PIT Enroll — Project Instructions

## Direction and Sources of Truth

- Build a role-based enrollment and academic records portal with three portal roles: students, department chairs, and deans. The Administrator maintains the system through direct database access, creates all accounts, and has no portal UI. See [docs/adr/0001-three-portal-roles.md](docs/adr/0001-three-portal-roles.md).
- Use [GLOSSARY.md](GLOSSARY.md) for domain vocabulary. Update it when a term is settled.
- The current stage is UI implementation with preview data. The shared portal shell and student Academic Records screen exist; authentication and database integration are pending.
- Read [README.md](README.md) for setup and [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) for status, priorities, dependencies, and completion criteria. Update them when implemented behavior changes.
- Use `role-config.ts` and `types/sidebar-types.ts` for the current role and navigation vocabulary. A navigation entry does not mean its route is implemented or authorized.
- Use `de73435c-7278-4869-ae39-ba644826491b/pencil-new.pen` as the current design reference. Design labels such as Administrator, Registrar, Faculty, and Supervisor are not portal roles; map them to the roles in ADR 0001 and the glossary before implementing them.
- Preserve unrelated work in progress. Trace existing behavior and invariants before editing; reuse the responsible component, helper, or platform feature before adding new structure.

## Next.js Version Rules

- Follow `AGENTS.md`. Read the relevant installed guides in `node_modules/next/dist/docs/` before writing Next.js code; do not rely on conventions from older releases.
- Keep the generated Next.js instruction block in `AGENTS.md`.
- The project currently has separate root layouts under `app/(auth)` and `app/(main)`. Preserve that structure unless the task requires a deliberate change; each root layout owns its `html` and `body` tags.

## Stack

- Next.js 16 App Router, React 19, and TypeScript in strict mode
- Tailwind CSS 4, shadcn/ui with Radix primitives, and Lucide icons
- PostgreSQL and Supabase as the planned data and authentication platform
- Supabase CLI is installed for local development. Application Supabase clients and Zod are not installed yet; add them when the corresponding integration requires them.

## Package Manager

- Use **npm** as the only package manager for this project.
- Do not use `pnpm`, `yarn`, or `bun`.
- Use `package-lock.json` as the dependency lockfile.
- Do not create `pnpm-lock.yaml`, `yarn.lock`, `bun.lock`, or `bun.lockb`.
- When installing dependencies, use `npm install`.
- When adding a package, use `npm install <package-name>`.
- When adding a development dependency, use `npm install -D <package-name>`.

## Commands

### Install dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

### Lint

```bash
npm run lint
```

### Build

```bash
npm run build
```

## Coding Rules

- Use TypeScript.
- Prefer Server Components by default.
- Use Client Components only when client-side behavior is required.
- Reuse existing components before creating new ones.
- Prefer existing shadcn/ui primitives when appropriate.
- Avoid introducing unnecessary dependencies.
- Validate external and user input using Zod.
- Perform authoritative validation on the server when accepting input; client validation is for feedback. Install Zod with npm when implementing the first validated boundary.
- Keep database operations server-side.
- Keep sensitive credentials and environment variables out of client-side code.
- Follow KISS — Keep It Simple.
- Follow DRY — Don't Repeat Yourself.
- Apply SOLID principles where appropriate without overengineering.
- Keep feature UI files inside the owning route's `components/` folder, for example `app/(main)/student/academic-records/components/`. Keep the route's `page.tsx` focused on composition and server data loading.
- Reserve `page.tsx`, `layout.tsx`, `route.ts`, and other Next.js special filenames for actual routing behavior. Use descriptive component filenames inside `components/`; a `components/page.tsx` can create an unintended public route.
- Keep shared portal UI in `components/shared/sidebar/`, reusable UI primitives in `components/ui/`, shared server logic and helpers in `lib/`, and shared types in `types/`. The route colocation rule does not require placing database or authorization logic inside UI components.
- Keep `role-config.ts` as the owner of portal labels, destinations, and active-link behavior; avoid duplicating these mappings in feature components.
- If a new style is needed for a separate design, put it in a stylesheet colocated with the route, for example `app/(main)/department-chair/curricula-and-subjects/curricula-and-subjects.css`, imported by that route's `page.tsx` or `layout.tsx`. Do not add feature styles to `app/globals.css`: feature branches that all edit it conflict on merge. Keep `globals.css` for design tokens, base styles, and styles shared across features. Route stylesheets stay loaded after navigation, so namespace every selector, for example `.academic-records-*`. Reuse existing design tokens and avoid global element or shared primitive overrides for a single screen.
- Preserve the existing server-rendered record content passed into the interactive Academic Records controls. Add Client Components only for state, events, and browser APIs.
- Provide meaningful loading, empty, error, pending, and disabled states where relevant. Preserve keyboard navigation, focus visibility, accessible labels, status announcements, and responsive table access.

## Preview Data and Domain Rules

- Store created feature types/interfaces, typed mock datasets, and their associated exports in the project-root `types/` directory, rather than defining data contracts or fixtures inline in route/component files. Use descriptive files such as `academic-records-types.ts`, `academic-records-mocks.ts`, and `academic-records-exports.ts`.
- Define the data structure first, then make mocks conform to it using type annotations or `satisfies`; avoid type assertions that hide incompatible mock data. Functions and components should receive this typed data through parameters or props, matching the structure expected from a future API response.
- Keep type definitions separate from runtime mock values, and use `import type` / `export type` for type-only dependencies. Replacing mocks with validated API data should preserve the receiving function/component contract; TypeScript types do not replace runtime validation of API responses.
- Keep preview users, terms, subjects, grades, and GPA values clearly identified as fixtures. Do not treat the hard-coded academic year as the current institutional term.
- A URL segment selects the preview shell; it does not establish an authenticated role. The current logout callback is not connected to a session, and refreshing Academic Records does not fetch live records.
- Preserve the distinction between no record, an unpublished grade (`null` or still a draft; students see Pending), and a published grade, including INC and DROP. Do not convert missing values to zero or infer a pass/fail result without an approved grading policy.
- Confirm the institution's grade scale, GPA weighting and rounding, term lifecycle, enrollment transitions, review authority, prerequisites, and unit limits before encoding them as production rules. Design examples are not policy.

## Authentication and Database Rules

- Use Supabase Auth when implementing sessions; do not build a separate password or session system.
- Resolve identity and roles from a verified session and trusted server-controlled data. Never authorize from the pathname, hidden navigation, submitted role fields, or user-editable metadata.
- Check session, role, and record ownership close to each protected query or mutation. Server Actions and Route Handlers must enforce their own checks; a layout or Proxy redirect alone is insufficient.
- Keep application database queries in server-only modules. Pass only the fields needed by client components, and avoid caching private records across users.
- Keep publishable Supabase configuration distinct from secret/service-role credentials. Never expose secret keys through `NEXT_PUBLIC_*`, logs, browser bundles, or committed files.
- Introduce schema changes through versioned SQL in `supabase/migrations/`. Enable Row Level Security and explicit policies on application tables exposed through Supabase before connecting real data; use constraints for relational integrity and uniqueness.
- Enforce enrollment transitions and capacity rules atomically in the database where concurrent requests can race. Disabling a button is not duplicate-submission protection.
- Use synthetic local seed data. Database resets delete local data; do not reset a developer's database without authorization or apply destructive schema changes as routine validation.

## Dependency Management

Before installing a new dependency:

1. Check whether the required functionality already exists in the project.
2. Check whether it can be implemented using the existing stack.
3. Avoid installing multiple libraries that solve the same problem.
4. Use npm for all dependency operations.

Install packages only when needed; these are command examples, not a required dependency list:

```bash
npm install zod
npm install lucide-react
npm install -D prettier
```

Do not use:

```bash
pnpm install
pnpm add
yarn
yarn add
bun install
bun add
```

## Before Finishing

Before considering a task complete, run:

```bash
npm run lint
npm run build
```

Resolve relevant linting, TypeScript, or build errors introduced by the changes before finishing.

Use the smallest additional proof appropriate to the behavior: inspect affected screens at desktop and mobile sizes for UI work; exercise unauthorized access and ownership boundaries for auth; verify migrations, RLS, and concurrent mutations for database work. Do not add tests that only repeat implementation details.

For documentation-only work, verify commands, file links, and status claims against the repository. Record pre-existing check failures separately from failures introduced by the task. Do not expand the task into unrelated code repairs or claim a blocked build passed.

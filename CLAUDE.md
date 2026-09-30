# Project Instructions

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- PostgreSQL
- Supabase
- Supabase CLI for local development

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
- Keep database operations server-side.
- Keep sensitive credentials and environment variables out of client-side code.
- Follow KISS — Keep It Simple.
- Follow DRY — Don't Repeat Yourself.
- Apply SOLID principles where appropriate without overengineering.

## Dependency Management

Before installing a new dependency:

1. Check whether the required functionality already exists in the project.
2. Check whether it can be implemented using the existing stack.
3. Avoid installing multiple libraries that solve the same problem.
4. Use npm for all dependency operations.

Examples:

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
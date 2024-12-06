# LST (LiveStreaming Tools)

...

## Development Setup

1. Install dependencies:

```bash
bun install
```

2. Run initial setup (installs git hooks and generates types):

```bash
bun run setup
```

3. Start development servers:

```bash
bun run dev
```

## Type Generation

The project uses both Prisma and Supabase, with automatic type generation:

- **Prisma Types**: Generated from `backend/prisma/schema.prisma`
- **Supabase Types**: Generated from your Supabase project schema

### Automatic Generation

Types are automatically generated:

- When running `bun run setup`
- On each git commit (via husky pre-commit hook)

### Manual Generation

If you need to generate types manually:

```bash
# Generate both Prisma and Supabase types
bun run generate-types

# Generate only Prisma types
bun run generate:prisma

# Generate only Supabase types
bun run generate:supabase
```

### Generated Files

The following files are automatically generated and should not be edited manually:

- `web/app/types/supabase.ts`
- `backend/prisma/generated/*`

These files are git-ignored and will be regenerated as needed.

...

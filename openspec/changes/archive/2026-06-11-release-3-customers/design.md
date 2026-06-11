# Design: Release 3 — Customers

## Technical Approach

Integrate Better Auth with Prisma adapter. Rename `User` → `user` + `@@map("User")` preserving existing table. Auth on `/ingresar` with RHF + Zod (single-page toggle). Route protection via Next.js 16 `proxy.ts`. Customer dashboard: order history, profile, guest-order linking via `databaseHooks.user.create.after`. All user-facing text in Spanish (Argentina).

## Architecture Decisions

| Decision | Option A | Option B | Tradeoff | Choice & Rationale |
|----------|----------|----------|----------|---------------------|
| Form errors | Zod inline on `min-h-[1.5rem]` containers | Zod only | Inline errors push layout without reserved space | **Option A**: Pattern used in `CustomerStep.tsx` and cart. Prevents CLS. |
| Auth errors (network/API) | Sonner toast | Inline errors | Inline mixes validation with business logic | **Sonner**: Already used in cart + checkout. Separates UX concerns. `toast.error("message")`. |
| Route protection | `proxy.ts` (Next.js 16) | `middleware.ts` | Middleware is legacy in Next 16 | **proxy.ts**: Next 16 pattern. Cookie check, no Node.js runtime issues. |
| Session in RSC | `auth.api.getSession({ headers })` | Context wrapper | Context adds indirection for simple reads | **Direct import**: Largo is small; direct call keeps auth colocated. |
| Name field on registration | None (email only) | Required | UX says 1-step, users add name later from profile | **None**: User explicitly requested. Name added via `/account/profile`. |
| Password storage | `account.password` (Better Auth convention) | Keep `User.passwordHash` | BA convention avoids dual-hash complexity | **BA convention**: `passwordHash` column goes dead. Migrations don't touch it. |

## Data Flow

```
Browser → proxy.ts (session check) → /account/* or redirect /ingresar
Browser → /ingresar → RHF + Zod → fetch auth API → Better Auth → DB
                                     ↓ success
                                  sonner toast + redirect /account
                                     
Registration → BA hook → UPDATE Order SET userId WHERE customerEmail = ? AND userId IS NULL
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modify | Rename `User` → `user` + `@@map("User")`. Add `session`, `account`, `verification` tables (BA schema). Remove `passwordHash`, `emailVerified` from user model. |
| `src/lib/auth/config.ts` | Create | Better Auth config: Prisma adapter + email/password plugin + `databaseHooks.user.create.after` |
| `src/lib/auth/client.ts` | Create | `createAuthClient()` for client components |
| `src/app/proxy.ts` | Create | Session cookie check: redirect `/account/*` → `/ingresar`; `/ingresar` authenticated → `/account` |
| `src/app/api/auth/[...all]/route.ts` | Create | Better Auth API handler |
| `src/app/(auth)/ingresar/page.tsx` | Create | Single-page toggle (Sign In / Sign Up). RHF + Zod forms. Error space reserved. |
| `src/features/customers/schemas.ts` | Create | `signInSchema`, `signUpSchema`, `profileSchema`, `passwordSchema` (Zod) |
| `src/features/customers/actions.ts` | Create | `signUpAction`, `signInAction`, `signOutAction`, `updateProfileAction`, `changePasswordAction` |
| `src/features/customers/queries.ts` | Create | `getCustomerOrders`, `getCustomerOrderByNumber` |
| `src/app/account/layout.tsx` | Create | Dashboard layout with sidebar/nav |
| `src/app/account/orders/page.tsx` | Create | Order history — server component, most recent first |
| `src/app/account/orders/[orderNumber]/page.tsx` | Create | Order detail — reuses `OrderDetail` component |
| `src/app/account/profile/page.tsx` | Create | Name update + change password forms |
| `src/components/layout/Header.tsx` | Modify | Auth-aware: "Ingresar" (guest) vs "Mi cuenta" + "Salir" (authenticated) |
| `src/app/(auth)/layout.tsx` | Create | Auth layout — minimal, no Header/Footer |
| `package.json` | Modify | Add `better-auth`, `@better-auth/prisma-adapter` |

## Interfaces / Contracts

```typescript
// src/features/customers/schemas.ts
const signInSchema = z.object({
  email: z.email({ error: "Ingresá un email válido" }),
  password: z.string().min(8, { error: "La contraseña debe tener al menos 8 caracteres" }),
});

const signUpSchema = signInSchema; // same fields

const profileSchema = z.object({
  name: z.string().min(1, { error: "El nombre es obligatorio" }),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, { error: "La contraseña debe tener al menos 8 caracteres" }),
});
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Zod schemas, form validation | Vitest: test boundary cases (empty, invalid email, short password) |
| Integration | Guest order linking hook | Prisma test instance: create order, register user, assert link |
| E2E | Auth flow (sign up, sign in, redirect) | Playwright: `/ingresar` → register → `/account` → sign out → `/ingresar` |

## Migration / Rollout

- **DB migration**: Non-destructive — `@@map("User")` preserves table + data. `passwordHash` column goes dead (not removed). New tables (`session`, `account`, `verification`) are additive.
- **Packages**: `better-auth` + `@better-auth/prisma-adapter` added to `package.json`.
- **Existing guest orders**: Unaffected. `userId` stays null until same-email registration triggers the hook.
- **Rollback**: Revert migration; remove `proxy.ts`, `(auth)/`, `account/`, `api/auth/[...all]/`; uninstall BA packages.

## Open Questions

- None

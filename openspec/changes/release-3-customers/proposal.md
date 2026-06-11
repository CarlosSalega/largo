# Proposal: Release 3 — Customers

## Intent

Add authentication and customer accounts to Largo. Visitors register/login to access order history and manage profiles. Guest orders placed before registration must link automatically to the new account.

## Scope

### In Scope
- Better Auth integration (email/password) with Prisma adapter
- Schema migration: `User` → `user` + `@@map("User")`, new `session`, `account`, `verification` tables
- Single-page auth UI with Sign In / Sign Up toggle (1-step UX, 2–3 fields max)
- Route protection via `proxy.ts` (Node.js runtime)
- Customer dashboard: order history, order detail
- Profile management: name update, password change
- Guest order linking on registration (server-side `databaseHooks.user.create.after`)
- Auth-aware Header showing session state + "Mi cuenta" link
- User-facing text in Spanish (Argentina), per i18n config

### Out of Scope
- Email verification flow (MVP deferred)
- Social login, magic links (future enhancement)
- Multi-step registration wizard
- Admin authentication (Release 4)
- Password reset via email

## Non-goals
- Two-factor authentication
- Account deletion / deactivation
- Cart preservation across auth states (Zustand + localStorage is independent)

## Capabilities

### New Capabilities
None — all auth features extend existing capabilities.

### Modified Capabilities
- `customers` — refine registration, authentication, profile, order history, and guest order linking requirements with Better Auth scenarios, single-page toggle UX, and proxy-based route protection.

## Approach

Integrate Better Auth with Prisma adapter. Rename `User` → `user` preserving table via `@@map("User")`. Store password via `account.password` (Better Auth convention); existing `passwordHash` column becomes vestigial. Link guest orders server-side via `databaseHooks.user.create.after` hook. Protect `/account/*` routes with `proxy.ts`. Single `(auth)/page.tsx` toggles Sign In / Sign Up forms with React Hook Form + Zod validation.

## PR Slices

| # | Name | Files | Est. Lines | Complexity |
|---|------|-------|------------|------------|
| 1 | Schema + Auth Config | ~6 new, ~2 mod | ~200 | Medium |
| 2 | Auth Pages + Proxy | ~6 new, ~2 mod | ~400 | Medium |
| 3 | Customer Dashboard | ~6 new, ~1 mod | ~400 | Medium |
| 4 | Profile + Polish | ~5 new | ~300 | Low |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modified | Rename User → user, add session/account/verification |
| `src/lib/auth/` | New | Client, config, types |
| `src/app/(auth)/` | New | Single-page toggle UI |
| `src/app/account/` | New | Protected dashboard routes |
| `src/app/api/auth/[...all]/` | New | Better Auth handler |
| `src/features/customers/` | New | Queries, actions, components |
| `src/proxy.ts` | New | Route protection |
| `src/components/Header.tsx` | Modified | Auth-aware session display |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Schema migration data loss | Low | `@@map("User")` preserves table; dead `passwordHash` column harmless |
| Better Auth + Prisma 7 compat edge | Low | Adapter uses PrismaClient instance, no direct schema dependency |
| Session/cookie namespace conflict | Low | Better Auth uses isolated cookie prefix; no existing auth cookies |

## Rollback Plan

Revert Prisma migration, remove `proxy.ts`, delete `(auth)/` and `account/` route groups. Guest checkout and public storefront are independent of auth — no impact.

## Dependencies

- `better-auth`, `better-auth/adapters/prisma`, `better-auth/next-js` (npm packages)
- Existing Prisma 7 + Neon setup

## Success Criteria
- [ ] Customer registers (name + email + password) in 1 step and is authenticated
- [ ] Customer signs in (email + password) in 1 step and sees dashboard
- [ ] `/account/*` routes return 401/redirect when unauthenticated
- [ ] Order history shows only owning customer's orders
- [ ] Guest orders link on same-email registration (hook-triggered, server-side)
- [ ] Profile name and password updateable from account dashboard

# Tasks: Release 3 — Customers

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~950 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Schema migration + Better Auth config | PR 1 | Base: main. Foundation for all auth. |
| 2 | Auth pages + proxy route protection | PR 2 | Base: PR 1. Core sign-in/up UX. |
| 3 | Customer dashboard (orders, detail) | PR 3 | Base: PR 2. Requires valid session. |
| 4 | Profile management + Header polish | PR 4 | Base: PR 3. Completes customer feature. |

## PR 1 — Schema + Auth Config

- [x] 1.1 Install `better-auth` and `@better-auth/prisma-adapter` in `package.json`
- [x] 1.2 Modify `prisma/schema.prisma`: rename `User` → `user` + `@@map("User")`, drop `passwordHash`/`emailVerified`, add `session`/`account`/`verification` models per BA schema
- [x] 1.3 Run `pnpm db:migrate` — verify non-destructive (table preserved, new tables created)
- [x] 1.4 Create `src/lib/auth/config.ts` — BA config with Prisma adapter, email/password plugin, `databaseHooks.user.create.after` for guest order linking
- [x] 1.5 Create `src/lib/auth/client.ts` — `createAuthClient()` for client components
- [x] 1.6 Create `src/app/api/auth/[...all]/route.ts` — BA `toNextJsHandler()` API route
- [x] 1.7 Add `BETTER_AUTH_SECRET` to `.env.example`

## PR 2 — Auth Pages + Proxy

- [x] 2.1 Create `src/features/customers/schemas.ts` — `signInSchema`, `signUpSchema` (email + password ≥8 chars, Spanish error messages)
- [x] 2.2 Create `src/features/customers/actions.ts` — `signInAction`, `signUpAction`, `signOutAction` (Server Actions with try/catch, `{ success, error }` shape)
- [x] 2.3 Create `src/app/(auth)/layout.tsx` — minimal auth layout, centered card, no Header/Footer
- [x] 2.4 Create `src/app/(auth)/ingresar/page.tsx` — single-page toggle Sign In / Sign Up, RHF + zodResolver, `min-h-[1.5rem]` error space, sonner for network/auth toasts
- [x] 2.5 Create `src/proxy.ts` — session cookie check: redirect `/account/*` → `/ingresar` (guest), `/ingresar` → `/account` (authenticated)

## PR 3 — Customer Dashboard

- [ ] 3.1 Create `src/features/customers/queries.ts` — `getCustomerOrders(userId)` most-recent-first, `getCustomerOrderByNumber(userId, orderNumber)` via Prisma
- [ ] 3.2 Create `src/app/account/layout.tsx` — dashboard layout with sidebar nav (Orders, Profile) and sign-out button
- [ ] 3.3 Create `src/app/account/orders/page.tsx` — server component: fetch orders via `auth.api.getSession({ headers })`, list or "Todavía no hiciste ningún pedido" empty state
- [ ] 3.4 Create `src/app/account/orders/[orderNumber]/page.tsx` — order detail page: items, shipping, payment status; "Pedido no encontrado" for missing orders

## PR 4 — Profile + Polish

- [ ] 4.1 Add `updateProfileAction` and `changePasswordAction` to `src/features/customers/actions.ts`
- [ ] 4.2 Create `src/app/account/profile/page.tsx` — name form + password change form (current + new ≥8 chars), `min-h-[1.5rem]` error space, sonner feedback
- [ ] 4.3 Modify `src/components/layout/Header.tsx` — auth-aware: "Ingresar" (guest) vs "Mi cuenta" + "Salir" (authenticated) via `auth.api.getSession({ headers })`
- [ ] 4.4 Verify full auth flow manually: register → dashboard → order history → profile → sign out → sign in — cover all 20 delta spec scenarios
- [ ] 4.5 Run `pnpm build` — verify zero type errors, all new routes compile and are reachable

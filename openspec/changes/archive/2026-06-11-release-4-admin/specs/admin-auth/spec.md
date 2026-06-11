# Admin Auth Specification

## Purpose

ADMIN role enforcement for `/admin/*` routes via proxy.ts and a reusable `requireAdmin()` guard for Server Components and Server Actions.

## Requirements

### REQ-ADM-01: Admin Route Protection
El sistema SHALL redirigir a usuarios sin rol ADMIN fuera de `/admin/*` desde `proxy.ts`.

#### Scenario: Admin accede sin problemas
- GIVEN una sesión válida con rol ADMIN
- WHEN se accede a cualquier ruta `/admin/*`
- THEN la página solicitada se renderiza normalmente

#### Scenario: No-admin es redirigido
- GIVEN una sesión de CUSTOMER o sin sesión
- WHEN se accede a cualquier ruta `/admin/*`
- THEN el usuario es redirigido a `/ingresar`

#### Scenario: Sin sesión es redirigido
- GIVEN no existe sesión activa
- WHEN se accede a cualquier ruta `/admin/*`
- THEN el usuario es redirigido a `/ingresar`

### REQ-ADM-02: requireAdmin() Helper
El sistema SHALL proveer un helper `requireAdmin()` que obtenga la sesión, verifique el rol ADMIN y redirija si no corresponde, retornando `{ id, name }` si es válido.

#### Scenario: Admin autorizado
- GIVEN una sesión con rol ADMIN
- WHEN `requireAdmin()` es invocada desde un Server Component o Server Action
- THEN retorna `{ id, name }` del usuario autenticado

#### Scenario: Usuario no autorizado
- GIVEN una sesión con rol CUSTOMER
- WHEN `requireAdmin()` es invocada
- THEN redirige a `/ingresar`

### REQ-ADM-03: Admin Link en Header Público
El sistema SHALL mostrar un enlace "Admin" en el Header cuando el usuario tiene rol ADMIN.

#### Scenario: Admin ve el enlace
- GIVEN una sesión con rol ADMIN
- WHEN se renderiza el Header público
- THEN se muestra un enlace "Admin" que dirige a `/admin`

#### Scenario: Customer no ve el enlace
- GIVEN una sesión con rol CUSTOMER
- WHEN se renderiza el Header público
- THEN no se muestra el enlace "Admin"

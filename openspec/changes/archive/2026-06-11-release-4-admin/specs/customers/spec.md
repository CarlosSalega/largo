# Delta for Customers

## ADDED Requirements

### REQ-CUST-13: requireAdmin() Utility
El sistema SHALL proveer un helper `requireAdmin()` exportado desde `src/lib/auth/utils.ts` para reutilizar la verificación de rol ADMIN en Server Components y Server Actions.

#### Scenario: Admin autorizado
- GIVEN una sesión con rol ADMIN
- WHEN `requireAdmin()` es invocada
- THEN retorna `{ id, name }` del usuario

#### Scenario: Rol no autorizado
- GIVEN una sesión con rol CUSTOMER o sin sesión
- WHEN `requireAdmin()` es invocada
- THEN redirige a `/ingresar`

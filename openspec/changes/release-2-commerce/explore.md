# Exploración: Release 2 — Commerce

> **Fecha**: 2026-06-10
> **Dominios**: Cart, Checkout, Orders, Payments (MercadoPago)
> **Estado pre-R2**: R1 completado y archivado. Homepage, Catalog, Product Detail funcionando. Botón "Add to cart" renderizado pero con lógica no-op.

---

## 1. Mapa de Dominios

### 1.1 Cart (7 requisitos, cart/spec.md)

| Requisito | Escenarios | Complejidad |
|-----------|-----------|-------------|
| Add Product to Cart | Producto nuevo (qty=1), Producto existente (qty+1) | Baja |
| Update Quantity | Incrementar, decrementar, excede stock (rechazo) | Media |
| Remove Product | Eliminar ítem, recalcular totales | Baja |
| Cart Totals | Subtotal = Σ(precio × cantidad) | Baja |
| Cart Persistence | Persiste tras refresh, sesión nueva = vacío | Media |
| Empty Cart | Estado vacío con link al catálogo | Baja |
| Proceed to Checkout | Carrito con ítems → checkout, vacío → botón oculto/disabled | Baja |

**Decisión arquitectónica clave**: El carrito NO se persiste en base de datos. Es session-based vía cookies o localStorage para el MVP (decisión documentada en `openspec/changes/archive/2026-06-10-domain-model-prisma-schema/design.md`). Esto simplifica el guest checkout pero impone límites de tamaño (~4KB para cookies, ~5MB para localStorage).

### 1.2 Checkout (8 requisitos, checkout/spec.md)

| Requisito | Escenarios | Complejidad |
|-----------|-----------|-------------|
| Customer Information | Formulario email, nombre, teléfono | Baja |
| Guest Checkout | Sin autenticación, opción crear cuenta post-compra | Baja |
| Shipping Information | Dirección completa (street, city, state, zip, country) | Baja |
| Order Summary | Mostrar ítems, cantidades, precios, total | Baja |
| Pending Order Creation | Crear Order PENDING, reservar stock, limpiar carrito | Alta |
| Stock Insufficient | Rechazar orden si stock < cantidad | Media |
| MP Preference Creation | Crear preferencia MP con ítems y total | Alta |
| Redirect to MP | Redirigir a hosted checkout de MP | Media |
| Return URLs | Success → order success page, Failure → retry page | Media |

**Acoplamiento**: Checkout depende directamente del Cart (lee los ítems) y de Orders/Payments (crea ambas entidades en una transacción). Es el punto de integración más complejo.

### 1.3 Orders (7 requisitos, orders/spec.md)

| Requisito | Escenarios | Complejidad |
|-----------|-----------|-------------|
| Order Creation | Datos de cliente, shipping, snapshots de productos | Media |
| Order Items Snapshot | Precio histórico congelado al momento de compra | Baja (modelo ya lo soporta) |
| Order Statuses | PENDING → PAID / CANCELLED / REFUNDED | Media |
| Stock Reservation | Reservar al crear, liberar al cancelar | Alta |
| Order Retrieval | GET by ID, información completa | Baja |
| Order History | Listado ordenado por fecha descendente | Baja |

**Modelo existente**: `Order`, `OrderItem`, `Address` ya están definidos en Prisma. `OrderStatus` enum ya existe (PENDING, PAID, CANCELLED, REFUNDED). `orderNumber` es `@unique String` — requiere estrategia de generación.

### 1.4 Payments (7 requisitos, payments/spec.md)

| Requisito | Escenarios | Complejidad |
|-----------|-----------|-------------|
| MP Checkout Pro | Crear preferencia, redirigir a MP | Alta |
| Webhook Reception | Recibir POST de MP, responder HTTP 200 | Alta |
| Payment Validation | Consultar API de MP para confirmar estado real | Alta |
| Order Status Update | Actualizar Order según pago (approved → PAID, rejected → CANCELLED) | Alta |
| Duplicate Prevention | Idempotencia vía eventId único | Media |
| Payment Record | Almacenar provider, providerId, status, amount, timestamp | Baja |
| Webhook Event Logging | Loggear payload completo para auditoría | Baja |

**Modelo existente**: `Payment` y `WebhookEvent` ya definidos. `Payment.providerPreferenceId` y `Payment.providerPaymentId` son opcionales (se llenan progresivamente). `WebhookEvent.eventId` tiene constraint `@unique` para dedup.

---

## 2. Flujo de Datos — Happy Path Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. CART (cliente)                                                   │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐               │
│  │ Add to   │───▶│ Client   │───▶│ cookies /        │               │
│  │ Cart btn │    │ State    │    │ localStorage     │               │
│  └──────────┘    └──────────┘    └──────────────────┘               │
│       ↑                               │                             │
│       │ ProductStock.tsx              │ Cart Page lee de acá         │
│       │ (ya existe, botón no-op)      ▼                             │
│                                    Cart UI                           │
└────────────────────────────────────┬────────────────────────────────┘
                                     │ "Proceed to checkout"
                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. CHECKOUT (server + client)                                       │
│  ┌──────────────┐   ┌──────────────┐   ┌───────────────────┐        │
│  │ Customer     │──▶│ Shipping     │──▶│ Order Summary     │        │
│  │ Form         │   │ Form         │   │ (lee del cart)    │        │
│  └──────────────┘   └──────────────┘   └────────┬──────────┘        │
│                                                  │ "Confirm"         │
│                                                  ▼                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Server Action: confirmCheckout()                              │   │
│  │  1. Validar stock (con lock/transacción)                      │   │
│  │  2. CREATE Order (PENDING) + OrderItems + Address + Payment   │   │
│  │  3. Reservar stock (UPDATE Product.stock -= quantity)         │   │
│  │  4. Limpiar carrito                                           │   │
│  │  5. CREATE MercadoPago Preference                             │   │
│  │  6. Retornar URL de redirect a MP                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                  │                   │
└──────────────────────────────────────────────────┼───────────────────┘
                                                   │ redirect
                                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. PAGO (MercadoPago — externo)                                     │
│  ┌──────────────────────┐         ┌──────────────────────┐          │
│  │ Usuario paga en MP   │         │ MP redirige a:       │          │
│  │ (hosted checkout)    │         │ /checkout/success    │          │
│  │                      │         │ /checkout/failure    │          │
│  └──────────────────────┘         └──────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
                   │
                   │ MP envía webhook (POST)
                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. WEBHOOK (server)                                                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ POST /api/webhooks/mercadopago                                │   │
│  │  1. Recibir payload                                           │   │
│  │  2. Guardar en WebhookEvent (eventId dedup)                   │   │
│  │  3. Validar contra MP API (GET /payments/{id})                │   │
│  │  4. Si approved:                                              │   │
│  │     - Order.status → PAID                                     │   │
│  │     - Payment.status → APPROVED                               │   │
│  │     - Payment.providerPaymentId ← MP payment ID               │   │
│  │     - Payment.paidAt ← now()                                  │   │
│  │  5. Si rejected:                                              │   │
│  │     - Order.status → CANCELLED                                │   │
│  │     - Payment.status → REJECTED                               │   │
│  │     - Liberar stock (UPDATE Product.stock += quantity)        │   │
│  │  6. Responder HTTP 200                                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Puntos de Integración

### 3.1 MercadoPago Checkout Pro SDK

**Estado actual**: El SDK de MercadoPago NO está instalado. No hay dependencia en `package.json`.

**Opciones**:
- **Opción A: SDK oficial `mercadopago` (npm)** — El paquete `mercadopago` v2.x para Node.js. Provee `new MercadoPagoConfig({ accessToken })` y `new Preference(client)`. Pros: tipado, manejo de errores, oficial. Contras: bundle size (~200KB), posible overhead.
- **Opción B: REST API directa** — POST a `https://api.mercadopago.com/checkout/preferences` con `Authorization: Bearer {token}`. Pros: cero dependencias, control total. Contras: sin tipado, manejo manual de errores.

**Recomendación preliminar**: Opción A (SDK oficial). Para un MVP con una sola integración de pago, el SDK reduce riesgos de implementación incorrecta.

**Archivos necesarios**:
```
src/lib/mercadopago/
├── client.ts        # Config singleton (access token de env)
├── preferences.ts   # createPreference(order)
└── payments.ts      # getPayment(paymentId) — para validación webhook
```

**Variables de entorno necesarias**:
```
MERCADOPAGO_ACCESS_TOKEN=TEST-xxx o APP_USR-xxx
MERCADOPAGO_WEBHOOK_SECRET= (para validar firma del webhook)
NEXT_PUBLIC_SITE_URL=http://localhost:3000 (para return URLs)
```

### 3.2 Webhook Endpoint

Ruta: `POST /api/webhooks/mercadopago`

**Consideraciones de seguridad**:
- MP envía `x-signature` y `x-request-id` en headers
- Validar firma con `MERCADOPAGO_WEBHOOK_SECRET` (clave secreta configurada en dashboard MP)
- No confiar ciegamente en el payload — siempre re-consultar MP API para confirmar estado

**Consideraciones de desarrollo local**:
- MP no puede llamar a `localhost` → necesario usar ngrok, Cloudflare Tunnel, o similar
- Alternativa: simular webhooks manualmente con curl en desarrollo

### 3.3 Idempotencia

Ya modelado en Prisma: `WebhookEvent.eventId` es `@unique`. Flujo:
1. Recibir webhook → extraer `eventId`
2. Intentar `INSERT INTO WebhookEvent` con eventId
3. Si falla por unique constraint → webhook ya procesado → responder 200 y salir
4. Si éxito → procesar pago → marcar `processed = true`

---

## 4. Riesgos e Incógnitas

### 4.1 Riesgos Técnicos

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|-------------|------------|
| **Race condition en reserva de stock** | Alto | Media | Usar `prisma.$transaction` con lectura atómica + update where `stock >= quantity`. Considerar `SELECT ... FOR UPDATE` si Prisma lo soporta. |
| **Webhook no llega (MP downtime)** | Alto | Baja | Order queda en PENDING. MP tiene reintentos automáticos. Agregar polling manual como fallback post-MVP. |
| **Webhook duplicado corrompe estado** | Alto | Media | Ya mitigado con `WebhookEvent.eventId @unique`. |
| **Firma de webhook no validada** | Crítico | Baja si se implementa | Implementar validación de `x-signature` desde día 1. |
| **MercadoPago SDK incompatible con Next.js edge** | Medio | Baja | Usar `runtime = "nodejs"` en el webhook route handler. |
| **Currency mismatch: USD vs ARS** | Medio | Alta | `formatPrice` usa USD. Payment model default ARS. MercadoPago opera en ARS por defecto. Necesitamos definir moneda del store. |
| **Cart persiste en cookies → excede 4KB** | Bajo | Media | Usar localStorage como storage primario, cookies solo para ID de sesión. |
| **Order.orderNumber único — generación** | Medio | Alta | ¿UUID? ¿Secuencial con prefijo? ¿Basado en timestamp? El campo es `String @unique`. |

### 4.2 Preguntas sin Responder (antes de la fase de diseño)

1. **Moneda del store**: ¿USD, ARS, o multi-moneda? El seed tiene precios en USD pero el Payment model tiene `currency @default("ARS")`. Esto debe ser consistente.

2. **Estrategia de cart persistence**: ¿localStorage + Zustand? ¿Cookies con serialize/deserialize? ¿Ambos (cookies como fallback)?

3. **Formato de orderNumber**: ¿`ORD-20260610-XXXX`? ¿UUID corto? ¿Secuencial desde DB?

4. **Return URLs después del pago**: ¿Cómo sabe la success page qué orden mostrar? Opciones: query param (`?orderId=xxx`), external_reference en MP preference, o session.

5. **Manejo de stock 0 durante el pago**: Si un usuario tarda 15 min en pagar y otro compra el último ítem, ¿qué pasa? ¿MP tiene timeout de preferencia? ¿Cancelamos la orden tras N minutos?

6. **Validación server-side de stock en add-to-cart**: ¿Consultamos la DB en cada add-to-cart, o confiamos en el stock mostrado al usuario y validamos solo en checkout?

7. **Webhook en desarrollo**: ¿Usamos ngrok? ¿Túnel de Cloudflare? ¿Simulamos con scripts?

---

## 5. Estrategia de Slices (PR Budget ~400 líneas)

Siguiendo el patrón de R1 (3 PRs encadenados), propongo 4 slices. Los PRs 1 y 2 pueden correr en paralelo si hay dos personas; si no, respetar el orden.

### Slice 1: Cart Foundation (~350-400 líneas)
**Dependencias**: Ninguna (R1 ProductStock ya tiene el botón)
**Objetivo**: Carrito funcional con UI completa

```
Archivos nuevos:
├── src/features/cart/
│   ├── store.ts              # Zustand store con persistencia localStorage
│   ├── types.ts              # CartItem, CartState
│   ├── queries.ts            # getProductCartInfo (stock + price actual)
│   └── components/
│       ├── CartDrawer.tsx    # Drawer/sheet con ítems
│       ├── CartItem.tsx      # Fila de ítem (qty controls, remove)
│       ├── CartIcon.tsx      # Ícono en header con badge de cantidad
│       └── EmptyCart.tsx     # Estado vacío
├── src/app/(public)/cart/
│   └── page.tsx              # Página de carrito completa

Archivos modificados:
├── src/components/layout/Header.tsx    # Agregar CartIcon
├── src/features/product-detail/
│   └── components/ProductStock.tsx     # Conectar botón "Add to cart" al store
└── package.json                        # Agregar zustand
```

**Validación**: Add/remove/update productos, persistencia tras refresh, badge en header, totals correctos.

### Slice 2: Checkout UI + Order Creation (~400 líneas)
**Dependencias**: Slice 1 (lee del cart store)
**Objetivo**: Formulario de checkout que crea Orden pendiente

```
Archivos nuevos:
├── src/features/checkout/
│   ├── queries.ts            # createOrder, reserveStock
│   ├── validation.ts         # Zod schemas (customer, shipping)
│   ├── actions.ts            # Server Action: confirmCheckout
│   └── components/
│       ├── CheckoutForm.tsx  # Form wizard (customer → shipping → confirm)
│       ├── CustomerStep.tsx
│       ├── ShippingStep.tsx
│       ├── OrderSummary.tsx  # Lee del cart store
│       └── ConfirmStep.tsx
├── src/app/(public)/checkout/
│   ├── page.tsx              # Página de checkout (server component wrapper)
│   ├── success/
│   │   └── page.tsx          # Post-pago success (simple por ahora)
│   └── failure/
│       └── page.tsx          # Post-pago failure (retry)

Archivos modificados:
├── package.json              # Agregar react-hook-form, zod
```

**Validación**: Formulario multi-step, validación Zod, Order + OrderItems + Address creados en DB, stock reservado, carrito limpiado.

### Slice 3: MercadoPago Integration (~350 líneas)
**Dependencias**: Slice 2 (Order creada)
**Objetivo**: Preferencia MP, redirect al checkout hosted, webhook receiver

```
Archivos nuevos:
├── src/lib/mercadopago/
│   ├── client.ts             # MP SDK config singleton
│   └── preferences.ts        # createPreference(order)
├── src/features/payments/
│   ├── actions.ts            # Server Action: createPreferenceAndRedirect
│   └── queries.ts            # getPaymentByOrderId
├── src/app/api/webhooks/mercadopago/
│   └── route.ts              # POST handler (recibir, validar, procesar)
├── src/features/orders/
│   └── queries.ts            # getOrderById, updateOrderStatus, releaseStock

Archivos modificados:
├── src/features/checkout/actions.ts  # Integrar MP preference creation
├── package.json                       # Agregar mercadopago SDK
├── .env.example                        # Agregar MP env vars
└── next.config.ts                     # Si necesita config extra
```

**Validación**: Preferencia MP creada, redirect funciona, webhook recibido, Order.status cambia a PAID/CANCELLED, idempotencia.

### Slice 4: Order Display + Polish (~200 líneas)
**Dependencias**: Slice 3 (órdenes ya tienen status real)
**Objetivo**: Páginas de orden y refinamientos

```
Archivos nuevos:
├── src/features/orders/
│   └── components/
│       ├── OrderCard.tsx      # Tarjeta resumen
│       └── OrderDetail.tsx   # Vista detallada
├── src/app/(public)/orders/[id]/
│   └── page.tsx              # Orden individual (pública, guest-accessible)

Archivos modificados:
├── src/app/(public)/checkout/success/page.tsx  # Mostrar Order real
├── src/app/(public)/checkout/failure/page.tsx  # Mostrar opción retry
```

**Validación**: Order detail muestra items, status, total. Success page muestra confirmación con número de orden.

---

## 6. Dependencias y Paralelismo

```
Slice 1 (Cart) ─────────────┐
                             ├──▶ Slice 2 (Checkout) ──▶ Slice 3 (MP) ──▶ Slice 4 (Display)
                             │
(Slice 2 UI forms) ─────────┘  ← puede arrancar en paralelo con Slice 1
                                (formularios sin backend, solo UI + Zod)
```

**Qué puede ser paralelo**:
- Slice 1 (Cart) y el UI-only de Slice 2 (formularios CheckoutForm, CustomerStep, ShippingStep sin Server Action)
- `src/lib/mercadopago/client.ts` se puede configurar temprano (no depende de nada)
- `src/features/orders/queries.ts` (consultas de lectura) se pueden escribir en cualquier momento

**Qué DEBE ser secuencial**:
- Slice 2 backend (Server Action `confirmCheckout`) requiere Slice 1 completo
- Slice 3 (MP preference, webhook) requiere Slice 2 backend
- Slice 4 (display) requiere Slice 3 (órdenes con status real)

---

## 7. Decisiones Clave Pendientes

Antes de entrar en la fase de diseño (`sdd-design`), necesitamos resolver:

| # | Decisión | Opciones | Impacto |
|---|----------|----------|---------|
| 1 | **Moneda del store** | USD, ARS, o configuración en DB | Afecta `formatPrice`, `Payment.currency`, MP preference |
| 2 | **Cart state management** | Zustand + localStorage, Jotai, React Context + cookies | Afecta arquitectura del Slice 1 |
| 3 | **Formato orderNumber** | `ORD-{timestamp}-{random}`, `ORD-{seq}`, UUID corto | Afecta createOrder y UI |
| 4 | **MP SDK vs REST** | SDK npm `mercadopago` o fetch directo a API | Afecta dependencias y tipado |
| 5 | **Estrategia stock race condition** | `prisma.$transaction` con where clause, o `SELECT FOR UPDATE` raw | Afecta confiabilidad del checkout |
| 6 | **Webhook dev testing** | ngrok, Cloudflare Tunnel, simulación manual | Afecta flujo de desarrollo del Slice 3 |
| 7 | **MP preference expiration** | Timeout de preferencia (ej: 30 min) para liberar stock | Afecta riesgo de overselling |

---

## 8. Estado Actual del Código (R1)

### Lo que ya existe y R2 debe extender

| Archivo | Rol en R1 | Cambio necesario en R2 |
|---------|-----------|------------------------|
| `src/features/product-detail/components/ProductStock.tsx` | Botón "Add to cart" no-op | Conectar a cart store |
| `src/components/layout/Header.tsx` | Logo + nav | Agregar CartIcon con badge |
| `src/app/(public)/layout.tsx` | Public layout | Sin cambios (ya envuelve children) |
| `src/lib/db/client.ts` | Prisma singleton | Sin cambios |
| `src/lib/db/types.ts` | Re-exporta tipos Prisma | Sin cambios (ya incluye Order, Payment, etc.) |
| `src/features/product-detail/queries.ts` | `formatPrice`, `getProductBySlug` | Sin cambios, posible reutilizar `formatPrice` |
| `prisma/schema.prisma` | 10 modelos, 3 enums | Sin cambios (modelos ya existen) |

### Lo que NO existe y R2 debe crear

- `src/features/cart/` (todo el módulo)
- `src/features/checkout/` (todo el módulo)
- `src/features/orders/` (todo el módulo)
- `src/features/payments/` (todo el módulo)
- `src/lib/mercadopago/` (configuración SDK)
- `src/app/api/webhooks/` (endpoint de webhook)
- `src/app/(public)/cart/` (página de carrito)
- `src/app/(public)/checkout/` (páginas de checkout)
- `src/app/(public)/orders/` (páginas de orden)
- Variables de entorno de MercadoPago
- Paquete npm `mercadopago`
- Paquete npm `zustand` (o alternativa para cart state)
- Paquete npm `react-hook-form` + `@hookform/resolvers`
- Paquete npm `zod` (si no está ya como transitiva)

---

## 9. Complejidad Estimada por Slice

| Slice | Archivos nuevos | Archivos modificados | Líneas estimadas | Complejidad |
|-------|-----------------|---------------------|-----------------|-------------|
| 1. Cart | ~9 | ~3 | ~350-400 | Media (state management) |
| 2. Checkout | ~11 | ~2 | ~380-420 | Alta (transacción, stock) |
| 3. MP + Webhook | ~9 | ~4 | ~340-380 | Alta (integración externa) |
| 4. Display | ~4 | ~2 | ~180-220 | Baja |
| **Total R2** | **~33** | **~11** | **~1250-1420** | — |

Comparación con R1: R1 fueron 32 archivos, ~1818 líneas en 3 PRs. R2 es similar o ligeramente menor en volumen pero mayor en complejidad por la integración externa y transacciones.

---

## 10. Conclusión

**Ready for Proposal**: Sí — con caveats.

La exploración revela que los 4 specs están bien definidos y el modelo de datos ya soporta todos los escenarios. Los principales riesgos son:
1. Race condition en stock — mitigable con transacciones Prisma
2. Integración MercadoPago — requiere SDK nuevo y testing con ngrok
3. Currency mismatch — necesita definición del negocio

Los 4 slices propuestos respetan el presupuesto de ~400 líneas por PR y siguen el patrón de R1 (PRs encadenados con dependencias claras).

**Lo que el orquestador debe preguntar al usuario antes de pasar a design**:
- ¿Moneda del store? (USD vs ARS)
- ¿Prefiere Zustand para cart state o hay otra preferencia?
- ¿Formato de orderNumber?
- ¿Cómo manejamos el testing local del webhook? (ngrok vs simulación)

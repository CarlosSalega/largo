# Admin Orders Specification

## Purpose

Administrative interface for viewing and managing customer orders: paginated list with status and date filters, detail view with customer and payment info, and manual PAID→REFUNDED transition with confirmation.

## Requirements

### REQ-ADM-24: Listado de Órdenes con Paginación y Filtros
El sistema SHALL mostrar órdenes en tabla con paginación server-side, filtros por estado, rango de fechas y búsqueda, usando URL searchParams.

#### Scenario: Ver todas las órdenes
- GIVEN un administrador autenticado
- WHEN accede a `/admin/orders`
- THEN se muestran órdenes paginadas con número, cliente, total, estado y fecha

#### Scenario: Filtrar por estado
- GIVEN órdenes con distintos estados
- WHEN el administrador selecciona "PAID" en el filtro de estado
- THEN solo órdenes con status PAID son visibles y la URL refleja `status=PAID`

#### Scenario: Filtrar por rango de fechas
- GIVEN órdenes de distintas fechas
- WHEN el administrador selecciona un rango de fechas
- THEN solo órdenes dentro del rango son visibles

### REQ-ADM-25: Vista de Detalle de Orden
El sistema SHALL mostrar el detalle completo de una orden en `/admin/orders/[orderNumber]`.

#### Scenario: Ver detalle
- GIVEN una orden existe con items, dirección, cliente y pago
- WHEN el administrador abre el detalle
- THEN se muestran: items con cantidad y precio, datos del cliente, dirección de envío, estado del pago y totales

### REQ-ADM-26: Filtro por Estado
El sistema SHALL permitir filtrar órdenes por estado mediante un dropdown, reflejando el filtro en los URL searchParams.

#### Scenario: Alternar filtro de estado
- GIVEN órdenes con estados PENDING, PAID y REFUNDED
- WHEN el administrador selecciona "REFUNDED" del dropdown
- THEN solo órdenes refunded se muestran
- AND al limpiar el filtro vuelven a verse todas

### REQ-ADM-27: Filtro por Rango de Fechas
El sistema SHALL permitir filtrar órdenes por fecha de creación con campos de fecha inicio y fecha fin.

#### Scenario: Aplicar rango de fechas
- GIVEN órdenes creadas entre enero y junio
- WHEN el administrador filtra de marzo a mayo
- THEN solo órdenes de ese rango se muestran

### REQ-ADM-28: Transición PAID→REFUNDED con AlertDialog
El sistema SHALL permitir la transición manual de PAID a REFUNDED exclusivamente, requiriendo confirmación mediante AlertDialog.

#### Scenario: Reembolso confirmado
- GIVEN una orden con status PAID y pago APPROVED
- WHEN el administrador presiona "Reembolsar", confirma en el AlertDialog
- THEN `Order.status = REFUNDED` y `Payment.status = REFUNDED` se actualizan en `$transaction`
- AND se muestra toast "Reembolso procesado"

#### Scenario: Transición inválida
- GIVEN una orden con status PENDING
- WHEN el administrador intenta reembolsar
- THEN la acción se rechaza porque solo órdenes PAID pueden pasar a REFUNDED

#### Scenario: Cancelar reembolso
- GIVEN el AlertDialog de confirmación está abierto
- WHEN el administrador presiona "Cancelar"
- THEN no se realiza ningún cambio y el diálogo se cierra

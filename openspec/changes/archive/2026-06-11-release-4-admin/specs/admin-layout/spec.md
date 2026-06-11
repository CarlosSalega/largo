# Admin Layout Specification

## Purpose

Full-screen admin dashboard layout with collapsible sidebar navigation, no public Header/Footer, and defense-in-depth session verification.

## Requirements

### REQ-ADM-04: Admin Sidebar Navigation
El sistema SHALL renderizar un sidebar con navegación a Productos, Categorías y Órdenes dentro del layout `/admin`, sin Header ni Footer públicos.

#### Scenario: Sidebar renderiza navegación
- GIVEN un administrador autenticado
- WHEN se accede a cualquier ruta `/admin/*`
- THEN se muestra el sidebar con enlaces a Productos, Categorías y Órdenes
- AND no se renderizan el Header ni Footer públicos

#### Scenario: Redirección desde /admin
- GIVEN un administrador autenticado
- WHEN se accede a `/admin`
- THEN es redirigido a `/admin/products`

### REQ-ADM-05: Sidebar Colapsable
El sistema SHALL permitir colapsar y expandir el sidebar con un botón toggle y animación CSS, manteniendo el estado en cliente.

#### Scenario: Colapsar sidebar
- GIVEN el sidebar está expandido
- WHEN el administrador presiona el botón toggle
- THEN el sidebar se colapsa con animación y los íconos permanecen visibles

#### Scenario: Expandir sidebar
- GIVEN el sidebar está colapsado
- WHEN el administrador presiona el botón toggle
- THEN el sidebar se expande mostrando etiquetas de texto

#### Scenario: Comportamiento responsive
- GIVEN un viewport mobile (< 768px)
- WHEN se accede al layout admin
- THEN el sidebar inicia colapsado y puede expandirse como overlay

### REQ-ADM-06: Sesión en Sidebar
El sistema SHALL mostrar el nombre del administrador y un botón de cierre de sesión en el sidebar.

#### Scenario: Mostrar nombre y salir
- GIVEN un administrador autenticado
- WHEN se renderiza el sidebar
- THEN se muestra "Hola, {name}" y un botón "Salir" que cierra la sesión

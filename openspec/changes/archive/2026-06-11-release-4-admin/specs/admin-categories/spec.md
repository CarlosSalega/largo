# Admin Categories Specification

## Purpose

Administrative interface for managing categories: paginated list, CRUD with single image upload, featured toggle, and soft delete.

## Requirements

### REQ-ADM-19: Listado de Categorías
El sistema SHALL mostrar todas las categorías en tabla con paginación server-side y búsqueda por nombre mediante URL searchParams.

#### Scenario: Ver categorías
- GIVEN un administrador autenticado
- WHEN accede a `/admin/categories`
- THEN se muestran las categorías paginadas con nombre, cantidad de productos y estado featured

#### Scenario: Buscar categoría
- GIVEN categorías existentes
- WHEN el administrador busca por nombre
- THEN la tabla se filtra y la URL refleja el parámetro `search`

### REQ-ADM-20: Crear Categoría
El sistema SHALL permitir crear una categoría con nombre, descripción opcional, imagen única y toggle de featured.

#### Scenario: Crear categoría con imagen
- GIVEN un administrador completa nombre e imagen
- WHEN envía el formulario
- THEN se crea la categoría con slug autogenerado, imagen en Cloudinary y redirige al listado con toast "Categoría creada"

#### Scenario: Nombre duplicado
- GIVEN ya existe una categoría con el mismo nombre
- WHEN se intenta crear otra igual
- THEN el servidor genera un slug único diferenciado

### REQ-ADM-21: Editar Categoría
El sistema SHALL permitir editar una categoría existente con formulario pre-rellenado que incluya la imagen actual.

#### Scenario: Editar categoría
- GIVEN una categoría existe con imagen
- WHEN el administrador cambia el nombre y guarda
- THEN los cambios se persisten con toast "Categoría actualizada"

#### Scenario: Reemplazar imagen
- GIVEN una categoría con imagen
- WHEN el administrador sube una nueva imagen
- THEN la imagen anterior se reemplaza (se elimina de Cloudinary y DB)

### REQ-ADM-22: Toggle de Destacado
El sistema SHALL permitir activar y desactivar el estado featured de una categoría desde la fila de la tabla.

#### Scenario: Activar destacado
- GIVEN una categoría no destacada
- WHEN el administrador activa el toggle de featured
- THEN la categoría se marca como destacada para el storefront

### REQ-ADM-23: Archivado (Soft Delete)
El sistema SHALL archivar categorías seteando `deletedAt` y `active = false` sin eliminarlas físicamente.

#### Scenario: Archivar categoría
- GIVEN una categoría existe
- WHEN el administrador ejecuta la acción de archivar
- THEN `deletedAt` y `active = false` se persisten
- AND la categoría deja de aparecer en admin y storefront

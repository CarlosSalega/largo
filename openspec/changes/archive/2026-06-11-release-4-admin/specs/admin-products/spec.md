# Admin Products Specification

## Purpose

Administrative interface for managing products: paginated list with filters, CRUD with image upload (drag & drop reorder), stock, toggles, brand inline creation, and soft delete.

## Requirements

### REQ-ADM-07: Listado de Productos con Paginación y Filtros
El sistema SHALL mostrar todos los productos en una tabla con paginación server-side, búsqueda por texto y filtros por estado mediante URL searchParams.

#### Scenario: Ver todos los productos
- GIVEN un administrador autenticado
- WHEN accede a `/admin/products`
- THEN se muestran todos los productos paginados con nombre, precio, stock, estado y featured
- AND los filtros por defecto muestran "Todos"

#### Scenario: Filtrar por estado
- GIVEN productos activos e inactivos
- WHEN el administrador selecciona el filtro "Sin stock"
- THEN solo productos con stock = 0 son visibles

#### Scenario: Buscar por nombre
- GIVEN productos en el catálogo
- WHEN el administrador escribe en el campo de búsqueda y presiona Enter
- THEN la tabla se filtra por nombre coincidente y la URL refleja el parámetro `search`

### REQ-ADM-08: Crear Producto
El sistema SHALL permitir crear un producto nuevo mediante un formulario en página dedicada con todos los campos requeridos.

#### Scenario: Crear producto exitoso
- GIVEN un administrador completa nombre, descripción, precio, stock, categoría y marca
- WHEN envía el formulario
- THEN el producto se crea con slug autogenerado, imágenes asociadas y redirige al listado con toast "Producto creado"

#### Scenario: Validación de formulario
- GIVEN campos requeridos vacíos
- WHEN se intenta enviar el formulario
- THEN errores inline de Zod se muestran en cada campo inválido

### REQ-ADM-09: Editar Producto
El sistema SHALL permitir editar un producto existente con formulario pre-rellenado en `/admin/products/[id]/edit`.

#### Scenario: Editar producto
- GIVEN un producto existe con imágenes y datos
- WHEN el administrador modifica campos y guarda
- THEN los cambios se persisten y se muestra toast "Producto actualizado"

### REQ-ADM-10: Carga de Imágenes con Drag & Drop
El sistema SHALL permitir subir imágenes arrastrando o haciendo clic, mostrar previews en grilla y barra de progreso durante la carga.

#### Scenario: Subir imágenes
- GIVEN el formulario de producto está abierto
- WHEN el administrador arrastra imágenes a la zona de carga
- THEN las imágenes se suben a Cloudinary vía API route, aparecen en la grilla de previews y sus publicIds se asocian al producto

#### Scenario: Límite de imágenes
- GIVEN la grilla ya tiene 10 imágenes
- WHEN se intenta subir otra imagen
- THEN la carga se rechaza o la zona de drop se deshabilita

### REQ-ADM-11: Reordenamiento de Imágenes
El sistema SHALL permitir reordenar imágenes mediante drag & drop con `@dnd-kit` y persistir el orden en `ProductImage.order`.

#### Scenario: Reordenar imágenes
- GIVEN un producto con 3 imágenes
- WHEN el administrador arrastra la tercera imagen a la primera posición
- THEN el orden visual se actualiza y se persiste en base de datos mediante `reorderProductImages`

### REQ-ADM-12: Eliminar Imagen
El sistema SHALL permitir eliminar una imagen del producto, borrándola de Cloudinary y de la base de datos.

#### Scenario: Eliminar imagen
- GIVEN un producto con imágenes
- WHEN el administrador presiona el botón de eliminar en una imagen
- THEN la imagen desaparece de la grilla, se elimina de Cloudinary y se borra el registro `ProductImage`

### REQ-ADM-13: Gestión de Stock
El sistema SHALL permitir actualizar el stock desde el formulario de edición.

#### Scenario: Actualizar stock
- GIVEN un producto con stock = 5
- WHEN el administrador cambia el stock a 10 y guarda
- THEN el stock en base de datos se actualiza a 10

### REQ-ADM-14: Toggle de Destacado
El sistema SHALL permitir activar y desactivar el estado featured de un producto desde la fila de la tabla.

#### Scenario: Activar destacado
- GIVEN un producto no destacado
- WHEN el administrador activa el toggle de featured en la tabla
- THEN el producto se marca como featured y aparece en la sección destacada del storefront

### REQ-ADM-15: Toggle de Activo/Inactivo
El sistema SHALL permitir activar y desactivar un producto desde la fila de la tabla.

#### Scenario: Desactivar producto
- GIVEN un producto activo
- WHEN el administrador desactiva el toggle en la tabla
- THEN el producto se marca como `active = false` y se oculta del storefront

### REQ-ADM-16: Archivado (Soft Delete)
El sistema SHALL archivar productos seteando `deletedAt` y `active = false` sin eliminarlos físicamente.

#### Scenario: Archivar producto
- GIVEN un producto existe
- WHEN el administrador ejecuta la acción de archivar
- THEN el producto recibe `deletedAt = now()` y `active = false`
- AND ya no aparece en listados del admin ni del storefront

### REQ-ADM-17: Creación Inline de Marca
El sistema SHALL permitir seleccionar una marca existente mediante Combobox o crear una nueva sin salir del formulario de producto.

#### Scenario: Seleccionar marca existente
- GIVEN marcas existen en la base de datos
- WHEN el administrador escribe en el Combobox de marca
- THEN se muestran sugerencias de marcas existentes

#### Scenario: Crear nueva marca
- GIVEN la marca buscada no existe
- WHEN el administrador selecciona "Crear nueva" e ingresa el nombre
- THEN se crea la marca con slug autogenerado y se asigna al producto

### REQ-ADM-18: Slug Autogenerado
El sistema SHALL generar el slug del producto en el servidor durante la creación, verificando unicidad contra la base de datos.

#### Scenario: Slug único
- GIVEN se crea un producto con nombre "iPhone 16"
- WHEN el servidor genera el slug
- THEN el slug es "iphone-16"

#### Scenario: Slug duplicado
- GIVEN ya existe un producto con slug "iphone-16"
- WHEN se crea otro producto con el mismo nombre
- THEN el slug se diferencia agregando un sufijo (ej: "iphone-16-1")

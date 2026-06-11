# Delta for Customers — Release 3

## ADDED Requirements

### REQ-CUST-04: Single-Page Auth Toggle
The system SHALL render Sign In and Sign Up on `/ingresar` with a toggle.

#### Scenario: Toggle between forms
- GIVEN visitor on `/ingresar`
- WHEN clicking "Crear cuenta" or "Ya tengo cuenta"
- THEN the visible form switches between Sign In (email + password) and Sign Up (email + password)

### REQ-CUST-05: Form Validation
The system SHALL validate auth form inputs with inline errors before submission.

#### Scenario: Invalid email
- GIVEN visitor submits auth form
- WHEN email format is invalid
- THEN inline error "Ingresá un email válido" is shown

#### Scenario: Short password
- GIVEN visitor submits auth form
- WHEN password is fewer than 8 characters
- THEN inline error "La contraseña debe tener al menos 8 caracteres" is shown

### REQ-CUST-06: Route Protection
The system SHALL redirect unauthenticated requests to `/account/*` via `proxy.ts`.

#### Scenario: Block unauthenticated access
- GIVEN no valid session exists
- WHEN accessing any `/account/*` route
- THEN redirect to `/ingresar`

#### Scenario: Allow authenticated access
- GIVEN valid session exists
- WHEN accessing any `/account/*` route
- THEN the requested page renders normally

### REQ-CUST-07: Auth-Aware Header
The system SHALL display authentication state in the global Header component.

#### Scenario: Authenticated
- GIVEN a customer has an active session
- WHEN viewing any page
- THEN Header shows "Mi cuenta" link and "Salir" button

#### Scenario: Unauthenticated
- GIVEN no session exists
- WHEN viewing any page
- THEN Header shows "Ingresar" link

## MODIFIED Requirements

### REQ-CUST-01: Customer Registration
The system SHALL register customers with email and password only, in one step, without email verification.
(Previously: required name field on registration.)

#### Scenario: Successful registration
- GIVEN a visitor provides a valid email and password
- WHEN registration is submitted
- THEN a customer account is created with role CUSTOMER and the customer is authenticated immediately

#### Scenario: Duplicate email
- GIVEN an account with email "user@example.com" exists
- WHEN a visitor registers with the same email
- THEN registration is rejected with "El email ya está registrado"

### REQ-CUST-02: Customer Sign In
The system SHALL sign in customers with email and password in one step, creating a session.
(Previously: generic credential authentication.)

#### Scenario: Valid sign in
- GIVEN a customer account exists
- WHEN valid email and password are submitted
- THEN a session is created and the customer is redirected to `/account`

#### Scenario: Invalid credentials
- GIVEN a customer account exists
- WHEN invalid credentials are provided
- THEN sign in is rejected with "Email o contraseña incorrectos"

### REQ-CUST-03: Customer Sign Out
The system SHALL clear the session and redirect to home on sign out.
(Previously: generic logout with homepage redirect.)

#### Scenario: Sign out
- GIVEN a customer is authenticated
- WHEN the customer clicks "Salir"
- THEN the session is cleared and the customer is redirected to `/`

### REQ-CUST-08: Order History
The system SHALL display the customer's order history, most recent first.
(Previously: unspecified ordering.)

#### Scenario: Customer has orders
- GIVEN a customer has placed orders
- WHEN accessing `/account`
- THEN order history is displayed with status, date, and total — most recent first

#### Scenario: Customer has no orders
- GIVEN a customer has no orders
- WHEN accessing `/account`
- THEN "Todavía no hiciste ningún pedido" is displayed

### REQ-CUST-09: Order Detail
The system SHALL show full order details at `/account/orders/[orderNumber]`.
(Previously: unspecified URL pattern.)

#### Scenario: View order
- GIVEN a customer has an order
- WHEN navigating to `/account/orders/[orderNumber]`
- THEN order items, shipping address, and payment status are displayed

#### Scenario: Order not found
- GIVEN a customer is authenticated
- WHEN accessing `/account/orders/nonexistent`
- THEN "Pedido no encontrado" is displayed

### REQ-CUST-10: Guest Order Linking
The system SHALL link guest orders to a customer account server-side upon registration when emails match.
(Previously: link on registration; implementation unspecified.)

#### Scenario: Link on registration
- GIVEN guest orders exist with email "user@example.com"
- WHEN a customer registers with the same email
- THEN previous guest orders are associated with the new account via server-side hook

### REQ-CUST-11 & REQ-CUST-12: Profile Management
The system SHALL allow customers to update their name and change their password from `/account/profile`.
(Previously: generic profile update.)

#### Scenario: Update name
- GIVEN a customer is authenticated
- WHEN the customer saves a new name
- THEN the name is persisted

#### Scenario: Change password
- GIVEN a customer is authenticated
- WHEN the customer provides their current password and a new password (≥8 characters)
- THEN the password is updated and the session remains active

#### Scenario: Wrong current password
- GIVEN a customer is authenticated
- WHEN the customer provides an incorrect current password
- THEN the change is rejected with "Contraseña actual incorrecta"

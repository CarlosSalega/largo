# Checkout Specification

## Purpose

Checkout flow that collects customer and shipping information, creates a pending order, and initiates payment through Mercado Pago Checkout Pro.

## Requirements

### Requirement: Customer Information Collection
The system SHALL collect customer contact information during checkout.

#### Scenario: Checkout form display
- GIVEN a visitor starts checkout with products in cart
- WHEN the checkout page loads
- THEN fields for email, full name, and phone are displayed

#### Scenario: Valid customer data
- GIVEN the visitor fills all required fields with valid data
- WHEN the form is submitted
- THEN customer information is stored for the order

### Requirement: Guest Checkout
The system SHALL support checkout without requiring authentication.

#### Scenario: Unauthenticated visitor
- GIVEN the visitor is not logged in
- WHEN checkout starts
- THEN the visitor can complete checkout without creating an account

#### Scenario: Optional account creation
- GIVEN a guest completes checkout
- WHEN the order confirmation is shown
- THEN an option to create an account is offered

### Requirement: Shipping Information Collection
The system SHALL collect shipping address during checkout.

#### Scenario: Shipping form
- GIVEN checkout is in progress
- WHEN the shipping section is reached
- THEN fields for street, city, state, zip code, and country are displayed

#### Scenario: Valid shipping data
- GIVEN the visitor fills shipping fields with valid data
- WHEN the form is submitted
- THEN shipping information is stored with the order

### Requirement: Order Summary
The system SHALL display an order summary during checkout.

#### Scenario: Summary display
- GIVEN checkout is in progress
- WHEN the checkout page loads
- THEN cart items, quantities, unit prices, and total are displayed

### Requirement: Pending Order Creation
The system SHALL create a pending order when checkout is submitted.

#### Scenario: Valid checkout submission
- GIVEN all required checkout data is valid
- WHEN the visitor confirms the order
- THEN a pending order is created with status PENDING
- AND stock is reserved for the ordered products
- AND the cart is cleared

#### Scenario: Insufficient stock at checkout
- GIVEN a product in cart has stock = 2 but quantity = 3
- WHEN the visitor confirms the order
- THEN the order is rejected with a stock availability error

### Requirement: Mercado Pago Preference Creation
The system SHALL create a Mercado Pago checkout preference for the order.

#### Scenario: Preference creation
- GIVEN a pending order exists
- WHEN checkout is confirmed
- THEN a Mercado Pago preference is created with order items and total amount

#### Scenario: Preference creation failure
- GIVEN Mercado Pago API is unavailable
- WHEN preference creation is attempted
- THEN an error message is shown and the order remains pending

### Requirement: Redirect to Mercado Pago
The system SHALL redirect the customer to Mercado Pago for payment.

#### Scenario: Successful redirect
- GIVEN a Mercado Pago preference was created
- WHEN the order is confirmed
- THEN the customer is redirected to Mercado Pago's hosted checkout page

### Requirement: Checkout Return URLs
The system SHALL configure return URLs for post-payment navigation.

#### Scenario: Payment success return
- GIVEN the customer completes payment on Mercado Pago
- WHEN Mercado Pago redirects back
- THEN the customer lands on the order success page

#### Scenario: Payment failure return
- GIVEN the customer's payment is rejected on Mercado Pago
- WHEN Mercado Pago redirects back
- THEN the customer lands on the payment failure page with retry option

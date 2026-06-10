# Orders Specification

## Purpose

Order lifecycle management from creation through payment confirmation, including status transitions and order data persistence.

## Requirements

### Requirement: Order Creation
The system SHALL create orders when checkout is completed.

#### Scenario: Order created at checkout
- GIVEN checkout is confirmed with valid data
- WHEN the order is submitted
- THEN an order is created with status PENDING
- AND customer information is stored
- AND shipping address is stored
- AND order items with product snapshots are stored

### Requirement: Order Items Snapshot
The system SHALL store product information as a snapshot at order time.

#### Scenario: Product price changes after order
- GIVEN an order was created with product price 100
- WHEN the product price is later changed to 120
- THEN the order still shows the original price of 100

### Requirement: Order Statuses
The system SHALL support the following order statuses: PENDING, PAID, CANCELLED, REFUNDED.

#### Scenario: Initial status
- GIVEN an order is created
- WHEN the order is stored
- THEN the status is PENDING

#### Scenario: Payment approved
- GIVEN an order with status PENDING
- WHEN the payment webhook confirms approval
- THEN the status changes to PAID

#### Scenario: Payment rejected
- GIVEN an order with status PENDING
- WHEN the payment webhook confirms rejection
- THEN the status changes to CANCELLED
- AND reserved stock is released

#### Scenario: Manual refund
- GIVEN an order with status PAID
- WHEN an administrator initiates a refund
- THEN the status changes to REFUNDED

### Requirement: Stock Reservation
The system SHALL reserve stock when an order is created.

#### Scenario: Stock reserved on order creation
- GIVEN a product has stock = 10
- WHEN an order is created with quantity 3
- THEN available stock becomes 7

#### Scenario: Stock released on cancellation
- GIVEN a product has reserved stock from a cancelled order
- WHEN the order status changes to CANCELLED
- THEN the reserved stock is released back to available

### Requirement: Order Retrieval
The system SHALL allow retrieving orders by ID.

#### Scenario: View order details
- GIVEN an order exists
- WHEN the order is accessed by ID
- THEN complete order information is displayed including items, customer data, shipping, and payment status

### Requirement: Order History
The system SHALL maintain a history of all orders.

#### Scenario: List orders
- GIVEN orders exist
- WHEN the order list is requested
- THEN orders are displayed sorted by creation date descending

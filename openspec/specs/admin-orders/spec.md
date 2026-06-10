# Admin Orders Specification

## Purpose

Administrative interface for viewing and managing customer orders.

## Requirements

### Requirement: Order List
The system SHALL display all orders in the admin panel.

#### Scenario: View all orders
- GIVEN an administrator is authenticated
- WHEN the orders page is accessed
- THEN all orders are displayed with order number, customer, total, status, and date

### Requirement: Order Detail View
The system SHALL display complete order details.

#### Scenario: View order details
- GIVEN an order exists
- WHEN an administrator opens the order
- THEN order items, customer info, shipping address, payment status, and totals are displayed

### Requirement: Order Filtering
The system SHALL support filtering orders by status and date range.

#### Scenario: Filter by status
- GIVEN orders with different statuses exist
- WHEN an administrator filters by "PAID"
- THEN only paid orders are displayed

#### Scenario: Filter by date range
- GIVEN orders from different dates exist
- WHEN an administrator selects a date range
- THEN only orders within that range are displayed

### Requirement: Order Status Update
The system SHALL allow administrators to update order status.

#### Scenario: Manual status change
- GIVEN an order with status PAID
- WHEN an administrator changes status to REFUNDED
- THEN the status is updated and the change is logged

#### Scenario: Invalid transition
- GIVEN an order with status PENDING
- WHEN an administrator tries to set status to REFUNDED
- THEN the transition is rejected (only PAID orders can be refunded)

### Requirement: Customer Information Display
The system SHALL display customer information on orders.

#### Scenario: View customer info
- GIVEN an order exists with customer data
- WHEN an administrator views the order
- THEN customer name, email, phone, and shipping address are displayed

### Requirement: Payment Information Display
The system SHALL display payment information on orders.

#### Scenario: View payment info
- GIVEN an order with a payment record exists
- WHEN an administrator views the order
- THEN payment provider, transaction ID, amount, and status are displayed

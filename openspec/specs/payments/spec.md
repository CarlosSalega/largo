# Payments Specification

## Purpose

Payment processing through Mercado Pago Checkout Pro, including preference creation, webhook reception, and order status synchronization.

## Requirements

### Requirement: Mercado Pago Checkout Pro
The system SHALL use Mercado Pago Checkout Pro as the payment method.

#### Scenario: Payment initiation
- GIVEN a pending order exists
- WHEN checkout is confirmed
- THEN a Mercado Pago preference is created
- AND the customer is redirected to Mercado Pago's hosted checkout

### Requirement: Webhook Reception
The system SHALL receive and process payment notifications from Mercado Pago.

#### Scenario: Payment notification received
- GIVEN Mercado Pago sends a payment webhook
- WHEN the webhook endpoint receives the notification
- THEN the notification is logged and processed

#### Scenario: Webhook endpoint availability
- GIVEN the application is running
- WHEN Mercado Pago sends a POST to the webhook URL
- THEN the endpoint responds with HTTP 200

### Requirement: Payment Validation
The system SHALL validate payment notifications against Mercado Pago API.

#### Scenario: Validate payment status
- GIVEN a payment notification is received
- WHEN the system queries Mercado Pago API for payment details
- THEN the actual payment status is confirmed

### Requirement: Order Status Update
The system SHALL update order status based on payment confirmation.

#### Scenario: Payment approved
- GIVEN a payment notification with status "approved"
- WHEN the notification is validated
- THEN the related order status changes to PAID

#### Scenario: Payment rejected
- GIVEN a payment notification with status "rejected"
- WHEN the notification is validated
- THEN the related order status changes to CANCELLED
- AND reserved stock is released

### Requirement: Duplicate Prevention
The system SHALL prevent duplicate processing of webhook notifications.

#### Scenario: Duplicate notification
- GIVEN a webhook notification was already processed
- WHEN the same notification arrives again
- THEN it is ignored and no order status change occurs

#### Scenario: Idempotent processing
- GIVEN a payment notification with a unique event ID
- WHEN the notification is processed
- THEN the event ID is recorded to prevent future duplicates

### Requirement: Payment Record
The system SHALL store payment records for each transaction.

#### Scenario: Payment record creation
- GIVEN a payment is processed
- WHEN the webhook is handled
- THEN a payment record is stored with provider, provider ID, status, amount, and timestamp

### Requirement: Webhook Event Logging
The system SHALL log all webhook events for audit purposes.

#### Scenario: Event logged
- GIVEN any webhook notification is received
- WHEN the endpoint processes it
- THEN the full payload, event ID, and processing status are logged

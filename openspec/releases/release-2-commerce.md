# Release 2 — Commerce

## Scope

- Cart
- Checkout
- Orders
- Payments

## Features

- Shopping cart with add/remove/update quantity
- Cart persistence across sessions
- Stock validation on cart operations
- Guest checkout flow
- Customer information collection (email, name, phone)
- Shipping address collection
- Order summary before confirmation
- Pending order creation with stock reservation
- Mercado Pago Checkout Pro preference creation
- Redirect to Mercado Pago hosted checkout
- Payment success/failure return pages
- Webhook endpoint for payment notifications
- Payment validation against Mercado Pago API
- Order status updates via webhook (PENDING → PAID/CANCELLED)
- Duplicate webhook prevention
- Payment record storage

## Dependencies

- Prisma schema (Order, OrderItem, Payment, WebhookEvent models)
- Mercado Pago SDK integration
- Environment variables for MP credentials
- Webhook URL configuration in Mercado Pago dashboard

## Success Criteria

A visitor can add products to cart, complete checkout as guest, pay through Mercado Pago, and the order is automatically confirmed via webhook.

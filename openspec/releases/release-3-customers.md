# Release 3 — Customers

## Scope

- Authentication (Better Auth)
- Customer Dashboard

## Features

- Customer registration with email and password
- Customer login/logout
- Session management
- Customer dashboard with order history
- Order detail view
- Guest order linking on registration
- Profile management (name, password)

## Dependencies

- Prisma schema (User model with CUSTOMER role)
- Better Auth integration
- Auth middleware for protected routes

## Success Criteria

Customers can create accounts, log in, view their order history, and manage their profile. Guest orders are automatically linked when registering with the same email.

# Customers Specification

## Purpose

Customer registration, authentication, profile management, and order history access.

## Requirements

### Requirement: Customer Registration
The system SHALL allow visitors to create a customer account.

#### Scenario: Successful registration
- GIVEN a visitor provides valid email, name, and password
- WHEN registration is submitted
- THEN a customer account is created with role CUSTOMER
- AND the customer is logged in

#### Scenario: Duplicate email
- GIVEN an account with email "user@example.com" exists
- WHEN a visitor registers with the same email
- THEN registration is rejected with a duplicate email message

### Requirement: Customer Authentication
The system SHALL allow customers to log in with credentials.

#### Scenario: Valid login
- GIVEN a customer account exists
- WHEN valid email and password are provided
- THEN the customer is authenticated and redirected to dashboard

#### Scenario: Invalid credentials
- GIVEN a customer account exists
- WHEN invalid credentials are provided
- THEN login is rejected with an error message

### Requirement: Customer Logout
The system SHALL allow customers to log out.

#### Scenario: Logout
- GIVEN a customer is authenticated
- WHEN the customer clicks logout
- THEN the session is invalidated and the customer is redirected to homepage

### Requirement: Order History
The system SHALL display customer's order history in the dashboard.

#### Scenario: Customer has orders
- GIVEN a customer has placed orders
- WHEN the customer accesses the dashboard
- THEN order history is displayed with status, date, and total

#### Scenario: Customer has no orders
- GIVEN a customer has no orders
- WHEN the customer accesses the dashboard
- THEN an empty state message is displayed

### Requirement: Order Detail View
The system SHALL allow customers to view individual order details.

#### Scenario: View order
- GIVEN a customer has an order
- WHEN the customer clicks on an order
- THEN order details including items, shipping, and payment status are displayed

### Requirement: Guest Order Linking
The system SHALL link guest orders to customer accounts upon registration.

#### Scenario: Link orders on registration
- GIVEN guest orders exist with email "user@example.com"
- WHEN a customer registers with the same email
- THEN previous guest orders are associated with the new account

### Requirement: Profile Management
The system SHALL allow customers to update their profile.

#### Scenario: Update name
- GIVEN a customer is authenticated
- WHEN the customer updates their name
- THEN the change is persisted

#### Scenario: Update password
- GIVEN a customer is authenticated
- WHEN the customer provides current and new password
- THEN the password is updated

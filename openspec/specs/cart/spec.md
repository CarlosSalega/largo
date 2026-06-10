# Cart Specification

## Purpose

Shopping cart that allows visitors to collect products before checkout, with persistence across page refreshes.

## Requirements

### Requirement: Add Product to Cart
The system SHALL allow adding products to the cart.

#### Scenario: Add new product
- GIVEN a product exists and is in stock
- WHEN the visitor adds the product to cart
- THEN the product appears in the cart with quantity 1

#### Scenario: Add existing product
- GIVEN a product is already in the cart with quantity 2
- WHEN the visitor adds the same product again
- THEN the quantity increases to 3

### Requirement: Update Quantity
The system SHALL allow updating product quantities in the cart.

#### Scenario: Increase quantity
- GIVEN a product in cart with quantity 1 and stock = 10
- WHEN the visitor increases quantity to 3
- THEN the cart updates and totals are recalculated

#### Scenario: Decrease quantity
- GIVEN a product in cart with quantity 3
- WHEN the visitor decreases quantity to 1
- THEN the cart updates and totals are recalculated

#### Scenario: Quantity exceeds stock
- GIVEN a product in cart and stock = 5
- WHEN the visitor tries to set quantity to 6
- THEN the update is rejected with a stock limit message

### Requirement: Remove Product
The system SHALL allow removing products from the cart.

#### Scenario: Remove item
- GIVEN a product exists in the cart
- WHEN the visitor removes the product
- THEN the product is removed from the cart
- AND totals are recalculated

### Requirement: Cart Totals
The system SHALL display accurate cart totals.

#### Scenario: Display totals
- GIVEN the cart contains 2 products (price 100 qty 2, price 50 qty 1)
- WHEN the cart page loads
- THEN subtotal is 250 and total is 250

### Requirement: Cart Persistence
The system SHALL persist cart contents across page refreshes.

#### Scenario: Page refresh
- GIVEN products were added to the cart
- WHEN the visitor refreshes the page
- THEN the cart contents remain available

#### Scenario: New session
- GIVEN a visitor has no previous cart
- WHEN the visitor opens the site
- THEN the cart is empty

### Requirement: Empty Cart
The system SHALL handle empty cart state gracefully.

#### Scenario: Empty cart display
- GIVEN the cart has no products
- WHEN the cart page loads
- THEN an empty state message is displayed with a link to the catalog

### Requirement: Proceed to Checkout
The system SHALL allow proceeding to checkout from the cart.

#### Scenario: Checkout button
- GIVEN the cart contains at least one product
- WHEN the visitor clicks "Proceed to checkout"
- THEN the checkout page is displayed

#### Scenario: Empty cart checkout
- GIVEN the cart is empty
- WHEN the cart page loads
- THEN the checkout button is not displayed or is disabled

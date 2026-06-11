# Delta for Cart

> **References**: [Cart specification](../../../../specs/cart/spec.md)
> **Change**: Wires the non-functional "Add to cart" button and implements a client-side cart with Zustand + localStorage, currency awareness, and full UI (CartDrawer, CartIcon, CartPage).

## Status

| REQ ID | Requirement | Priority | Scenarios | PR |
|--------|------------|----------|-----------|-----|
| REQ-CART-01 | Add Product to Cart (wired) | P0 | SC-CART-01, SC-CART-02, SC-CART-03 | 1 |
| REQ-CART-02 | Cart State (Zustand + localStorage) | P0 | SC-CART-04, SC-CART-05 | 1 |
| REQ-CART-03 | Update Quantity | P0 | SC-CART-06, SC-CART-07, SC-CART-08 | 1 |
| REQ-CART-04 | Remove Product | P0 | SC-CART-09 | 1 |
| REQ-CART-05 | Cart Totals (currency-aware) | P0 | SC-CART-10, SC-CART-11 | 1 |
| REQ-CART-06 | Empty Cart State | P1 | SC-CART-12, SC-CART-13 | 1 |
| REQ-CART-07 | Mixed-Currency Prevention | P0 | SC-CART-14, SC-CART-15 | 1 |
| REQ-CART-08 | CartIcon Badge | P1 | SC-CART-16 | 1 |
| REQ-CART-09 | CartDrawer | P1 | SC-CART-17, SC-CART-18 | 1 |
| REQ-CART-10 | Cart Page | P1 | SC-CART-19, SC-CART-20 | 1 |
| REQ-CART-11 | Currency Display | P0 | SC-CART-21, SC-CART-22 | 1 |

**Total**: 11 requirements | 22 scenarios | Budget: PR 1 (~370 lines)

## ADDED Requirements

### Requirement: REQ-CART-07 — Mixed-Currency Prevention
The system SHALL prevent adding products with a different currency than items already in the cart. For MVP, mixed-currency carts are forbidden.

#### Scenario: SC-CART-14 — Different currency product
- GIVEN the cart contains a product with currency USD
- WHEN the visitor attempts to add a product with currency ARS
- THEN a warning is displayed: "Tu carrito tiene productos en USD. ¿Querés vaciar el carrito y agregar este producto en ARS?"
- AND the product is NOT added to the cart
- AND a "Vaciar carrito y agregar" action is offered

#### Scenario: SC-CART-15 — Same currency product
- GIVEN the cart contains a product with currency USD
- WHEN the visitor adds another product with currency USD
- THEN the product is added normally

### Requirement: REQ-CART-08 — CartIcon Badge
The system SHALL display a cart icon in the Header with an item-count badge.

#### Scenario: SC-CART-16 — Badge shows item count
- GIVEN the cart has 3 items
- WHEN the Header renders
- THEN a CartIcon is displayed with a badge showing "3"

### Requirement: REQ-CART-09 — CartDrawer
The system SHALL provide a slide-out CartDrawer accessible from the CartIcon.

#### Scenario: SC-CART-17 — Open drawer with items
- GIVEN the cart has items
- WHEN the visitor clicks the CartIcon
- THEN a slide-out panel opens from the right
- AND displays each item with image, name, quantity, price, and currency
- AND shows the cart total

#### Scenario: SC-CART-18 — Open drawer empty
- GIVEN the cart is empty
- WHEN the visitor clicks the CartIcon
- THEN the drawer opens showing the empty cart state

### Requirement: REQ-CART-10 — Cart Page
The system SHALL provide a full cart page at `/cart`.

#### Scenario: SC-CART-19 — Cart page with items
- GIVEN the cart has items
- WHEN the visitor navigates to `/cart`
- THEN a full-page cart view displays each item with image, name, currency, unit price, quantity controls, subtotal, and remove button
- AND the cart total is displayed
- AND a "Proceed to checkout" button is visible

#### Scenario: SC-CART-20 — Cart page SEO
- GIVEN the cart page loads
- WHEN the page renders
- THEN the page title is "Carrito | Largo"
- AND meta description includes "carrito de compras"

### Requirement: REQ-CART-11 — Currency Display
The system SHALL display each cart item's currency alongside its price.

#### Scenario: SC-CART-21 — Currency format per item
- GIVEN a cart item with price 1500 and currency ARS
- WHEN the cart renders
- THEN the price is displayed as "$ 1.500,00" (Argentine locale format)

#### Scenario: SC-CART-22 — Cart total currency note
- GIVEN all cart items share the same currency
- WHEN the cart total is displayed
- THEN the total is shown in that currency with the correct locale format

## MODIFIED Requirements

### Requirement: REQ-CART-01 — Add Product to Cart
The system SHALL allow adding products to the cart. The existing "Add to cart" button in ProductStock.tsx is wired to the Zustand cart store. Currency compatibility is validated before adding.

(Previously: add-to-cart button was a no-op placeholder)

#### Scenario: SC-CART-01 — Add new product
- GIVEN a product exists with stock > 0 and currency USD
- WHEN the visitor clicks "Add to cart" on the product detail page
- THEN the product is added to the Zustand cart store with quantity 1
- AND the CartIcon badge updates to reflect the new count

#### Scenario: SC-CART-02 — Add existing product
- GIVEN a product is already in the cart with quantity 2
- WHEN the visitor adds the same product again
- THEN the quantity increases to 3
- AND cart totals are recalculated

#### Scenario: SC-CART-03 — Out of stock product
- GIVEN a product with stock = 0
- WHEN the product detail page loads
- THEN the button is disabled and reads "Out of stock"
- AND clicking it has no effect

### Requirement: REQ-CART-02 — Cart State
The system SHALL persist cart state across page refreshes using Zustand with localStorage middleware.

(Previously: cart persistence was specified but not implemented)

#### Scenario: SC-CART-04 — Page refresh preserves cart
- GIVEN products were added to the cart
- WHEN the visitor refreshes the page
- THEN the cart contents are restored from localStorage
- AND all item quantities, prices, and totals are preserved

#### Scenario: SC-CART-05 — New session empty cart
- GIVEN a visitor has no cart data in localStorage
- WHEN the visitor opens the site
- THEN the cart is initialized as empty

### Requirement: REQ-CART-03 — Update Quantity
The system SHALL allow updating product quantities via increment/decrement controls. Stock limits are validated against the server-side (latest) stock value.

(Previously: quantity update was specified but not implemented)

#### Scenario: SC-CART-06 — Increase quantity
- GIVEN a product in cart with quantity 1 and server-side stock = 10
- WHEN the visitor increments quantity to 3
- THEN the cart updates to quantity 3
- AND line subtotal and cart total are recalculated

#### Scenario: SC-CART-07 — Decrease quantity
- GIVEN a product in cart with quantity 3
- WHEN the visitor decrements quantity to 1
- THEN the cart updates to quantity 1
- AND totals are recalculated

#### Scenario: SC-CART-08 — Quantity exceeds available stock
- GIVEN a product in cart with quantity 5 and server-side stock = 5
- WHEN the visitor tries to increment to 6
- THEN the update is rejected
- AND a message "Solo quedan 5 disponibles" is shown

### Requirement: REQ-CART-04 — Remove Product
The system SHALL allow removing products from the cart via a remove button.

(Previously: remove was specified but not implemented)

#### Scenario: SC-CART-09 — Remove item
- GIVEN a product exists in the cart
- WHEN the visitor clicks the remove button (trash icon)
- THEN the product is removed from the Zustand store
- AND cart totals are recalculated
- AND the CartIcon badge updates

### Requirement: REQ-CART-05 — Cart Totals
The system SHALL calculate and display cart totals: line subtotal = unit price × quantity, cart total = sum of all line subtotals. All amounts are displayed in the cart's currency.

(Previously: totals were specified without currency awareness)

#### Scenario: SC-CART-10 — Line subtotal and cart total
- GIVEN the cart has 2 items: (price 100, qty 2) and (price 50, qty 1)
- WHEN the cart renders
- THEN first line subtotal = 200, second line subtotal = 50
- AND cart total = 250

#### Scenario: SC-CART-11 — Total after remove
- GIVEN cart total is 250
- WHEN the visitor removes the item with subtotal 50
- THEN the new cart total is 200

### Requirement: REQ-CART-06 — Empty Cart State
The system SHALL display an informative empty cart state on both the CartDrawer and the CartPage.

(Previously: empty cart was specified without UI component details)

#### Scenario: SC-CART-12 — CartDrawer empty state
- GIVEN the cart is empty
- WHEN the CartDrawer opens
- THEN a message "Tu carrito está vacío" is displayed with a link to the catalog

#### Scenario: SC-CART-13 — CartPage empty state
- GIVEN the cart is empty
- WHEN the visitor navigates to `/cart`
- THEN the empty state message is shown with a "Ver productos" call-to-action linking to `/catalog`

## REMOVED Requirements

None. All existing requirements are preserved and enhanced.

## RENAMED Requirements

None.

---

## PR Slice Mapping

| PR | Slice | Requirements |
|----|-------|-------------|
| 1 | Cart Foundation | REQ-CART-01 through REQ-CART-11 |

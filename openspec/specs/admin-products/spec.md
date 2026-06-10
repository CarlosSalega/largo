# Admin Products Specification

## Purpose

Administrative interface for managing products including creation, editing, deletion, image management, stock control, and featured status.

## Requirements

### Requirement: Product List
The system SHALL display all products in the admin panel.

#### Scenario: View product list
- GIVEN an administrator is authenticated
- WHEN the products page is accessed
- THEN all products are displayed with name, price, stock, status, and featured flag

### Requirement: Product Creation
The system SHALL allow administrators to create new products.

#### Scenario: Create product
- GIVEN an administrator fills in name, description, price, stock, category, and brand
- WHEN the product form is submitted
- THEN a new product is created with a generated slug
- AND the product is inactive by default

#### Scenario: Duplicate slug
- GIVEN a product with slug "iphone-16" exists
- WHEN a new product generates the same slug
- THEN the slug is made unique by appending a suffix

### Requirement: Product Update
The system SHALL allow administrators to edit existing products.

#### Scenario: Edit product
- GIVEN a product exists
- WHEN an administrator modifies product fields and saves
- THEN changes are persisted

### Requirement: Product Deletion
The system SHALL support soft deletion (archiving) of products.

#### Scenario: Archive product
- GIVEN a product exists
- WHEN an administrator deletes the product
- THEN the product is marked as archived (not physically deleted)
- AND it no longer appears in the storefront

### Requirement: Product Images
The system SHALL support uploading multiple images per product.

#### Scenario: Upload images
- GIVEN an administrator is editing a product
- WHEN images are uploaded
- THEN images are stored in Cloudinary and associated with the product

#### Scenario: Image ordering
- GIVEN a product has multiple images
- WHEN an administrator reorders images
- THEN the display order is updated

#### Scenario: Delete image
- GIVEN a product has images
- WHEN an administrator deletes an image
- THEN the image is removed from the product

### Requirement: Featured Products
The system SHALL allow toggling featured status on products.

#### Scenario: Enable featured
- GIVEN a product exists
- WHEN an administrator enables featured
- THEN the product appears on the homepage featured section

#### Scenario: Disable featured
- GIVEN a featured product exists
- WHEN an administrator disables featured
- THEN the product no longer appears on the homepage

### Requirement: Stock Management
The system SHALL allow administrators to manage product stock.

#### Scenario: Update stock
- GIVEN a product exists with stock = 5
- WHEN an administrator changes stock to 10
- THEN the available stock is updated to 10

### Requirement: Product Activation
The system SHALL allow activating and deactivating products.

#### Scenario: Activate product
- GIVEN an inactive product exists
- WHEN an administrator activates it
- THEN the product appears in the storefront

#### Scenario: Deactivate product
- GIVEN an active product exists
- WHEN an administrator deactivates it
- THEN the product is hidden from the storefront

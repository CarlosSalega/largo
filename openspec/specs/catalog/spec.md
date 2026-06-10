# Catalog Specification

## Purpose

Product listing page with search, filtering, sorting, and pagination capabilities.

## Requirements

### Requirement: Product Grid
The system SHALL display active products in a responsive grid layout.

#### Scenario: Products exist
- GIVEN active products with stock exist
- WHEN a visitor opens the catalog
- THEN products are displayed in a grid with image, name, price, and availability

#### Scenario: No products
- GIVEN no active products exist
- WHEN a visitor opens the catalog
- THEN an empty state message is displayed

### Requirement: Product Search
The system SHALL support keyword-based product search.

#### Scenario: Search by keyword
- GIVEN products exist
- WHEN a visitor enters a search term
- THEN products matching the keyword in name or description are displayed

#### Scenario: No results
- GIVEN products exist
- WHEN a visitor searches for a term with no matches
- THEN a "no results" message is displayed

### Requirement: Category Filtering
The system SHALL support filtering products by category.

#### Scenario: Filter by category
- GIVEN categories with products exist
- WHEN a visitor selects a category
- THEN only products in that category are displayed

#### Scenario: Clear category filter
- GIVEN a category filter is active
- WHEN the visitor clears the filter
- THEN all products are displayed again

### Requirement: Brand Filtering
The system SHALL support filtering products by brand.

#### Scenario: Filter by brand
- GIVEN brands with products exist
- WHEN a visitor selects a brand
- THEN only products of that brand are displayed

### Requirement: Combined Filters
The system SHALL support combining category and brand filters simultaneously.

#### Scenario: Multiple filters active
- GIVEN a category filter and brand filter are both active
- WHEN the catalog renders
- THEN only products matching both filters are displayed

### Requirement: Sorting
The system SHALL support sorting products by multiple criteria.

#### Scenario: Sort by price ascending
- GIVEN products exist
- WHEN a visitor selects "price: low to high"
- THEN products are ordered by price ascending

#### Scenario: Sort by price descending
- GIVEN products exist
- WHEN a visitor selects "price: high to low"
- THEN products are ordered by price descending

#### Scenario: Sort by name
- GIVEN products exist
- WHEN a visitor selects "name: A-Z"
- THEN products are ordered alphabetically by name

### Requirement: Pagination
The system SHALL paginate product results.

#### Scenario: Multiple pages
- GIVEN more products exist than the page size
- WHEN the catalog loads
- THEN products are displayed in pages with navigation controls

#### Scenario: Navigate pages
- GIVEN multiple pages exist
- WHEN the visitor clicks next page
- THEN the next set of products is displayed

### Requirement: Active Products Only
The system SHALL only display active products in the catalog.

#### Scenario: Inactive products hidden
- GIVEN both active and inactive products exist
- WHEN the catalog loads
- THEN only active products are displayed

### Requirement: Stock Availability Display
The system SHALL display stock availability information for each product.

#### Scenario: Product in stock
- GIVEN a product with stock > 0
- WHEN the catalog renders
- THEN the product shows as available

#### Scenario: Product out of stock
- GIVEN a product with stock = 0
- WHEN the catalog renders
- THEN the product shows as "Out of stock"

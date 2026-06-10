# Admin Categories Specification

## Purpose

Administrative interface for managing product categories including creation, editing, deletion, images, and featured status.

## Requirements

### Requirement: Category List
The system SHALL display all categories in the admin panel.

#### Scenario: View category list
- GIVEN an administrator is authenticated
- WHEN the categories page is accessed
- THEN all categories are displayed with name, product count, and featured flag

### Requirement: Category Creation
The system SHALL allow administrators to create new categories.

#### Scenario: Create category
- GIVEN an administrator fills in name and optional description
- WHEN the category form is submitted
- THEN a new category is created with a generated slug

#### Scenario: Duplicate name
- GIVEN a category named "Electronics" exists
- WHEN a new category with the same name is created
- THEN the slug is made unique

### Requirement: Category Update
The system SHALL allow administrators to edit existing categories.

#### Scenario: Edit category
- GIVEN a category exists
- WHEN an administrator modifies category fields and saves
- THEN changes are persisted

### Requirement: Category Deletion
The system SHALL support soft deletion (archiving) of categories.

#### Scenario: Archive category
- GIVEN a category exists with no active products
- WHEN an administrator deletes the category
- THEN the category is marked as archived

#### Scenario: Category with products
- GIVEN a category exists with active products
- WHEN an administrator attempts to delete
- THEN a warning is shown about associated products

### Requirement: Featured Categories
The system SHALL allow toggling featured status on categories.

#### Scenario: Enable featured
- GIVEN a category exists
- WHEN an administrator enables featured
- THEN the category appears on the homepage featured section

#### Scenario: Disable featured
- GIVEN a featured category exists
- WHEN an administrator disables featured
- THEN the category no longer appears on the homepage

### Requirement: Category Images
The system SHALL support uploading an image per category.

#### Scenario: Upload image
- GIVEN an administrator is editing a category
- WHEN an image is uploaded
- THEN the image is stored in Cloudinary and associated with the category

#### Scenario: Replace image
- GIVEN a category has an image
- WHEN an administrator uploads a new image
- THEN the old image is replaced

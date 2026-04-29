# Product Specification Document (PRD) for TestSprite
## Project: Shesheny Motors Website Testing

### 1. Introduction
This document outlines the testing requirements for the Shesheny Motors website, a luxury car dealership platform. The goal is to provide **TestSprite** with a comprehensive guide to perform automated end-to-end testing across all public and administrative interfaces.

### 2. Testing Objectives
- Ensure all public pages load correctly and are responsive.
- Verify the integrity of the car inventory search and filtering system.
- Validate the customer interaction flows (Inquiries, Deposits, Custom Requests).
- Confirm the correctness of internationalization (English/Arabic) and currency toggling.
- Secure the administrative dashboard and verify all management operations (CRUD).

### 3. User Roles
- **Guest/Customer**: Public access to browse inventory, search, view details, add to favorites, submit inquiries/requests, and manage a deposit cart.
- **Administrator**: Authenticated access to manage the entire platform (cars, brands, categories, settings).

### 4. Core Functional Modules & Test Cases

#### 4.1. Navigation & Public Pages
- **Home (`index.html`)**:
  - Verify Hero section loads with dynamic title/subtitle.
  - Check "Featured Inventory" grid loads vehicles.
- **Inventory (`inventory.html`)**:
  - Verify all vehicles are displayed.
  - Test Search functionality by name/brand.
  - Test Filtering by Category and Brand.
  - Verify "View Details" redirects to `details.html`.
- **About (`about.html`)**:
  - Verify content blocks (Mission, Vision, etc.) are visible.
- **Contact (`contact.html`)**:
  - Verify contact info and map embed.
  - Test inquiry form submission (Name, Email, Message).

#### 4.2. Car Details & Interactions
- **Details (`details.html?id=...`)**:
  - Verify specific car data (Price, Specs, Description) loads based on URL ID.
  - Test Image Gallery (thumbnails and main view).
  - Test "Add to Favorites" (persistence check).
  - Test "Deposit" button (adds car to cart).
- **Cart (`cart.html`)**:
  - Verify cars added for deposit appear in the list.
  - Test "Request Deposit" form submission.
- **Favorites (`favorites.html`)**:
  - Verify liked cars appear here.
  - Test removal from favorites.
- **Custom Request (`request.html`)**:
  - Test submission of specialized car requests (Budget, Requirements).

#### 4.3. Localization & UI Controls
- **Language Toggle**:
  - Switch between English and Arabic.
  - Verify text changes based on `translations.json` keys.
  - Verify layout direction (LTR for EN, RTL for AR).
- **Currency Toggle**:
  - Switch between EGP and USD.
  - Verify price calculations match the exchange rate set in Admin Settings.

#### 4.4. Admin Dashboard (`admin.html`)
- **Authentication**:
  - Test login with valid/invalid credentials.
  - Verify logout functionality.
- **Product Management**:
  - Create a new vehicle (fill EN/AR names, price, upload images).
  - Edit an existing vehicle.
  - Mark a vehicle as "Sold Out" or "Spotlight".
  - Delete a vehicle.
  - Reorder vehicles using drag-and-drop (if supported by test environment).
- **Management Tabs**:
  - **Brands**: Add/Edit/Delete car brands.
  - **Categories**: Add/Edit/Delete categories.
  - **Inquiries/Deposits/Requests**: View lists, mark as read, delete.
- **Settings**:
  - Update Currency Exchange rate.
  - Update Hero Background image.
  - Update Social links (Instagram, Facebook, etc.).

### 5. Critical User Flows
1. **The Purchase Intent Flow**:
   - Customer enters Home -> Clicks "View Inventory" -> Filters for "SUV" -> Selects a car -> Views details -> Clicks "Deposit" -> Goes to Cart -> Submits Deposit Request.
2. **The Admin Update Flow**:
   - Admin logs in -> Navigates to Products -> Adds a new vehicle -> Marks as "Spotlight" -> Logs out -> Checks Home page for the new featured vehicle.
3. **The Global User Flow**:
   - Customer searches for a car -> Toggles Currency to USD -> Toggles Language to Arabic -> Verifies price and text conversion.

### 6. Technical Requirements for TestSprite
- **Base URL**: (To be provided by user/deployment environment)
- **Admin Credentials**: (Test account required)
- **Supabase Connectivity**: Tests should account for asynchronous data loading from Supabase.
- **PWA Check**: Verify Service Worker (`sw.js`) registration.

### 7. Success Criteria
- 100% pass rate on form submissions (Contact, Deposit, Request).
- No broken links in Header/Footer components.
- No console errors during data fetching or language switching.
- Admin CRUD operations persist correctly in the database.

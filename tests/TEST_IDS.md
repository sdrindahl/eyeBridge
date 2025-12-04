# Test IDs Reference Guide

This document lists all `data-testid` attributes available in the Eye Bridges application for testing.

## Password Gate (`PasswordGate.jsx`)
- `password-gate` - Main password gate container

## Dashboard Page (`Dashboard.jsx`)

### Header
- `dashboard-header` - Header container
- `logo-link` - Logo link to home
- `home-button` - Home navigation button
- `browse-vendors-button` - Browse Vendors button
- `user-email` - User email display
- `logout-button` - Logout button

### Main Content
- `dashboard-main` - Main content container
- `dashboard-title` - "My Dashboard" heading

### Search
- `category-dropdown` - Category filter dropdown
- `search-input` - Search input field
- `clear-search-button` - Clear search button
- `search-button` - Search vendors button

### Quick Stats Cards
- `quick-stats` - Quick stats grid container
- `favorites-stat-card` - Favorites stat card
- `favorites-label` - "Favorites" label
- `favorites-count` - Favorites count number
- `searches-stat-card` - Recent Searches stat card
- `searches-label` - "Recent Searches" label
- `searches-count` - Recent searches count
- `contacted-stat-card` - Contacted stat card
- `contacted-label` - "Contacted" label
- `contacted-count` - Contacted count
- `comparisons-stat-card` - Comparisons stat card
- `comparisons-label` - "Comparisons" label
- `comparisons-count` - Comparisons count

## Login Page (`Login.jsx`)
- `login-card` - Login card container
- `login-form` - Login form element
- `login-error` - Error message container
- `email-input` - Email input field
- `password-input` - Password input field

## Vendors Page (`Vendors.jsx`)

### Header
- `vendors-header` - Header container
- `logo-link` - Logo link to home
- `vendors-title` - "Vendor Directory" heading
- `home-button` - Home navigation button
- `dashboard-button` - Dashboard button (when logged in)
- `logout-button` - Logout button (when logged in)
- `login-button` - Login button (when logged out)

## Home Page (`Home.jsx`)
- `home-header` - Header container
- `logo-link` - Logo link to home

---

## Usage in Tests

### Using getByTestId
```javascript
// Click logout button
await page.getByTestId('logout-button').click();

// Fill search input
await page.getByTestId('search-input').fill('optical');

// Check if Quick Stats is visible
await expect(page.getByTestId('quick-stats')).toBeVisible();
```

### Using locator with data-testid
```javascript
// Get favorites count
const favCount = await page.locator('[data-testid="favorites-count"]').textContent();

// Click stat card
await page.locator('[data-testid="favorites-stat-card"]').click();
```

### Advantages of Test IDs
1. **Stable** - Don't break when CSS classes change
2. **Explicit** - Clear intent for testing
3. **Fast** - More efficient than complex selectors
4. **Maintainable** - Easy to find and update
5. **Framework-agnostic** - Works with any testing tool

---

## Best Practices

✅ **Do:**
- Use `data-testid` for interactive elements (buttons, inputs, links)
- Use `data-testid` for important content containers
- Use descriptive, kebab-case names
- Document all test IDs in this file

❌ **Don't:**
- Add test IDs to every single element
- Use test IDs for styling or business logic
- Duplicate test ID values
- Use generated or dynamic test ID values

---

## Adding New Test IDs

When adding new features, follow this pattern:

```jsx
<button
  data-testid="my-action-button"
  onClick={handleClick}
  className="..."
>
  Click Me
</button>
```

Then update this document with the new test ID.

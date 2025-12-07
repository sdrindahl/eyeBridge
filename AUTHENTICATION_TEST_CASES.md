# Authentication System Test Cases

## Prerequisites
- Backend server running on http://localhost:3001
- Frontend dev server running on http://localhost:5174
- SQLite database initialized at `/Users/scottrindahl/repo/eyeBridge/server/db/eyebridge.db`

## Test Case 1: User Registration - Happy Path

**Objective**: Verify successful user registration with valid credentials

**Steps**:
1. Navigate to http://localhost:5174
2. Click "Sign up" link at the bottom of the login form
3. Fill in the registration form:
   - First Name: "John" (optional)
   - Last Name: "Doe" (optional)
   - Practice Name: "ABC Eye Care" (optional)
   - Email: "john.doe@example.com"
   - Password: "Test123!@#"
   - Confirm Password: "Test123!@#"
4. Click "Create Account" button

**Expected Results**:
- User is automatically logged in
- Redirected to Dashboard page
- Email "john.doe@example.com" displayed in UI
- No error messages shown

**Database Verification**:
```bash
cd /Users/scottrindahl/repo/eyeBridge/server
sqlite3 db/eyebridge.db "SELECT email, first_name, last_name, practice_name, created_at FROM users WHERE email='john.doe@example.com';"
```

---

## Test Case 2: User Registration - Password Validation

**Objective**: Verify password validation rules are enforced

**Test 2a - Password Too Short**:
1. Navigate to http://localhost:5174/register
2. Enter email: "test@example.com"
3. Enter password: "Test1!"
4. Enter confirm password: "Test1!"
5. Click "Create Account"

**Expected**: Error message "Password must be at least 6 characters long"

**Test 2b - Missing Uppercase**:
1. Enter password: "test123!@#"
2. Enter confirm password: "test123!@#"
3. Click "Create Account"

**Expected**: Error message "Password must contain at least one uppercase letter"

**Test 2c - Missing Lowercase**:
1. Enter password: "TEST123!@#"
2. Enter confirm password: "TEST123!@#"
3. Click "Create Account"

**Expected**: Error message "Password must contain at least one lowercase letter"

**Test 2d - Missing Number**:
1. Enter password: "TestAbc!@#"
2. Enter confirm password: "TestAbc!@#"
3. Click "Create Account"

**Expected**: Error message "Password must contain at least one number"

**Test 2e - Missing Special Character**:
1. Enter password: "TestAbc123"
2. Enter confirm password: "TestAbc123"
3. Click "Create Account"

**Expected**: Error message "Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)"

**Test 2f - Passwords Don't Match**:
1. Enter password: "Test123!@#"
2. Enter confirm password: "Test456!@#"
3. Click "Create Account"

**Expected**: Error message "Passwords do not match"

---

## Test Case 3: User Registration - Email Validation

**Objective**: Verify email validation

**Test 3a - Invalid Email Format**:
1. Navigate to http://localhost:5174/register
2. Enter email: "invalid-email"
3. Enter valid password
4. Click "Create Account"

**Expected**: Error message "Please enter a valid email address"

**Test 3b - Duplicate Email**:
1. Register user with email: "duplicate@example.com"
2. Log out (clear localStorage or use new browser)
3. Try to register again with same email: "duplicate@example.com"
4. Click "Create Account"

**Expected**: Error message "Email already exists"

---

## Test Case 4: User Login - Happy Path

**Objective**: Verify successful login with valid credentials

**Prerequisite**: User registered with email "john.doe@example.com" and password "Test123!@#"

**Steps**:
1. Navigate to http://localhost:5174/login
2. Enter email: "john.doe@example.com"
3. Enter password: "Test123!@#"
4. Click "Sign In"

**Expected Results**:
- User is logged in successfully
- Redirected to Dashboard page
- Email displayed in UI
- JWT token stored in localStorage (key: "authToken")

**Verification**:
- Open browser DevTools > Application > Local Storage
- Verify "authToken" exists and contains JWT token
- Verify "isLoggedIn" = "true"
- Verify "userEmail" = "john.doe@example.com"

---

## Test Case 5: User Login - Invalid Credentials

**Objective**: Verify login fails with incorrect credentials

**Test 5a - Wrong Password**:
1. Navigate to http://localhost:5174/login
2. Enter email: "john.doe@example.com"
3. Enter password: "WrongPassword123!"
4. Click "Sign In"

**Expected**: Error message "Invalid email or password"

**Test 5b - Non-existent Email**:
1. Enter email: "nonexistent@example.com"
2. Enter password: "Test123!@#"
3. Click "Sign In"

**Expected**: Error message "Invalid email or password"

**Test 5c - Empty Fields**:
1. Leave email and password empty
2. Click "Sign In"

**Expected**: Error message "Please enter both email and password"

---

## Test Case 6: JWT Token Authentication

**Objective**: Verify JWT token is sent with API requests

**Steps**:
1. Log in successfully
2. Open browser DevTools > Network tab
3. Navigate to Dashboard or perform any action that requires authentication
4. Check API requests to http://localhost:3001/api/user/*

**Expected Results**:
- All requests to `/api/user/*` endpoints include `Authorization: Bearer <token>` header
- Requests return status 200 with user data
- Requests without token return status 401 Unauthorized

**Manual API Test**:
```bash
# Get token from localStorage in browser console
# Copy the authToken value, then test:

TOKEN="your-jwt-token-here"

# Should succeed (status 200)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/user/profile

# Should fail (status 401)
curl http://localhost:3001/api/user/profile
```

---

## Test Case 7: Token Verification on Page Load

**Objective**: Verify authentication persists across page refreshes

**Steps**:
1. Log in successfully at http://localhost:5174/login
2. Navigate to Dashboard
3. Refresh the page (F5 or Cmd+R)

**Expected Results**:
- User remains logged in
- Dashboard loads with user data
- No redirect to login page
- API call to `/api/auth/verify` succeeds

**Verification in Network Tab**:
- Should see GET request to `/api/auth/verify` with Authorization header
- Response status: 200
- Response body contains user email and id

---

## Test Case 8: Data Persistence Across Devices

**Objective**: Verify user data syncs across different browsers/devices

**Prerequisites**: User registered and logged in with favorites/notes/reviews saved

**Steps**:
1. Log in on Browser 1 (e.g., Chrome)
2. Add a favorite vendor on Vendors page
3. Add a note to a vendor
4. Add a review with rating
5. Log out or close browser
6. Open Browser 2 (e.g., Safari or Incognito/Private window)
7. Log in with same credentials

**Expected Results**:
- All favorites from Browser 1 appear in Browser 2
- All notes are visible in Browser 2
- All reviews are visible in Browser 2
- Data is identical across browsers

---

## Test Case 9: User Profile Management (Future Feature)

**Objective**: Test profile update functionality

**API Test** (Backend already supports this):
```bash
TOKEN="your-jwt-token-here"

# Get current profile
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/user/profile

# Update profile
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Smith","practiceName":"XYZ Vision Center"}' \
  http://localhost:3001/api/user/profile
```

---

## Test Case 10: Favorites Integration with Backend

**Objective**: Verify favorites are stored in database and sync properly

**Steps**:
1. Log in at http://localhost:5174/login
2. Navigate to Vendors page
3. Click the heart icon on a vendor to add to favorites
4. Refresh the page

**Expected Results**:
- Favorite remains after refresh
- API calls visible in Network tab:
  - POST `/api/user/favorites` when adding
  - GET `/api/user/favorites` when loading page

**Database Verification**:
```bash
cd /Users/scottrindahl/repo/eyeBridge/server
sqlite3 db/eyebridge.db "SELECT * FROM favorites WHERE user_id=(SELECT id FROM users WHERE email='john.doe@example.com');"
```

---

## Test Case 11: Notes Integration with Backend

**Objective**: Verify vendor notes are stored in database

**Steps**:
1. Log in and navigate to Vendors page
2. Click on a vendor to open modal
3. Click "Add Note" or "Edit Note" button
4. Enter note text: "This is a test note"
5. Save the note
6. Close and reopen the vendor modal

**Expected Results**:
- Note text persists after closing/reopening modal
- Note visible in "Notes" section of modal
- API calls visible:
  - POST `/api/user/notes` when saving
  - GET `/api/user/notes` when loading

**Database Verification**:
```bash
sqlite3 db/eyebridge.db "SELECT vendor_name, note_text FROM vendor_notes WHERE user_id=(SELECT id FROM users WHERE email='john.doe@example.com');"
```

---

## Test Case 12: Reviews Integration with Backend

**Objective**: Verify vendor reviews are stored in database

**Steps**:
1. Log in and navigate to Vendors page
2. Click on a vendor to open modal
3. Scroll to Reviews section
4. Click to add a rating (e.g., 4 stars)
5. Optionally add a comment: "Great vendor!"
6. Save the review
7. Refresh the page and open the same vendor modal

**Expected Results**:
- Review and rating persist after refresh
- Review displays in "Reviews" section
- API calls visible:
  - POST `/api/user/reviews` when saving
  - GET `/api/user/reviews` when loading

**Database Verification**:
```bash
sqlite3 db/eyebridge.db "SELECT vendor_name, rating, comment FROM vendor_reviews WHERE user_id=(SELECT id FROM users WHERE email='john.doe@example.com');"
```

---

## Test Case 13: Session Timeout

**Objective**: Verify JWT token expiration (7 days)

**Note**: This test requires waiting 7 days or manually modifying token expiration in code

**Steps**:
1. Log in successfully
2. Wait for token to expire (or modify JWT_SECRET in server/.env to invalidate tokens)
3. Try to access Dashboard or make an API request

**Expected Results**:
- API requests return 401 Unauthorized
- User is redirected to login page
- Error message prompts user to log in again

**Quick Test** (Change JWT_SECRET):
```bash
# Edit server/.env and change JWT_SECRET
# Restart backend server
# Try to access Dashboard with old token
```

---

## Test Case 14: Loading States

**Objective**: Verify UI shows loading states during authentication

**Steps**:
1. Navigate to Login page
2. Enter valid credentials
3. Click "Sign In" button
4. Observe button state

**Expected Results**:
- Button text changes to "Signing In..."
- Button is disabled during request
- Cursor shows not-allowed when hovering over button

**Repeat for Registration**:
- Button text changes to "Creating Account..."
- Button is disabled during registration

---

## Test Case 15: Error Handling

**Objective**: Verify proper error messages for network issues

**Test 15a - Backend Server Down**:
1. Stop the backend server: `pkill -f "node index.js"`
2. Try to log in or register

**Expected**: Error message about connection failure

**Test 15b - Invalid API URL**:
1. Edit `.env` file, set `VITE_API_URL=http://localhost:9999/api`
2. Restart frontend
3. Try to log in

**Expected**: Error message about connection failure

---

## Test Case 16: Browser Compatibility

**Objective**: Verify authentication works across major browsers

**Browsers to Test**:
- Chrome/Chromium
- Safari
- Firefox
- Edge

**Steps**: Perform Test Case 1 (Happy Path Registration) and Test Case 4 (Happy Path Login) in each browser

**Expected**: Consistent behavior across all browsers

---

## Test Case 17: Logout Functionality (Future Feature)

**Note**: Logout functionality needs to be implemented in frontend

**Expected Behavior**:
1. Click Logout button
2. JWT token removed from localStorage
3. User redirected to login page
4. Cannot access protected pages without logging in again

---

## API Endpoint Testing (Using curl or Postman)

### Health Check
```bash
curl http://localhost:3001/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User",
    "practiceName": "Test Practice"
  }'
# Expected: {"message":"User registered successfully","token":"...","user":{...}}
```

### Login User
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
# Expected: {"message":"Login successful","token":"...","user":{...}}
```

### Verify Token
```bash
TOKEN="your-jwt-token-here"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/auth/verify
# Expected: {"valid":true,"user":{...}}
```

### Get User Profile
```bash
TOKEN="your-jwt-token-here"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/user/profile
# Expected: {"email":"...","firstName":"...","lastName":"...","practiceName":"..."}
```

### Sync All User Data
```bash
TOKEN="your-jwt-token-here"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/user/sync
# Expected: {"favorites":[...],"searchHistory":[...],"notes":[...],"reviews":[...]}
```

---

## Database Inspection Commands

### View All Users
```bash
cd /Users/scottrindahl/repo/eyeBridge/server
sqlite3 db/eyebridge.db "SELECT id, email, first_name, last_name, created_at FROM users;"
```

### View User's Favorites
```bash
sqlite3 db/eyebridge.db "SELECT u.email, f.vendor_name, f.added_at FROM favorites f JOIN users u ON f.user_id = u.id;"
```

### View User's Notes
```bash
sqlite3 db/eyebridge.db "SELECT u.email, n.vendor_name, n.note_text, n.updated_at FROM vendor_notes n JOIN users u ON n.user_id = u.id;"
```

### View User's Reviews
```bash
sqlite3 db/eyebridge.db "SELECT u.email, r.vendor_name, r.rating, r.comment, r.created_at FROM vendor_reviews r JOIN users u ON r.user_id = u.id;"
```

### Count Records by User
```bash
sqlite3 db/eyebridge.db "
SELECT 
  u.email,
  COUNT(DISTINCT f.id) as favorites_count,
  COUNT(DISTINCT n.id) as notes_count,
  COUNT(DISTINCT r.id) as reviews_count
FROM users u
LEFT JOIN favorites f ON u.id = f.user_id
LEFT JOIN vendor_notes n ON u.id = n.user_id
LEFT JOIN vendor_reviews r ON u.id = r.user_id
GROUP BY u.email;
"
```

---

## Troubleshooting

### Reset Database
```bash
cd /Users/scottrindahl/repo/eyeBridge/server
rm db/eyebridge.db
npm run init-db
```

### Clear Browser Data
1. Open DevTools > Application > Local Storage
2. Delete all keys (authToken, isLoggedIn, userEmail, etc.)
3. Refresh page

### Check Server Logs
```bash
cd /Users/scottrindahl/repo/eyeBridge/server
tail -f server.log
```

### Verify Backend is Running
```bash
lsof -i :3001
# Should show node process
```

### Verify Frontend is Running
```bash
lsof -i :5174
# Should show node process
```

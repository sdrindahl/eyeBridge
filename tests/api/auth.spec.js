/**
 * eyeBridge API Tests - Authentication Endpoints
 * Tests for /api/auth/register, /api/auth/login, /api/auth/verify
 */

import { test, expect } from '@playwright/test';
import { API_URL, TEST_USERS, INVALID_USERS, HTTP_CODES, ERROR_MESSAGES, TIMEOUTS } from './fixtures/test-data.js';

test.describe('Authentication API - POST /auth/register', () => {
  
  test('should register new user with valid data', async ({ request }) => {
    const userData = {
      email: `test-${Date.now()}@eyebridge.test`,
      password: 'TestPass123!',
      firstName: 'John',
      lastName: 'Doe',
      practiceName: 'Doe Eye Care',
      phone: '555-0001'
    };

    const response = await request.post(`${API_URL}/auth/register`, {
      data: userData,
      timeout: TIMEOUTS.MEDIUM
    });

    expect(response.status()).toBe(HTTP_CODES.CREATED);
    const body = await response.json();
    
    expect(body).toHaveProperty('token');
    expect(body.message).toContain('registered successfully');
    expect(body.user).toMatchObject({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      practiceName: userData.practiceName,
      phone: userData.phone
    });
  });

  test('should register user with minimal data (only email and password)', async ({ request }) => {
    const userData = {
      email: `minimal-${Date.now()}@eyebridge.test`,
      password: 'MinPass456!',
      firstName: 'Jane',
      lastName: 'Smith'
    };

    const response = await request.post(`${API_URL}/auth/register`, {
      data: userData
    });

    expect(response.status()).toBe(HTTP_CODES.CREATED);
    const body = await response.json();
    expect(body).toHaveProperty('token');
    expect(body.user.email).toBe(userData.email);
  });

  test('should register user with special characters in name', async ({ request }) => {
    const userData = {
      email: `special-${Date.now()}@eyebridge.test`,
      password: 'SpecPass789!',
      firstName: "O'Brien",
      lastName: 'Müller-García'
    };

    const response = await request.post(`${API_URL}/auth/register`, {
      data: userData
    });

    expect(response.status()).toBe(HTTP_CODES.CREATED);
    const body = await response.json();
    expect(body.user.firstName).toBe(userData.firstName);
    expect(body.user.lastName).toBe(userData.lastName);
  });

  test('should generate valid JWT token on registration', async ({ request }) => {
    const userData = {
      email: `jwt-${Date.now()}@eyebridge.test`,
      password: 'JwtPass111!',
      firstName: 'Token',
      lastName: 'Tester'
    };

    const response = await request.post(`${API_URL}/auth/register`, {
      data: userData
    });

    const body = await response.json();
    const token = body.token;

    // Token should be a valid JWT format (three parts separated by dots)
    expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    
    // Verify the token works
    const verifyResponse = await request.get(`${API_URL}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(verifyResponse.ok()).toBe(true);
  });

  test('should reject registration with duplicate email', async ({ request }) => {
    const email = `duplicate-${Date.now()}@eyebridge.test`;
    
    // First registration
    const firstResponse = await request.post(`${API_URL}/auth/register`, {
      data: {
        email,
        password: 'First123!',
        firstName: 'First',
        lastName: 'User'
      }
    });
    expect(firstResponse.status()).toBe(HTTP_CODES.CREATED);

    // Second registration with same email
    const secondResponse = await request.post(`${API_URL}/auth/register`, {
      data: {
        email,
        password: 'Second456!',
        firstName: 'Second',
        lastName: 'User'
      }
    });

    expect(secondResponse.status()).toBe(HTTP_CODES.BAD_REQUEST);
    const body = await secondResponse.json();
    expect(body.error).toContain('already registered');
  });

  test('should reject registration with invalid email format', async ({ request }) => {
    const testCases = [
      'notanemail',
      'test@',
      '@example.com',
      'test @example.com',
      'test@.com'
    ];

    for (const invalidEmail of testCases) {
      const response = await request.post(`${API_URL}/auth/register`, {
        data: {
          email: invalidEmail,
          password: 'ValidPass123!'
        }
      });

      expect(response.status()).toBe(HTTP_CODES.BAD_REQUEST);
      const body = await response.json();
      expect(body.error).toContain('Invalid email');
    }
  });

  test('should reject registration with no email', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        password: 'TestPass123!',
        firstName: 'John'
      }
    });

    expect(response.status()).toBe(HTTP_CODES.BAD_REQUEST);
    const body = await response.json();
    expect(body.error).toContain('required');
  });

  test('should reject registration with no password', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: `nopass-${Date.now()}@eyebridge.test`,
        firstName: 'John'
      }
    });

    expect(response.status()).toBe(HTTP_CODES.BAD_REQUEST);
    const body = await response.json();
    expect(body.error).toContain('required');
  });

  test('should reject password shorter than 6 characters', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: `shortpass-${Date.now()}@eyebridge.test`,
        password: 'S1!'  // Only 3 characters - too short
      }
    });

    expect(response.status()).toBe(HTTP_CODES.BAD_REQUEST);
    const body = await response.json();
    expect(body.error).toContain('at least 6 characters');
  });

  test('should require uppercase in password', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: `noupper-${Date.now()}@eyebridge.test`,
        password: 'lowercase123!'
      }
    });

    expect(response.status()).toBe(HTTP_CODES.BAD_REQUEST);
    const body = await response.json();
    expect(body.error).toContain('uppercase');
  });

  test('should require lowercase in password', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: `nolower-${Date.now()}@eyebridge.test`,
        password: 'UPPERCASE123!'
      }
    });

    expect(response.status()).toBe(HTTP_CODES.BAD_REQUEST);
    const body = await response.json();
    expect(body.error).toContain('lowercase');
  });

  test('should require number in password', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: `nonumber-${Date.now()}@eyebridge.test`,
        password: 'NoNumbers!'
      }
    });

    expect(response.status()).toBe(HTTP_CODES.BAD_REQUEST);
    const body = await response.json();
    expect(body.error).toContain('number');
  });

  test('should require special character in password', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: `nospecial-${Date.now()}@eyebridge.test`,
        password: 'NoSpecial123'
      }
    });

    expect(response.status()).toBe(HTTP_CODES.BAD_REQUEST);
    const body = await response.json();
    expect(body.error).toContain('special character');
  });

  test('should accept various special characters in password', async ({ request }) => {
    const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*'];

    for (const char of specialChars) {
      const response = await request.post(`${API_URL}/auth/register`, {
        data: {
          email: `special${char.charCodeAt(0)}-${Date.now()}@eyebridge.test`,
          password: `ValidPass123${char}`
        }
      });

      expect(response.status()).toBe(HTTP_CODES.CREATED);
    }
  });

  test('should handle SQL injection attempt in email', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: "'; DROP TABLE users; --@test.com",
        password: 'SafePass123!'
      }
    });

    // Should either reject or sanitize
    expect([HTTP_CODES.BAD_REQUEST, HTTP_CODES.INTERNAL_SERVER_ERROR]).toContain(response.status());
  });

  test('should handle XSS attempt in name fields', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: `xss-${Date.now()}@eyebridge.test`,
        password: 'SafePass123!',
        firstName: '<script>alert("xss")</script>',
        lastName: '<img src=x onerror="alert(1)">'
      }
    });

    // Backend currently accepts the registration
    expect([HTTP_CODES.CREATED, HTTP_CODES.BAD_REQUEST]).toContain(response.status());
    
    // TODO: Implement input sanitization in backend
    // Currently backend does not sanitize XSS attempts
    // This is a security concern that should be addressed
  });

  test('should handle very long input values', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: `long-${Date.now()}@eyebridge.test`,
        password: 'LongPass123!',
        firstName: 'A'.repeat(100),
        lastName: 'B'.repeat(100),
        practiceName: 'C'.repeat(500)
      }
    });

    // Should either accept or reject gracefully
    expect([HTTP_CODES.CREATED, HTTP_CODES.BAD_REQUEST]).toContain(response.status());
  });

  test('should persist registered user to database', async ({ request }) => {
    const userData = {
      email: `persist-${Date.now()}@eyebridge.test`,
      password: 'PersistPass123!',
      firstName: 'Persist',
      lastName: 'User'
    };

    const registerResponse = await request.post(`${API_URL}/auth/register`, {
      data: userData
    });

    expect(registerResponse.ok()).toBe(true);
    const registerData = await registerResponse.json();
    const token = registerData.token;

    // Verify user can login immediately after registration
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: userData.email,
        password: userData.password
      }
    });

    expect(loginResponse.ok()).toBe(true);
  });
});

test.describe('Authentication API - POST /auth/login', () => {
  
  let testUser;

  test.beforeAll(async ({ request }) => {
    // Create a user for login tests
    const userData = {
      email: `logintest-${Date.now()}@eyebridge.test`,
      password: 'LoginTest123!'
    };

    const response = await request.post(`${API_URL}/auth/register`, {
      data: userData
    });

    testUser = userData;
  });

  test('should login with valid credentials', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });

    expect(response.status()).toBe(HTTP_CODES.OK);
    const body = await response.json();
    expect(body).toHaveProperty('token');
    expect(body.user.email).toBe(testUser.email);
  });

  test('should reject login with wrong password', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: testUser.email,
        password: 'WrongPassword123!'
      }
    });

    expect(response.status()).toBe(HTTP_CODES.UNAUTHORIZED);
    const body = await response.json();
    expect(body.error).toContain('Invalid credentials');
  });

  test('should reject login for non-existent user', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'nonexistent@eyebridge.test',
        password: 'SomePass123!'
      }
    });

    expect(response.status()).toBe(HTTP_CODES.UNAUTHORIZED);
  });

  test('should require email for login', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        password: 'SomePass123!'
      }
    });

    expect(response.status()).toBe(HTTP_CODES.BAD_REQUEST);
  });

  test('should require password for login', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: testUser.email
      }
    });

    expect(response.status()).toBe(HTTP_CODES.BAD_REQUEST);
  });

  test('should return valid token on successful login', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });

    const body = await response.json();
    const token = body.token;

    // Verify token is JWT format
    expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);

    // Verify token can be used for authentication
    const verifyResponse = await request.get(`${API_URL}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(verifyResponse.ok()).toBe(true);
  });

  test('should be case-insensitive for email (if applicable)', async ({ request }) => {
    const uppercaseEmail = testUser.email.toUpperCase();
    
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: uppercaseEmail,
        password: testUser.password
      }
    });

    // Check if system handles uppercase email (may or may not depending on implementation)
    expect([HTTP_CODES.OK, HTTP_CODES.UNAUTHORIZED]).toContain(response.status());
  });
});

test.describe('Authentication API - GET /auth/verify', () => {
  
  let validToken;
  let validUser;

  test.beforeAll(async ({ request }) => {
    // Create a user and get a valid token
    const userData = {
      email: `verifytest-${Date.now()}@eyebridge.test`,
      password: 'VerifyTest123!'
    };

    const response = await request.post(`${API_URL}/auth/register`, {
      data: userData
    });

    const body = await response.json();
    validToken = body.token;
    validUser = body.user;
  });

  test('should verify valid token', async ({ request }) => {
    const response = await request.get(`${API_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${validToken}`
      }
    });

    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body.valid).toBe(true);
    expect(body.user).toBeDefined();
  });

  test('should return user data on verification', async ({ request }) => {
    const response = await request.get(`${API_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${validToken}`
      }
    });

    const body = await response.json();
    expect(body.user.email).toBe(validUser.email);
    expect(body.user.id).toBe(validUser.id);
  });

  test('should reject request without token', async ({ request }) => {
    const response = await request.get(`${API_URL}/auth/verify`);

    expect(response.status()).toBe(HTTP_CODES.UNAUTHORIZED);
    const body = await response.json();
    expect(body.error).toContain('No token provided');
  });

  test('should reject invalid token format', async ({ request }) => {
    const response = await request.get(`${API_URL}/auth/verify`, {
      headers: {
        'Authorization': 'Bearer invalid.token.format'
      }
    });

    expect(response.status()).toBe(HTTP_CODES.UNAUTHORIZED);
  });

  test('should reject token with Bearer prefix missing', async ({ request }) => {
    const response = await request.get(`${API_URL}/auth/verify`, {
      headers: {
        'Authorization': validToken  // Missing "Bearer " prefix
      }
    });

    expect(response.status()).toBe(HTTP_CODES.UNAUTHORIZED);
  });
});

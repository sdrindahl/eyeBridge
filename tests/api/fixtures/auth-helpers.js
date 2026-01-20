/**
 * Authentication Helpers for eyeBridge Tests
 * Provides reusable functions for authentication flows
 */

import { request } from '@playwright/test';
import { API_URL, TEST_USERS, testDataCleanup } from './test-data.js';

/**
 * Register a new user and return the auth token
 * @param {Object} userData - User data for registration
 * @returns {Promise<{token: string, userId: number, user: Object}>}
 */
export async function registerUser(userData = null) {
  const ctx = await request.newContext();
  const user = userData || testDataCleanup.generateTestUser();

  const response = await ctx.post(`${API_URL}/auth/register`, {
    data: user
  });

  if (!response.ok()) {
    throw new Error(`Registration failed: ${response.status()} - ${await response.text()}`);
  }

  const responseData = await response.json();
  await ctx.dispose();

  return {
    token: responseData.token,
    userId: responseData.user.id,
    user: responseData.user
  };
}

/**
 * Login a user and return the auth token
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{token: string, userId: number, user: Object}>}
 */
export async function loginUser(email, password) {
  const ctx = await request.newContext();

  const response = await ctx.post(`${API_URL}/auth/login`, {
    data: { email, password }
  });

  if (!response.ok()) {
    throw new Error(`Login failed: ${response.status()} - ${await response.text()}`);
  }

  const responseData = await response.json();
  await ctx.dispose();

  return {
    token: responseData.token,
    userId: responseData.user.id,
    user: responseData.user
  };
}

/**
 * Register and login a user in one call
 * @param {Object} userData - User data for registration
 * @returns {Promise<{token: string, userId: number, user: Object}>}
 */
export async function registerAndLogin(userData = null) {
  const registered = await registerUser(userData);
  // The registration already returns a token, so we can return it directly
  return registered;
}

/**
 * Create a reusable auth header
 * @param {string} token - JWT token
 * @returns {Object} Authorization header
 */
export function getAuthHeader(token) {
  return {
    'Authorization': `Bearer ${token}`
  };
}

/**
 * Verify a token is valid
 * @param {string} token - JWT token to verify
 * @returns {Promise<boolean>}
 */
export async function verifyToken(token) {
  const ctx = await request.newContext();

  const response = await ctx.get(`${API_URL}/auth/verify`, {
    headers: getAuthHeader(token)
  });

  await ctx.dispose();
  return response.ok();
}

/**
 * Get user profile with auth token
 * @param {string} token - JWT token
 * @returns {Promise<Object>} User profile data
 */
export async function getUserProfile(token) {
  const ctx = await request.newContext();

  const response = await ctx.get(`${API_URL}/user/profile`, {
    headers: getAuthHeader(token)
  });

  if (!response.ok()) {
    throw new Error(`Failed to get profile: ${response.status()}`);
  }

  const user = await response.json();
  await ctx.dispose();
  return user;
}

/**
 * Create multiple test users for concurrent testing
 * @param {number} count - Number of users to create
 * @returns {Promise<Array<{token: string, userId: number, user: Object}>>}
 */
export async function createMultipleUsers(count = 3) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = await registerUser();
    users.push(user);
  }
  return users;
}

/**
 * Setup a test with authenticated user
 * Usage: In test file: test.beforeEach(setupAuthenticatedUser);
 * @returns {Promise<Object>} Object with token and userId for test use
 */
export async function setupAuthenticatedUser(context) {
  const authData = await registerUser();
  
  // Add auth header to all requests in this context
  await context.setExtraHTTPHeaders({
    'Authorization': `Bearer ${authData.token}`
  });

  return authData;
}

/**
 * Create test fixture for authenticated requests
 * Usage: test('...', async ({ authenticatedRequest }) => {})
 */
export async function createAuthenticatedRequest() {
  const authData = await registerUser();
  const ctx = await request.newContext({
    extraHTTPHeaders: {
      'Authorization': `Bearer ${authData.token}`
    }
  });

  return {
    ctx,
    token: authData.token,
    userId: authData.userId,
    user: authData.user,
    dispose: () => ctx.dispose()
  };
}

export default {
  registerUser,
  loginUser,
  registerAndLogin,
  getAuthHeader,
  verifyToken,
  getUserProfile,
  createMultipleUsers,
  setupAuthenticatedUser,
  createAuthenticatedRequest
};

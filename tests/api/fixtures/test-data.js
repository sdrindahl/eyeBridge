/**
 * eyeBridge Test Fixtures
 * Reusable test data and helper functions for API and UI tests
 */

// API Endpoints
export const API_URL = process.env.API_URL || 'http://localhost:3001/api';
export const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// Test User Data - Different scenarios
export const TEST_USERS = {
  // Valid user for happy path tests
  validUser: {
    email: `test-${Date.now()}@eyebridge.test`,
    password: 'TestPass123!',
    firstName: 'John',
    lastName: 'Doe',
    practiceName: 'Doe Eye Care',
    phone: '555-0001'
  },

  // User with minimal data
  minimalUser: {
    email: `minimal-${Date.now()}@eyebridge.test`,
    password: 'MinPass456!',
    firstName: 'Jane',
    lastName: 'Smith'
  },

  // User with special characters
  specialCharUser: {
    email: `test-special-${Date.now()}@eyebridge.test`,
    password: 'SpecPass789!',
    firstName: "O'Brien",
    lastName: 'Müller-García',
    practiceName: "St. Mary's Eye Care & Wellness"
  },

  // International characters
  internationalUser: {
    email: `intl-${Date.now()}@eyebridge.test`,
    password: 'IntlPass000!',
    firstName: '李',
    lastName: '王',
    practiceName: '明亮眼科'
  },

  // Long input test
  longInputUser: {
    email: `long-${Date.now()}@eyebridge.test`,
    password: 'LongPass111!',
    firstName: 'Christopher',
    lastName: 'Livingston',
    practiceName: 'The Greater Metropolitan Area Advanced Optometric Services and Wellness Center'
  }
};

// Invalid user data for negative tests
export const INVALID_USERS = {
  // Invalid email formats
  noEmail: {
    password: 'TestPass123!',
    firstName: 'John',
    lastName: 'Doe'
  },

  invalidEmailFormat: {
    email: 'not-an-email',
    password: 'TestPass123!'
  },

  invalidEmailFormat2: {
    email: 'test@',
    password: 'TestPass123!'
  },

  // Weak passwords
  noPassword: {
    email: 'test@eyebridge.test',
    firstName: 'John'
  },

  shortPassword: {
    email: 'test@eyebridge.test',
    password: 'short'
  },

  noUppercase: {
    email: 'test@eyebridge.test',
    password: 'lowercase123!'
  },

  noLowercase: {
    email: 'test@eyebridge.test',
    password: 'UPPERCASE123!'
  },

  noNumber: {
    email: 'test@eyebridge.test',
    password: 'NoNumbers!'
  },

  noSpecialChar: {
    email: 'test@eyebridge.test',
    password: 'NoSpecial123'
  }
};

// Test Vendor Data
export const TEST_VENDORS = {
  // Real-looking optometry practices
  vendors: [
    {
      id: 1,
      name: 'Smith Vision Center',
      specialty: 'Optometry',
      location: 'New York, NY',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      rating: 4.8,
      reviewCount: 156,
      description: 'Full-service eye care with latest technology',
      phone: '(212) 555-0001',
      website: 'www.smithvision.com',
      acceptsInsurance: true,
      acceptedInsurance: ['United', 'Aetna', 'Blue Cross']
    },
    {
      id: 2,
      name: 'Clear Vision Ophthalmology',
      specialty: 'Ophthalmology',
      location: 'Los Angeles, CA',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      rating: 4.6,
      reviewCount: 203,
      description: 'Surgical eye care and advanced treatments',
      phone: '(213) 555-0002',
      website: 'www.clearvisionoph.com',
      acceptsInsurance: true,
      acceptedInsurance: ['United', 'Cigna', 'Kaiser']
    },
    {
      id: 3,
      name: 'Family Eye Care Plus',
      specialty: 'Optometry',
      location: 'Chicago, IL',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      rating: 4.4,
      reviewCount: 89,
      description: 'Serving families for 20 years',
      phone: '(312) 555-0003',
      website: 'www.familyeyecare.com',
      acceptsInsurance: true,
      acceptedInsurance: ['United', 'Aetna']
    },
    {
      id: 4,
      name: 'Pediatric Eye Specialists',
      specialty: 'Pediatric Optometry',
      location: 'Boston, MA',
      city: 'Boston',
      state: 'MA',
      zipCode: '02101',
      rating: 4.9,
      reviewCount: 112,
      description: 'Specialized care for children',
      phone: '(617) 555-0004',
      website: 'www.pediaeyecare.com',
      acceptsInsurance: false,
      acceptedInsurance: []
    },
    {
      id: 5,
      name: 'Geriatric Vision Care',
      specialty: 'Optometry',
      location: 'Miami, FL',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      rating: 4.7,
      reviewCount: 167,
      description: 'Specialized care for seniors',
      phone: '(305) 555-0005',
      website: 'www.geriatricvision.com',
      acceptsInsurance: true,
      acceptedInsurance: ['Medicare', 'United', 'Aetna']
    }
  ],

  // Vendors with special characters
  specialCharVendor: {
    id: 99,
    name: "O'Brien & Müller's Eye Care",
    specialty: 'Optometry',
    location: "St. Louis, MO",
    rating: 4.5,
    reviewCount: 78
  },

  // Very high review count (performance test)
  highReviewVendor: {
    id: 100,
    name: 'Ultra Popular Eye Clinic',
    specialty: 'Optometry',
    location: 'Houston, TX',
    rating: 4.3,
    reviewCount: 5000
  }
};

// Favorite Vendors Test Data
export const FAVORITE_VENDORS = [
  'Smith Vision Center',
  'Clear Vision Ophthalmology',
  'Family Eye Care Plus'
];

// Login Test Data (existing users for login tests)
export const LOGIN_TEST_USERS = {
  validCredentials: {
    email: 'valid@eyebridge.test',
    password: 'ValidPass123!'
  },

  invalidPassword: {
    email: 'valid@eyebridge.test',
    password: 'WrongPass123!'
  },

  nonExistentUser: {
    email: 'doesnotexist@eyebridge.test',
    password: 'SomePass123!'
  },

  emptyEmail: {
    email: '',
    password: 'SomePass123!'
  },

  emptyPassword: {
    email: 'test@eyebridge.test',
    password: ''
  }
};

// Search Query Test Data
export const SEARCH_QUERIES = {
  // Valid searches
  partialName: 'Smith',
  fullName: 'Smith Vision Center',
  specialty: 'Optometry',
  location: 'New York',
  stateCode: 'NY',

  // Edge cases
  singleLetter: 'a',
  veryLong: 'a'.repeat(100),
  withNumbers: '123 Eye Care',
  withSpecialChars: "O'Brien's",
  withDiacritics: 'Müller',

  // Injection attempts
  sqlInjection: "'; DROP TABLE vendors; --",
  xssAttempt: '<script>alert("xss")</script>',
  htmlInjection: '<img src=x onerror="alert(1)">',

  // Empty/whitespace
  emptyString: '',
  whitespaceOnly: '   ',
  newlineCharacter: '\n'
};

// Filter Test Data
export const FILTER_OPTIONS = {
  specialties: [
    'Optometry',
    'Ophthalmology',
    'Pediatric Optometry',
    'Geriatric Optometry'
  ],

  states: [
    'NY', 'CA', 'IL', 'MA', 'FL', 'TX', 'PA', 'OH'
  ],

  ratingRanges: [
    { min: 4.5, max: 5.0 },
    { min: 4.0, max: 4.5 },
    { min: 3.5, max: 4.0 },
    { min: 0, max: 5.0 }
  ],

  insuranceAcceptance: [
    { acceptsInsurance: true },
    { acceptsInsurance: false },
    { insuredOnly: 'United' },
    { insuredOnly: 'Aetna' }
  ]
};

// Pagination Test Data
export const PAGINATION = {
  pageSize: 10,
  totalPages: 5,
  firstPage: 1,
  lastPage: 5,
  midPage: 3,
  invalidPage: 999,
  negativePage: -1
};

// Sorting Test Data
export const SORT_OPTIONS = {
  byRating: 'rating',
  byReviewCount: 'reviewCount',
  byName: 'name',
  byLocation: 'location',
  ascending: 'asc',
  descending: 'desc'
};

// Profile Update Test Data
export const PROFILE_UPDATES = {
  // Valid updates
  updateFirstName: {
    firstName: 'James'
  },

  updateAllFields: {
    firstName: 'James',
    lastName: 'Johnson',
    practiceName: 'Johnson Eye Center',
    phone: '555-1234'
  },

  updateWithSpecialChars: {
    firstName: "Jean-Paul",
    lastName: 'O\'Brien',
    practiceName: "St. Mary's & Associates",
    phone: '+1 (555) 123-4567'
  },

  // Edge cases
  updateToEmpty: {
    firstName: '',
    lastName: '',
    practiceName: ''
  },

  updateToNull: {
    firstName: null,
    lastName: null,
    practiceName: null,
    phone: null
  },

  updateToVeryLong: {
    firstName: 'A'.repeat(100),
    lastName: 'B'.repeat(100),
    practiceName: 'C'.repeat(200),
    phone: '1'.repeat(50)
  }
};

// Password Update Test Data (if feature exists)
export const PASSWORD_UPDATES = {
  validNewPassword: {
    currentPassword: 'CurrentPass123!',
    newPassword: 'NewPass456!'
  },

  weakNewPassword: {
    currentPassword: 'CurrentPass123!',
    newPassword: 'weak'
  },

  wrongCurrentPassword: {
    currentPassword: 'WrongPass123!',
    newPassword: 'NewPass456!'
  }
};

// HTTP Status Codes for Tests
export const HTTP_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Common Error Messages
export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Invalid email format',
  EMAIL_REQUIRED: 'Email and password are required',
  PASSWORD_REQUIRED: 'Email and password are required',
  PASSWORD_TOO_WEAK: 'Password must be at least 6 characters',
  PASSWORD_MISSING_UPPERCASE: 'Password must contain uppercase',
  PASSWORD_MISSING_LOWERCASE: 'Password must contain lowercase',
  PASSWORD_MISSING_NUMBER: 'Password must contain number',
  PASSWORD_MISSING_SPECIAL: 'Password must contain special character',
  EMAIL_ALREADY_REGISTERED: 'Email already registered',
  INVALID_CREDENTIALS: 'Invalid credentials',
  NO_TOKEN_PROVIDED: 'No token provided',
  TOKEN_INVALID: 'Token invalid or expired',
  USER_NOT_FOUND: 'User not found',
  VENDOR_NOT_FOUND: 'Vendor not found',
  UNAUTHORIZED: 'Unauthorized'
};

// Timeouts for Tests
export const TIMEOUTS = {
  SHORT: 5000,        // 5 seconds for quick operations
  MEDIUM: 15000,      // 15 seconds for standard operations
  LONG: 30000,        // 30 seconds for slower operations
  DATABASE: 10000,    // 10 seconds for database operations
  NETWORK: 20000      // 20 seconds for network calls
};

// Retry Configuration
export const RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelayMs: 100,
  backoffMultiplier: 2
};

// Response Validation Schemas
export const RESPONSE_SCHEMAS = {
  // User response schema
  userSchema: {
    id: 'number',
    email: 'string',
    firstName: 'string|null',
    lastName: 'string|null',
    practiceName: 'string|null',
    phone: 'string|null',
    createdAt: 'string'
  },

  // Auth response schema
  authSchema: {
    message: 'string',
    token: 'string',
    user: 'object'
  },

  // Vendor response schema
  vendorSchema: {
    id: 'number',
    name: 'string',
    specialty: 'string',
    location: 'string',
    rating: 'number',
    reviewCount: 'number'
  },

  // Error response schema
  errorSchema: {
    error: 'string'
  },

  // Vendors list schema
  vendorsListSchema: {
    vendors: 'array',
    total: 'number',
    page: 'number',
    pageSize: 'number'
  }
};

// Test Data Cleanup Functions
export const testDataCleanup = {
  // Generate unique email for each test run
  generateUniqueEmail: (prefix = 'test') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@eyebridge.test`;
  },

  // Generate test user with unique email
  generateTestUser: () => {
    return {
      ...TEST_USERS.validUser,
      email: this.generateUniqueEmail('user')
    };
  },

  // Generate multiple test users
  generateMultipleUsers: (count = 5) => {
    return Array.from({ length: count }, () => this.generateTestUser());
  }
};

export default {
  API_URL,
  BASE_URL,
  TEST_USERS,
  INVALID_USERS,
  TEST_VENDORS,
  FAVORITE_VENDORS,
  LOGIN_TEST_USERS,
  SEARCH_QUERIES,
  FILTER_OPTIONS,
  PAGINATION,
  SORT_OPTIONS,
  PROFILE_UPDATES,
  PASSWORD_UPDATES,
  HTTP_CODES,
  ERROR_MESSAGES,
  TIMEOUTS,
  RETRY_CONFIG,
  RESPONSE_SCHEMAS,
  testDataCleanup
};

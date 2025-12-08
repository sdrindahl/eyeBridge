/**
 * End-to-End Authentication Flow Test
 * Tests the complete authentication flow including registration, login, token verification, and data operations
 */

const API_URL = 'http://localhost:3001/api';

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const { headers = {}, ...restOptions } = options;
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  
  return data;
}

// Test data
const testUser = {
  email: `test_${Date.now()}@example.com`,
  password: 'Test123!@#',
  firstName: 'Test',
  lastName: 'User'
};

let authToken = null;

async function runTests() {
  console.log('🚀 Starting End-to-End Authentication Flow Tests\n');
  
  try {
    // Test 1: Register a new user
    console.log('📝 Test 1: User Registration');
    const registerResponse = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(testUser)
    });
    
    if (registerResponse.token) {
      authToken = registerResponse.token;
      console.log('✅ Registration successful');
      console.log(`   Token received: ${authToken.substring(0, 20)}...`);
    } else {
      throw new Error('No token received from registration');
    }
    
    // Test 2: Verify token
    console.log('\n🔐 Test 2: Token Verification');
    const verifyResponse = await apiRequest('/auth/verify', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (verifyResponse.user && verifyResponse.user.email === testUser.email) {
      console.log('✅ Token verification successful');
      console.log(`   User email: ${verifyResponse.user.email}`);
    } else {
      throw new Error('Token verification failed');
    }
    
    // Test 3: Get user profile
    console.log('\n👤 Test 3: Get User Profile');
    const profileResponse = await apiRequest('/user/profile', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (profileResponse.email === testUser.email) {
      console.log('✅ Profile retrieval successful');
      console.log(`   First Name: ${profileResponse.firstName}`);
      console.log(`   Last Name: ${profileResponse.lastName}`);
    } else {
      throw new Error('Profile retrieval failed');
    }
    
    // Test 4: Add a favorite
    console.log('\n⭐ Test 4: Add Favorite');
    const addFavoriteResponse = await apiRequest('/user/favorites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ vendorName: 'Test Vendor' })
    });
    
    console.log('✅ Favorite added successfully');
    
    // Test 5: Get favorites
    console.log('\n📋 Test 5: Get Favorites');
    const favoritesResponse = await apiRequest('/user/favorites', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (favoritesResponse.favorites && favoritesResponse.favorites.includes('Test Vendor')) {
      console.log('✅ Favorites retrieval successful');
      console.log(`   Favorites: ${favoritesResponse.favorites.join(', ')}`);
    } else {
      throw new Error('Favorites not found');
    }
    
    // Test 6: Add a note
    console.log('\n📝 Test 6: Add Note');
    await apiRequest('/user/notes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ vendorName: 'Test Vendor', note: 'This is a test note' })
    });
    
    console.log('✅ Note added successfully');
    
    // Test 7: Get notes
    console.log('\n📄 Test 7: Get Notes');
    const notesResponse = await apiRequest('/user/notes', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (notesResponse.notes && notesResponse.notes['Test Vendor']) {
      console.log('✅ Notes retrieval successful');
      console.log(`   Note: ${notesResponse.notes['Test Vendor']}`);
    } else {
      throw new Error('Notes not found');
    }
    
    // Test 8: Add a review
    console.log('\n⭐ Test 8: Add Review');
    await apiRequest('/user/reviews', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ 
        vendorName: 'Test Vendor', 
        rating: 5, 
        comment: 'Excellent vendor!' 
      })
    });
    
    console.log('✅ Review added successfully');
    
    // Test 9: Sync user data
    console.log('\n🔄 Test 9: Sync User Data');
    const syncResponse = await apiRequest('/user/sync', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (syncResponse.favorites && syncResponse.notes && syncResponse.reviews) {
      console.log('✅ Data sync successful');
      console.log(`   Favorites count: ${syncResponse.favorites.length}`);
      console.log(`   Notes count: ${Object.keys(syncResponse.notes).length}`);
      console.log(`   Reviews count: ${Object.keys(syncResponse.reviews).length}`);
    } else {
      throw new Error('Data sync incomplete');
    }
    
    // Test 10: Login with existing user
    console.log('\n🔑 Test 10: User Login');
    const loginResponse = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    if (loginResponse.token) {
      console.log('✅ Login successful');
      console.log(`   New token received: ${loginResponse.token.substring(0, 20)}...`);
    } else {
      throw new Error('Login failed');
    }
    
    // Test 11: Remove favorite
    console.log('\n🗑️  Test 11: Remove Favorite');
    await apiRequest(`/user/favorites/${encodeURIComponent('Test Vendor')}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Favorite removed successfully');
    
    // Test 12: Verify favorite was removed
    console.log('\n✔️  Test 12: Verify Favorite Removal');
    const finalFavoritesResponse = await apiRequest('/user/favorites', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!finalFavoritesResponse.favorites.includes('Test Vendor')) {
      console.log('✅ Favorite removal verified');
    } else {
      throw new Error('Favorite was not removed');
    }
    
    console.log('\n✨ All tests passed successfully! ✨\n');
    console.log('Summary:');
    console.log('  ✅ User registration');
    console.log('  ✅ Token verification');
    console.log('  ✅ User profile retrieval');
    console.log('  ✅ Add/get favorites');
    console.log('  ✅ Add/get notes');
    console.log('  ✅ Add reviews');
    console.log('  ✅ Data synchronization');
    console.log('  ✅ User login');
    console.log('  ✅ Remove favorites');
    console.log('  ✅ Data consistency');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the tests
runTests();

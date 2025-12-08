const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class APIService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(),
    };

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { error: text || 'Server error' };
      }

      if (!response.ok) {
        // Handle specific HTTP error codes
        if (response.status === 401) {
          throw new Error('Unauthorized - Invalid credentials or token expired');
        } else if (response.status === 403) {
          throw new Error('Forbidden - Access denied');
        } else if (response.status === 404) {
          throw new Error('Not found');
        } else if (response.status === 500) {
          throw new Error('Server error - Please try again later');
        }
        
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('Network error - Unable to connect to server:', error);
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      
      console.error('API request error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async verifyToken() {
    return this.request('/auth/verify');
  }

  logout() {
    this.setToken(null);
    localStorage.clear();
  }

  // User endpoints
  async getProfile() {
    return this.request('/user/profile');
  }

  async updateProfile(profileData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getFavorites() {
    return this.request('/user/favorites');
  }

  async addFavorite(vendorName) {
    return this.request('/user/favorites', {
      method: 'POST',
      body: JSON.stringify({ vendorName }),
    });
  }

  async removeFavorite(vendorName) {
    return this.request(`/user/favorites/${encodeURIComponent(vendorName)}`, {
      method: 'DELETE',
    });
  }

  async getSearchHistory() {
    return this.request('/user/search-history');
  }

  async addSearchHistory(searchData) {
    return this.request('/user/search-history', {
      method: 'POST',
      body: JSON.stringify(searchData),
    });
  }

  async getNotes() {
    return this.request('/user/notes');
  }

  async saveNote(vendorName, note) {
    return this.request('/user/notes', {
      method: 'POST',
      body: JSON.stringify({ vendorName, note }),
    });
  }

  async deleteNote(vendorName) {
    return this.request(`/user/notes/${encodeURIComponent(vendorName)}`, {
      method: 'DELETE',
    });
  }

  async getReviews() {
    return this.request('/user/reviews');
  }

  async saveReview(vendorName, rating, comment) {
    return this.request('/user/reviews', {
      method: 'POST',
      body: JSON.stringify({ vendorName, rating, comment }),
    });
  }

  async syncUserData() {
    return this.request('/user/sync');
  }
}

export default new APIService();

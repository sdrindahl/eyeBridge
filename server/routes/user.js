import express from 'express';
import { dbRun, dbGet, dbAll } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await dbGet(
      'SELECT id, email, first_name, last_name, practice_name, phone, created_at FROM users WHERE id = ?',
      [req.userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      practiceName: user.practice_name,
      phone: user.phone,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { firstName, lastName, practiceName, phone } = req.body;

    await dbRun(
      'UPDATE users SET first_name = ?, last_name = ?, practice_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [firstName || null, lastName || null, practiceName || null, phone || null, req.userId]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user favorites
router.get('/favorites', async (req, res) => {
  try {
    const favorites = await dbAll(
      'SELECT vendor_name, created_at FROM favorites WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );

    // Return array of vendor names for consistency with /sync endpoint
    res.json({
      favorites: favorites.map(f => f.vendor_name)
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add favorite
router.post('/favorites', async (req, res) => {
  try {
    const { vendorName } = req.body;

    if (!vendorName) {
      return res.status(400).json({ error: 'Vendor name is required' });
    }

    await dbRun(
      'INSERT OR REPLACE INTO favorites (user_id, vendor_name) VALUES (?, ?)',
      [req.userId, vendorName]
    );

    res.json({ message: 'Favorite added successfully' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove favorite
router.delete('/favorites/:vendorName', async (req, res) => {
  try {
    const { vendorName } = req.params;

    await dbRun(
      'DELETE FROM favorites WHERE user_id = ? AND vendor_name = ?',
      [req.userId, vendorName]
    );

    res.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get search history
router.get('/search-history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const history = await dbAll(
      'SELECT search_term, search_type, created_at FROM search_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [req.userId, limit]
    );

    res.json(history.map(h => ({
      searchTerm: h.search_term,
      searchType: h.search_type,
      createdAt: h.created_at
    })));
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add search history entry
router.post('/search-history', async (req, res) => {
  try {
    const { searchTerm, searchType } = req.body;

    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    await dbRun(
      'INSERT INTO search_history (user_id, search_term, search_type) VALUES (?, ?, ?)',
      [req.userId, searchTerm, searchType || null]
    );

    res.json({ message: 'Search history added successfully' });
  } catch (error) {
    console.error('Add search history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get vendor notes
router.get('/notes', async (req, res) => {
  try {
    const notes = await dbAll(
      'SELECT vendor_name, note, created_at, updated_at FROM vendor_notes WHERE user_id = ? ORDER BY updated_at DESC',
      [req.userId]
    );

    // Return as object keyed by vendor name for consistency with /sync endpoint
    const notesObject = notes.reduce((acc, n) => {
      acc[n.vendor_name] = n.note;
      return acc;
    }, {});

    res.json({ notes: notesObject });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save or update vendor note
router.post('/notes', async (req, res) => {
  try {
    const { vendorName, note } = req.body;

    if (!vendorName) {
      return res.status(400).json({ error: 'Vendor name is required' });
    }

    await dbRun(
      'INSERT OR REPLACE INTO vendor_notes (user_id, vendor_name, note, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      [req.userId, vendorName, note || null]
    );

    res.json({ message: 'Note saved successfully' });
  } catch (error) {
    console.error('Save note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete vendor note
router.delete('/notes/:vendorName', async (req, res) => {
  try {
    const { vendorName } = req.params;

    await dbRun(
      'DELETE FROM vendor_notes WHERE user_id = ? AND vendor_name = ?',
      [req.userId, vendorName]
    );

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get vendor reviews
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await dbAll(
      `SELECT vendor_name, rating, comment, created_at, updated_at 
       FROM vendor_reviews 
       WHERE user_id = ? 
       ORDER BY updated_at DESC`,
      [req.userId]
    );

    // Return as object keyed by vendor name for consistency with /sync endpoint
    const reviewsObject = reviews.reduce((acc, r) => {
      acc[r.vendor_name] = {
        rating: r.rating,
        comment: r.comment
      };
      return acc;
    }, {});

    res.json({ reviews: reviewsObject });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save or update vendor review
router.post('/reviews', async (req, res) => {
  try {
    const { vendorName, rating, comment } = req.body;

    if (!vendorName || !rating) {
      return res.status(400).json({ error: 'Vendor name and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    await dbRun(
      `INSERT OR REPLACE INTO vendor_reviews (user_id, vendor_name, rating, comment, updated_at) 
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [req.userId, vendorName, rating, comment || null]
    );

    res.json({ message: 'Review saved successfully' });
  } catch (error) {
    console.error('Save review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all user data (sync endpoint)
router.get('/sync', async (req, res) => {
  try {
    const [profile, favorites, searchHistory, notes, reviews] = await Promise.all([
      dbGet(
        'SELECT id, email, first_name, last_name, practice_name, phone FROM users WHERE id = ?',
        [req.userId]
      ),
      dbAll('SELECT vendor_name FROM favorites WHERE user_id = ?', [req.userId]),
      dbAll('SELECT search_term, search_type, created_at FROM search_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [req.userId]),
      dbAll('SELECT vendor_name, note FROM vendor_notes WHERE user_id = ?', [req.userId]),
      dbAll('SELECT vendor_name, rating, comment FROM vendor_reviews WHERE user_id = ?', [req.userId])
    ]);

    res.json({
      profile: {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        practiceName: profile.practice_name,
        phone: profile.phone
      },
      favorites: favorites.map(f => f.vendor_name),
      searchHistory: searchHistory.map(h => ({
        searchTerm: h.search_term,
        searchType: h.search_type,
        createdAt: h.created_at
      })),
      notes: notes.reduce((acc, n) => {
        acc[n.vendor_name] = n.note;
        return acc;
      }, {}),
      reviews: reviews.reduce((acc, r) => {
        acc[r.vendor_name] = {
          rating: r.rating,
          comment: r.comment
        };
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

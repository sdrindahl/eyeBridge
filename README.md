# 👁️ Eye Bridges

**Connecting optometry & ophthalmology professionals with verified vendors and products**

Eye Bridges is a comprehensive vendor directory and product search platform designed specifically for eye care professionals. Browse 312+ verified vendors, save favorites, track contacts, and make informed purchasing decisions—all in one place.

---

## ✨ Features

### 🔍 **Smart Vendor Search**
- Search through 312+ verified eye care vendors
- Filter by category: Equipment, Contact Lens, Pharmaceuticals, Optical Lab, Software, and more
- Advanced product-type filtering
- Save and revisit recent searches

### ⭐ **Personalized Dashboard**
- Save favorite vendors for quick access
- Add private notes to vendor profiles
- Rate and review vendors
- Track contact history
- Compare up to 4 vendors side-by-side

### 🔐 **Secure Authentication**
- JWT token-based authentication
- Secure password requirements
- User profile management
- Data persistence across sessions

### 📊 **Vendor Intelligence**
- Detailed company profiles with contact information
- Product categories and specialties
- Direct contact via phone, email, or website
- Recommended vendors based on your activity

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sdrindahl/eyeBridge.git
   cd eyeBridge
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

3. **Start the development servers**

   **Terminal 1 - Backend Server:**
   ```bash
   cd server
   node index.js
   ```
   Backend will run on http://localhost:3001

   **Terminal 2 - Frontend Server:**
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:5173

4. **Open the application**
   
   Navigate to http://localhost:5173 in your browser

---

## 📁 Project Structure

```
eyeBridge/
├── server/                 # Backend API
│   ├── db/                # SQLite database
│   │   └── database.js    # Database initialization
│   ├── middleware/        # Authentication middleware
│   │   └── auth.js
│   ├── routes/            # API routes
│   │   ├── auth.js        # Authentication endpoints
│   │   └── user.js        # User data endpoints
│   ├── index.js           # Server entry point
│   └── package.json
│
├── src/                   # Frontend application
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   └── PasswordGate.jsx
│   ├── pages/            # Page components
│   │   ├── Home.jsx      # Landing page
│   │   ├── Login.jsx     # Login page
│   │   ├── Register.jsx  # Registration page
│   │   ├── Dashboard.jsx # User dashboard
│   │   └── Vendors.jsx   # Vendor search/browse
│   ├── services/         # API service layer
│   │   └── api.js
│   ├── data/             # Static data
│   │   └── vendors.json  # Vendor database
│   └── main.jsx          # App entry point
│
├── tests/                # Playwright tests
│   ├── auth.setup.js
│   ├── dashboard.spec.js
│   ├── login.spec.js
│   └── vendors.spec.js
│
├── test-auth-flow.js     # E2E authentication test suite
└── README.md
```

---

## 🧪 Testing

### Run E2E Authentication Tests
```bash
node test-auth-flow.js
```

This will run 12 comprehensive tests covering:
- ✅ User registration
- ✅ Token verification
- ✅ User profile retrieval
- ✅ Add/get favorites
- ✅ Add/get notes
- ✅ Add/get reviews
- ✅ Data synchronization
- ✅ User login
- ✅ Remove favorites
- ✅ Data consistency

### Run Playwright Tests
```bash
npm run test
```

---

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### User Data
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/favorites` - Get user's favorite vendors
- `POST /api/user/favorites` - Add favorite vendor
- `DELETE /api/user/favorites/:vendorName` - Remove favorite
- `GET /api/user/notes` - Get vendor notes
- `POST /api/user/notes` - Save vendor note
- `GET /api/user/reviews` - Get vendor reviews
- `POST /api/user/reviews` - Save vendor review
- `GET /api/user/sync` - Sync all user data

---

## 🛠️ Technology Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **SQLite** - Database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **CORS** - Cross-origin resource sharing

### Testing
- **Playwright** - E2E testing
- **Custom test suite** - Authentication flow validation

---

## 🔐 Security Features

- **JWT Token Authentication** - Secure, stateless authentication
- **Password Requirements** - Min 6 characters with uppercase, lowercase, number, and special character
- **Bcrypt Password Hashing** - Secure password storage
- **Protected Routes** - Authentication required for sensitive endpoints
- **Token Expiration** - Configurable token lifetime
- **CORS Protection** - Restricted cross-origin requests

---

## 📝 Environment Variables

### Development

Create a `.env` file in the `server` directory:

```env
PORT=3001
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3001/api
```

### Production

**Backend Environment Variables:**
```env
PORT=3001
JWT_SECRET=your-production-secret-key-here
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend-domain.com
NODE_ENV=production
```

**Frontend Environment Variables:**
```env
VITE_API_URL=https://your-backend-domain.com/api
```

---

## 🌐 Production Deployment

### Deploy Backend (Choose one):

#### **Railway**
1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

#### **Render**
1. Create new Web Service
2. Connect repository (select `server` folder as root)
3. Set environment variables
4. Deploy

#### **Heroku**
```bash
cd server
heroku create your-app-backend
heroku config:set JWT_SECRET=your-secret CLIENT_URL=https://your-frontend.com
git push heroku main
```

### Deploy Frontend (Choose one):

#### **Vercel** (Recommended)
1. Import project from GitHub
2. Framework Preset: Vite
3. Add environment variable: `VITE_API_URL=https://your-backend.com/api`
4. Deploy

#### **Netlify**
1. Connect repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend.com/api`
5. Deploy

### Important Production Checklist:
- [ ] Set strong `JWT_SECRET` (use random 32+ character string)
- [ ] Update `CLIENT_URL` to your production frontend URL
- [ ] Update `VITE_API_URL` to your production backend URL
- [ ] Ensure CORS is properly configured
- [ ] Use HTTPS for both frontend and backend
- [ ] Test authentication flow in production
- [ ] Monitor backend logs for errors

---

## 🚧 Roadmap

- [ ] Email verification for new accounts
- [ ] Password reset functionality
- [ ] Vendor inquiry/quote request system
- [ ] Advanced filtering and search
- [ ] Export favorites/comparisons
- [ ] Admin panel for vendor management
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

## 👥 Authors

- **Scott Rindahl** - Initial work - [@sdrindahl](https://github.com/sdrindahl)

---

## 🙏 Acknowledgments

- Inspired by Nicole's idea to connect eye care professionals with vendors
- Built with modern web technologies for optimal performance
- Designed with user experience in mind

---

## 🔧 Troubleshooting

### "Unable to connect to server" in Production

**Problem:** Frontend cannot reach backend API

**Solutions:**
1. **Check `VITE_API_URL`**: Ensure it points to your production backend URL
   - In Vercel/Netlify: Go to Settings → Environment Variables
   - Must include `/api` at the end (e.g., `https://your-backend.com/api`)
   - After updating, redeploy the frontend

2. **Check Backend CORS**: Ensure `CLIENT_URL` in backend matches your frontend domain
   - Update environment variable: `CLIENT_URL=https://your-frontend.com`
   - Redeploy backend

3. **Verify Backend is Running**: 
   - Visit `https://your-backend.com/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

4. **Check HTTPS**: Both frontend and backend should use HTTPS in production

### Login/Register Not Working

**Problem:** Authentication fails silently

**Check:**
- Browser console for error messages (F12 → Console)
- Network tab to see API requests (F12 → Network)
- Backend logs for authentication errors
- JWT_SECRET is set in production backend
- Passwords meet requirements (6+ chars, uppercase, lowercase, number, special char)

### Database Not Persisting

**Problem:** User data disappears after backend restart

**Solution:**
- Ensure `server/db/` directory exists on your hosting platform
- Use persistent storage (Railway, Render, Heroku offer this)
- Consider migrating to PostgreSQL for production

### CORS Errors

**Problem:** Browser blocks requests due to CORS policy

**Solution:**
- Set `CLIENT_URL` environment variable in backend to your frontend URL
- Ensure both domains use HTTPS
- Check that your hosting platform isn't adding additional CORS restrictions

---

## 📧 Support

For support, email your-email@example.com or open an issue in the GitHub repository.

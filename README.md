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

## 📧 Support

For support, email your-email@example.com or open an issue in the GitHub repository.

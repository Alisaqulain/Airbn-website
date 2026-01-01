# 🏨 Wanderlust - Airbnb-style Vacation Rental Platform

A full-featured, production-ready vacation rental platform built with Node.js, Express, MongoDB, and EJS. This application allows users to browse, search, and book vacation rentals while hosts can list and manage their properties.

![Node.js](https://img.shields.io/badge/Node.js-22.11.0-green)
![Express](https://img.shields.io/badge/Express-4.21.2-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-8.8.1-brightgreen)
![License](https://img.shields.io/badge/License-ISC-yellow)

## ✨ Features

### Core Features
- 🔐 **User Authentication** - Secure signup, login, and logout with Passport.js
- 📝 **Listings Management** - Create, read, update, and delete property listings
- 🖼️ **Image Upload** - Cloudinary integration for image storage and optimization
- ⭐ **Reviews & Ratings** - 5-star rating system with review comments
- 🔍 **Advanced Search & Filters** - Search by location, filter by price range, sort by multiple criteria
- ❤️ **Wishlist** - Save favorite listings for easy access
- 🗺️ **Interactive Maps** - Location visualization with Leaflet maps
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Mobile-first, fully responsive UI

### Security Features
- MongoDB injection protection with express-mongo-sanitize
- Secure session management with connect-mongo
- HTTP-only cookies with secure flags in production
- Input validation with Joi
- CSRF protection with sameSite cookies
- Password hashing with passport-local-mongoose

### User Experience
- Flash messages for user feedback
- Loading states and form validation
- Clean, modern Airbnb-inspired UI
- Smooth transitions and animations
- Accessible forms with proper labels

## 🛠️ Tech Stack

### Backend
- **Node.js** (v22.11.0) - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Passport.js** - Authentication middleware
- **Joi** - Schema validation
- **Express-session** - Session management
- **Connect-mongo** - MongoDB session store

### Frontend
- **EJS** - Embedded JavaScript templating
- **EJS-mate** - Layout support for EJS
- **Bootstrap 5** - CSS framework
- **Font Awesome** - Icon library
- **Leaflet** - Interactive maps

### Services
- **Cloudinary** - Image storage and CDN
- **Multer** - File upload middleware

## 📁 Project Structure

```
airbn/
├── app.js                 # Main application file
├── cloudconfi.js          # Cloudinary configuration
├── schema.js              # Joi validation schemas
├── midleware.js           # Custom middleware functions
│
├── controllers/           # Route controllers
│   └── listing.js
│
├── models/                # Mongoose models
│   ├── listing.js
│   ├── review.js
│   └── user.js
│
├── routes/                # Express routes
│   ├── listing.js
│   ├── review.js
│   └── user.js
│
├── utils/                 # Utility functions
│   ├── expresserror.js    # Custom error class
│   └── wrap.js            # Async error wrapper
│
├── views/                 # EJS templates
│   ├── layouts/
│   │   └── bolierplate.ejs
│   ├── includes/
│   │   ├── navbar.ejs
│   │   ├── footer.ejs
│   │   └── flash.ejs
│   ├── listings/
│   │   ├── index.ejs
│   │   ├── show.ejs
│   │   ├── new.ejs
│   │   └── edit.ejs
│   ├── users/
│   │   ├── login.ejs
│   │   ├── signup.ejs
│   │   └── wishlist.ejs
│   └── error.ejs
│
└── public/                # Static assets
    ├── css/
    │   ├── style.css
    │   ├── rating.css
    │   └── darkmode.css
    └── js/
        ├── script.js
        └── darkmode.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v22.11.0 or higher)
- MongoDB (local installation or Atlas account)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd airbn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # MongoDB Connection
   ATLASDB_URL=mongodb://127.0.0.1:27017/airbn
   # OR for MongoDB Atlas:
   # ATLASDB_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname

   # Session Secret (change this in production!)
   SESSION_SECRET=your-secret-key-here-change-in-production

   # Cloudinary Configuration
   CLOUD_NAME=your-cloudinary-cloud-name
   CLOUD_API_KEY=your-cloudinary-api-key
   CLOUD_API_SECRET=your-cloudinary-api-secret

   # Environment
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```
   Or for production:
   ```bash
   npm start
   ```

5. **Open your browser**
   ```
   http://localhost:8080
   ```

## 📖 Usage

### As a Guest
1. **Browse Listings** - View all available properties on the homepage
2. **Search & Filter** - Use the search bar and filters to find specific properties
3. **View Details** - Click on any listing to see full details, reviews, and location map
4. **Save to Wishlist** - Click the heart icon to save favorite listings
5. **Leave Reviews** - Rate and review properties you've visited

### As a Host
1. **Sign Up/Login** - Create an account or login
2. **Create Listing** - Click "Airbnb your home" to add a new property
3. **Upload Images** - Add property images via Cloudinary
4. **Manage Listings** - Edit or delete your listings from the listing detail page

## 🔒 Security Considerations

- All user inputs are validated using Joi schemas
- MongoDB injection attacks are prevented with express-mongo-sanitize
- Passwords are hashed using passport-local-mongoose
- Sessions are stored securely in MongoDB
- Cookies are HTTP-only and secure in production
- CSRF protection enabled via sameSite cookies

## 🎨 Key Features Implementation

### Search & Filters
- Full-text search across listing titles and descriptions
- Location-based filtering
- Price range filtering
- Multiple sorting options (price, date, etc.)

### Reviews & Ratings
- 5-star rating system with visual star display
- Average rating calculation and display
- Review authors can edit/delete their reviews
- Chronological review display

### Wishlist
- One-click save/remove functionality
- Persistent wishlist stored in user profile
- Dedicated wishlist page with all saved listings

### Dark Mode
- Toggle between light and dark themes
- Preference saved in localStorage
- Smooth transitions between themes

## 🧪 Testing

While automated tests are not included, the application has been thoroughly tested manually for:
- User authentication flows
- CRUD operations on listings
- Review creation and deletion
- Search and filter functionality
- Image upload and deletion
- Session persistence
- Authorization checks

## 🚧 Future Enhancements

Potential features for future development:
- Booking/Reservation system with date availability
- Host-Guest messaging system
- Payment integration
- Email notifications
- Advanced analytics for hosts
- Multi-image uploads
- Property categories and tags
- User profiles and avatars

## 📝 License

ISC

## 👨‍💻 Author

Syed Ali Zaidi

## 🙏 Acknowledgments

- Airbnb for design inspiration
- Bootstrap for the UI framework
- Cloudinary for image hosting
- All open-source contributors of the libraries used

---

**Note**: This is a portfolio project demonstrating full-stack development skills. For production deployment, ensure all environment variables are properly configured and security best practices are followed.
#   a i r b n _ u p d t e  
 
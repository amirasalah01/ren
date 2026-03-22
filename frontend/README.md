# Rentify Frontend

A complete React + Vite frontend application for the Rentify property rental platform.

## Features

### Authentication
- User registration with email, name, phone
- Login with JWT token authentication
- Automatic token refresh on expiry
- Protected routes for authenticated users
- Property owner role validation

### Property Browsing
- Browse all available properties with pagination
- Advanced search and filtering:
  - Search by title, city, or country
  - Filter by price range
  - Filter by property type (apartment, house, condo, villa, studio)
  - Filter by bedrooms and bathrooms
  - Sort by date, price, or view count
- Property cards with images, ratings, and quick info
- Favorite properties (heart icon)

### Property Details
- Full property information display
- Image placeholder with gradient background
- Property stats (bedrooms, bathrooms, square feet, views)
- Reviews and ratings system
- Write reviews (authenticated users, excluding owners)
- Contact property owner via messaging
- Add/remove from favorites

### Dashboard
- User statistics overview:
  - My properties count (for owners)
  - Favorites count
  - Sent/received messages count
  - Unread messages count
- Quick action buttons for common tasks
- Beautiful gradient stat cards

### Property Management (Owner Features)
- View all owned properties in a table
- Create new property listings
- Edit existing properties
- Delete properties (with confirmation)
- Property status tracking (available/unavailable)
- View count monitoring

### Favorites
- View all saved properties
- Remove from favorites
- Quick navigation to property details

### Messaging System
- Inbox and sent messages tabs
- Send messages to property owners
- View conversation threads
- Reply to messages
- Mark messages as read
- Unread message badge in navbar
- Property context in messages

## Tech Stack

- **React 19** - UI library
- **Vite 8** - Build tool and dev server
- **React Router DOM 7** - Client-side routing
- **Axios** - HTTP client with interceptors
- **CSS3** - Modern styling with CSS variables
- **LocalStorage** - JWT token persistence

## Project Structure

```
frontend/
├── src/
│   ├── api/                    # API integration layer
│   │   ├── axios.js           # Axios instance with JWT interceptors
│   │   ├── auth.js            # Authentication API calls
│   │   ├── properties.js      # Property & review API calls
│   │   └── messages.js        # Messaging API calls
│   ├── components/            # Reusable components
│   │   ├── Navbar.jsx         # Navigation with auth state
│   │   ├── PropertyCard.jsx   # Property card with favorite toggle
│   │   ├── SearchFilter.jsx   # Advanced search and filters
│   │   ├── StarRating.jsx     # Star rating display/input
│   │   └── PrivateRoute.jsx   # Protected route wrapper
│   ├── context/
│   │   └── AuthContext.jsx    # Authentication state management
│   ├── pages/                 # Page components
│   │   ├── Home.jsx           # Property listing with filters
│   │   ├── Login.jsx          # Login form
│   │   ├── Register.jsx       # Registration form
│   │   ├── PropertyDetail.jsx # Property details with reviews
│   │   ├── Dashboard.jsx      # User dashboard
│   │   ├── MyProperties.jsx   # Owner's properties table
│   │   ├── CreateProperty.jsx # Create/edit property form
│   │   ├── Favorites.jsx      # Saved properties
│   │   ├── Inbox.jsx          # Messages inbox/sent
│   │   └── Conversation.jsx   # Message thread view
│   ├── App.jsx                # Main app with routes
│   ├── main.jsx               # React DOM entry point
│   └── index.css              # Global styles and CSS variables
├── .env                       # Environment variables
├── package.json
└── vite.config.js
```

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create a `.env` file with:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   App runs on http://localhost:5173

4. **Build for production:**
   ```bash
   npm run build
   ```

## API Integration

The frontend connects to a Django REST Framework backend at `http://localhost:8000`.

### Authentication Flow
1. User logs in → receives access & refresh tokens
2. Tokens stored in localStorage
3. Axios interceptor adds Bearer token to all requests
4. On 401 error, automatically refreshes token
5. If refresh fails, redirects to login

### Key API Endpoints Used
- `/api/auth/login/` - User login
- `/api/auth/register/` - User registration
- `/api/auth/dashboard/` - User statistics
- `/api/properties/list/` - Property listing (GET/POST)
- `/api/properties/<id>/` - Property CRUD
- `/api/properties/favorites/` - Favorites management
- `/api/properties/<id>/reviews/` - Reviews
- `/api/messages/send/` - Send message
- `/api/messages/inbox/` - Inbox
- `/api/messages/conversation/<user_id>/` - Conversation thread

## Styling

Modern, clean design with:
- **CSS Variables** for consistent theming
- **Flexbox & Grid** for responsive layouts
- **Card-based UI** with subtle shadows
- **Gradient backgrounds** for auth pages and stats
- **Mobile-responsive** design
- **Smooth transitions** and hover effects
- **Color scheme:**
  - Primary: Blue (#2563eb)
  - Success: Green (#10b981)
  - Danger: Red (#ef4444)
  - Text: Gray scale

## Component Highlights

### AuthContext
Provides global authentication state:
- `user` - Current user object
- `isAuthenticated` - Boolean auth status
- `isPropertyOwner` - Owner role check
- `login()` - Login function
- `logout()` - Logout function
- `updateUser()` - Update user data

### PrivateRoute
Wraps protected pages:
- Redirects to login if not authenticated
- Optional `requireOwner` prop for owner-only pages
- Shows loading spinner during auth check

### PropertyCard
Feature-rich property card:
- Property image placeholder
- Favorite toggle (heart icon)
- Property type badge
- Price, location, stats
- Star rating display
- "View Details" link

### SearchFilter
Advanced filtering panel:
- Search input
- Collapsible filters
- Price range inputs
- Property type dropdown
- Bedroom/bathroom selectors
- Availability toggle
- Sort options
- Apply/reset buttons

## Development Notes

- **Port**: Frontend runs on port 5173 (Vite default)
- **CORS**: Backend must allow `http://localhost:5173`
- **Token Storage**: Uses localStorage (consider HttpOnly cookies for production)
- **Error Handling**: All API calls wrapped in try-catch with user-friendly messages
- **Loading States**: Spinner shown during async operations
- **Responsive**: Works on mobile, tablet, and desktop

## Future Enhancements

Potential improvements:
- Image upload for properties
- Google Maps integration
- Real-time messaging with WebSockets
- Advanced analytics for property owners
- Booking/reservation system
- Payment integration
- Email notifications
- Social media sharing
- Property comparison feature
- Saved searches

## License

This project is part of the Rentify property rental application.

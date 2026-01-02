# DOAP Frontend - React Application

A React-based frontend for the DOAP (Digital Out-of-Home Advertising Platform) with full authentication and role-based access control.

## Features

- ✅ User Registration
- ✅ User Login with JWT
- ✅ Role-Based Access Control (RBAC)
- ✅ Protected Routes
- ✅ Token Management
- ✅ Role-Specific Dashboards
- ✅ API Integration with Spring Boot Backend

## Installation

1. Install dependencies:
```bash
npm install
```

2. Make sure your Spring Boot backend is running on `http://localhost:8080`

3. Start the React development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Login.js          # Login component
│   │   ├── Login.css
│   │   ├── Register.js        # Registration component
│   │   ├── Register.css
│   │   ├── Dashboard.js       # Main dashboard
│   │   ├── Dashboard.css
│   │   └── ProtectedRoute.js  # Route protection component
│   ├── context/
│   │   └── AuthContext.js     # Authentication context
│   ├── services/
│   │   └── api.js             # API service layer
│   ├── App.js                 # Main app component
│   ├── App.css
│   ├── index.js               # Entry point
│   └── index.css              # Global styles
└── package.json
```

## Available Roles

- **ADVERTISER** - Users who want to advertise
- **SCREEN_OWNER** - Users who own digital screens
- **AD_EDITOR** - Users who edit advertisements
- **ADMIN** - Platform administrators

## API Endpoints Used

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /test/public` - Public test endpoint
- `GET /test/admin` - Admin-only endpoint
- `GET /test/owner` - Screen owner-only endpoint
- `GET /test/advertiser` - Advertiser-only endpoint

## Usage

### Registration
1. Navigate to `/register`
2. Fill in name, email, password, and select a role
3. After successful registration, you'll be redirected to login

### Login
1. Navigate to `/login`
2. Enter your email and password
3. Upon successful login, you'll be redirected to the dashboard

### Dashboard
- View your user information
- See your assigned roles
- Test role-based API endpoints
- Access role-specific sections based on your permissions

### Protected Routes
- `/dashboard` - Requires authentication
- `/admin` - Requires ADMIN role
- `/owner` - Requires SCREEN_OWNER role
- `/advertiser` - Requires ADVERTISER role

## Token Management

- JWT tokens are stored in `localStorage`
- Tokens are automatically included in API requests via axios interceptors
- Token expiration is handled automatically (401 responses redirect to login)

## Development

### Environment Variables
You can create a `.env` file to configure the API base URL:
```
REACT_APP_API_URL=http://localhost:8080
```

### Build for Production
```bash
npm run build
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors, make sure:
1. Your Spring Boot backend has CORS configured
2. The backend is running on `http://localhost:8080`
3. The frontend proxy is configured in `package.json`

### Token Issues
- Clear browser localStorage if you encounter authentication issues
- Check browser console for error messages
- Verify JWT token is being stored correctly

## Next Steps

- Add more role-specific features
- Implement screen management for SCREEN_OWNER
- Add advertisement creation for ADVERTISER
- Build admin panel for ADMIN users
- Add ad editing interface for AD_EDITOR


# Frontend Google Sign-In Setup

## Quick Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

This will install `@react-oauth/google` package.

### 2. Configure Google Client ID

**Option A: Using Environment Variable (Recommended)**

Create `.env` file in `frontend/` directory:
```
REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

**Option B: Direct in Code**

Edit `frontend/src/App.js`:
```javascript
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';
```

### 3. Get Google Client ID

1. Go to: https://console.cloud.google.com/
2. Create OAuth 2.0 Client ID (Web application)
3. Copy the Client ID
4. Add to `.env` file or `App.js`

### 4. Start Frontend
```bash
npm start
```

## Features Added

✅ Google Sign-In button on login page
✅ Google OAuth integration
✅ Automatic user registration
✅ Same JWT flow as email/password login

## How It Works

1. User clicks "Sign in with Google" button
2. Google OAuth popup opens
3. User authenticates with Google
4. Frontend receives Google ID Token
5. Frontend sends ID Token to backend (`/auth/google`)
6. Backend verifies token and returns DOAP JWT
7. Frontend stores JWT and redirects to dashboard

## Testing

1. Start backend: `mvn spring-boot:run`
2. Start frontend: `npm start`
3. Go to login page
4. Click "Sign in with Google"
5. Complete Google authentication
6. Should redirect to dashboard


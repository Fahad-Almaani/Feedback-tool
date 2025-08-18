# Authentication System Documentation

## Overview

The frontend now has a complete authentication system with role-based access control. The system supports ADMIN and USER roles with different dashboards and capabilities.

## Features Implemented

### 1. Authentication Context (`src/context/AuthContext.jsx`)

- Centralized authentication state management
- Login/logout functionality
- Token and user data persistence in localStorage
- Role-based helper functions (`isAdmin()`, `isUser()`, `hasRole()`)
- Automatic session restoration on app reload

### 2. Protected Routes (`src/components/ProtectedRoute.jsx`)

- Route protection based on authentication status
- Role-based access control
- Automatic redirects for unauthorized access
- Loading states during authentication checks

### 3. Login Integration (`src/pages/Login/Login.jsx`)

- Real API integration with your backend
- Proper error handling and loading states
- Automatic role-based redirects after login
- Form validation and user feedback

### 4. Role-Based Routing Structure

#### Public Routes (No authentication required)

- `/login` - Login page
- `/signup` - User registration
- `/forgot` - Password reset

#### Admin Routes (ADMIN role required)

- `/admin/dashboard` - Admin dashboard with analytics

#### User Routes (USER role required)

- `/user/dashboard` - User dashboard with available surveys

## API Integration

### Login Endpoint

- **URL**: `{VITE_BACKEND_URL}/auth/login`
- **Method**: POST
- **Body**: `{ "email": "string", "password": "string" }`
- **Response**:

```json
{
  "token": "JWT_TOKEN_STRING",
  "email": "user@example.com",
  "name": "User Name",
  "role": "USER|ADMIN",
  "userId": 123
}
```

### Token Storage

- JWT token stored in `localStorage` as `jwt_token`
- User data stored in `localStorage` as `user_data`
- Automatic cleanup on logout

## Environment Variables

Make sure your `.env` file contains:

```
VITE_BACKEND_URL=http://localhost:8080/api
```

## Usage Examples

### Using the Auth Context in Components

```jsx
import { useAuth } from "../context/AuthContext";

function MyComponent() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      {isAdmin() && <AdminPanel />}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Creating Protected Routes

```jsx
import ProtectedRoute from '../components/ProtectedRoute';

// Route that requires any authenticated user
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Route that requires ADMIN role specifically
<Route path="/admin" element={
  <ProtectedRoute requiredRole="ADMIN">
    <AdminPanel />
  </ProtectedRoute>
} />
```

## Security Features

1. **Token Validation**: Tokens are validated on each request
2. **Role Verification**: Server-side role validation required
3. **Automatic Logout**: Invalid tokens trigger automatic logout
4. **Route Protection**: Unauthorized access attempts are blocked
5. **Session Persistence**: Users stay logged in across browser sessions

## Future Enhancements

1. **Token Refresh**: Implement automatic token refresh
2. **Session Timeout**: Add session timeout warnings
3. **Remember Me**: Enhanced session persistence options
4. **Multi-Factor Auth**: Add 2FA support
5. **Password Reset**: Complete forgot password flow

## Error Handling

The system handles various error scenarios:

- Invalid login credentials
- Network errors
- Malformed tokens
- Role permission denials
- Session expiration

All errors are displayed to users with appropriate messaging and fallback options.

## Testing the System

1. Start your backend server
2. Ensure the login endpoint is working at `/auth/login`
3. Test with different user roles (ADMIN/USER)
4. Verify role-based redirects work correctly
5. Test logout functionality
6. Check session persistence across browser refreshes

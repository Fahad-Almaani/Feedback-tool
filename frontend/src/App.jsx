import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login/Login'
import Dashbord from './pages/Dashbord';
// import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root path to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login page route */}
        <Route path="/login" element={<Login />} />

        {/* Placeholder for future routes */}
        <Route path="/dashboard" element={<Dashbord />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot" element={<ForgotPassword />} />

        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

// Placeholder components for routes referenced in Login.jsx
function Dashboard() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      <button onClick={() => {
        localStorage.removeItem('jwt_token');
        window.location.href = '/login';
      }}>
        Logout
      </button>
    </div>
  )
}

function SignUp() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Sign Up</h1>
      <p>Create a new account</p>
      <a href="/login">Back to Login</a>
    </div>
  )
}

function ForgotPassword() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Forgot Password</h1>
      <p>Reset your password</p>
      <a href="/login">Back to Login</a>
    </div>
  )
}

function NotFound() {
  return (
    <>
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/login">Go to Login</a>
    </div>
</>
  )
}

export default App
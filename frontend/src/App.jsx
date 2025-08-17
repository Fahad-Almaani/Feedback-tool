import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
<<<<<<< HEAD
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
=======
    <BrowserRouter>
      <Routes>
        {/* Redirect root path to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login page route */}
        <Route path="/login" element={<Login />} />

        {/* Placeholder for future routes */}
        <Route path="/dashboard" element={<Dashboard />} />
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
>>>>>>> 199524929644c7ceb8db2585c030ce77909dccd3
  )
}

export default App
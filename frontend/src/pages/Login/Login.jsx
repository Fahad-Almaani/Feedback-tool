import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Login.module.css";

export default function Login() {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(email, password);

    if (result.success) {
      // Redirect based on user role
      if (result.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.leftPanel}>
        <div className={styles.brand}>
          <h1>MyApp</h1>
          <p>Welcome back — Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <div className={styles.row}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" disabled={loading} /> Remember me
            </label>
            <a className={styles.forgot} href="/forgot">Forgot?</a>
          </div>

          <button
            className={styles.button}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className={styles.signup}>
          Don’t have an account? <a href="/signup">Create account</a>
        </p>
      </div>





    </div>


  );
}

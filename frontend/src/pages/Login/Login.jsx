import { useState } from "react";
import styles from "./Login.module.css";

export default function Login() {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password");

  // Fake submit handler (design first). Stores a fake JWT in localStorage.
  const handleSubmit = (e) => {
    e.preventDefault();

    const fakeToken = "eyJhbGciOiFAKE.JWT.TOKEN";
    localStorage.setItem("jwt_token", fakeToken);

    alert(" login succeeded — token saved to localStorage!");
    window.location.href = "/dashboard";
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.leftPanel}>
        <div className={styles.brand}>
          <h1>MyApp</h1>
          <p>Welcome back — Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className={styles.row}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" /> Remember me
            </label>
            <a className={styles.forgot} href="/forgot">Forgot?</a>
          </div>

          <button className={styles.button} type="submit">
            Sign In
          </button>
        </form>

        <p className={styles.signup}>
          Don’t have an account? <a href="/signup">Create account</a>
        </p>
      </div>

      
        
      
          
        </div>
     
    
  );
}

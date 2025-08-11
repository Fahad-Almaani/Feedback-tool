# 🎨 Frontend Development Guide

## React + Vite Development Environment

This comprehensive guide covers developing and running the React frontend using Vite on Windows. You'll learn about project setup, development workflows, component architecture, backend integration, and deployment strategies.

---

## 🛠️ Tech Stack Overview

- **⚡ Build Tool:** Vite (Fast HMR & optimized builds)
- **⚛️ Framework:** React 18+ with SWC plugin
- **📦 Package Manager:** npm
- **🔍 Code Quality:** ESLint
- **🌐 Dev Server:** Vite Dev Server (default: `http://localhost:5173`)

---

## 📋 Prerequisites

Ensure your development environment has:

- **Node.js 18+** (LTS 20+ recommended) - [Download here](https://nodejs.org)
- **Git** (recommended for version control)
- **Code Editor:** VS Code, IntelliJ IDEA, or your preferred editor with JavaScript/TypeScript support

> 💡 **Quick Check:** Run `node -v` and `npm -v` in your terminal to verify installation

---

## 🚀 Getting Started

### 📂 Project Setup

1. **Open the frontend folder** in your preferred editor
2. **Install dependencies** (one-time setup):
   ```bash
   cd frontend
   npm install
   ```

### 🔥 Development Server

**Start the development environment:**

```bash
npm run dev
```

Your application will be available at `http://localhost:5173` with:

- ⚡ **Hot Module Replacement (HMR)** - Instant updates on file changes
- 🔄 **Fast Refresh** - Preserves component state during updates
- 📱 **Responsive development** - Works across different devices

---

## 📜 Available Scripts

| Command           | Purpose                  | When to Use           |
| ----------------- | ------------------------ | --------------------- |
| `npm run dev`     | Start development server | Daily development     |
| `npm run build`   | Create production build  | Before deployment     |
| `npm run preview` | Preview production build | Testing before deploy |
| `npm run lint`    | Check code quality       | Before commits        |

---

## 🏗️ Recommended Project Structure

Organize your React application with this proven folder structure:

```
src/
├── 📱 components/          → Reusable UI components
│   ├── common/            → Shared components (Button, Modal, etc.)
│   ├── layout/            → Layout components (Header, Footer, Sidebar)
│   └── forms/             → Form-specific components
├── 📄 pages/              → Page-level components
│   ├── Home/
│   ├── Dashboard/
│   └── Profile/
├── 🔧 hooks/              → Custom React hooks
├── 🌐 services/           → API calls and external services
├── 🎯 utils/              → Helper functions and utilities
├── 📊 store/              → State management (Context, Redux, etc.)
├── 🎨 styles/             → Global styles and CSS modules
├── 📸 assets/             → Images, icons, and static files
├── 🔧 config/             → Configuration files
└── 📝 types/              → TypeScript type definitions (if using TS)
```

### 🎯 Component Organization Best Practices

**Create organized component files:**

```javascript
// src/components/common/Button/Button.jsx
import "./Button.css";

export const Button = ({ variant = "primary", children, ...props }) => {
  return (
    <button className={`btn btn--${variant}`} {...props}>
      {children}
    </button>
  );
};

// src/components/common/Button/index.js
export { Button } from "./Button";
```

**Group related components:**

```
src/components/forms/
├── ContactForm/
│   ├── ContactForm.jsx
│   ├── ContactForm.css
│   ├── ContactForm.test.js
│   └── index.js
└── LoginForm/
    ├── LoginForm.jsx
    ├── LoginForm.css
    └── index.js
```

---

## 🌐 Backend Integration

### 🔄 Method 1: CORS Configuration (Simple)

When your Spring Boot backend includes `@CrossOrigin(origins = "*")`:

```javascript
// src/services/api.js
const API_BASE_URL = "http://localhost:8080";

export const feedbackService = {
  getAllFeedback: async () => {
    const response = await fetch(`${API_BASE_URL}/api/feedback`);
    return response.json();
  },

  createFeedback: async (feedbackData) => {
    const response = await fetch(`${API_BASE_URL}/api/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedbackData),
    });
    return response.json();
  },
};
```

### 🔧 Method 2: Vite Proxy Configuration (Recommended)

Configure a development proxy in `vite.config.js`:

```javascript
// ...existing code...
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

Then use relative paths in your API calls:

```javascript
// src/services/api.js
export const feedbackService = {
  getAllFeedback: async () => {
    const response = await fetch("/api/feedback");
    return response.json();
  },
};
```

---

## ⚙️ Environment Configuration

### 🔐 Environment Variables

Create environment-specific configuration:

**`.env.development`**

```
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=Feedback Tool - Development
VITE_ENABLE_ANALYTICS=false
```

**`.env.production`**

```
VITE_API_BASE_URL=https://your-production-api.com
VITE_APP_TITLE=Feedback Tool
VITE_ENABLE_ANALYTICS=true
```

**Usage in components:**

```javascript
// src/config/environment.js
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "",
  appTitle: import.meta.env.VITE_APP_TITLE || "Feedback Tool",
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
};
```

---

## 📊 State Management Patterns

### 🎯 Local State (useState)

```javascript
// For component-specific state
const [formData, setFormData] = useState({
  name: "",
  message: "",
});
```

### 🌍 Global State (Context API)

```javascript
// src/store/AppContext.jsx
import { createContext, useContext, useReducer } from "react";

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
```

---

## 🎨 Styling Architecture

### 📝 CSS Organization

```
src/styles/
├── globals.css           → Global styles and CSS reset
├── variables.css         → CSS custom properties
├── components.css        → Component-specific styles
└── utilities.css         → Utility classes
```

### 🎯 Component Styling Approaches

**CSS Modules:**

```javascript
// Button.module.css
.button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
}

.button--primary {
  background-color: var(--color-primary);
}

// Button.jsx
import styles from './Button.module.css';

export const Button = ({ variant = 'primary' }) => (
  <button className={`${styles.button} ${styles[`button--${variant}`]}`}>
    Click me
  </button>
);
```

---

## 🔍 Code Quality & Linting

### ⚡ Running ESLint

```bash
# Check for linting issues
npm run lint

# Auto-fix fixable issues
npm run lint -- --fix
```

### 🔧 ESLint Configuration

Your `eslint.config.js` manages code quality rules. Common practices:

- Consistent code formatting
- Import/export organization
- React-specific best practices
- Accessibility guidelines

---

## 🚀 Build & Deployment

### 🏗️ Production Build

```bash
# Create optimized production build
npm run build

# Preview the production build locally
npm run preview
```

### 📦 Deployment Options

**Static Hosting:**

- Deploy the `dist/` folder to Netlify, Vercel, or GitHub Pages
- Configure build command: `npm run build`
- Set publish directory: `dist`

**Spring Boot Integration:**

1. Build the frontend: `npm run build`
2. Copy `dist/` contents to `backend/src/main/resources/static/`
3. Update API calls to use relative paths

---

## 🔧 Development Tools & Tips

### 🎯 React Developer Tools

Install the React DevTools browser extension for enhanced debugging:

- Component tree inspection
- Props and state examination
- Performance profiling

### ⚡ Vite Features

- **Fast startup** - Pre-bundled dependencies
- **Efficient HMR** - Updates only changed modules
- **Optimized builds** - Tree-shaking and code splitting
- **Plugin ecosystem** - Extensive customization options

### 🐛 Debugging Techniques

```javascript
// Use React's built-in debugging
console.log("Component props:", props);

// Conditional debugging
if (import.meta.env.DEV) {
  console.log("Development-only debug info");
}
```

---

## ❗ Troubleshooting Guide

| Issue                | Solution                                               |
| -------------------- | ------------------------------------------------------ |
| **Port 5173 in use** | Vite will automatically find an available port         |
| **CORS errors**      | Verify backend CORS configuration or use Vite proxy    |
| **404 API errors**   | Ensure backend is running on expected port             |
| **Module not found** | Run `npm install` to ensure dependencies are installed |
| **Build failures**   | Check for TypeScript errors or linting issues          |
| **Slow performance** | Clear browser cache and restart dev server             |

---

## 🎯 Next Steps & Best Practices

### 🚀 Performance Optimization

- Implement code splitting with React.lazy()
- Optimize images and assets
- Use React.memo for expensive components
- Implement proper error boundaries

### 🧪 Testing Strategy

- Unit tests for utility functions
- Component testing with React Testing Library
- Integration tests for user workflows
- E2E testing with Playwright or Cypress

### 📚 Recommended Learning Resources

- React documentation and patterns
- Vite configuration options
- Modern JavaScript/ES6+ features
- Web performance optimization

---

**Happy coding! 🎉** Your React application is ready for development with modern tooling and best practices.

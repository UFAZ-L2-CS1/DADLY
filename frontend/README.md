# DADLY Frontend

A modern recipe discovery and meal planning application built with React 19 and Vite.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** 9+
- Backend services running (Auth API and Main API)

### Installation

1. **Clone and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root of the frontend directory:
   ```env
   VITE_BASE_URL=http://localhost:4000
   VITE_AUTH_URL=http://localhost:3000
   ```
   
   Adjust URLs to match your backend services.

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173` (default Vite port).

## 📁 Project Structure

```
frontend/
├── .github/
│   └── copilot-instructions.md    # AI agent guidelines
├── context/
│   ├── DataContext.js             # Context type definitions
│   └── DataProvider.jsx           # Global state provider
├── service/
│   ├── AuthService.js             # Authentication logic
│   ├── AxiosInstance.jsx          # HTTP client configuration
│   └── Data.js                    # Data fetching utilities
├── src/
│   ├── assets/                    # Static assets (images, icons)
│   ├── components/                # Reusable UI components
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── Navbar.jsx
│   │   ├── RecipeCarousel.jsx
│   │   ├── RecipeFeed.jsx
│   │   └── ...
│   ├── layout/
│   │   └── MainLayout.jsx         # Main app layout wrapper
│   ├── pages/                     # Route-level components
│   │   ├── Home.jsx
│   │   ├── SignIn.jsx
│   │   ├── Register.jsx
│   │   ├── Recipes.jsx
│   │   ├── UserProfile.jsx
│   │   └── ...
│   ├── utils/
│   │   └── dietaryTags.js         # Utility functions
│   ├── App.jsx                    # Root component with routing
│   ├── ErrorBoundary.jsx          # Error handling wrapper
│   ├── main.jsx                   # Application entry point
│   └── index.css                  # Global styles (Tailwind)
├── Dockerfile                     # Docker configuration
├── vite.config.js                 # Vite configuration
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## 🏗️ Architecture

### Data Flow

1. **Authentication Flow:**
   - User submits credentials via `SignIn.jsx` or `Register.jsx`
   - `AuthService.js` calls backend via `AuthInstance` (Axios)
   - On success, user data is stored in `localStorage` and `DataContext`
   - `DataContext.jsx` hydrates `currentUser` on app mount via `loadUser()`

2. **API Communication:**
   - **AuthInstance** (`VITE_AUTH_URL`) - handles user authentication (`/users` endpoint)
   - **AxiosInstance** (`VITE_BASE_URL`) - handles main API calls (recipes, pantry, etc.)
   - Both instances have 10s timeout and JSON content-type headers

3. **State Management:**
   - Global state via React Context (`DataContext.jsx`)
   - `currentUser` object available to all components via `useContext(dataCntxt)`
   - LocalStorage persistence for user session (`{ id, email }`)

### Routing

Defined in `src/App.jsx`:
- `/` - Home page (via `MainLayout`)
- `/token` - Sign in page
- `/register` - Registration page

**Note:** Some components reference legacy routes (`/ap/signin`, `/ap/register`). Use `/token` and `/register` as canonical routes.

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code quality checks |

### Tech Stack

- **Framework:** React 19.1.1
- **Build Tool:** Vite 7.1.7
- **Styling:** Tailwind CSS 4.1.16
- **Routing:** React Router 7.9.5
- **HTTP Client:** Axios 1.13.1
- **Animations:** Framer Motion 12.23.24
- **Icons:** React Icons 5.5.0
- **Gestures:** @use-gesture/react 10.3.1

### Code Conventions

1. **File Extensions:** All React files use `.jsx` (not `.ts` or `.tsx`)
2. **Module System:** ES Modules (`type: "module"` in package.json)
3. **Environment Variables:** Use `import.meta.env.VITE_*` (NOT `process.env`)
4. **Import Paths:** Relative imports (`../../service/...`) - be cautious when moving files
5. **Error Messages:** Localized in Azerbaijani - update UI string comparisons when changing messages

### Common Development Tasks

#### Access Current User
```jsx
import { useContext } from 'react';
import { dataCntxt } from '../context/DataContext.jsx';

function MyComponent() {
  const { currentUser } = useContext(dataCntxt);
  
  return <div>Welcome, {currentUser?.name}</div>;
}
```

#### Make Authenticated API Calls
```jsx
import { AuthInstance } from '../service/AxiosInstance.jsx';

const fetchUserData = async (email) => {
  const response = await AuthInstance.get(`/users?email=${email}`);
  return response.data;
};
```

#### Add New Routes
1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Update navigation links in components

### Environment Setup

Create a `.env` file with these variables:

```env
# Main API endpoint (recipes, pantry, etc.)
VITE_BASE_URL=http://localhost:4000

# Authentication API endpoint (user management)
VITE_AUTH_URL=http://localhost:3000
```

**Production Example:**
```env
VITE_BASE_URL=https://api.dadly.app
VITE_AUTH_URL=https://auth.dadly.app
```

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t dadly-frontend .
```

### Run Container
```bash
docker run -p 8080:80 dadly-frontend
```

Access at `http://localhost:8080`

### Docker Notes
- Multi-stage build reduces image size (~20MB final)
- Uses nginx:alpine for serving static files
- Default nginx config may cause 404 on route refresh (see Troubleshooting)

### Docker with Environment Variables

Since Vite bakes env vars at build time, you need to pass them during build:

```bash
docker build \
  --build-arg VITE_BASE_URL=https://api.example.com \
  --build-arg VITE_AUTH_URL=https://auth.example.com \
  -t dadly-frontend .
```

Update `Dockerfile` to accept build args:
```dockerfile
ARG VITE_BASE_URL
ARG VITE_AUTH_URL
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_AUTH_URL=$VITE_AUTH_URL
```

## 🔍 Troubleshooting

### Issue: 404 on Page Refresh (Docker/Production)

**Symptom:** Routes like `/token` work initially but show 404 when refreshed.

**Cause:** Nginx tries to find physical files instead of routing to React Router.

**Solution:** Add `nginx.conf` to project root:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Then update Dockerfile:
```dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

### Issue: API Calls Failing

**Check:**
1. Backend services are running
2. `.env` file exists with correct URLs
3. CORS is configured on backend
4. No typos in `VITE_BASE_URL` or `VITE_AUTH_URL`

### Issue: "User not found" after sign-in

**Cause:** LocalStorage might have stale data or backend returned empty array.

**Solution:**
```javascript
localStorage.clear();
// Then try signing in again
```

### Issue: Route Mismatch Warnings

**Cause:** Legacy code references `/ap/signin` and `/ap/register` but `App.jsx` defines `/token` and `/register`.

**Solution:** Search and replace:
```bash
grep -r "/ap/signin" src/
grep -r "/ap/register" src/
```
Update all references to use canonical routes (`/token`, `/register`).

### Issue: Dependency Conflicts

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Sign up with new email
- [ ] Sign in with existing credentials
- [ ] Navigate between routes
- [ ] Refresh page on different routes
- [ ] Check browser console for errors
- [ ] Test logout flow
- [ ] Verify localStorage persistence

### Backend API Requirements

The frontend expects these endpoints:

**Auth API (`VITE_AUTH_URL`):**
- `GET /users?email=<email>` - Returns array of users
- `POST /users` - Create new user (accepts client-generated ID)

**Main API (`VITE_BASE_URL`):**
- (Document your recipe/pantry endpoints here)

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React 19 Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [AI Agent Instructions](.github/copilot-instructions.md)

## 🤝 Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Run `npm run lint` to check code quality
4. Test thoroughly (see Testing section)
5. Submit a pull request



## Support

For issues, questions, or suggestions:
1. Check existing GitHub issues
2. Create detailed bug reports with reproduction steps
3. Include error logs and environment details

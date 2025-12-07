import { AuthInstance } from './AxiosInstance';

// ✅ Helper: attach token if it exists
function getAuthHeader() {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ✅ Register a new user
export async function registerUser(userData) {
    try {
        const response = await AuthInstance.post(
            '/register',
            {
                email: userData.email,
                name: userData.name,
                password: userData.password,
                dietary_type: userData.dietaryType || 'none',
                allergies: userData.allergies || null,
            },
            {
                headers: getAuthHeader(),
            }
        );

        console.log('User registered:', response.data);
        return response.data;
    } catch (error) {
        console.error('Registration error:', error.response?.data || error.message);
        throw error;
    }
}

// ✅ Login user
export async function login(email, password) {
    try {
        // Create URL-encoded form data
        const formData = new URLSearchParams();
        formData.append('username', email); // some APIs expect 'username' not 'email'
        formData.append('password', password);

        const response = await AuthInstance.post(
            '/token',
            formData, // Axios automatically handles this as the body
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const data = response.data;

        // Store tokens
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        console.log('Login successful');
        return data;
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        throw error;
    }
}
// Get current logged-in user
export async function getCurrentUser() {
  try {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return null;

    const response = await AuthInstance.get('/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(response.data);

    return response.data; // <-- must be the actual user object
  } catch (error) {
    console.error('Get current user failed:', error);
    return null;
  }
}
// Get current logged-in user
export async function getLikedUser() {
  try {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return null;

    const response = await AuthInstance.get('/recipes/liked', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(response.data);

    return response.data; // <-- must be the actual user object

  } catch (error) {
    console.error('Get current user failed:', error);
    return null;
  }
}
// Refresh access token
export async function refreshAccessToken() {
    try {
        const response = await AuthInstance.post(
            '/refresh',
            {}, // Axios needs a body, even if empty
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('refresh_token')}`,
                },
            }
        );

        const data = response.data;

        // Update localStorage with new access token
        localStorage.setItem('access_token', data.access_token);

        return data;
    } catch (error) {
        console.error('Token refresh failed:', error.response?.data || error.message);

        // Refresh token expired, clear storage and redirect
        localStorage.clear();
        window.location.href = '/login';
    }
}
export async function logout() {
    try {
        await AuthInstance.post(
            '/logout',
            {}, // Axios needs a body for POST, even if empty
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            }
        );
    } catch (error) {
        console.error('Logout error:', error.response?.data || error.message);
    } finally {
        // Clear tokens and redirect regardless of API response
        localStorage.clear();
        window.location.href = '/login';
    }
}

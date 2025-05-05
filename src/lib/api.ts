import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let csrfToken: null = null;
const fetchCsrfToken = async () => {
  if (!csrfToken) {
    const response = await api.get('/csrf-token');
    csrfToken = response.data.csrfToken;
    
    console.log('c', (csrfToken as unknown as String).slice(0, 2));
  }
  return csrfToken;
};

// Interceptor do dodawania tokenu CSRF
api.interceptors.request.use(async (config) => {
  if (config.method && ['get', 'head', 'options'].includes(config.method.toLowerCase()) || (config.url && config.url.endsWith('/login'))) {
    return config;
  }
  const token = await fetchCsrfToken();
  config.headers['X-CSRF-Token'] = token;
  return config;
}, (error) => Promise.reject(error));


const excludedEndpoints = ['/login', '/csrf-token', '/users', '/users/reset-password', '/reset-password/confirm'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    // Sprawdź, czy URL nie jest na liście wykluczonych
    if ((status >= 400 && status < 405)&& url && !excludedEndpoints.some((endpoint) => url.endsWith(endpoint))) {
      localStorage.removeItem("jwt_token");
      window.location.reload();
    }

    return Promise.reject(error);
  }
);


export default api;
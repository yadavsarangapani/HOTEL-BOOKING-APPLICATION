import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hotel_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hotel_token');
      localStorage.removeItem('hotel_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH =====
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};

// ===== HOTELS =====
export const hotelApi = {
  getAll: () => api.get('/hotels'),
  getById: (id) => api.get(`/hotels/${id}`),
  search: (location) => api.get('/hotels/search', { params: { location } }),
  getLocations: () => api.get('/hotels/locations'),
  getRooms: (hotelId) => api.get(`/hotels/${hotelId}/rooms`),
  getAvailableRooms: (hotelId, checkIn, checkOut) =>
    api.get(`/hotels/${hotelId}/rooms/available`, { params: { checkIn, checkOut } }),
  // Admin Hoteliers
  create: (data) => api.post('/admin/hotels', data),
  update: (id, data) => api.put(`/admin/hotels/${id}`, data),
  delete: (id) => api.delete(`/admin/hotels/${id}`),
  addRoom: (hotelId, data) => api.post(`/admin/hotels/${hotelId}/rooms`, data),
};

// ===== ROOMS =====
export const roomApi = {
  search: (location, checkIn, checkOut) =>
    api.get('/rooms/search', { params: { location, checkIn, checkOut } }),
  getById: (id) => api.get(`/rooms/${id}`),
  // Admin Rooms
  update: (id, data) => api.put(`/admin/rooms/${id}`, data),
  delete: (id) => api.delete(`/admin/rooms/${id}`),
};

// ===== BOOKINGS =====
export const bookingApi = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  getAllAdmin: () => api.get('/bookings/admin/all'),
  approveRefund: (id) => api.put(`/bookings/admin/${id}/approve-refund`),
};

// ===== PAYMENTS =====
export const paymentApi = {
  createCheckoutSession: (bookingId) => api.post(`/payments/checkout/${bookingId}`),
  createPaymentIntent: (bookingId) => api.post(`/payments/create-intent/${bookingId}`),
  confirmPayment: (bookingId) => api.post(`/payments/confirm/${bookingId}`),
  verifyPayment: (sessionId) => api.post('/payments/verify', { sessionId }),
};

// ===== USER =====
export const userApi = {
  getMe: () => api.get('/users/me'),
  getAllAdmin: () => api.get('/users/admin/all'),
};

export default api;

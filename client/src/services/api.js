import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch all menu items
 */
export const getMenu = async (config = {}) => {
  const res = await api.get('/menu', config);
  return res.data.data;
};

/**
 * Fetch menu item details by ID
 */
export const getMenuItem = async (id, config = {}) => {
  const res = await api.get(`/menu/${id}`, config);
  return res.data.data;
};

/**
 * Create a new order (Checkout submission)
 */
export const placeOrder = async (orderData, config = {}) => {
  const res = await api.post('/orders', orderData, config);
  return res.data.data;
};

/**
 * Fetch single order status and items by ID
 */
export const getOrder = async (id, config = {}) => {
  const res = await api.get(`/orders/${id}`, config);
  return res.data.data;
};

export default api;

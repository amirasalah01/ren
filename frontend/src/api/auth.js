import axiosInstance from './axios';

export const register = async (userData) => {
  const response = await axiosInstance.post('/api/auth/register/', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await axiosInstance.post('/api/auth/login/', credentials);
  return response.data;
};

export const getProfile = async () => {
  const response = await axiosInstance.get('/api/auth/profile/');
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await axiosInstance.put('/api/auth/profile/', userData);
  return response.data;
};

export const getDashboard = async () => {
  const response = await axiosInstance.get('/api/auth/dashboard/');
  return response.data;
};

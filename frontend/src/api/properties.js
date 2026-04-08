import axiosInstance from './axios';

export const getProperties = async (params = {}) => {
  const response = await axiosInstance.get('/api/properties/list/', { params });
  return response.data;
};

export const getProperty = async (id) => {
  const response = await axiosInstance.get(`/api/properties/${id}/`);
  return response.data;
};

export const createProperty = async (propertyData) => {
  const response = await axiosInstance.post('/api/properties/list/', propertyData);
  return response.data;
};

export const updateProperty = async (id, propertyData) => {
  const response = await axiosInstance.patch(`/api/properties/${id}/`, propertyData);
  return response.data;
};

export const deleteProperty = async (id) => {
  const response = await axiosInstance.delete(`/api/properties/${id}/`);
  return response.data;
};

export const getMyProperties = async () => {
  const response = await axiosInstance.get('/api/properties/my/');
  return response.data;
};

export const searchProperties = async (params = {}) => {
  const response = await axiosInstance.get('/api/properties/search/', { params });
  return response.data;
};

export const getPropertyReviews = async (propertyId) => {
  const response = await axiosInstance.get(`/api/properties/${propertyId}/reviews/`);
  return response.data;
};

export const createReview = async (propertyId, reviewData) => {
  const response = await axiosInstance.post(`/api/properties/${propertyId}/reviews/`, reviewData);
  return response.data;
};

export const updateReview = async (reviewId, reviewData) => {
  const response = await axiosInstance.put(`/api/properties/review/${reviewId}/`, reviewData);
  return response.data;
};

export const deleteReview = async (reviewId) => {
  const response = await axiosInstance.delete(`/api/properties/review/${reviewId}/`);
  return response.data;
};

export const getFavorites = async () => {
  const response = await axiosInstance.get('/api/properties/favorites/');
  return response.data;
};

export const addFavorite = async (propertyId) => {
  const response = await axiosInstance.post('/api/properties/favorites/', { property: propertyId });
  return response.data;
};

export const removeFavorite = async (favoriteId) => {
  const response = await axiosInstance.delete(`/api/properties/favorite/${favoriteId}/`);
  return response.data;
};

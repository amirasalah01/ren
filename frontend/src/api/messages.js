import axiosInstance from './axios';

export const sendMessage = async (messageData) => {
  const response = await axiosInstance.post('/api/messages/send/', messageData);
  return response.data;
};

export const getInbox = async () => {
  const response = await axiosInstance.get('/api/messages/inbox/');
  return response.data;
};

export const getSentMessages = async () => {
  const response = await axiosInstance.get('/api/messages/sent/');
  return response.data;
};

export const getMessage = async (id) => {
  const response = await axiosInstance.get(`/api/messages/${id}/`);
  return response.data;
};

export const updateMessage = async (id, messageData) => {
  const response = await axiosInstance.put(`/api/messages/${id}/`, messageData);
  return response.data;
};

export const deleteMessage = async (id) => {
  const response = await axiosInstance.delete(`/api/messages/${id}/`);
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await axiosInstance.patch(`/api/messages/${id}/read/`);
  return response.data;
};

export const getConversation = async (userId) => {
  const response = await axiosInstance.get(`/api/messages/conversation/${userId}/`);
  return response.data;
};

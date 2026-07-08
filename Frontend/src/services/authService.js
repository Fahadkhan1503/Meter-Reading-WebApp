import axiosInstance from './axiosInstance';

export const signup = async (data) => {
  const response = await axiosInstance.post('/auth/signup', data);
  return response.data;
};

export const login = async (data) => {
  const response = await axiosInstance.post('/auth/login', data);
  return response.data;
};

export const getMe = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};
import axiosInstance, { getErrorMessage } from './axiosInstance';

export const signup = async (data) => {
  try {
    const response = await axiosInstance.post('/auth/signup', data);
    return response.data;
  } catch (error) {
    console.error('Signup error:', error);
    throw new Error(getErrorMessage(error, 'Could not create account'));
  }
};

export const login = async (data) => {
  try {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(getErrorMessage(error, 'Could not log in'));
  }
};

export const getMe = async () => {
  try {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw new Error(getErrorMessage(error, 'Could not fetch profile'));
  }
};
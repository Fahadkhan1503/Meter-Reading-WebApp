import axiosInstance, { getErrorMessage } from './axiosInstance';

export const createReading = async (data) => {
  try {
    const response = await axiosInstance.post('/readings', data);
    return response.data;
  } catch (error) {
    console.error('Create reading error:', error);
    throw new Error(getErrorMessage(error, 'Could not save reading'));
  }
};

export const scanReading = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axiosInstance.post('/readings/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Scan reading error:', error);
    throw new Error(getErrorMessage(error, 'Could not read meter from photo'));
  }
};

export const getReadings = async (meterId, month, year) => {
  try {
    const params = { meterId };
    if (month) params.month = month;
    if (year) params.year = year;

    const response = await axiosInstance.get('/readings', { params });
    return response.data;
  } catch (error) {
    console.error('Get readings error:', error);
    throw new Error(getErrorMessage(error, 'Could not fetch readings'));
  }
};

export const getLastReading = async (meterId) => {
  try {
    const response = await axiosInstance.get(`/readings/last/${meterId}`);
    return response.data;
  } catch (error) {
    console.error('Get last reading error:', error);
    throw new Error(getErrorMessage(error, 'Could not fetch last reading'));
  }
};

export const getMonthlySummary = async (meterId, month, year) => {
  try {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;

    const response = await axiosInstance.get(`/readings/summary/${meterId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Get monthly summary error:', error);
    throw new Error(getErrorMessage(error, 'Could not calculate monthly summary'));
  }
};

export const getCycleSummary = async (meterId) => {
  try {
    const response = await axiosInstance.get(`/readings/cycle/${meterId}`);
    return response.data;
  } catch (error) {
    console.error('Get cycle summary error:', error);
    throw new Error(getErrorMessage(error, 'Could not calculate cycle summary'));
  }
};

export const deleteReading = async (id) => {
  try {
    const response = await axiosInstance.delete(`/readings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete reading error:', error);
    throw new Error(getErrorMessage(error, 'Could not delete reading'));
  }
};
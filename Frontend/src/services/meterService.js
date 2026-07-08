import axiosInstance, { getErrorMessage } from './axiosInstance';

export const createMeter = async (data) => {
  try {
    const response = await axiosInstance.post('/meters', data);
    return response.data;
  } catch (error) {
    console.error('Create meter error:', error);
    throw new Error(getErrorMessage(error, 'Could not create meter'));
  }
};

export const getMeters = async (includeInactive = false) => {
  try {
    const response = await axiosInstance.get('/meters', {
      params: includeInactive ? { includeInactive: 'true' } : {},
    });
    return response.data;
  } catch (error) {
    console.error('Get meters error:', error);
    throw new Error(getErrorMessage(error, 'Could not fetch meters'));
  }
};

export const getMeterById = async (id) => {
  try {
    const response = await axiosInstance.get(`/meters/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get meter error:', error);
    throw new Error(getErrorMessage(error, 'Could not fetch meter'));
  }
};

export const updateMeter = async (id, data) => {
  try {
    const response = await axiosInstance.patch(`/meters/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update meter error:', error);
    throw new Error(getErrorMessage(error, 'Could not update meter'));
  }
};

export const deleteMeter = async (id) => {
  try {
    const response = await axiosInstance.delete(`/meters/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete meter error:', error);
    throw new Error(getErrorMessage(error, 'Could not delete meter'));
  }
};
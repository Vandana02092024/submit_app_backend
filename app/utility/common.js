import bcrypt from "bcrypt";
import { Op } from 'sequelize';

export const comparePasswords = async (pass, enpass) => {
  try {
    const match = await bcrypt.compare(pass, enpass);
    return match;
  } catch (error) {
    throw error;
  }
};

export const generateRandomNumber = (digits) => {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const sendResponse = (res, status, type, message, data = null) => {
  const response = {
    status: type || 'success', 
    success: type === 'success',
    message: message || 'Action was successful',
    data: data || null,
  };
  res.status(status).json(response);
};

export const sendSuccessResponse = (res, message, data = []) => {
  sendResponse(res, 200, 'success', message, data);
};

export const sendErrorResponse = (res, message) => {
  sendResponse(res, 402, 'error', message, []);
};

export const sendWarningResponse = (res, message) => {
  sendResponse(res, 300, 'warning', message, []);
};

export const sendInfoResponse = (res, message) => {
  sendResponse(res, 102, 'info', message, []);
};

export const applySearchAndPagination = (query, options) => {
  const { searchFields, searchTerm, page, pageSize } = query;
  const searchCondition  =
    searchTerm && searchFields && searchFields.length
      ? {
          [Op.or]: searchFields.map((field) => ({
            [field]: { [Op.like]: `%${searchTerm}%` },
          })),
        }
      : {};
      const whereCondition = options.where || {};

      const where = {
        [Op.and]: [whereCondition, searchCondition],
      };
      
  const offset = (page - 1) * pageSize || 0;
  const limit = pageSize || 10;

  return {
    ...options,
    where,
    offset,
    limit,
  };
};



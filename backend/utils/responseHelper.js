/**
 * Standardized response helper function
 * @param {Object} res - Express response object
 * @param {boolean} success - Whether the operation was successful
 * @param {string} message - Response message
 * @param {any} data - Response data (optional)
 * @param {number} statusCode - HTTP status code (optional, defaults to 200 for success, 400 for failure)
 */
const sendResponse = (res, success, message, data = null, statusCode = null) => {
  // Set default status codes
  if (!statusCode) {
    statusCode = success ? 200 : 400;
  }
  
  const response = {
    success,
    message
  };
  
  // Only include data if it's not null
  if (data !== null) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

module.exports = {
  sendResponse
};
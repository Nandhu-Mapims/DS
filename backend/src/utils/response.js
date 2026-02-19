/**
 * Consistent API response shape: { success, data, message, error }
 */
export function success(res, data = null, message = null, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    message: message || undefined,
    error: undefined,
  });
}

export function error(res, message = 'An error occurred', statusCode = 500, errorDetail = undefined) {
  return res.status(statusCode).json({
    success: false,
    data: undefined,
    message,
    error: errorDetail || undefined,
  });
}

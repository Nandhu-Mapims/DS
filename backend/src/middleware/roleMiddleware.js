import { error } from '../utils/response.js';

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Unauthorized', 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      return error(res, 'Forbidden: insufficient role', 403);
    }
    next();
  };
}

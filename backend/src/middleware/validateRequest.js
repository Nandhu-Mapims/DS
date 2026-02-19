import { validationResult } from 'express-validator';
import { error } from '../utils/response.js';

export function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const first = result.array({ onlyFirstError: true })[0];
    const message = first?.msg || 'Validation failed';
    return error(res, message, 400, result.array());
  }
  next();
}

import { Router } from 'express';
import { body } from 'express-validator';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  list,
  getById,
  create,
  update,
  toggle,
} from '../controllers/templateController.js';

const router = Router();

router.get('/', authMiddleware, list);
router.get('/:id', authMiddleware, getById);
router.post(
  '/',
  authMiddleware,
  requireRole('ADMIN'),
  [
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('version').optional().trim(),
    body('sections').optional().isArray(),
    body('layout').optional().isIn(['CLASSIC', 'MODERN', 'COMPACT', 'PREMIUM_TABLE']),
    body('defaultCss').optional().isString(),
  ],
  validateRequest,
  create
);
router.put(
  '/:id',
  authMiddleware,
  requireRole('ADMIN'),
  [
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('version').optional().trim(),
    body('sections').optional().isArray(),
    body('layout').optional().isIn(['CLASSIC', 'MODERN', 'COMPACT', 'PREMIUM_TABLE']),
    body('defaultCss').optional().isString(),
  ],
  validateRequest,
  update
);
router.patch('/:id/toggle', authMiddleware, requireRole('ADMIN'), toggle);

export default router;

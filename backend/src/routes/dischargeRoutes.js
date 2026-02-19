import { Router } from 'express';
import { body } from 'express-validator';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  create,
  update,
  aiEnhance,
  submit,
  list,
  listPending,
  listVerified,
  chiefEdit,
  approve,
  reject,
  getById,
  downloadPdf,
  sendWhatsApp,
} from '../controllers/dischargeController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRole('DOCTOR', 'CHIEF', 'ADMIN'), list);
router.get('/pending', requireRole('CHIEF', 'ADMIN'), listPending);
router.get('/verified', requireRole('DOCTOR', 'CHIEF', 'ADMIN'), listVerified);

router.post(
  '/',
  requireRole('DOCTOR', 'ADMIN'),
  [
    body('uhid').trim().notEmpty().withMessage('uhid required'),
    body('ipid').trim().notEmpty().withMessage('ipid required'),
    body('mobile').trim().notEmpty().withMessage('mobile required'),
    body('templateId').optional().isMongoId(),
  ],
  validateRequest,
  create
);

router.get('/:id/pdf', requireRole('DOCTOR', 'CHIEF', 'ADMIN'), downloadPdf);
router.post('/:id/whatsapp', requireRole('CHIEF', 'ADMIN'), sendWhatsApp);
router.get('/:id', getById);

router.put('/:id', requireRole('DOCTOR', 'ADMIN'), update);
router.patch('/:id', requireRole('DOCTOR', 'ADMIN'), update);
router.post('/:id/ai-enhance', requireRole('DOCTOR', 'ADMIN'), aiEnhance);
router.post(
  '/:id/submit',
  requireRole('DOCTOR', 'ADMIN'),
  [body('doctorEditedText').optional().isString()],
  validateRequest,
  submit
);

router.put(
  '/:id/chief-edit',
  requireRole('CHIEF', 'ADMIN'),
  [body('chiefEditedText').optional().isString()],
  validateRequest,
  chiefEdit
);
router.post('/:id/approve', requireRole('CHIEF', 'ADMIN'), approve);
router.post(
  '/:id/reject',
  requireRole('CHIEF', 'ADMIN'),
  [body('remarks').optional().isString()],
  validateRequest,
  reject
);

export default router;

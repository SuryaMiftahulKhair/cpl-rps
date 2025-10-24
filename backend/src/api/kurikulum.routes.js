import express from 'express';
import {
  createKurikulum,
  getAllKurikulum,
  getKurikulumById,
  updateKurikulum,
  deleteKurikulum,
} from '../controllers/kurikulum.controller.js';

const router = express.Router();
router.post('/', createKurikulum);
router.get('/', getAllKurikulum);
router.get('/:id', getKurikulumById);
router.put('/:id', updateKurikulum);
router.delete('/:id', deleteKurikulum);

export default router;
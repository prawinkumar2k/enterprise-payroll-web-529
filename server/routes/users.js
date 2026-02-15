import express from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// User management is restricted to Admins
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;

import express from 'express';
import userRoutes from './userRoutes.mjs';
import taskListRoutes from './taskListRoutes.mjs';
import taskRoutes from './taskRoutes.mjs';
import adminRoutes from './adminRoutes.mjs';

const router = express.Router();

router.use('/user', userRoutes);
router.use('/task_list', taskListRoutes);
router.use('/task', taskRoutes);
router.use('/admin', adminRoutes);

export default router;

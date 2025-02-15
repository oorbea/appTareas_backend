import express from 'express';
import userRoutes from './userRoutes';
import taskListRoutes from './taskListRoutes';
import taskRoutes from './taskRoutes';
import adminRoutes from './adminRoutes';

const router = express.Router();

router.use('/user', userRoutes);
router.use('/task_list', taskListRoutes);
router.use('/task', taskRoutes);
router.use('/admin', adminRoutes);

export default router;

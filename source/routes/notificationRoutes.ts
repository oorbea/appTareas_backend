import express from 'express';
import authenticate from '../authenticate';
import notCon from '../controllers/notificationController';

const router = express.Router();

router.post('/', authenticate, notCon.createPublic);

export default router;

import express from 'express';
import * as ec from '../controllers/employeeController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: 'uploads/work/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

const router = express.Router();

// All employee routes require authentication and EMPLOYEE role
router.use(authenticate);
router.use(authorize('EMPLOYEE'));

router.post('/punch-in', ec.punchIn);
router.post('/punch-out', upload.single('attachment'), ec.punchOut);
router.get('/attendance', ec.getMyAttendance);
router.get('/salary', ec.getMySalary);
router.get('/work-submissions', ec.getMyWorkSubmissions);

// Leave & Permissions
router.post('/leave/apply', ec.applyLeave);
router.get('/leave/my', ec.getMyLeaves);
router.post('/permission/apply', ec.applyPermission);
router.get('/permission/my', ec.getMyPermissions);

export default router;

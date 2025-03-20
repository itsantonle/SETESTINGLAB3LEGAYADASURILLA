import express from 'express';
import {
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';
import { checkSchema } from 'express-validator';
import { updateUserValidationSchema } from '../validation/updateUser.js';
import { deleteUserValidationSchema } from '../validation/deleteUser.js';

const router = express.Router();

router.post('/update/:id',verifyToken,checkSchema(updateUserValidationSchema),updateUser);
router.delete('/delete/:id', verifyToken, checkSchema(deleteUserValidationSchema),deleteUser);

export default router;

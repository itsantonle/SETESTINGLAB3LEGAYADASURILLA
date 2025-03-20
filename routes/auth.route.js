import express from 'express';
import { signin, signup, google, signout } from '../controllers/auth.controller.js';
import { checkSchema } from 'express-validator';
import { signUpValidationSchema } from '../validation/signup.js';
import { signInValidationSchema } from '../validation/signin.js';
import { googleValidationSchema } from '../validation/google.js';

const router = express.Router();

router.post('/signup',checkSchema(signUpValidationSchema),signup);
router.post('/signin',checkSchema(signInValidationSchema) ,signin);
router.post('/google',checkSchema(googleValidationSchema) ,google);
router.get('/signout', signout);

export default router;

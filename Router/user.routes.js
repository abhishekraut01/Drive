import express from 'express';
import { body, validationResult } from 'express-validator';
import userModel from '../models/user.js'
const router = express.Router();

router.get('/register', (req, res) => {
  res.render('register');
});

router.post(
  '/register',
  [
    body('email').trim().isEmail().isLength({ min: 13 }),
    body('username').trim().notEmpty().isLength({ min: 3 }).withMessage('Username is required'),
    body('password').trim().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    const { email, username, password } = req.body;

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newUser = new userModel({
        username: username,
        email: email,
        password: password,
      });
      
      newUser
        .save()
        .then(() => console.log('User created!'))
        .catch(err => console.error('Error creating user:', err));

        res.send(newUser);
  }
);

export default router;

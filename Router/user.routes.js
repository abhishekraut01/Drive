import express from 'express'; 
import { body, validationResult } from 'express-validator'; // Middleware for validating and sanitizing input
import userModel from '../models/user.js';
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
const router = express.Router(); 
import bcrypt from 'bcrypt'

// Route to render the registration form using EJS
router.get('/register', (req, res) => {
  // Renders the 'register' EJS view when the '/register' GET route is accessed
  res.render('register');
});

// Route to handle user registration form submission
router.post(
  '/register',
  [
    // Input validation rules using express-validator
    body('email')
      .trim() // Removes leading/trailing whitespace
      .isEmail() // Ensures the input is a valid email
      .isLength({ min: 13 }), // Ensures the email is at least 13 characters long

    body('username')
      .trim()
      .notEmpty() // Ensures the username is not empty
      .isLength({ min: 3 })
      .withMessage('Username is required'), // Custom error message for invalid username

    body('password')
      .trim()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
  ],
  async (req, res) => {
    // Extracting validation errors, if any
    const errors = validationResult(req);
    const { email, username, password } = req.body; // Destructuring the request body

    // Check if there are validation errors
    if (!errors.isEmpty()) {
      // If errors exist, return a 400 status with the error details
      return res.status(400).json({ errors: errors.array() });
    }

    // Hash the password using bcrypt for secure storage
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds for hashing

    // Create a new user object with the hashed password
    const newUser = new userModel({
      username: username, // Storing the username
      email: email, // Storing the email
      password: hashedPassword, // Storing the hashed password
    });

    // Save the new user to the database
    newUser
      .save()
      .then(() => console.log('User created!')) // Log success message
      .catch(err => console.error('Error creating user:', err)); // Log any errors that occur during save

    // Send the newly created user object as the response
    res.send(newUser);
  }
);

//Route to rander login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Route to handle login form submission
router.post(
  '/login',
  // Input validation rules using express-validator
  [
    body('username').trim().notEmpty().isLength({ min: 3 }).withMessage('Username must be atleast 3 characters long'),
    body('password').trim().notEmpty().isLength({ min: 8 }).withMessage('password must be atleast 8 characters long')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const { username, password } = req.body;

    if (!errors.isEmpty()) {
      return res.status(403).json({ errors: errors.array() });
    }

    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(403).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    const isMatch = await bcrypt.compare(password , user.password)
    if (!isMatch) {
      return res.status(403).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    const token = jwt.sign({
      id: user._id,
      username: user.username,
      email: user.email
    },process.env.SECRET_KEY)

    res.cookie("token",token)

    res.send({ msg: 'Logged in successfully' });
  } 
);

export default router; // Export the router for use in other parts of the application

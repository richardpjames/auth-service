import express from 'express';
// Grab the functions from the users controller
import { create as createUser } from '../controllers/userController.js';

// Create the router for us to plug in our controllers
const router = express.Router({ mergeParams: true });

// Add the controllers for our users
router.post('/api/users', createUser);

// Export the router for use in the application
export default router;

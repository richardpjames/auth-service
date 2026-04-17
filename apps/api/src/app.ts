// Start with using express for our web server
import express, { type Request, type Response, type Express } from 'express';
import cookieParser from 'cookie-parser';
// Helmet is used to secure the application
import helmet from 'helmet';
// Get our routes
import router from './routes/routes.js';
// Import our rate limiter
import { globalLimiter } from './middleware/rateLimit.js';

export function createApp(): Express {
  // Initialise the express app
  const app = express();
  // This allows for correct IP addresses behind our prod nginx and cloudflare
  app.set('trust proxy', 2);
  // Add helmet
  app.use(helmet());
  // Allow the ingestion of json
  app.use(express.json());
  // Allow working with cookies
  app.use(cookieParser());
  // Provide global rate limiting
  app.use(globalLimiter);

  // Add a simple health route
  app.get('/api/health', (req: Request, res: Response): void => {
    res.send().status(200);
  });

  // Add our application routes
  app.use(router);

  return app;
}

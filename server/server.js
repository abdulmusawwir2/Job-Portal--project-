import './config/instrument.js';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/db.js';
import * as Sentry from '@sentry/node';
import { clerkWebhooks } from './controllers/webhooks.js';

// initialize express
const app = express();

// ✅ Wrapped everything inside an async function to use `await`
const startServer = async () => {
    try {
        // ✅ Moved `await connectDB()` inside this function to avoid top-level `await`
        await connectDB();

        // middlewares 
        app.use(cors());
        app.use(express.json());

        // routes
        app.get('/', (req, res) => {
            res.send('API Working');
        });

        app.get('/debug-sentry', function mainHandler(req, res) {
            throw new Error('My first Sentry error!');
        });

        app.post('/webhooks', clerkWebhooks);

        // ✅ Defined `PORT` correctly with `process.env.PORT` (not `process.env.port`)
        const PORT = process.env.PORT || 5000;

        Sentry.setupExpressErrorHandler(app);

        // ✅ Start the server only after database connection
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        // ✅ Added proper error handling to exit process if something goes wrong
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

// ✅ Call the `startServer()` function to initialize everything
startServer();

// ✅ Export `app` to make it work with Vercel
export default app;

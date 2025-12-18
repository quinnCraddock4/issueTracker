// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

import express from 'express';
import dotenv from 'dotenv'
dotenv.config();
import debug from 'debug';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { userRouter } from './routes/api/user.js';
import { authRouter } from './routes/api/auth.js';
import { bugRouter } from './routes/api/bug.js';
import { commentRouter } from './routes/api/comment.js';
import { testRouter } from './routes/api/test.js';
import { timeRouter } from './routes/api/time.js';
import { ping } from './database.js';
const debugServer = debug('app:server');

const app = express();

// CORS configuration - allow all localhost origins in development
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080'
];

// Add production origin if specified
if (process.env.CORS_ORIGIN) {
    allowedOrigins.push(process.env.CORS_ORIGIN);
}

// Check if running on Cloud Run
const isCloudRun = !!process.env.K_SERVICE;

// Note: Same-origin requests (frontend and backend on same domain) don't need CORS
// This is mainly for cases where frontend is on a different subdomain

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (same-origin requests, mobile apps, curl, Postman)
        if (!origin) {
            return callback(null, true);
        }

        // Allow any localhost or 127.0.0.1 origin in development
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }

        // In production (Cloud Run), allow Cloud Run domains
        if (isCloudRun && (origin.includes('.run.app') || origin.includes('cloudfunctions.net'))) {
            return callback(null, true);
        }

        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // For production, be more permissive - allow all origins
        // (since frontend and backend are on same domain, this should be safe)
        if (process.env.NODE_ENV === 'production') {
            return callback(null, true);
        }

        // Log the rejected origin for debugging
        debugServer(`CORS: Origin not allowed: ${origin}`);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type'],
    maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));
app.use(express.json())
app.use(cookieParser());
app.use(express.static('dist'))

app.use('/api/auth', authRouter);

app.use('/api/users', userRouter);
app.use('/api/bugs', bugRouter);
app.use('/api/bugs', commentRouter);
app.use('/api/bugs', testRouter);
app.use('/api/bugs', timeRouter);

// API health check endpoint
app.get('/api', (req, res) => {
    res.send('API is working');
});

// Catch-all handler: serve index.html for non-API routes, 404 for unmatched API routes
// This allows React Router to handle client-side routing
// Note: express.static above will serve files from dist if they exist,
// so this only handles routes that don't match static files
app.use((req, res, next) => {
    // Handle unmatched API routes with JSON 404
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }

    // For non-API routes, serve index.html for SPA routing (only for GET requests)
    if (req.method === 'GET') {
        res.sendFile('index.html', { root: 'dist' }, (err) => {
            if (err) {
                console.error('Error serving index.html:', err);
                next(err); // Pass error to error handler
            }
        });
    } else {
        // Non-GET requests to non-API routes get 404
        res.status(404).send('Not found');
    }
});

// Error handling middleware - must be last, after all routes
app.use((err, req, res, next) => {
    // Determine status code
    const status = err.status || err.statusCode || 500;

    // Log error details server-side (always log full details)
    console.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        status: status,
        url: req.url,
        method: req.method
    });
    debugServer('Error occurred:', err);

    // Don't leak error details in production
    if (process.env.NODE_ENV === 'production') {
        // Return generic error message to client in production
        return res.status(status).json({
            error: status === 500 ? 'Internal server error' : (err.message || 'An error occurred')
        });
    } else {
        // In development, return full error details
        return res.status(status).json({
            error: err.message || 'Internal server error',
            stack: err.stack
        });
    }
});

const port = Number(process.env.PORT) || (isCloudRun ? 8080 : 3000);

// Start server
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    debugServer(`Server is running on http://0.0.0.0:${port}`);

    // Database ping (non-blocking - don't fail startup if DB is unavailable)
    ping().then(() => {
        debugServer('Database ping successful.');
        console.log('Database connection successful');
    }).catch((err) => {
        console.error('Database ping failed (this is non-fatal):', err?.message || err);
        debugServer('Database ping failed:', err);
    });
});

// Handle server errors
server.on('error', (err) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
        process.exit(1);
    } else {
        throw err;
    }
});

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
import { ping } from './database.js';
const debugServer = debug('app:server');

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json())
app.use(cookieParser());
app.use(express.static('dist'))

app.use('/api/auth', authRouter);

app.use('/api/users', userRouter);
app.use('/api/bugs', bugRouter);
app.use('/api/bugs', commentRouter);
app.use('/api/bugs', testRouter);

const isCloudRun = !!process.env.K_SERVICE;
const port = Number(process.env.PORT) || (isCloudRun ? 8080 : 3000);

app.listen(port, () => {
    console.log(`server up at http://localhost:${port}`)
    debugServer(`Server is running on http://localhost:${port}`);

    ping().then(() => {
        debugServer('Database ping successful.');
    }).catch((err) => {
        console.error('Failed to connect to the database on startup:', err?.message || err);
    });
});

app.get('/api', (req, res) => {
    res.send('API is working');
});

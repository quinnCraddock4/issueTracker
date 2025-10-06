import express from 'express';
import dotenv from 'dotenv'
dotenv.config();
import debug from 'debug';
import { userRouter } from './routes/api/user.js';
import { bugRouter } from './routes/api/bug.js';
import { ping } from './database.js';
const debugServer = debug('app:server');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json())
app.use(express.static('dist'))

app.use('/api/users', userRouter);
app.use('/api/bugs', bugRouter);

// Respect Cloud Run's injected PORT (8080). Default to 3000 locally.
const isCloudRun = !!process.env.K_SERVICE;
const port = Number(process.env.PORT) || (isCloudRun ? 8080 : 3000);

app.listen(port, () => {
    console.log(`server up at http://localhost:${port}`)
    debugServer(`Server is running on http://localhost:${port}`);

    // Ping DB in the background; do not crash if unavailable at startup
    ping().then(() => {
        debugServer('Database ping successful.');
    }).catch((err) => {
        console.error('Failed to connect to the database on startup:', err?.message || err);
    });
});

app.get('/api', (req, res) => {
    res.send('API is working');
});

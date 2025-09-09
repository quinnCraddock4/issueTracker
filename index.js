import express from 'express';
import dotenv from 'dotenv'
dotenv.config();
import debug from 'debug';
import { userRouter } from './routes/api/user.js';
import { bugRouter } from './routes/api/bug.js';
const debugServer = debug('app:server');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json())
app.use(express.static('dist'))

app.use('/api/users', userRouter);
app.use('/api/bugs', bugRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`server up at http://localhost:${port}`)
    debugServer(`Server is running on http://localhost:${port}`);
});

app.get('/api', (req, res) => {
    res.send('API is working');
});

import express from 'express';
import bcrypt from 'bcrypt';
import debug from 'debug';
import { connect, newId } from '../../database.js';
import { validate } from '../../validation/middleware.js';
import { registerUserSchema, loginUserSchema } from '../../validation/schemas.js';
import { createSession, deleteSession } from '../../middleware/auth.js';

const router = express.Router();
const debugAuth = debug('app:AuthRouter');

router.use(express.urlencoded({ extended: false }));

router.post('/sign-up/email', validate(registerUserSchema), async (req, res, next) => {
    try {
        const { email, password, givenName, familyName, role } = req.body;
        debugAuth(`Attempting to register user with email: ${email}`);

        const db = await connect();

        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const fullName = `${givenName} ${familyName}`;

        // Ensure role is always an array
        const normalizedRole = Array.isArray(role) ? role : (role ? [role] : []);

        const newUser = {
            email,
            password: hashedPassword,
            fullName,
            givenName,
            familyName,
            role: normalizedRole,
            createdOn: new Date(),
            lastUpdatedOn: new Date(),
            lastUpdatedBy: null
        };

        const result = await db.collection('users').insertOne(newUser);
        const userId = result.insertedId.toString();

        const sessionId = await createSession({ _id: result.insertedId, email, role: normalizedRole });

        res.cookie('sessionId', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        debugAuth(`User registered successfully with ID: ${userId}`);
        res.status(200).json({
            message: "New user registered!",
            userId
        });
    } catch (err) {
        next(err);
    }
});

router.post('/sign-in/email', validate(loginUserSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        debugAuth(`Attempting login for email: ${email}`);

        const db = await connect();
        const user = await db.collection('users').findOne({ email });

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ error: "Invalid login credential provided. Please try again." });
        }

        const sessionId = await createSession(user);

        res.cookie('sessionId', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        const userId = user._id.toString();
        debugAuth(`User logged in successfully with ID: ${userId}`);
        res.status(200).json({
            message: "Welcome back!",
            userId
        });
    } catch (err) {
        next(err);
    }
});

router.post('/sign-out', async (req, res, next) => {
    try {
        const sessionId = req.cookies?.sessionId;

        if (sessionId) {
            await deleteSession(sessionId);
        }

        res.clearCookie('sessionId');

        debugAuth('User signed out successfully');
        res.status(200).json({ message: "Signed out successfully" });
    } catch (err) {
        next(err);
    }
});

export { router as authRouter };

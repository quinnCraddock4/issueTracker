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

        // Ensure role is always an array, default to Developer if no role provided
        let normalizedRole = Array.isArray(role) ? role : (role ? [role] : []);
        if (normalizedRole.length === 0) {
            normalizedRole = ['Developer']; // Assign default role
        }

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
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/'
        });

        debugAuth(`User registered successfully with ID: ${userId}`);
        res.status(200).json({
            message: "New user registered!",
            userId,
            email: newUser.email,
            role: normalizedRole
        });
    } catch (err) {
        next(err);
    }
});

router.post('/sign-in/email', validate(loginUserSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log('[SIGN-IN] Attempting login for email:', email);
        debugAuth(`Attempting login for email: ${email}`);

        console.log('[SIGN-IN] Connecting to database...');
        const db = await connect();
        console.log('[SIGN-IN] Database connected, searching for user...');
        
        const user = await db.collection('users').findOne({ email });
        console.log('[SIGN-IN] User lookup result:', user ? 'found' : 'not found');

        if (!user) {
            console.log('[SIGN-IN] User not found for email:', email);
            debugAuth(`User not found for email: ${email}`);
            return res.status(400).json({ error: "Invalid login credential provided. Please try again." });
        }

        if (!user.password) {
            debugAuth(`User ${user._id?.toString() || 'unknown'} has no password set`);
            return res.status(400).json({ error: "Invalid login credential provided. Please try again." });
        }

        if (!user._id) {
            debugAuth('User object missing _id field');
            return res.status(500).json({ error: "Internal server error" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            debugAuth(`Password mismatch for user: ${user._id.toString()}`);
            return res.status(400).json({ error: "Invalid login credential provided. Please try again." });
        }

        try {
            console.log('[SIGN-IN] Creating session for user:', user._id?.toString());
            const sessionId = await createSession(user);
            console.log('[SIGN-IN] Session created successfully');

            const isProduction = process.env.NODE_ENV === 'production';
            console.log('[SIGN-IN] Setting cookie, NODE_ENV:', process.env.NODE_ENV, 'secure:', isProduction);
            
            res.cookie('sessionId', sessionId, {
                httpOnly: true,
                secure: isProduction,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000,
                path: '/'
            });
            console.log('[SIGN-IN] Cookie set successfully');

            const userId = user._id.toString();
            debugAuth(`User logged in successfully with ID: ${userId}`);
            res.status(200).json({
                message: "Welcome back!",
                userId,
                email: user.email,
                role: user.role || []
            });
        } catch (sessionErr) {
            console.error('[SIGN-IN] Error creating session:', sessionErr);
            console.error('[SIGN-IN] Session error stack:', sessionErr?.stack);
            debugAuth('Error creating session:', sessionErr);
            return res.status(500).json({ error: "Failed to create session" });
        }
    } catch (err) {
        console.error('[SIGN-IN] Unhandled error:', err);
        console.error('[SIGN-IN] Error type:', err?.constructor?.name);
        console.error('[SIGN-IN] Error message:', err?.message);
        console.error('[SIGN-IN] Error stack:', err?.stack);
        debugAuth('Sign-in error:', err);
        next(err);
    }
});

router.post('/sign-out', async (req, res, next) => {
    try {
        const sessionId = req.cookies?.sessionId;

        if (sessionId) {
            await deleteSession(sessionId);
        }

        res.clearCookie('sessionId', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });

        debugAuth('User signed out successfully');
        res.status(200).json({ message: "Signed out successfully" });
    } catch (err) {
        next(err);
    }
});

export { router as authRouter };

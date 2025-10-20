import express from 'express';
import bcrypt from 'bcrypt';
import debug from 'debug';
import { connect, newId } from '../../database.js';
import { validate, validateObjectId } from '../../validation/middleware.js';
import { registerUserSchema, loginUserSchema, updateUserSchema } from '../../validation/schemas.js';

const router = express.Router();
const debugUser = debug('app:UserRouter');

router.use(express.urlencoded({ extended: false }));

router.get('/', async (req, res, next) => {
    try {
        debugUser('Getting all users');
        const db = await connect();
        const users = await db.collection('users').find({}).toArray();
        res.json(users);
    } catch (err) {
        next(err);
    }
});

router.get('/:userId', validateObjectId('userId'), async (req, res, next) => {
    try {
        const { userId } = req.params;
        debugUser(`Getting user with ID: ${userId}`);

        const db = await connect();
        const user = await db.collection('users').findOne({ _id: newId(userId) });

        if (!user) {
            return res.status(404).json({ error: `User ${userId} not found.` });
        }

        res.json(user);
    } catch (err) {
        next(err);
    }
});

router.post('/register', validate(registerUserSchema), async (req, res, next) => {
    try {
        const { email, password, givenName, familyName, role } = req.body;
        debugUser(`Attempting to register user with email: ${email}`);

        const db = await connect();

        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const fullName = `${givenName} ${familyName}`;
        const newUser = {
            email,
            password: hashedPassword,
            fullName,
            givenName,
            familyName,
            role,
            createdAt: new Date()
        };

        const result = await db.collection('users').insertOne(newUser);
        const userId = result.insertedId.toString();

        debugUser(`User registered successfully with ID: ${userId}`);
        res.status(200).json({ message: "New user registered!", userId });
    } catch (err) {
        next(err);
    }
});

router.post('/login', validate(loginUserSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        debugUser(`Attempting login for email: ${email}`);

        const db = await connect();
        const user = await db.collection('users').findOne({ email });

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ error: "Invalid login credential provided. Please try again." });
        }

        const userId = user._id.toString();
        debugUser(`User logged in successfully with ID: ${userId}`);
        res.status(200).json({ message: "Welcome back!", userId });
    } catch (err) {
        next(err);
    }
});

router.patch('/:userId', validateObjectId('userId'), validate(updateUserSchema), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { password, fullName, givenName, familyName, role } = req.body;
        debugUser(`Updating user with ID: ${userId}`);

        const db = await connect();
        const user = await db.collection('users').findOne({ _id: newId(userId) });

        if (!user) {
            return res.status(404).json({ error: `User ${userId} not found.` });
        }

        const updateFields = {};
        if (password) updateFields.password = await bcrypt.hash(password, 10);
        if (fullName) updateFields.fullName = fullName;
        if (givenName) updateFields.givenName = givenName;
        if (familyName) updateFields.familyName = familyName;
        if (role) updateFields.role = role;

        updateFields.lastUpdated = new Date();

        await db.collection('users').updateOne(
            { _id: newId(userId) },
            { $set: updateFields }
        );

        debugUser(`User updated successfully with ID: ${userId}`);
        res.status(200).json({ message: `User ${userId} updated!`, userId });
    } catch (err) {
        next(err);
    }
});

router.delete('/:userId', validateObjectId('userId'), async (req, res, next) => {
    try {
        const { userId } = req.params;
        debugUser(`Deleting user with ID: ${userId}`);

        const db = await connect();
        const user = await db.collection('users').findOne({ _id: newId(userId) });

        if (!user) {
            return res.status(404).json({ error: `User ${userId} not found.` });
        }

        await db.collection('users').deleteOne({ _id: newId(userId) });

        debugUser(`User deleted successfully with ID: ${userId}`);
        res.status(200).json({ message: `User ${userId} deleted!`, userId });
    } catch (err) {
        next(err);
    }
});

export { router as userRouter };
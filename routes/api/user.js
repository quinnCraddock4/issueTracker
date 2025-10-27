import express from 'express';
import bcrypt from 'bcrypt';
import debug from 'debug';
import { connect, newId } from '../../database.js';
import { validate, validateObjectId } from '../../validation/middleware.js';
import { updateUserSchema } from '../../validation/schemas.js';
import { authenticateToken, createEditRecord, hasPermission } from '../../middleware/auth.js';

const router = express.Router();
const debugUser = debug('app:UserRouter');

router.use(express.urlencoded({ extended: false }));

router.use(authenticateToken);

router.get('/', hasPermission('canViewData'), async (req, res, next) => {
    try {
        const { keywords, role, maxAge, minAge, sortBy, pageSize, pageNumber } = req.query;
        debugUser('Getting users with search parameters');

        const db = await connect();
        let query = {};

        if (keywords) {
            query.$text = { $search: keywords };
        }

        if (role) {
            // Support searching by role in array field
            query.role = { $in: Array.isArray(role) ? role : [role] };
        }

        if (maxAge) {
            const maxAgeDays = parseInt(maxAge);
            const maxAgeDate = new Date();
            maxAgeDate.setDate(maxAgeDate.getDate() - maxAgeDays);
            query.createdOn = { $gte: maxAgeDate };
        }

        if (minAge) {
            const minAgeDays = parseInt(minAge);
            const minAgeDate = new Date();
            minAgeDate.setDate(minAgeDate.getDate() - minAgeDays);
            if (query.createdOn) {
                query.createdOn.$lt = minAgeDate;
            } else {
                query.createdOn = { $lt: minAgeDate };
            }
        }

        let sort = {};
        switch (sortBy) {
            case 'givenName':
                sort = { givenName: 1, familyName: 1, createdOn: 1 };
                break;
            case 'familyName':
                sort = { familyName: 1, givenName: 1, createdOn: 1 };
                break;
            case 'role':
                sort = { role: 1, givenName: 1, familyName: 1, createdOn: 1 };
                break;
            case 'newest':
                sort = { createdOn: -1 };
                break;
            case 'oldest':
                sort = { createdOn: 1 };
                break;
            default:
                sort = { givenName: 1, familyName: 1, createdOn: 1 };
        }

        const pageSizeNum = parseInt(pageSize) || 5;
        const pageNumberNum = parseInt(pageNumber) || 1;
        const skip = (pageNumberNum - 1) * pageSizeNum;

        const users = await db.collection('users')
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(pageSizeNum)
            .toArray();

        const usersWithoutPasswords = users.map(user => {
            const { password, ...userProfile } = user;
            return userProfile;
        });

        debugUser(`Found ${usersWithoutPasswords.length} users`);
        res.json(usersWithoutPasswords);
    } catch (err) {
        next(err);
    }
});

router.get('/me', async (req, res, next) => {
    try {
        const { userId } = req.auth;
        debugUser(`Getting current user profile for ID: ${userId}`);

        const db = await connect();
        const user = await db.collection('users').findOne({ _id: newId(userId) });

        if (!user) {
            return res.status(404).json({ error: `User ${userId} not found.` });
        }

        const { password, ...userProfile } = user;
        res.json(userProfile);
    } catch (err) {
        next(err);
    }
});

router.get('/:userId', validateObjectId('userId'), hasPermission('canViewData'), async (req, res, next) => {
    try {
        const { userId } = req.params;
        debugUser(`Getting user with ID: ${userId}`);

        const db = await connect();
        const user = await db.collection('users').findOne({ _id: newId(userId) });

        if (!user) {
            return res.status(404).json({ error: `User ${userId} not found.` });
        }

        const { password, ...userProfile } = user;
        res.json(userProfile);
    } catch (err) {
        next(err);
    }
});

router.patch('/me', validate(updateUserSchema), async (req, res, next) => {
    try {
        const { userId } = req.auth;
        const { password, fullName, givenName, familyName, role } = req.body;
        debugUser(`Updating current user with ID: ${userId}`);

        const db = await connect();
        const user = await db.collection('users').findOne({ _id: newId(userId) });

        if (!user) {
            return res.status(404).json({ error: `User ${userId} not found.` });
        }

        const updateFields = {};
        const changedFields = {};

        if (password) {
            updateFields.password = await bcrypt.hash(password, 10);
            changedFields.password = '[HASHED]';
        }
        if (fullName) {
            updateFields.fullName = fullName;
            changedFields.fullName = fullName;
        }
        if (givenName) {
            updateFields.givenName = givenName;
            changedFields.givenName = givenName;
        }
        if (familyName) {
            updateFields.familyName = familyName;
            changedFields.familyName = familyName;
        }
        if (role !== undefined) {
            // Ensure role is always an array
            const normalizedRole = Array.isArray(role) ? role : (role ? [role] : []);
            updateFields.role = normalizedRole;
            changedFields.role = normalizedRole;
        }

        if (Object.keys(updateFields).length > 0) {
            updateFields.lastUpdatedOn = new Date();
            updateFields.lastUpdatedBy = req.auth;

            await db.collection('users').updateOne(
                { _id: newId(userId) },
                { $set: updateFields }
            );

            await createEditRecord(req, 'user', 'update', { userId }, changedFields);

            debugUser(`User updated successfully with ID: ${userId}`);
            res.status(200).json({
                message: `User ${userId} updated!`,
                userId
            });
        } else {
            res.status(400).json({ error: 'No fields to update' });
        }
    } catch (err) {
        next(err);
    }
});

router.patch('/:userId', validateObjectId('userId'), validate(updateUserSchema), hasPermission('canEditAnyUser'), async (req, res, next) => {
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
        const changedFields = {};

        if (password) {
            updateFields.password = await bcrypt.hash(password, 10);
            changedFields.password = '[HASHED]';
        }
        if (fullName) {
            updateFields.fullName = fullName;
            changedFields.fullName = fullName;
        }
        if (givenName) {
            updateFields.givenName = givenName;
            changedFields.givenName = givenName;
        }
        if (familyName) {
            updateFields.familyName = familyName;
            changedFields.familyName = familyName;
        }
        if (role !== undefined) {
            // Ensure role is always an array
            const normalizedRole = Array.isArray(role) ? role : (role ? [role] : []);
            updateFields.role = normalizedRole;
            changedFields.role = normalizedRole;
        }

        if (Object.keys(updateFields).length > 0) {
            updateFields.lastUpdatedOn = new Date();
            updateFields.lastUpdatedBy = req.auth;

            await db.collection('users').updateOne(
                { _id: newId(userId) },
                { $set: updateFields }
            );

            await createEditRecord(req, 'user', 'update', { userId }, changedFields);

            debugUser(`User updated successfully with ID: ${userId}`);
            res.status(200).json({
                message: `User ${userId} updated!`,
                userId
            });
        } else {
            res.status(400).json({ error: 'No fields to update' });
        }
    } catch (err) {
        next(err);
    }
});

router.delete('/:userId', validateObjectId('userId'), hasPermission('canEditAnyUser'), async (req, res, next) => {
    try {
        const { userId } = req.params;
        debugUser(`Deleting user with ID: ${userId}`);

        const db = await connect();
        const user = await db.collection('users').findOne({ _id: newId(userId) });

        if (!user) {
            return res.status(404).json({ error: `User ${userId} not found.` });
        }

        await db.collection('users').deleteOne({ _id: newId(userId) });

        await createEditRecord(req, 'user', 'delete', { userId });

        debugUser(`User deleted successfully with ID: ${userId}`);
        res.status(200).json({ message: `User ${userId} deleted!`, userId });
    } catch (err) {
        next(err);
    }
});

export { router as userRouter };
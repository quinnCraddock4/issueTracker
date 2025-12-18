import express from 'express';
import debug from 'debug';
import { connect, newId } from '../../database.js';
import { validate, validateObjectId } from '../../validation/middleware.js';
import { createBugSchema, updateBugSchema, classifyBugSchema, assignBugSchema, closeBugSchema, updateBugVersionSchema } from '../../validation/schemas.js';
import { authenticateToken, createEditRecord, hasPermission, canEditBug, canClassifyBug, canReassignBug } from '../../middleware/auth.js';

const router = express.Router();
const debugBug = debug('app:BugRouter');

router.use(express.urlencoded({ extended: false }));

router.use(authenticateToken);

router.get('/', hasPermission('canViewData'), async (req, res, next) => {
    try {
        const { keywords, classification, maxAge, minAge, closed, sortBy, pageSize, pageNumber } = req.query;
        debugBug('Getting bugs with search parameters');

        const db = await connect();
        let query = {};

        if (keywords) {
            query.$text = { $search: keywords };
        }

        if (classification) {
            query.classification = classification;
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

        if (closed !== undefined) {
            // Handle both string and boolean values
            if (typeof closed === 'string') {
                query.closed = closed === 'true';
            } else {
                query.closed = Boolean(closed);
            }
        }

        let sort = {};
        switch (sortBy) {
            case 'newest':
                sort = { createdOn: -1 };
                break;
            case 'oldest':
                sort = { createdOn: 1 };
                break;
            case 'title':
                sort = { title: 1, createdOn: -1 };
                break;
            case 'classification':
                sort = { classification: 1, createdOn: -1 };
                break;
            case 'assignedTo':
                sort = { assignedToUserName: 1, createdOn: -1 };
                break;
            case 'createdBy':
                sort = { createdByUserName: 1, createdOn: -1 };
                break;
            default:
                sort = { createdOn: -1 };
        }

        const pageSizeNum = parseInt(pageSize) || 5;
        const pageNumberNum = parseInt(pageNumber) || 1;
        const skip = (pageNumberNum - 1) * pageSizeNum;

        const bugs = await db.collection('bugs')
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(pageSizeNum)
            .toArray();

        debugBug(`Found ${bugs.length} bugs`);
        res.json(bugs);
    } catch (err) {
        next(err);
    }
});

router.get('/:bugId', validateObjectId('bugId'), hasPermission('canViewData'), async (req, res, next) => {
    try {
        const { bugId } = req.params;
        debugBug(`Getting bug with ID: ${bugId}`);

        const db = await connect();
        const bug = await db.collection('bugs').findOne({ _id: newId(bugId) });

        if (!bug) {
            return res.status(404).json({ error: `Bug ${bugId} not found.` });
        }

        res.json(bug);
    } catch (err) {
        next(err);
    }
});

router.post('/', validate(createBugSchema), hasPermission('canCreateBug'), async (req, res, next) => {
    try {
        const { title, description, stepsToReproduce } = req.body;
        debugBug('Creating new bug');

        const db = await connect();

        // Get user's full name for sorting
        const user = await db.collection('users').findOne({ _id: newId(req.auth.userId) });
        const createdByUserName = user ? (user.fullName || `${user.givenName || ''} ${user.familyName || ''}`.trim()) : '';

        const newBug = {
            title,
            description,
            stepsToReproduce,
            status: 'open',
            classification: 'unclassified',
            closed: false,
            createdOn: new Date(),
            createdBy: req.auth,
            createdByUserName: createdByUserName
        };

        const result = await db.collection('bugs').insertOne(newBug);
        const bugId = result.insertedId.toString();

        await createEditRecord(req, 'bug', 'insert', { bugId }, newBug);

        debugBug(`Bug created successfully with ID: ${bugId}`);
        res.status(200).json({ message: "New bug reported!", bugId });
    } catch (err) {
        next(err);
    }
});

router.patch('/:bugId', validateObjectId('bugId'), validate(updateBugSchema), canEditBug, async (req, res, next) => {
    try {
        const { bugId } = req.params;
        const { title, description, stepsToReproduce } = req.body;
        debugBug(`Updating bug with ID: ${bugId}`);

        const db = await connect();
        const bug = await db.collection('bugs').findOne({ _id: newId(bugId) });

        if (!bug) {
            return res.status(404).json({ error: `Bug ${bugId} not found.` });
        }

        const updateFields = {};
        const changedFields = {};

        if (title) {
            updateFields.title = title;
            changedFields.title = title;
        }
        if (description) {
            updateFields.description = description;
            changedFields.description = description;
        }
        if (stepsToReproduce) {
            updateFields.stepsToReproduce = stepsToReproduce;
            changedFields.stepsToReproduce = stepsToReproduce;
        }

        if (Object.keys(updateFields).length > 0) {
            updateFields.lastUpdatedOn = new Date();
            updateFields.lastUpdatedBy = req.auth;

            await db.collection('bugs').updateOne(
                { _id: newId(bugId) },
                { $set: updateFields }
            );

            await createEditRecord(req, 'bug', 'update', { bugId }, changedFields);

            debugBug(`Bug updated successfully with ID: ${bugId}`);
            res.status(200).json({ message: `Bug ${bugId} updated!`, bugId });
        } else {
            res.status(400).json({ error: 'No fields to update' });
        }
    } catch (err) {
        next(err);
    }
});

router.patch('/:bugId/classify', validateObjectId('bugId'), validate(classifyBugSchema), canClassifyBug, async (req, res, next) => {
    try {
        const { bugId } = req.params;
        const { classification } = req.body;
        debugBug(`Classifying bug with ID: ${bugId}`);

        const db = await connect();
        const bug = await db.collection('bugs').findOne({ _id: newId(bugId) });

        if (!bug) {
            return res.status(404).json({ error: `Bug ${bugId} not found.` });
        }

        const updateFields = {
            classification,
            classifiedOn: new Date(),
            classifiedBy: req.auth,
            lastUpdatedOn: new Date(),
            lastUpdatedBy: req.auth
        };

        const changedFields = {
            classification,
            classifiedOn: updateFields.classifiedOn,
            classifiedBy: req.auth
        };

        await db.collection('bugs').updateOne(
            { _id: newId(bugId) },
            { $set: updateFields }
        );

        await createEditRecord(req, 'bug', 'update', { bugId }, changedFields);

        debugBug(`Bug classified successfully with ID: ${bugId}`);
        res.status(200).json({ message: `Bug ${bugId} classified!`, bugId });
    } catch (err) {
        next(err);
    }
});

router.patch('/:bugId/assign', validateObjectId('bugId'), validate(assignBugSchema), canReassignBug, async (req, res, next) => {
    try {
        const { bugId } = req.params;
        const { assignedToUserId, assignedToUserName } = req.body;
        debugBug(`Assigning bug with ID: ${bugId}`);

        const db = await connect();
        const bug = await db.collection('bugs').findOne({ _id: newId(bugId) });

        if (!bug) {
            return res.status(404).json({ error: `Bug ${bugId} not found.` });
        }

        const updateFields = {
            assignedToUserId,
            assignedToUserName,
            assignedOn: new Date(),
            assignedBy: req.auth,
            lastUpdatedOn: new Date(),
            lastUpdatedBy: req.auth
        };

        const changedFields = {
            assignedToUserId,
            assignedToUserName,
            assignedOn: updateFields.assignedOn,
            assignedBy: req.auth
        };

        await db.collection('bugs').updateOne(
            { _id: newId(bugId) },
            { $set: updateFields }
        );

        await createEditRecord(req, 'bug', 'update', { bugId }, changedFields);

        debugBug(`Bug assigned successfully with ID: ${bugId}`);
        res.status(200).json({ message: `Bug ${bugId} assigned!`, bugId });
    } catch (err) {
        next(err);
    }
});

router.patch('/:bugId/close', validateObjectId('bugId'), validate(closeBugSchema), hasPermission('canCloseAnyBug'), async (req, res, next) => {
    try {
        const { bugId } = req.params;
        const { closed } = req.body;
        debugBug(`Closing bug with ID: ${bugId}`);

        const db = await connect();
        const bug = await db.collection('bugs').findOne({ _id: newId(bugId) });

        if (!bug) {
            return res.status(404).json({ error: `Bug ${bugId} not found.` });
        }

        const updateFields = {
            closed,
            lastUpdatedOn: new Date(),
            lastUpdatedBy: req.auth
        };

        const changedFields = {
            closed
        };

        if (closed) {
            updateFields.closedOn = new Date();
            updateFields.closedBy = req.auth;
            changedFields.closedOn = updateFields.closedOn;
            changedFields.closedBy = req.auth;
        } else {
            updateFields.closedOn = null;
            updateFields.closedBy = null;
            changedFields.closedOn = null;
            changedFields.closedBy = null;
        }

        await db.collection('bugs').updateOne(
            { _id: newId(bugId) },
            { $set: updateFields }
        );

        await createEditRecord(req, 'bug', 'update', { bugId }, changedFields);

        debugBug(`Bug closed successfully with ID: ${bugId}`);
        res.status(200).json({ message: `Bug ${bugId} closed!`, bugId });
    } catch (err) {
        next(err);
    }
});

router.patch('/:bugId/version', validateObjectId('bugId'), validate(updateBugVersionSchema), hasPermission('canTrackTime'), async (req, res, next) => {
    try {
        const { bugId } = req.params;
        const { version, fixDate } = req.body;
        debugBug(`Updating version/fix date for bug with ID: ${bugId}`);

        const db = await connect();
        const bug = await db.collection('bugs').findOne({ _id: newId(bugId) });

        if (!bug) {
            return res.status(404).json({ error: `Bug ${bugId} not found.` });
        }

        const updateFields = {
            lastUpdatedOn: new Date(),
            lastUpdatedBy: req.auth
        };

        const changedFields = {};

        if (version !== undefined) {
            updateFields.version = version || null;
            changedFields.version = version || null;
        }

        if (fixDate !== undefined) {
            updateFields.fixDate = fixDate ? new Date(fixDate) : null;
            changedFields.fixDate = fixDate ? new Date(fixDate) : null;
        }

        await db.collection('bugs').updateOne(
            { _id: newId(bugId) },
            { $set: updateFields }
        );

        await createEditRecord(req, 'bug', 'update', { bugId }, changedFields);

        debugBug(`Bug version/fix date updated successfully with ID: ${bugId}`);
        res.status(200).json({ message: `Bug ${bugId} version/fix date updated!`, bugId });
    } catch (err) {
        next(err);
    }
});

export { router as bugRouter };
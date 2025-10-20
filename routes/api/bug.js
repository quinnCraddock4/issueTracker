import express from 'express';
import debug from 'debug';
import { connect, newId } from '../../database.js';
import { validate, validateObjectId } from '../../validation/middleware.js';
import { createBugSchema, updateBugSchema, classifyBugSchema, assignBugSchema, closeBugSchema } from '../../validation/schemas.js';

const router = express.Router();
const debugBug = debug('app:BugRouter');

router.use(express.urlencoded({ extended: false }));

router.get('/', async (req, res, next) => {
    try {
        debugBug('Getting all bugs');
        const db = await connect();
        const bugs = await db.collection('bugs').find({}).toArray();
        res.json(bugs);
    } catch (err) {
        next(err);
    }
});

router.get('/:bugId', validateObjectId('bugId'), async (req, res, next) => {
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

router.post('/', validate(createBugSchema), async (req, res, next) => {
    try {
        const { title, description, stepsToReproduce } = req.body;
        debugBug('Creating new bug');

        const db = await connect();

        const newBug = {
            title,
            description,
            stepsToReproduce,
            status: 'open',
            classification: 'unclassified',
            createdAt: new Date()
        };

        const result = await db.collection('bugs').insertOne(newBug);
        const bugId = result.insertedId.toString();

        debugBug(`Bug created successfully with ID: ${bugId}`);
        res.status(200).json({ message: "New bug reported!", bugId });
    } catch (err) {
        next(err);
    }
});

router.patch('/:bugId', validateObjectId('bugId'), validate(updateBugSchema), async (req, res, next) => {
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
        if (title) updateFields.title = title;
        if (description) updateFields.description = description;
        if (stepsToReproduce) updateFields.stepsToReproduce = stepsToReproduce;

        updateFields.lastUpdated = new Date();

        await db.collection('bugs').updateOne(
            { _id: newId(bugId) },
            { $set: updateFields }
        );

        debugBug(`Bug updated successfully with ID: ${bugId}`);
        res.status(200).json({ message: `Bug ${bugId} updated!`, bugId });
    } catch (err) {
        next(err);
    }
});

router.patch('/:bugId/classify', validateObjectId('bugId'), validate(classifyBugSchema), async (req, res, next) => {
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
            lastUpdated: new Date()
        };

        await db.collection('bugs').updateOne(
            { _id: newId(bugId) },
            { $set: updateFields }
        );

        debugBug(`Bug classified successfully with ID: ${bugId}`);
        res.status(200).json({ message: `Bug ${bugId} classified!`, bugId });
    } catch (err) {
        next(err);
    }
});

router.patch('/:bugId/assign', validateObjectId('bugId'), validate(assignBugSchema), async (req, res, next) => {
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
            lastUpdated: new Date()
        };

        await db.collection('bugs').updateOne(
            { _id: newId(bugId) },
            { $set: updateFields }
        );

        debugBug(`Bug assigned successfully with ID: ${bugId}`);
        res.status(200).json({ message: `Bug ${bugId} assigned!`, bugId });
    } catch (err) {
        next(err);
    }
});

router.patch('/:bugId/close', validateObjectId('bugId'), validate(closeBugSchema), async (req, res, next) => {
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
            closedOn: new Date(),
            lastUpdated: new Date()
        };

        await db.collection('bugs').updateOne(
            { _id: newId(bugId) },
            { $set: updateFields }
        );

        debugBug(`Bug closed successfully with ID: ${bugId}`);
        res.status(200).json({ message: `Bug ${bugId} closed!`, bugId });
    } catch (err) {
        next(err);
    }
});

export { router as bugRouter };
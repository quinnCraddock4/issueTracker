import express from 'express';
import debug from 'debug';
import { connect, newId } from '../../database.js';
import { validate, validateObjectId } from '../../validation/middleware.js';
import { createTimeEntrySchema } from '../../validation/schemas.js';
import { authenticateToken, createEditRecord, hasPermission } from '../../middleware/auth.js';

const router = express.Router();
const debugTime = debug('app:TimeRouter');

router.use(express.urlencoded({ extended: false }));

router.use(authenticateToken);

router.get('/:bugId/time', validateObjectId('bugId'), hasPermission('canViewData'), async (req, res, next) => {
    try {
        const { bugId } = req.params;
        debugTime(`Getting time entries for bug with ID: ${bugId}`);

        const db = await connect();

        const bug = await db.collection('bugs').findOne({ _id: newId(bugId) });
        if (!bug) {
            return res.status(404).json({ error: `Bug ${bugId} not found.` });
        }

        const timeEntries = await db.collection('timeEntries').find({ bugId: newId(bugId) }).sort({ createdAt: -1 }).toArray();
        res.json(timeEntries);
    } catch (err) {
        next(err);
    }
});

router.post('/:bugId/time', validateObjectId('bugId'), validate(createTimeEntrySchema), hasPermission('canTrackTime'), async (req, res, next) => {
    try {
        const { bugId } = req.params;
        const { hours, description } = req.body;
        debugTime(`Creating time entry for bug ${bugId}`);

        const db = await connect();

        const bug = await db.collection('bugs').findOne({ _id: newId(bugId) });
        if (!bug) {
            return res.status(404).json({ error: `Bug ${bugId} not found.` });
        }

        const newTimeEntry = {
            bugId: newId(bugId),
            hours: parseFloat(hours),
            description: description || '',
            createdAt: new Date(),
            createdBy: req.auth
        };

        const result = await db.collection('timeEntries').insertOne(newTimeEntry);
        const timeEntryId = result.insertedId.toString();

        await createEditRecord(req, 'timeEntry', 'insert', { timeEntryId }, newTimeEntry);

        debugTime(`Time entry created successfully with ID: ${timeEntryId}`);
        res.status(200).json({ message: "Time entry added!", timeEntryId });
    } catch (err) {
        next(err);
    }
});

export { router as timeRouter };


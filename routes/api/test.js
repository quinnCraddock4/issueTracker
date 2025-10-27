import express from 'express';
import debug from 'debug';
import { connect, newId } from '../../database.js';
import { validate, validateObjectId } from '../../validation/middleware.js';
import { createTestSchema, updateTestSchema } from '../../validation/schemas.js';
import { authenticateToken, createEditRecord, hasPermission } from '../../middleware/auth.js';

const router = express.Router();
const debugTest = debug('app:TestRouter');

router.use(express.urlencoded({ extended: false }));

router.use(authenticateToken);

router.get('/:bugId/tests', validateObjectId('bugId'), hasPermission('canViewData'), async (req, res, next) => {
    try {
        const { bugId } = req.params;
        debugTest(`Getting test cases for bug with ID: ${bugId}`);

        const db = await connect();

        const bug = await db.collection('bugs').findOne({ _id: newId(bugId) });
        if (!bug) {
            return res.status(404).json({ error: `Bug ${bugId} not found.` });
        }

        const tests = await db.collection('tests').find({ bugId: newId(bugId) }).toArray();
        res.json(tests);
    } catch (err) {
        next(err);
    }
});

router.get('/:bugId/tests/:testId', validateObjectId('bugId'), validateObjectId('testId'), hasPermission('canViewData'), async (req, res, next) => {
    try {
        const { bugId, testId } = req.params;
        debugTest(`Getting test case ${testId} for bug ${bugId}`);

        const db = await connect();

        const bug = await db.collection('bugs').findOne({ _id: newId(bugId) });
        if (!bug) {
            return res.status(404).json({ error: `Bug ${bugId} not found.` });
        }

        const test = await db.collection('tests').findOne({
            _id: newId(testId),
            bugId: newId(bugId)
        });

        if (!test) {
            return res.status(404).json({ error: `Test case ${testId} not found for bug ${bugId}.` });
        }

        res.json(test);
    } catch (err) {
        next(err);
    }
});

router.post('/:bugId/tests', validateObjectId('bugId'), validate(createTestSchema), hasPermission('canAddTestCase'), async (req, res, next) => {
    try {
        const { bugId } = req.params;
        const { title, description, expectedResult } = req.body;
        debugTest(`Creating test case for bug ${bugId}`);

        const db = await connect();

        const bug = await db.collection('bugs').findOne({ _id: newId(bugId) });
        if (!bug) {
            return res.status(404).json({ error: `Bug ${bugId} not found.` });
        }

        const newTest = {
            bugId: newId(bugId),
            title,
            description,
            expectedResult,
            status: 'pending',
            createdOn: new Date(),
            createdBy: req.auth
        };

        const result = await db.collection('tests').insertOne(newTest);
        const testId = result.insertedId.toString();

        await createEditRecord(req, 'test', 'insert', { testId }, newTest);

        debugTest(`Test case created successfully with ID: ${testId}`);
        res.status(200).json({ message: "Test case added!", testId });
    } catch (err) {
        next(err);
    }
});

router.patch('/:bugId/tests/:testId', validateObjectId('bugId'), validateObjectId('testId'), validate(updateTestSchema), hasPermission('canEditTestCase'), async (req, res, next) => {
    try {
        const { bugId, testId } = req.params;
        const { status } = req.body;
        debugTest(`Updating test case ${testId} for bug ${bugId}`);

        const db = await connect();

        const bug = await db.collection('bugs').findOne({ _id: newId(bugId) });
        if (!bug) {
            return res.status(404).json({ error: `Bug ${bugId} not found.` });
        }

        const test = await db.collection('tests').findOne({
            _id: newId(testId),
            bugId: newId(bugId)
        });

        if (!test) {
            return res.status(404).json({ error: `Test case ${testId} not found for bug ${bugId}.` });
        }

        const updateFields = {
            status,
            lastUpdatedOn: new Date(),
            lastUpdatedBy: req.auth
        };

        const changedFields = {
            status
        };

        await db.collection('tests').updateOne(
            { _id: newId(testId) },
            { $set: updateFields }
        );

        await createEditRecord(req, 'test', 'update', { testId }, changedFields);

        debugTest(`Test case updated successfully with ID: ${testId}`);
        res.status(200).json({ message: `Test case ${testId} updated!`, testId });
    } catch (err) {
        next(err);
    }
});

router.delete('/:bugId/tests/:testId', validateObjectId('bugId'), validateObjectId('testId'), hasPermission('canDeleteTestCase'), async (req, res, next) => {
    try {
        const { bugId, testId } = req.params;
        debugTest(`Deleting test case ${testId} for bug ${bugId}`);

        const db = await connect();

        const bug = await db.collection('bugs').findOne({ _id: newId(bugId) });
        if (!bug) {
            return res.status(404).json({ error: `Bug ${bugId} not found.` });
        }

        const test = await db.collection('tests').findOne({
            _id: newId(testId),
            bugId: newId(bugId)
        });

        if (!test) {
            return res.status(404).json({ error: `Test case ${testId} not found for bug ${bugId}.` });
        }

        await db.collection('tests').deleteOne({ _id: newId(testId) });

        await createEditRecord(req, 'test', 'delete', { testId });

        debugTest(`Test case deleted successfully with ID: ${testId}`);
        res.status(200).json({ message: `Test case ${testId} deleted!`, testId });
    } catch (err) {
        next(err);
    }
});

export { router as testRouter };

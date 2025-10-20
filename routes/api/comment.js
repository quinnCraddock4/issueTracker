import express from 'express';
import debug from 'debug';
import { connect, newId } from '../../database.js';
import { validate, validateObjectId } from '../../validation/middleware.js';
import { createCommentSchema } from '../../validation/schemas.js';

const router = express.Router();
const debugComment = debug('app:CommentRouter');

router.use(express.urlencoded({ extended: false }));

router.get('/:bugId/comments', validateObjectId('bugId'), async (req, res, next) => {
    try {
        const { bugId } = req.params;
        debugComment(`Getting comments for bug with ID: ${bugId}`);

        const db = await connect();

        const bug = await db.collection('bugs').findOne({ _id: newId(bugId) });
        if (!bug) {
            return res.status(404).json({ error: `Bug ${bugId} not found.` });
        }

        const comments = await db.collection('comments').find({ bugId: newId(bugId) }).toArray();
        res.json(comments);
    } catch (err) {
        next(err);
    }
});

router.get('/:bugId/comments/:commentId', validateObjectId('bugId'), validateObjectId('commentId'), async (req, res, next) => {
    try {
        const { bugId, commentId } = req.params;
        debugComment(`Getting comment ${commentId} for bug ${bugId}`);

        const db = await connect();

        const bug = await db.collection('bugs').findOne({ _id: newId(bugId) });
        if (!bug) {
            return res.status(404).json({ error: `Bug ${bugId} not found.` });
        }

        const comment = await db.collection('comments').findOne({
            _id: newId(commentId),
            bugId: newId(bugId)
        });

        if (!comment) {
            return res.status(404).json({ error: `Comment ${commentId} not found for bug ${bugId}.` });
        }

        res.json(comment);
    } catch (err) {
        next(err);
    }
});

router.post('/:bugId/comments', validateObjectId('bugId'), validate(createCommentSchema), async (req, res, next) => {
    try {
        const { bugId } = req.params;
        const { author, content } = req.body;
        debugComment(`Creating comment for bug ${bugId}`);

        const db = await connect();

        const bug = await db.collection('bugs').findOne({ _id: newId(bugId) });
        if (!bug) {
            return res.status(404).json({ error: `Bug ${bugId} not found.` });
        }

        const newComment = {
            bugId: newId(bugId),
            author,
            content,
            createdAt: new Date()
        };

        const result = await db.collection('comments').insertOne(newComment);
        const commentId = result.insertedId.toString();

        debugComment(`Comment created successfully with ID: ${commentId}`);
        res.status(200).json({ message: "Comment added!", commentId });
    } catch (err) {
        next(err);
    }
});

export { router as commentRouter };

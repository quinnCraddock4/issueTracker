import express from 'express'
const router = express.Router();

import debug from 'debug';
import { nanoid } from 'nanoid';
const debugBug = debug('app:BugRouter');

router.use(express.urlencoded({ extended: false }));

const bugsArray = [{assignedToUserId: 1,assignedToUsername:'bobby',title:'bug one',description:'this is the first bug',status:'open',classification:'bug',createdByUserId:1,createdAt:'2024-01-01T00:00:00Z',updatedAt:'2024-01-01T00:00:00Z'}];

router.get('/list', (req, res) => {
    res.json(bugsArray);
});

router.get('/:bugId', (req, res) => {
    const id = parseInt(req.params.bugId, 10); // convert to number
    const bug = bugsArray.find(b => b.bugId === id); // find by bugId
    if (!bug) {
        return res.status(404).json({ error: 'Bug not found' });
    }
    res.json(bug);
});
router.put('/:bugId', (req, res) => {
    const {title, description, stepsToReproduce} = req.body;
    const id = parseInt(req.params.bugId, 10); // convert to number
    const bug = bugsArray.find(b => b.bugId === id); // find by bugId
    if (!bug) {
        return res.status(404).json({ error: 'Bug not found' });
    }
    Object.assign(bug, {title, description, stepsToReproduce, updatedAt: new Date().toISOString()});
    res.json({ message: 'Bug updated successfully', bug }).status(200);
});

router.post('/new', (req, res) => {
       const {title, description, stepsToReproduce} = req.body;
       if(!title || !description || !stepsToReproduce){
        return res.status(400).json({ error: 'All fields are required' });
       }
         const newBug = {
          bugId: nanoid(), // simple incrementing ID
          title,
          description,
          stepsToReproduce,
          status: 'open',
          classification: 'bug',
          createdByUserId: 1, // placeholder
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
         };
            bugsArray.push(newBug);
            res.status(200).json('New bug created!');
});
router.put('/:bugId/classify', (req, res) => {
    const { classification } = req.body;
    const id = parseInt(req.params.bugId, 10); // convert to number
    const bug = bugsArray.find(b => b.bugId === id); // find by bugId
    if (!bug) {
        return res.status(404).json({ error: 'Bug not found' });
    }
    if (!classification) {
        return res.status(400).json({ error: 'Classification is required' });
    }
    Object.assign(bug, { classification, updatedAt: new Date().toISOString(), classifiedOn: new Date().toISOString() });
    res.json({ message: 'Bug classified successfully', bug }).status(200);
});
router.put('/:bugId/assign', (req, res) => {
    const { assignedToUserId, assignedToUsername } = req.body;
    const id = parseInt(req.params.bugId, 10); // convert to number
    const bug = bugsArray.find(b => b.bugId === id); // find by bugId
    if (!bug) {
        return res.status(404).json({ error: 'Bug not found' });
    }
    if (!assignedToUserId || !assignedToUsername) {
        return res.status(400).json({ error: 'Assigned user ID and username are required' });
    }
    Object.assign(bug, { assignedToUserId, assignedToUsername, updatedAt: new Date().toISOString(), assignedOn: new Date().toISOString() });
    res.json({ message: 'Bug assigned successfully', bug }).status(200);
});
router.put('/:bugId/close', (req, res) => {
    const {status} = req.body;
    const id = parseInt(req.params.bugId, 10); // convert to number
    const bug = bugsArray.find(b => b.bugId === id); // find by bugId
    if (!bug) {
        return res.status(404).json({ error: 'Bug not found' });
    }
    if (!status || (status !== 'closed' && status !== 'resolved')) {
        return res.status(400).json({ error: 'Valid status is required (closed or resolved)' });
    }
    Object.assign(bug, { status, updatedAt: new Date().toISOString(), closedOn: new Date().toISOString() });
    res.json({ message: 'Bug status updated successfully', bug }).status(200);
});

export { router as bugRouter };
import express from 'express'
import { nanoid } from 'nanoid'

const router = express.Router();

import debug from 'debug';
const debugUser = debug('app:UserRouter');

router.use(express.urlencoded({ extended: false }));

//fix coding thing lab 2
const usersArray = [{userId: 1, email:'bob@email.com',password:'secret',givenName:'bob',familyName:'rock'}, {userId: 2, email:'bob2@email.com',password:'secret2',givenName:'bob2',familyName:'rock2'}];

router.get('/list', (req, res) => {
    res.json(usersArray);
});

router.get('/:userId', (req, res) => {
    const id = parseInt(req.params.userId, 10); // convert to number
    const user = usersArray.find(u => u.userId === id); // find by userId
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);

});
router.post('/register', (req, res) => {
    const { email, password, givenName, familyName, role } = req.body;
    if (!email || !password || !givenName || !familyName || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const newUser = {
        userId: nanoid(),
        email,
        password,
        givenName,
        familyName,
        role
    };
    usersArray.push(newUser);
    res.status(200).json('New user registered!');
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if(!email || !password){
        return res.status(400).json('please enter your login credintials')
    }
    const user = usersArray.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(404).json({ error: 'Invalid email or password' });
    }
    res.status(200).json('welcome back');
});
 router.put('/:userId', (req, res) => {
  const id = parseInt(req.params.userId, 10); // convert to number
  //const { email, password, givenName, familyName, role } = req.body;

  const user = usersArray.find(u => u.userId === id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  Object.assign(user,req.body)
  console.log(user)

  res.json({ message: 'User updated successfully', user });
});

router.delete('/:userId', (req, res) => {
    const id = parseInt(req.params.userId, 10); // convert to number
    const userIndex = usersArray.findIndex(u => u.userId === id);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    usersArray.splice(userIndex, 1);
    res.json({ message: 'User deleted successfully' });
});

export { router as userRouter };
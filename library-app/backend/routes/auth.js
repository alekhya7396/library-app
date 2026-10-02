import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();
const emailOk = (e) => /^\S+@\S+\.\S+$/.test(e);

const sign = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    if (!emailOk(email)) return res.status(400).json({ message: 'Enter a valid email address' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ message: 'An account with this email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Incorrect email or password' });

    res.json({ token: sign(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

export default router;

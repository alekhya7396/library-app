import { Router } from 'express';
import mongoose from 'mongoose';
import Book from '../models/Book.js';
import requireAuth from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function validateId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ message: 'Invalid book id' });
  next();
}

function validateBody(body, { partial = false } = {}) {
  const errors = [];
  for (const f of ['title', 'author', 'category']) {
    if (body[f] === undefined) {
      if (!partial) errors.push(`${f} is required`);
    } else if (typeof body[f] !== 'string' || !body[f].trim()) {
      errors.push(`${f} cannot be empty`);
    }
  }
  if (body.status !== undefined && !['Available', 'Issued'].includes(body.status))
    errors.push('status must be Available or Issued');
  return errors;
}

// GET /api/books?search=term
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    const q = String(req.query.search || '').trim();
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ title: rx }, { author: rx }];
    }
    res.json(await Book.find(filter).sort({ createdAt: -1 }));
  } catch (err) {
    next(err);
  }
});

// POST /api/books
router.post('/', async (req, res, next) => {
  try {
    const errors = validateBody(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join(', ') });

    const { title, author, category, status } = req.body;
    const book = await Book.create({ title, author, category, status, addedBy: req.userId });
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
});

// PUT /api/books/:id  (edit details and/or status)
router.put('/:id', validateId, async (req, res, next) => {
  try {
    const errors = validateBody(req.body, { partial: true });
    if (errors.length) return res.status(400).json({ message: errors.join(', ') });

    const update = {};
    for (const f of ['title', 'author', 'category', 'status'])
      if (req.body[f] !== undefined) update[f] = req.body[f];

    const book = await Book.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/books/:id
router.delete('/:id', validateId, async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;

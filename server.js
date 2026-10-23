const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root123',
  database: process.env.DB_NAME || 'notesdb',
});

const isBlank = (v) => typeof v !== 'string' || v.trim() === '';

async function findNote(id) {
  const [rows] = await pool.query('SELECT * FROM notes WHERE id = ?', [id]);
  return rows[0];
}

// Validate :id for every route that has it
app.param('id', (req, res, next, id) => {
  if (!/^\d+$/.test(id)) return res.status(400).json({ error: 'id must be a number' });
  next();
});

// GET all notes
app.get('/api/notes', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM notes ORDER BY id');
  res.status(200).json(rows);
});

// GET one note
app.get('/api/notes/:id', async (req, res) => {
  const note = await findNote(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.status(200).json(note);
});

// POST create a note
app.post('/api/notes', async (req, res) => {
  const { title, content } = req.body || {};
  if (isBlank(title) || isBlank(content)) {
    return res.status(400).json({ error: 'title and content are required' });
  }
  const [result] = await pool.query(
    'INSERT INTO notes (title, content) VALUES (?, ?)',
    [title, content]
  );
  res.status(201).json(await findNote(result.insertId));
});

// PUT replace a note (both fields required)
app.put('/api/notes/:id', async (req, res) => {
  const { title, content } = req.body || {};
  if (isBlank(title) || isBlank(content)) {
    return res.status(400).json({ error: 'PUT needs both title and content' });
  }
  const [result] = await pool.query(
    'UPDATE notes SET title = ?, content = ? WHERE id = ?',
    [title, content, req.params.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Note not found' });
  res.status(200).json(await findNote(req.params.id));
});

// PATCH partial update (at least one field)
app.patch('/api/notes/:id', async (req, res) => {
  const { title, content } = req.body || {};
  const fields = [];
  const values = [];
  if (title !== undefined) {
    if (isBlank(title)) return res.status(400).json({ error: 'title cannot be empty' });
    fields.push('title = ?');
    values.push(title);
  }
  if (content !== undefined) {
    if (isBlank(content)) return res.status(400).json({ error: 'content cannot be empty' });
    fields.push('content = ?');
    values.push(content);
  }
  if (fields.length === 0) {
    return res.status(400).json({ error: 'send title and/or content' });
  }
  const [result] = await pool.query(
    `UPDATE notes SET ${fields.join(', ')} WHERE id = ?`,
    [...values, req.params.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Note not found' });
  res.status(200).json(await findNote(req.params.id));
});

// DELETE a note
app.delete('/api/notes/:id', async (req, res) => {
  const [result] = await pool.query('DELETE FROM notes WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Note not found' });
  res.status(204).send();
});

// Unknown route / server error handling
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Notes API running on http://localhost:${PORT}`));

const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// Multer setup for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Get all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, avatar, role_id FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, avatar, role_id FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new user
router.post('/', upload.single('avatar'), async (req, res) => {
  const { name, email, password, role_id } = req.body;
  if (!name || !email || !password || !role_id) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Name, email, password and role_id are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = req.file ? req.file.filename : null;
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, avatar, role_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, avatar, role_id]
    );
    res.status(201).json({ id: result.insertId, name, email, avatar, role_id });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/:id', upload.single('avatar'), async (req, res) => {
  const { name, email, password, role_id } = req.body;
  try {
    const [rows] = await db.query('SELECT avatar FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'User not found' });
    }
    const oldAvatar = rows[0].avatar;

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const avatar = req.file ? req.file.filename : oldAvatar;

    const updateFields = [];
    const updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (hashedPassword) {
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }
    if (avatar !== oldAvatar) {
      updateFields.push('avatar = ?');
      updateValues.push(avatar);
    }
    if (role_id) {
      updateFields.push('role_id = ?');
      updateValues.push(role_id);
    }

    if (updateFields.length === 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(req.params.id);

    await db.query(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

    if (avatar !== oldAvatar && oldAvatar) {
      const oldAvatarPath = path.join('uploads', oldAvatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    res.json({ message: 'User updated' });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT avatar FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const avatar = rows[0].avatar;

    const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });

    if (avatar) {
      const avatarPath = path.join('uploads', avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { emp_id, password } = req.body;

    // 1. Validate input
    if (!emp_id || !password) {
        return res.status(400).json({ error: 'Employee ID and password are required.' });
    }

    try {
        // 2. Check if admin exists
        const result = await pool.query(
            `SELECT a.emp_id, a.password, e.emp_name
             FROM admins a
             JOIN employees e ON e.emp_id = a.emp_id
             WHERE a.emp_id = $1`,
            [emp_id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const admin = result.rows[0];

        // 3. Compare password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // 4. Sign JWT
        const token = jwt.sign(
            { emp_id: admin.emp_id, emp_name: admin.emp_name },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // 5. Respond
        res.json({
            message: 'Login successful.',
            token,
            admin: {
                emp_id: admin.emp_id,
                emp_name: admin.emp_name,
            }
        });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/auth/verify  ← useful for frontend to check if token is still valid
router.get('/verify', require('../middleware/auth'), (req, res) => {
    res.json({ valid: true, admin: req.admin });
});

module.exports = router;
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

module.exports = (db) => {
    // 用户注册
    router.post('/register', (req, res) => {
        const { username, password } = req.body;
        
 //检查输入字段
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const query = 'INSERT INTO users (username, password) VALUES (?, ?)';

        db.run(query, [username, hashedPassword], function (err) {
            if (err) {
                res.status(500).json({ error: 'Username already exists or error occurred.' });
            } else {
                res.status(201).json({ message: 'User registered successfully!', user_id: this.lastID });
            }
        });
    });

    // 用户登录
    router.post('/login', (req, res) => {
        const { username, password } = req.body;

        const query = 'SELECT * FROM users WHERE username = ?';
        db.get(query, [username], (err, user) => {
            if (err || !user) {
                return res.status(401).json({ error: 'Invalid username or password.' });
            }

            const isValid = bcrypt.compareSync(password, user.password);
            if (isValid) {
                res.json({ message: 'Login successful!', user_id: user.id });
            } else {
                res.status(401).json({ error: 'Invalid username or password.' });
            }
        });
    });

    return router;
};

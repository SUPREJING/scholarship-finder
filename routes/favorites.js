const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // 添加收藏
    router.post('/', (req, res) => {
        const { user_id, scholarship_id } = req.body;

        if (!user_id || !scholarship_id) {
            return res.status(400).json({ error: 'Please provide user_id and scholarship_id.' });
        }

        const query = 'INSERT INTO favorites (user_id, scholarship_id) VALUES (?, ?)';
        db.run(query, [user_id, scholarship_id], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(201).json({ message: 'Added to favorites successfully!', id: this.lastID });
            }
        });
    });

    // 获取用户收藏
    router.get('/:user_id', (req, res) => {
        const { user_id } = req.params;

        const query = `
            SELECT scholarships.* FROM scholarships
            JOIN favorites ON scholarships.id = favorites.scholarship_id
            WHERE favorites.user_id = ?
        `;

        db.all(query, [user_id], (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(rows);
            }
        });
    });

    return router;
};

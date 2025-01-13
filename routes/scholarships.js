const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // 获取所有奖学金
    router.get('/', (req, res) => {
        db.all('SELECT * FROM scholarships', [], (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(rows);
            }
        });
    });

    // 根据筛选条件搜索奖学金
    router.get('/search', (req, res) => {
        const { keyword, country, funding, degree } = req.query;
        let query = 'SELECT * FROM scholarships WHERE 1=1';
        const params = [];

        if (keyword) {
            query += ' AND (title LIKE ? OR country LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`);
        }
        if (country) {
            query += ' AND country = ?';
            params.push(country);
        }
        if (funding) {
            query += ' AND funding = ?';
            params.push(funding);
        }
        if (degree) {
            query += ' AND degree = ?';
            params.push(degree);
        }

        db.all(query, params, (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(rows);
            }
        });
    });

    return router;
};

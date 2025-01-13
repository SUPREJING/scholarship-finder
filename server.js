const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 连接 SQLite 数据库
const db = new sqlite3.Database('./database/scholarships.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// 路由模块
const scholarshipsRoutes = require('./routes/scholarships')(db);
const favoritesRoutes = require('./routes/favorites')(db);
const usersRoutes = require('./routes/users')(db);

// 注册路由
app.use('/api/scholarships', scholarshipsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/users', usersRoutes);

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

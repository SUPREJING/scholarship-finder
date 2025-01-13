// 在文件开头添加音效管理器
const AudioManager = {
    sounds: {
        click: new Audio('audio/click.mp3'),
        success: new Audio('audio/success.mp3'),
        error: new Audio('audio/error.mp3'),
        background: new Audio('audio/background.mp3')
    },

    loadSounds() {
        const audioFiles = {
            click: 'audio/click.mp3',
            success: 'audio/success.mp3',
            error: 'audio/error.mp3',
            background: 'audio/background.mp3'
        };

        for (const [name, path] of Object.entries(audioFiles)) {
            const audio = new Audio();
            audio.addEventListener('error', () => {
                console.error(`无法加载音频文件: ${path}`);
            });
            audio.src = path;
            this.sounds[name] = audio;
        }
    },

    init() {
        this.loadSounds();
        // 从本地存储加载音效设置
        const savedSettings = JSON.parse(localStorage.getItem('audioSettings')) || {
            soundEnabled: true,
            musicEnabled: false
        };
        
        this.sounds.background.loop = true;
        this.sounds.background.volume = 0.1;
        
        // 初始化音效状态
        this.soundEnabled = savedSettings.soundEnabled;
        this.musicEnabled = savedSettings.musicEnabled;
        
        // 添加音效控制按钮
        this.addSoundControls();
        
        // 根据保存的设置更新UI和音乐状态
        this.updateSoundUI();
        if (this.musicEnabled) {
            this.sounds.background.play();
        }
    },

    play(soundName) {
        if (!this.soundEnabled && soundName !== 'background') return;
        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(err => console.log('音频播放失败:', err));
        }
    },

    updateSoundUI() {
        const soundIcon = document.querySelector('.sound-icon');
        const musicIcon = document.querySelector('.music-icon');
        if (soundIcon) {
            soundIcon.src = this.soundEnabled ? 'images/sound-on.png' : 'images/sound-off.png';
        }
        if (musicIcon) {
            musicIcon.src = this.musicEnabled ? 'images/music-on.png' : 'images/music-off.png';
        }
    },

    saveSettings() {
        localStorage.setItem('audioSettings', JSON.stringify({
            soundEnabled: this.soundEnabled,
            musicEnabled: this.musicEnabled
        }));
    },

    addSoundControls() {
        // 在导航栏添加音效控制按钮
        const navLinks = document.querySelector('.nav-links');
        const soundControl = document.createElement('div');
        soundControl.className = 'sound-control';
        soundControl.innerHTML = `
            <button class="sound-btn" id="toggleSound">
                <img src="images/sound-on.png" alt="声音开关" class="sound-icon">
            </button>
            <button class="sound-btn" id="toggleMusic">
                <img src="images/music-on.png" alt="音乐开关" class="music-icon">
            </button>
        `;
        navLinks.appendChild(soundControl);

        // 音效开关事件
        document.getElementById('toggleSound').addEventListener('click', () => {
            this.soundEnabled = !this.soundEnabled;
            this.updateSoundUI();
            this.saveSettings();
            this.play('click');
        });

        document.getElementById('toggleMusic').addEventListener('click', () => {
            this.musicEnabled = !this.musicEnabled;
            this.updateSoundUI();
            this.saveSettings();
            
            if (this.musicEnabled) {
                this.sounds.background.play();
            } else {
                this.sounds.background.pause();
            }
            this.play('click');
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // 初始化音效管理器
    AudioManager.init();

    // 移动端菜单切换
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        AudioManager.play('click');
    });

    // 点击导航链接时关闭菜单
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
            }
        });
    });

    // 为所有按钮添加点击音效
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            AudioManager.play('click');
        }
    });

    // 导航链接平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // 替换原有的模拟数据部分
    function fetchScholarships() {
        fetch('/api/scholarships')
            .then(response => response.json())
            .then(data => {
                renderScholarships(data);
            })
            .catch(err => {
                console.error('获取奖学金数据失败:', err);
                AudioManager.play('error');
            });
    }

    // 修改搜索功能
    const searchInput = document.querySelector('.search-container input');
    const searchBtn = document.querySelector('.search-btn');

    searchBtn.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const country = document.querySelector('select[aria-label="选择国家"]').value;
        const degree = document.querySelector('select[aria-label="学位类型"]').value;
        const funding = document.querySelector('select[aria-label="资助类型"]').value;

        const queryParams = new URLSearchParams({
            keyword: searchTerm,
            country: country,
            degree: degree,
            funding: funding
        });

        fetch(`/api/scholarships/search?${queryParams}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    AudioManager.play('success');
                } else {
                    AudioManager.play('error');
                }
                renderScholarships(data);
            })
            .catch(err => {
                console.error('搜索失败:', err);
                AudioManager.play('error');
            });
    });

    // 渲染奖学金卡片
    function renderScholarships(scholarships) {
        const container = document.querySelector('.scholarships-container');
        container.innerHTML = '';

        scholarships.forEach(scholarship => {
            const card = document.createElement('div');
            card.className = 'scholarship-card';
            card.innerHTML = `
                <h3>${scholarship.title}</h3>
                <div class="scholarship-info">
                    <span class="tag country">${scholarship.country}</span>
                    <span class="tag type ${scholarship.type === '全额' ? 'full' : 'partial'}">${scholarship.type}</span>
                    <span class="tag degree">${scholarship.degree}</span>
                </div>
                <p class="description">${scholarship.description}</p>
                <div class="card-actions">
                    <button class="favorite-btn" data-id="${scholarship.id}">
                        <img src="images/heart.png" alt="收藏" class="heart-icon">
                        收藏
                    </button>
                    <button class="details-btn" data-id="${scholarship.id}">查看详情</button>
                </div>
            `;
            container.appendChild(card);

            // 为收藏按钮添加点击事件
            const favoriteBtn = card.querySelector('.favorite-btn');
            favoriteBtn.addEventListener('click', () => toggleFavorite(scholarship.id));
        });
    }

    // 修改收藏功能
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    function toggleFavorite(scholarshipId) {
        // 检查用户是否登录
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('请先登录');
            AudioManager.play('error');
            return;
        }

        const btn = document.querySelector(`.favorite-btn[data-id="${scholarshipId}"]`);
        
        if (!favorites.includes(scholarshipId)) {
            fetch('/api/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    scholarship_id: scholarshipId
                })
            })
            .then(response => response.json())
            .then(data => {
                favorites.push(scholarshipId);
                btn.classList.add('active');
                AudioManager.play('success');
                localStorage.setItem('favorites', JSON.stringify(favorites));
                updateFavoriteUI();
            })
            .catch(err => {
                console.error('添加收藏失败:', err);
                AudioManager.play('error');
            });
        } else {
            fetch(`/api/favorites/${userId}/${scholarshipId}`, {
                method: 'DELETE'
            })
            .then(response => {
                const index = favorites.indexOf(scholarshipId);
                favorites.splice(index, 1);
                btn.classList.remove('active');
                AudioManager.play('click');
                localStorage.setItem('favorites', JSON.stringify(favorites));
                updateFavoriteUI();
            })
            .catch(err => {
                console.error('移除收藏失败:', err);
                AudioManager.play('error');
            });
        }
    }

    function updateFavoriteUI() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const id = parseInt(btn.dataset.id);
            if (favorites.includes(id)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // 收藏功能
    const favoritesBtn = document.querySelector('.favorites-btn');
    const favoritesSection = document.getElementById('favorites-section');
    const favoritesList = document.getElementById('favorites-list');
    const emptyFavorites = document.getElementById('empty-favorites');

    // 存储收藏的奖学金
    let storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // 点击收藏按钮滚动到收藏区域
    if (favoritesBtn && favoritesSection) {
        favoritesBtn.addEventListener('click', () => {
            favoritesSection.scrollIntoView({ behavior: 'smooth' });
            AudioManager.play('click');
        });
    }

    // 更新收藏列表显示
    function updateFavoritesList() {
        if (storedFavorites.length === 0) {
            emptyFavorites.style.display = 'block';
            favoritesList.style.display = 'none';
            return;
        }

        emptyFavorites.style.display = 'none';
        favoritesList.style.display = 'grid';
        favoritesList.innerHTML = '';

        storedFavorites.forEach(scholarshipId => {
            const scholarship = scholarships.find(s => s.id === scholarshipId);
            if (scholarship) {
                const card = document.createElement('div');
                card.className = 'favorite-card';
                card.innerHTML = `
                    <h3>${scholarship.title}</h3>
                    <p>${scholarship.description}</p>
                    <div class="card-buttons">
                        <button class="view-details-btn" onclick="viewDetails('${scholarship.id}')">查看详情</button>
                        <button class="remove-favorite-btn" onclick="removeFavorite('${scholarship.id}')">移除收藏</button>
                    </div>
                `;
                favoritesList.appendChild(card);
            }
        });
    }

    // 添加收藏
    function addToFavorites(scholarship) {
        if (!storedFavorites.find(f => f === scholarship.id)) {
            storedFavorites.push(scholarship.id);
            localStorage.setItem('favorites', JSON.stringify(storedFavorites));
            updateFavoritesList();
            AudioManager.play('success');
        }
    }

    // 移除收藏
    function removeFavorite(scholarshipId) {
        storedFavorites = storedFavorites.filter(f => f !== scholarshipId);
        localStorage.setItem('favorites', JSON.stringify(storedFavorites));
        updateFavoritesList();
        AudioManager.play('click');
    }

    // 查看详情
    function viewDetails(scholarshipId) {
        const scholarship = scholarships.find(f => f.id === scholarshipId);
        if (scholarship) {
            // 这里可以添加查看详情的逻辑
            console.log('查看详情:', scholarship);
            AudioManager.play('click');
        }
    }

    // 初始化收藏列表
    updateFavoritesList();

    // 登录/注册模态框功能
    const loginBtn = document.querySelector('.login-btn');
    const modal = document.getElementById('loginModal');
    const closeButtons = document.querySelectorAll('.close');
    const authTabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    const forgotPasswordBtn = document.querySelector('.forgot-password-btn');
    const resetPasswordModal = document.getElementById('resetPasswordModal');

    if (loginBtn && modal) {
        loginBtn.addEventListener('click', () => {
            modal.classList.add('active');
            AudioManager.play('click');
        });
    }

    if (closeButtons) {
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (modal) modal.classList.remove('active');
                if (resetPasswordModal) resetPasswordModal.classList.remove('active');
                AudioManager.play('click');
            });
        });
    }

    if (forgotPasswordBtn && resetPasswordModal) {
        forgotPasswordBtn.addEventListener('click', () => {
            resetPasswordModal.classList.add('active');
            AudioManager.play('click');
        });
    }

    window.addEventListener('click', (e) => {
        if (modal && resetPasswordModal && (e.target === modal || e.target === resetPasswordModal)) {
            modal.classList.remove('active');
            resetPasswordModal.classList.remove('active');
            AudioManager.play('click');
        }
    });

    if (authTabs && loginForm && registerForm) {
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                authTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                if (tab.dataset.tab === 'login') {
                    loginForm.classList.remove('hidden');
                    registerForm.classList.add('hidden');
                } else {
                    registerForm.classList.remove('hidden');
                    loginForm.classList.add('hidden');
                }
            });
        });
    }

    // 修改登录/注册表单，添加音效
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = loginForm.querySelector('input[type="text"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.user_id) {
                    localStorage.setItem('userId', data.user_id);
                    AudioManager.play('success');
                    modal.classList.remove('active');
                    // 更新UI显示登录状态
                    updateLoginStatus();
                } else {
                    AudioManager.play('error');
                    alert('登录失败: ' + data.error);
                }
            })
            .catch(err => {
                console.error('登录失败:', err);
                AudioManager.play('error');
            });
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = registerForm.querySelector('input[type="text"]').value;
            const email = registerForm.querySelector('input[type="email"]').value;
            const password = registerForm.querySelector('input[type="password"]').value;

            fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.user_id) {
                    AudioManager.play('success');
                    alert('注册成功！请登录');
                    // 切换到登录表单
                    document.querySelector('[data-tab="login"]').click();
                } else {
                    AudioManager.play('error');
                    alert('注册失败: ' + data.error);
                }
            })
            .catch(err => {
                console.error('注册失败:', err);
                AudioManager.play('error');
            });
        });
    }

    // 添加登录状态检查和更新函数
    function updateLoginStatus() {
        const userId = localStorage.getItem('userId');
        const loginBtn = document.querySelector('.login-btn');
        
        if (userId) {
            fetch(`/api/users/${userId}`)
                .then(response => response.json())
                .then(user => {
                    loginBtn.textContent = `${user.username}`;
                    // 可以添加登出选项
                    loginBtn.onclick = logout;
                });
        } else {
            loginBtn.textContent = '登录/注册';
            loginBtn.onclick = () => modal.classList.add('active');
        }
    }

    function logout() {
        localStorage.removeItem('userId');
        localStorage.removeItem('favorites');
        favorites = [];
        updateLoginStatus();
        updateFavoriteUI();
        AudioManager.play('click');
    }

    // 页面加载时初始化
    document.addEventListener('DOMContentLoaded', () => {
        // 初始化音效管理器
        AudioManager.init();
        
        // 检查登录状态
        updateLoginStatus();
        
        // 获取奖学金数据
        fetchScholarships();
        
        // 如果用户已登录，获取收藏列表
        const userId = localStorage.getItem('userId');
        if (userId) {
            fetch(`/api/favorites/${userId}`)
                .then(response => response.json())
                .then(data => {
                    favorites = data.map(item => item.id);
                    localStorage.setItem('favorites', JSON.stringify(favorites));
                    updateFavoriteUI();
                });
        }
    });

    // 导航栏滚动效果
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
});

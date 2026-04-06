// ==================== КОНФИГУРАЦИЯ ====================
const CONFIG = {
    player: {
        width: 40, height: 40, speed: 6, jumpPower: 16, gravity: 0.8,
        friction: 0.85, dashSpeed: 20, dashDuration: 12, dashCooldown: 45, maxDashes: 2
    },
    melee: { radius: 95, cooldownMax: 18, damage: 1 },
    elo: { coinsMultiplier: 2, damageDivider: 5 },
    enemies: {
        baseHealth: { normal: 1, shooter: 2, patrol: 3, jumper: 1, flying: 2, necromancer: 3, vortex: 4, homeless: 5 },
        baseScore: { normal: 100, shooter: 120, patrol: 150, jumper: 110, flying: 200, necromancer: 300, vortex: 250, homeless: 180 }
    },
    boss: { health: 20, damage: 30, attackCooldown: 120, moveSpeed: 2 },
    particles: { maxCount: 800, enabled: true },
    audio: { enabled: true, volume: 0.4 },
    camera: { followSpeed: 0.1, playerOffset: 0.35 },
    level: { basePlatforms: 20, platformGrowth: 2, baseEnemies: 3, enemyGrowth: 1.2, baseWidth: 2500, widthGrowth: 400 },
    combat: { comboDecay: 180 },
    classes: {
        warrior: { name: 'Воин', health: 150, meleeDamage: 2, speed: 5.5, jumpPower: 15, color: '#c0392b', price: 100 },
        archer: { name: 'Лучник', health: 80, meleeDamage: 1, speed: 6, jumpPower: 16, color: '#27ae60', price: 35, arrowDamage: 1, arrowSpeed: 15, arrowCooldown: 25 },
        mage: { name: 'Маг', health: 90, meleeDamage: 1.5, speed: 5.8, jumpPower: 16, color: '#8e44ad', price: 85, gravity: 0.5, meleeRadius: 130 },
        rogue: { name: 'Разбойник', health: 60, meleeDamage: 1, speed: 8.5, jumpPower: 18, color: '#f39c12', price: 90, maxJumps: 3, maxDashes: 3 }
    }
};

// ==================== СПИСКИ КОНТЕНТА ====================
const PLAYER_CLASSES = [
    { id: 'default', name: 'Новичок', description: 'Базовый класс', color: '#4af626', price: 0 },
    { id: 'warrior', name: 'Воин', description: '💪 +50 HP, +100% урон', color: '#c0392b', price: 100 },
    { id: 'archer', name: 'Лучник', description: '🏹 Дальняя атака стрелами', color: '#27ae60', price: 35 },
    { id: 'mage', name: 'Маг', description: '🔮 Падает медленнее, +35% радиус', color: '#8e44ad', price: 85 },
    { id: 'rogue', name: 'Разбойник', description: '⚡ +40% скорость, тройной прыжок', color: '#f39c12', price: 90 }
];

const CHEST_SKINS = [
    { id: 'copper', name: 'Медный рыцарь', color: '#B87333', chance: 60, type: 'cube' },
    { id: 'sapphire', name: 'Сапфировый страж', color: '#0f52ba', chance: 30, type: 'cube' },
    { id: 'magma', name: 'Магмовый голем', color: '#FF4500', chance: 8, type: 'cube' },
    { id: 'royal', name: 'Королевский легион', color: '#FFD700', chance: 2, type: 'cube' },
    { id: 'sphere_fire', name: 'Огненная сфера', color: '#ff6b35', chance: 15, type: 'sphere', effect: 'rotate' },
    { id: 'sphere_ice', name: 'Ледяной кристалл', color: '#7fdbff', chance: 12, type: 'sphere', effect: 'glow' },
    { id: 'sphere_cosmic', name: 'Космический шар', color: '#9b59b6', chance: 8, type: 'sphere', effect: 'particles' },
    { id: 'cube_decorated', name: 'Узорчатый куб', color: '#e74c3c', chance: 10, type: 'decorated', pattern: 'stripes' },
    { id: 'cube_rainbow', name: 'Радужный блок', color: '#ff00ff', chance: 7, type: 'decorated', pattern: 'rainbow' },
    { id: 'cube_neon', name: 'Неоновый призм', color: '#00ff88', chance: 5, type: 'decorated', pattern: 'neon' },
    { id: 'pyramid_gold', name: 'Золотая пирамида', color: '#ffd700', chance: 4, type: 'pyramid' },
    { id: 'diamond', name: 'Алмазный монолит', color: '#00ffff', chance: 2, type: 'diamond' }
];

const AURA_SKINS = [
    { id: 'fire_aura', name: 'Огненная аура', color: '#ff4400', effectColor: 'rgba(255, 68, 0, 0.6)', chance: 40 },
    { id: 'ice_aura', name: 'Ледяная аура', color: '#00ccff', effectColor: 'rgba(0, 204, 255, 0.6)', chance: 30 },
    { id: 'lightning_aura', name: 'Электрическая аура', color: '#ffff00', effectColor: 'rgba(255, 255, 0, 0.6)', chance: 20 },
    { id: 'cosmic_aura', name: 'Космическая аура', color: '#9b59b6', effectColor: 'rgba(155, 89, 182, 0.6)', chance: 9 },
    { id: 'batidao_aura', name: 'Но батидао', color: '#ff0000', effectColor: 'rgba(255, 0, 0, 0.8)', chance: 1, image: 'https://images.genius.com/3849b06fe11fa1c89ba96465b298457c.1000x1000x1.png' }
];

const CHEST_TYPES = [
    { id: 'basic', name: 'Обычный кейс', price: 10, icon: '📦', skins: CHEST_SKINS.filter(s => ['copper','sapphire','magma','royal'].includes(s.id)) },
    { id: 'shapes', name: 'Кейс форм', price: 25, icon: '🔷', skins: CHEST_SKINS.filter(s => ['sphere_fire','sphere_ice','sphere_cosmic','pyramid_gold','diamond'].includes(s.id)) },
    { id: 'decorated', name: 'Узорчатый кейс', price: 30, icon: '✨', skins: CHEST_SKINS.filter(s => ['cube_decorated','cube_rainbow','cube_neon'].includes(s.id)) },
    { id: 'aura', name: 'Кейс аур', price: 12, icon: '💫', skins: [], isAura: true }
];

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let playerELO = parseInt(localStorage.getItem('kolblocks_elo')) || 0;
let totalKeys = parseInt(localStorage.getItem('kolblocks_keys')) || 0;
let unlockedSkins = JSON.parse(localStorage.getItem('kolblocks_skins')) || ['default'];
let unlockedAuras = JSON.parse(localStorage.getItem('kolblocks_auras')) || [];
let unlockedClasses = JSON.parse(localStorage.getItem('kolblocks_classes')) || ['default'];
let equippedSkin = localStorage.getItem('kolblocks_equipped') || 'default';
let equippedAura = localStorage.getItem('kolblocks_equipped_aura') || null;
let equippedClass = localStorage.getItem('kolblocks_equipped_class') || 'default';
let roundCoins = 0, roundDamage = 0;

let batidaoImage = null;
let activeAuraEffect = null;
let arrows = [];
let windProjectiles = []; // Ветряные заряды вихря
let lavaPlatforms = [];
let deadEnemiesForNecro = [];

// ==================== АУДИО СИСТЕМА ====================
const AudioSys = {
    ctx: null, enabled: true,
    init() {
        try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch(e) { this.enabled = false; }
    },
    play(f, d, t='square', v=0.1, dec=0.1) {
        if (!this.enabled || !this.ctx) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.connect(g); g.connect(this.ctx.destination);
        o.frequency.value = f; o.type = t;
        g.gain.setValueAtTime(v, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + d * dec);
        o.start(); o.stop(this.ctx.currentTime + d);
    },
    jump() { this.play(440, 0.15, 'sine', 0.15); },
    meleeSwing() { this.play(380, 0.12, 'sawtooth', 0.2); },
    hit() { this.play(220, 0.2, 'sawtooth', 0.2, 0.3); },
    collect() { this.play(660, 0.1, 'sine', 0.12); },
    combo() { this.play(523, 0.12, 'sine', 0.15); },
    dash() { this.play(330, 0.1, 'triangle', 0.1); },
    checkpoint() { this.play(784, 0.3, 'sine', 0.2); },
    levelComplete() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>this.play(f,0.2,'sine',0.15),i*100)); },
    bossSpawn() { [200,250,300,250,200].forEach((f,i)=>setTimeout(()=>this.play(f,0.3,'sawtooth',0.2,0.5),i*100)); },
    bossHit() { this.play(150, 0.3, 'sawtooth', 0.25, 0.4); },
    bossDefeat() { [400,500,600,800,1000].forEach((f,i)=>setTimeout(()=>this.play(f,0.4,'square',0.2),i*150)); },
    gameOver() { [392,349,294,262].forEach((f,i)=>setTimeout(()=>this.play(f,0.3,'sawtooth',0.15,0.5),i*150)); },
    eloGain() { this.play(880, 0.2, 'sine', 0.2); },
    eloLoss() { this.play(200, 0.25, 'sawtooth', 0.15); },
    chestOpen() { [300,450,600,900].forEach((f,i)=>setTimeout(()=>this.play(f,0.15,'square',0.15),i*80)); },
    arrowShoot() { this.play(550, 0.08, 'triangle', 0.15); },
    arrowHit() { this.play(280, 0.15, 'sawtooth', 0.18, 0.4); },
    lavaBurn() { this.play(180, 0.3, 'sawtooth', 0.1, 0.2); },
    necroSummon() { this.play(120, 0.4, 'sine', 0.2, 0.6); },
    windShoot() { this.play(480, 0.1, 'triangle', 0.12); },
    windHit() { this.play(320, 0.15, 'sawtooth', 0.15, 0.3); }
};

// ==================== ПУЛ ЧАСТИЦ ====================
class Particle {
    constructor(x, y, color) { this.reset(x, y, color); }
    reset(x, y, color) {
        this.x = x; this.y = y;
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 8 - 4;
        this.speedY = Math.random() * 8 - 4;
        this.color = color;
        this.life = 20 + Math.random() * 15;
        this.maxLife = this.life;
        this.active = true;
        return this;
    }
    update() {
        if (!this.active) return;
        this.x += this.speedX; this.y += this.speedY; this.speedY += 0.1;
        this.life--; this.size *= 0.96;
        if (this.life <= 0) this.active = false;
    }
    draw(ctx, cx) {
        if (!this.active) return;
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.x - cx, this.y, this.size, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class ObjectPool {
    constructor(createFn, maxSize = 500) {
        this.createFn = createFn; this.maxSize = maxSize;
        this.pool = []; this.active = [];
    }
    acquire(...args) {
        let o = this.pool.pop();
        if (!o) o = this.createFn(...args);
        o.active = true; this.active.push(o); return o;
    }
    release(o) {
        o.active = false;
        const i = this.active.indexOf(o);
        if (i > -1) this.active.splice(i, 1);
        if (this.pool.length < this.maxSize) this.pool.push(o);
    }
    releaseAll() { while (this.active.length > 0) this.release(this.active[0]); }
    get activeObjects() { return [...this.active]; }
}

// ==================== СНАРЯДЫ ====================
class Arrow {
    constructor(x, y, dir, dmg = 1) {
        this.x = x; this.y = y; this.w = 20; this.h = 4;
        this.spd = 15; this.dir = dir; this.dmg = dmg;
        this.active = true; this.life = 120; this.color = '#27ae60';
    }
    update() {
        if (!this.active) return;
        this.x += this.spd * this.dir; this.life--;
        if (this.life <= 0 || this.x < cameraX - 50 || this.x > cameraX + canvas.width + 50) { this.active = false; return; }
        const targets = [...enemies, ...flyingEnemies, ...homelessEnemies, ...necromancers, ...vortexes];
        for (let e of targets) {
            if (!e.active) continue;
            if (this.x < e.x + e.width && this.x + this.w > e.x && this.y < e.y + e.height && this.y + this.h > e.y) {
                if (e.takeDamage(this.dmg, 'arrow')) {
                    if (e instanceof Enemy) enemies = enemies.filter(x => x !== e);
                    else if (e instanceof FlyingEnemy) flyingEnemies = flyingEnemies.filter(x => x !== e);
                    else if (e instanceof HomelessEnemy) homelessEnemies = homelessEnemies.filter(x => x !== e);
                    else if (e instanceof NecromancerEnemy) necromancers = necromancers.filter(x => x !== e);
                    else if (e instanceof VortexEnemy) vortexes = vortexes.filter(x => x !== e);
                }
                this.active = false; AudioSys.arrowHit();
                for (let i = 0; i < 8; i++) particlePool.acquire(this.x, this.y, '#27ae60');
                return;
            }
        }
        if (boss && boss.active && this.x < boss.x + boss.width && this.x + this.w > boss.x && this.y < boss.y + boss.height && this.y + this.h > boss.y) {
            if (boss.takeDamage(this.dmg * 0.5)) { boss = null; document.getElementById('bossHealthBar').style.display = 'none'; }
            this.active = false; AudioSys.bossHit();
        }
    }
    draw(ctx) {
        if (!this.active) return;
        ctx.save(); ctx.translate(this.x - cameraX + this.w / 2, this.y + this.h / 2); ctx.rotate(this.dir > 0 ? 0 : Math.PI);
        ctx.fillStyle = this.color; ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        ctx.fillStyle = '#1a5233';
        ctx.beginPath(); ctx.moveTo(this.w / 2, 0); ctx.lineTo(this.w / 2 + 8, -6); ctx.lineTo(this.w / 2 + 8, 6); ctx.fill();
        ctx.restore();
    }
}

class WindProjectile {
    constructor(x, y, targetX, targetY) {
        this.x = x; this.y = y; this.w = 12; this.h = 12;
        this.speed = 8; this.active = true; this.life = 100; this.color = '#00ffff';
        const dx = targetX - x, dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
        this.rotation = 0;
    }
    update() {
        if (!this.active) return;
        this.x += this.vx; this.y += this.vy; this.rotation += 0.2; this.life--;
        if (this.life <= 0 || this.x < cameraX - 50 || this.x > cameraX + canvas.width + 50 || this.y < -50 || this.y > canvas.height + 50) {
            this.active = false; return;
        }
        if (this.x < player.x + player.width && this.x + this.w > player.x && this.y < player.y + player.height && this.y + this.h > player.y) {
            player.takeDamage(12, this.vx * 0.5, this.vy * 0.3, '#00ffff');
            this.active = false; AudioSys.windHit();
            for (let i = 0; i < 10; i++) particlePool.acquire(this.x, this.y, '#00ffff');
            return;
        }
        for (let p of platforms) {
            if (this.x < p.x + p.width && this.x + this.w > p.x && this.y < p.y + p.height && this.y + this.h > p.y) {
                this.active = false; for (let i = 0; i < 6; i++) particlePool.acquire(this.x, this.y, '#00ffff'); return;
            }
        }
    }
    draw(ctx) {
        if (!this.active) return;
        ctx.save(); ctx.translate(this.x - cameraX + this.w / 2, this.y + this.h / 2); ctx.rotate(this.rotation);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.beginPath(); ctx.arc(0, 0, this.w / 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath(); ctx.arc(-2, -2, 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}

// ==================== ТЕКСТУРЫ БОССОВ ====================
const bossTextures = {
    images: [], loaded: false,
    urls: [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbYIgWMe7urZ16o6fTz7OwE8IC6cakgU56rA&s',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg-WbZgPhjpjzrCi5jb0S3qJGJgSYway6EAQ&s',
        'https://img07.rl0.ru/afisha/e1200x1200i/daily.afisha.ru/uploads/images/d/c5/dc57d49aef5e0a0bb334b47df0fff5c3.jpg',
        'https://i.pinimg.com/736x/e2/ff/4a/e2ff4ab2a6496ba0632d23833569339d.jpg'
    ],
    load() {
        return new Promise(res => {
            let c = 0;
            this.urls.forEach((u, i) => {
                let img = new Image(); img.crossOrigin = "anonymous";
                img.onload = img.onerror = () => { c++; if (c === this.urls.length) { this.loaded = true; res(); } };
                img.src = u; this.images[i] = img;
            });
        });
    },
    getRandom(colors) {
        return Math.random() < 0.7
            ? { type: 'color', color: colors[Math.floor(Math.random() * colors.length)] }
            : { type: 'image', image: this.images[Math.floor(Math.random() * this.images.length)] };
    }
};

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ИГРЫ ====================
const canvas = document.getElementById('gameCanvas'), ctx = canvas.getContext('2d');
let particlePool;
let platforms = [], enemies = [], flyingEnemies = [], homelessEnemies = [], necromancers = [], vortexes = [], coins = [], powerUps = [];
let player, cameraX = 0, keys = {}, gameRunning = true, levelWidth = 0;
let currentLevel = 1, score = 0, playerHealth = 100, maxHealth = 100;
let comboCount = 1, maxCombo = 1, comboTimer = 0, comboMultiplier = 1;
let screenShake = 0, shakeIntensity = 0, lastCheckpointX = 0, boss = null, bossesDefeated = 0;
let levelKeys = [], arrowCooldown = 0;

const platTex = [
    { c: '#FF2E63', p: 'stripes' }, { c: '#08D9D6', p: 'dots' }, { c: '#FFDE7D', p: 'checker' },
    { c: '#6A2C70', p: 'zigzag' }, { c: '#4ECDC4', p: 'bricks' }, { c: '#FF9A76', p: 'waves' }
];
const enCol = ['#FF2E63', '#FFDE7D', '#6A2C70', '#08D9D6', '#AA00FF'];
const flyCol = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF6600'];

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
function updateHealthBar() { document.getElementById('healthFill').style.width = `${(playerHealth / maxHealth) * 100}%`; }
function updateBossHealth() { if (boss) document.getElementById('bossHealthFill').style.width = `${(boss.health / boss.maxHealth) * 100}%`; }
function updateUI() {
    document.getElementById('levelDisplay').textContent = currentLevel;
    document.getElementById('scoreDisplay').textContent = score;
    document.getElementById('comboCount').textContent = `x${comboCount}`;
    document.getElementById('eloValue').textContent = Math.floor(playerELO);
    document.getElementById('classDisplay').textContent = 'Класс: ' + PLAYER_CLASSES.find(c => c.id === equippedClass).name;
}
function addScore(p) { score += Math.floor(p * comboMultiplier); updateUI(); }
function updateCombo() {
    comboCount++; comboTimer = 180; comboMultiplier = 1 + (comboCount - 1) * 0.1;
    maxCombo = Math.max(maxCombo, comboCount);
    const cd = document.getElementById('comboDisplay'); cd.classList.add('active');
    document.getElementById('comboValue').textContent = comboCount;
    setTimeout(() => cd.classList.remove('active'), 1000);
    if (comboCount >= 5) AudioSys.combo();
}
function decayCombo() { if (comboTimer > 0) { comboTimer--; if (comboTimer <= 0) { comboCount = 1; comboMultiplier = 1; updateUI(); } } }
function shakeScreen(i) { screenShake = 20; shakeIntensity = i; }
function updateDashIndicator() { const dots = document.querySelectorAll('.dash-dot'); dots.forEach((d, i) => d.classList.toggle('active', i < player.dashCharges)); }
function showCheckpointIndicator() { const ci = document.getElementById('checkpointIndicator'); ci.classList.add('active'); setTimeout(() => ci.classList.remove('active'), 2000); }
function getCurrentClass() { return CONFIG.classes[equippedClass] || CONFIG.classes.default; }

// ==================== СИСТЕМА КЛАССОВ ====================
function getClassData(id) { return PLAYER_CLASSES.find(c => c.id === id) || PLAYER_CLASSES[0]; }
function equipClass(id) {
    if (unlockedClasses.includes(id)) {
        equippedClass = id; saveAllData(); applyClassStats(); renderClasses(); updateHealthBar(); updateUI();
    }
}
function applyClassStats() {
    const c = getCurrentClass(); if (!c) return;
    maxHealth = c.health || 100; playerHealth = Math.min(playerHealth, maxHealth);
    player.speed = c.speed || 6; player.jumpPower = c.jumpPower || 16;
    player.gravity = c.gravity || 0.8; player.meleeDamage = c.meleeDamage || 1;
    player.maxJumps = c.maxJumps || 2; player.maxDashes = c.maxDashes || 2;
    player.meleeRadius = c.meleeRadius || CONFIG.melee.radius;
    updateHealthBar(); updateDashIndicator();
}

// ==================== СИСТЕМА ELO ====================
function updateEloDisplay() { document.getElementById('eloValue').textContent = Math.floor(playerELO); }
function showEloChange(ch) {
    const el = document.createElement('div');
    el.className = 'elo-change ' + (ch >= 0 ? 'positive' : 'negative');
    el.textContent = (ch >= 0 ? '+' : '') + Math.floor(ch);
    document.body.appendChild(el);
    if (ch >= 0) AudioSys.eloGain(); else AudioSys.eloLoss();
    setTimeout(() => el.remove(), 1500);
}
function calculateEloChange() {
    const c = Math.floor(roundCoins * CONFIG.elo.coinsMultiplier), d = Math.floor(roundDamage / CONFIG.elo.damageDivider), ch = c - d;
    playerELO = Math.max(0, playerELO + ch); saveAllData(); return { change: ch };
}

// ==================== МАГАЗИН ====================
function getSkinData(id) { return CHEST_SKINS.find(s => s.id === id) || { id: 'default', name: 'Стандарт', color: '#4af626', type: 'cube' }; }
function getAuraData(id) { return AURA_SKINS.find(a => a.id === id) || null; }
function saveAllData() {
    localStorage.setItem('kolblocks_elo', playerELO);
    localStorage.setItem('kolblocks_keys', totalKeys);
    localStorage.setItem('kolblocks_skins', JSON.stringify(unlockedSkins));
    localStorage.setItem('kolblocks_auras', JSON.stringify(unlockedAuras));
    localStorage.setItem('kolblocks_classes', JSON.stringify(unlockedClasses));
    localStorage.setItem('kolblocks_equipped', equippedSkin);
    localStorage.setItem('kolblocks_equipped_aura', equippedAura || '');
    localStorage.setItem('kolblocks_equipped_class', equippedClass);
}

function openShop() {
    gameRunning = false; document.getElementById('pauseMenu').style.display = 'none';
    document.getElementById('caseShopScreen').style.display = 'flex';
    document.getElementById('shopKeyCount').textContent = totalKeys;
    renderChestTypes(); renderSkins(); renderAuras(); renderClasses();
}
function closeShop() { document.getElementById('caseShopScreen').style.display = 'none'; gameRunning = true; if (typeof gameLoop === 'function') gameLoop(); }
function renderChestTypes() {
    const c = document.getElementById('chestsContainer'); c.innerHTML = '';
    CHEST_TYPES.forEach(ch => {
        const d = document.createElement('div'); d.className = 'chest-card';
        d.innerHTML = `<div class="chest ${ch.id}-chest">${ch.icon}</div><p class="chest-name">${ch.name}</p><p class="chest-cost">Цена: ${ch.price} 🔑</p><button onclick="openChestType('${ch.id}')" ${totalKeys < ch.price ? 'disabled' : ''}>ОТКРЫТЬ</button>`;
        c.appendChild(d);
    });
}
function openChestType(id) {
    const ch = CHEST_TYPES.find(c => c.id === id);
    if (!ch || totalKeys < ch.price) { alert('Недостаточно ключей!'); return; }
    if (ch.isAura) { openAuraChest(); return; }
    totalKeys -= ch.price; saveAllData(); document.getElementById('shopKeyCount').textContent = totalKeys;
    event.target.disabled = true; AudioSys.chestOpen();
    setTimeout(() => {
        let r = Math.random() * 100, cm = 0, dr = ch.skins[0];
        for (let s of ch.skins) { cm += s.chance; if (r < cm) { dr = s; break; } }
        const has = unlockedSkins.includes(dr.id);
        if (has) {
            totalKeys += Math.floor(ch.price * 0.2); saveAllData(); document.getElementById('shopKeyCount').textContent = totalKeys;
            showResult('Дубликат: ' + dr.name, 'Возврат: +' + Math.floor(ch.price * 0.2) + ' 🔑', '#aaa');
        } else {
            unlockedSkins.push(dr.id); saveAllData(); showResult('Новый скин: ' + dr.name + '!', dr.color);
        }
        event.target.disabled = false; renderSkins(); renderChestTypes();
    }, 1000);
}
function renderSkins() {
    const g = document.getElementById('skinsGrid'); g.innerHTML = '';
    [{ id: 'default', name: 'Стандарт', color: '#4af626', type: 'cube' }, ...CHEST_SKINS].forEach(s => {
        const u = unlockedSkins.includes(s.id), e = equippedSkin === s.id;
        const d = document.createElement('div'); d.className = 'skin-item ' + (e ? 'equipped' : '') + (!u ? 'locked' : '');
        let p = '';
        if (s.type === 'sphere') p = `<div class="skin-preview sphere" style="background:radial-gradient(circle at 30% 30%, ${s.color}, ${s.color}88);"></div>`;
        else if (s.type === 'decorated') p = `<div class="skin-preview decorated" style="background:linear-gradient(135deg, ${s.color}, ${s.color}88);"></div>`;
        else if (s.type === 'pyramid') p = `<div class="skin-preview pyramid" style="border-bottom:35px solid ${s.color};border-left:20px solid transparent;border-right:20px solid transparent;"></div>`;
        else if (s.type === 'diamond') p = `<div class="skin-preview diamond" style="background:${s.color};transform:rotate(45deg);"></div>`;
        else p = `<div class="skin-preview" style="background:${u ? s.color : '#333'}"></div>`;
        d.innerHTML = p + `<span class="skin-name">${s.name}</span><button class="equip-btn" onclick="equipSkin('${s.id}')" ${(!u || e) ? 'disabled' : ''}>${e ? '✓ Выбран' : 'Выбрать'}</button>`;
        g.appendChild(d);
    });
}
function renderAuras() {
    const g = document.getElementById('aurasGrid'); g.innerHTML = '';
    if (unlockedAuras.length === 0) { g.innerHTML = '<div style="color:#aaa;text-align:center;grid-column:1/-1;">Нет аур. Открывайте кейс аур!</div>'; return; }
    AURA_SKINS.forEach(a => {
        const u = unlockedAuras.includes(a.id), e = equippedAura === a.id;
        const d = document.createElement('div'); d.className = 'skin-item ' + (e ? 'equipped' : '') + (!u ? 'locked' : '');
        d.innerHTML = `<div class="skin-preview" style="background:${u ? a.color : '#333'};box-shadow:0 0 10px ${u ? a.color : '#333'};"></div><span class="skin-name">${a.name}</span><button class="equip-btn" onclick="equipAura('${a.id}')" ${(!u || e) ? 'disabled' : ''}>${e ? '✓ Активирована' : 'Активировать'}</button>`;
        g.appendChild(d);
    });
}
function renderClasses() {
    const g = document.getElementById('classesGrid'); g.innerHTML = '';
    PLAYER_CLASSES.forEach(c => {
        const u = unlockedClasses.includes(c.id), e = equippedClass === c.id;
        const can = totalKeys >= c.price;
        const d = document.createElement('div'); d.className = 'skin-item ' + (e ? 'equipped' : '') + (!u ? 'locked' : '');
        d.innerHTML = `
            <div class="class-preview" style="background:${u ? c.color : '#333'};border:2px solid ${c.color}"></div>
            <span class="skin-name" style="color:${c.color};font-weight:bold">${c.name}</span>
            <span class="skin-desc">${c.description}</span>
            ${u ? `<button class="equip-btn" onclick="equipClass('${c.id}')" ${e ? 'disabled' : ''}>${e ? '✓ Выбран' : 'Выбрать'}</button>` :
            `<button class="equip-btn" style="background:${can ? '#FFDE7D' : '#444'};color:${can ? '#000' : '#888'}" onclick="${can ? `buyClass('${c.id}',${c.price})` : 'alert(\"Недостаточно ключей!\")'}" ${!can ? 'disabled' : ''}>${c.price} 🔑 ${can ? 'Купить' : 'Мало ключей'}</button>`}`;
        g.appendChild(d);
    });
}
function buyClass(id, price) {
    if (totalKeys < price) return;
    if (confirm(`Купить ${getClassData(id).name} за ${price} 🔑?`)) {
        totalKeys -= price; unlockedClasses.push(id); equippedClass = id; saveAllData();
        applyClassStats(); renderClasses(); document.getElementById('shopKeyCount').textContent = totalKeys;
        showResult('Класс получен!', getClassData(id).name, getClassData(id).color);
    }
}
function equipSkin(id) { if (unlockedSkins.includes(id)) { equippedSkin = id; saveAllData(); renderSkins(); } }
function equipAura(id) { if (unlockedAuras.includes(id)) { equippedAura = equippedAura === id ? null : id; saveAllData(); renderAuras(); } }
function openChest() { openChestType('basic'); }
function openAuraChest() {
    if (totalKeys < 12) { alert('Нужно минимум 12 🔑!'); return; }
    totalKeys -= 12; saveAllData(); document.getElementById('shopKeyCount').textContent = totalKeys;
    const btn = document.getElementById('openAuraChestBtn'), chest = document.getElementById('auraChestVisual');
    if (btn) { btn.disabled = true; chest.classList.add('shaking'); }
    AudioSys.chestOpen();
    setTimeout(() => {
        chest.classList.remove('shaking');
        let r = Math.random() * 100, cm = 0, dr = AURA_SKINS[0];
        for (let a of AURA_SKINS) { cm += a.chance; if (r < cm) { dr = a; break; } }
        const has = unlockedAuras.includes(dr.id);
        if (has) { totalKeys += 3; saveAllData(); document.getElementById('shopKeyCount').textContent = totalKeys; showResult('Дубликат ауры: ' + dr.name, 'Возврат: +3 🔑', '#aaa'); }
        else { unlockedAuras.push(dr.id); saveAllData(); showResult('Новая аура: ' + dr.name + '!', dr.color); }
        if (btn) btn.disabled = false; renderAuras();
    }, 1200);
}
function showResult(t, tx, cl) {
    document.getElementById('resultTitle').textContent = t;
    document.getElementById('resultText').textContent = tx;
    if (cl) document.getElementById('chestResult').querySelector('h3').style.color = cl;
    document.getElementById('chestResult').style.display = 'block';
}
function hideResult() { document.getElementById('chestResult').style.display = 'none'; }

// ==================== ЭФФЕКТ АУРЫ (ИСПРАВЛЕН) ====================
function showAuraEffectOnPlayer(x, y, aura) {
    if (activeAuraEffect) { activeAuraEffect.remove(); activeAuraEffect = null; }
    const e = document.createElement('div');
    e.className = 'aura-effect player-aura';
    e.style.cssText = `position:fixed;pointer-events:none;z-index:200;border-radius:50%;left:${x - 150}px;top:${y - 150}px;width:300px;height:300px;`;
    
    if (aura.id === 'batidao_aura') {
        e.style.background = `radial-gradient(circle, ${aura.effectColor} 0%, transparent 70%)`;
        e.style.backgroundImage = `url('https://images.genius.com/3849b06fe11fa1c89ba96465b298457c.1000x1000x1.png')`;
        e.style.backgroundSize = 'contain';
        e.style.backgroundPosition = 'center';
        e.style.backgroundRepeat = 'no-repeat';
        e.style.backgroundBlendMode = 'screen';
        e.style.boxShadow = `0 0 50px ${aura.color}, 0 0 100px ${aura.color}`;
        e.style.animation = 'batidaoAuraPlayer 0.5s ease-out forwards';
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const p = document.createElement('div');
                p.style.cssText = `position:fixed;pointer-events:none;z-index:199;left:${x + (Math.random() - 0.5) * 180}px;top:${y + (Math.random() - 0.5) * 180}px;width:${Math.random() * 8 + 4}px;height:${Math.random() * 8 + 4}px;background:#ff0000;border-radius:50%;box-shadow:0 0 15px ${aura.color};animation:particleExplode 0.5s ease-out forwards`;
                document.body.appendChild(p); setTimeout(() => p.remove(), 500);
            }, i * 10);
        }
    } else {
        e.style.background = `radial-gradient(circle, ${aura.effectColor}, transparent)`;
        e.style.boxShadow = `0 0 40px ${aura.color}`;
        e.style.animation = 'auraExpandPlayer 0.4s ease-out forwards';
    }
    document.body.appendChild(e); activeAuraEffect = e;
    setTimeout(() => { if (activeAuraEffect) { activeAuraEffect.remove(); activeAuraEffect = null; } }, 500);
}

const styleSheet = document.createElement("style");
styleSheet.textContent = `@keyframes auraExpandPlayer{0%{transform:scale(0.5);opacity:0.8}100%{transform:scale(1.5);opacity:0}}@keyframes batidaoAuraPlayer{0%{transform:scale(0.3) rotate(0deg);opacity:1}50%{transform:scale(1.2) rotate(180deg);opacity:0.8}100%{transform:scale(1.8) rotate(360deg);opacity:0}}@keyframes particleExplode{0%{transform:scale(1);opacity:1}100%{transform:scale(0) translateY(-60px);opacity:0}}`;
document.head.appendChild(styleSheet);

function loadBatidaoImage() {
    const img = new Image(); img.crossOrigin = "Anonymous";
    img.onload = () => { batidaoImage = img; };
    img.onerror = () => { batidaoImage = null; };
    img.src = 'https://images.genius.com/3849b06fe11fa1c89ba96465b298457c.1000x1000x1.png';
}

// ==================== ИГРОК ====================
class Player {
    constructor() { this.reset(); }
    reset() {
        const c = getCurrentClass();
        this.width = 40; this.height = 40; this.x = 100; this.y = 200;
        this.velX = 0; this.velY = 0; this.jumping = false; this.jumpCount = 0;
        this.color = c.color; this.speed = c.speed || 6; this.jumpPower = c.jumpPower || 16;
        this.gravity = c.gravity || 0.8; this.friction = 0.85; this.trail = []; this.maxTrail = 8;
        this.invulnerable = 0; this.dashCharges = c.maxDashes || 2; this.dashCooldown = 0;
        this.isDashing = false; this.dashTimer = 0; this.dashDirection = 1;
        this.lastCheckpoint = { x: 100, y: 200 }; this.meleeCooldown = 0; this.swingEffect = 0;
        this.meleeDamage = c.meleeDamage || 1; this.maxJumps = c.maxJumps || 2;
        this.meleeRadius = c.meleeRadius || 95; this.rotation = 0;
        this.prevY = this.y; // Сохраняем позицию для надёжной коллизии
        return this;
    }
    update(k) {
        this.prevY = this.y; // Запоминаем прошлый кадр
        if (this.invulnerable > 0) this.invulnerable--;
        if (this.dashCooldown > 0) this.dashCooldown--;
        if (this.meleeCooldown > 0) this.meleeCooldown--;
        if (this.swingEffect > 0) this.swingEffect--;
        if (!this.isDashing) { this.trail.push({ x: this.x, y: this.y }); if (this.trail.length > this.maxTrail) this.trail.shift(); }
        if (this.isDashing) { this.dashTimer--; this.x += 20 * this.dashDirection; if (this.dashTimer <= 0) { this.isDashing = false; this.velY = 0; } return; }
        this.velY += this.gravity;
        if (k['ArrowLeft'] || k['a'] || k['ф']) { this.velX = -this.speed; this.dashDirection = -1; }
        else if (k['ArrowRight'] || k['d'] || k['в']) { this.velX = this.speed; this.dashDirection = 1; }
        else { this.velX *= this.friction; }
        if ((k[' '] || k['ArrowUp'] || k['w'] || k['ц']) && this.jumpCount < this.maxJumps) {
            if (!this.jumping || this.maxJumps > 1) {
                this.velY = -this.jumpPower; this.jumping = true; this.jumpCount++; this.createJumpParticles(); AudioSys.jump();
                k[' '] = k['ArrowUp'] = k['w'] = k['ц'] = false;
            }
        }
        if ((k['Shift'] || k['shift'] || k['q'] || k['й']) && this.dashCharges > 0 && this.dashCooldown <= 0) { this.startDash(); k['Shift'] = k['shift'] = k['q'] = k['й'] = false; }
        if (equippedClass === 'archer' && (k['v'] || k['V'] || k['м'] || k['М']) && arrowCooldown <= 0) { this.shootArrow(); arrowCooldown = 25; k['v'] = k['V'] = k['м'] = k['М'] = false; }
        if (arrowCooldown > 0) arrowCooldown--;
        this.x += this.velX; this.y += this.velY;
        this.x = Math.max(cameraX + 50, Math.min(this.x, cameraX + canvas.width - 90));
        if (this.y > canvas.height + 200) { this.respawn(); return; }
        this.checkPlatformCollisions(); this.checkLavaDamage(); this.rotation += Math.abs(this.velX) * 0.1;
    }
    shootArrow() {
        if (equippedClass !== 'archer') return;
        AudioSys.arrowShoot();
        arrows.push(new Arrow(this.x + (this.dashDirection > 0 ? this.width : -10), this.y + this.height / 2, this.dashDirection, 1));
        for (let i = 0; i < 8; i++) particlePool.acquire(this.x + this.width / 2, this.y + this.height / 2, '#27ae60');
    }
    startDash() {
        this.isDashing = true; this.dashTimer = 12; this.dashCharges--; this.dashCooldown = 45;
        this.invulnerable = 15; this.velY = 0; AudioSys.dash();
        for (let i = 0; i < 20; i++) particlePool.acquire(this.x + this.width / 2 + Math.random() * 20 - 10, this.y + this.height / 2 + Math.random() * 20 - 10, '#FFDE7D');
        updateDashIndicator();
    }
    meleeAttack() {
        if (this.meleeCooldown > 0 || !gameRunning) return;
        this.meleeCooldown = 18; this.swingEffect = 8; AudioSys.meleeSwing();
        const cx = this.x + this.width / 2, cy = this.y + this.height / 2;
        if (equippedAura) { const a = getAuraData(equippedAura); if (a) showAuraEffectOnPlayer(cx - cameraX, cy, a); }
        let hit = false;
        const check = (e) => {
            if (!e.active) return;
            const d = Math.hypot(cx - (e.x + e.width / 2), cy - (e.y + e.height / 2));
            if (d < this.meleeRadius) {
                if (e.takeDamage(this.meleeDamage)) {
                    if (e instanceof Enemy) enemies = enemies.filter(x => x !== e);
                    else if (e instanceof FlyingEnemy) flyingEnemies = flyingEnemies.filter(x => x !== e);
                    else if (e instanceof HomelessEnemy) homelessEnemies = homelessEnemies.filter(x => x !== e);
                    else if (e instanceof NecromancerEnemy) necromancers = necromancers.filter(x => x !== e);
                    else if (e instanceof VortexEnemy) vortexes = vortexes.filter(x => x !== e);
                    else if (e === boss) { boss = null; document.getElementById('bossHealthBar').style.display = 'none'; }
                }
                hit = true; updateCombo(); this.createHitEffect(e.x + e.width / 2, e.y + e.height / 2);
            }
        };
        enemies.forEach(check); flyingEnemies.forEach(check); necromancers.forEach(check); vortexes.forEach(check); homelessEnemies.forEach(check);
        if (boss && boss.active) check(boss);
        if (hit) { for (let i = 0; i < 25; i++) particlePool.acquire(cx + (Math.random() - 0.5) * 40, cy + (Math.random() - 0.5) * 40, '#ffaa33'); shakeScreen(3); }
    }
    createHitEffect(x, y) { for (let i = 0; i < 15; i++) particlePool.acquire(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20, '#ff5500'); }
    createJumpParticles() { for (let i = 0; i < 12; i++) particlePool.acquire(this.x + this.width / 2, this.y + this.height, this.color); }
    createLandParticles() { for (let i = 0; i < 8; i++) particlePool.acquire(this.x + this.width / 2, this.y + this.height, '#08D9D6'); }
        checkPlatformCollisions() {
        let onGround = false;
        for (let p of platforms) {
            // 1. Проверка горизонтального пересечения
            const horizontalOverlap = this.x + this.width > p.x + 4 && this.x < p.x + p.width - 4;
            if (!horizontalOverlap) continue;

            // 2. Коллизия проверяется ТОЛЬКО при падении вниз (не при прыжке вверх!)
            if (this.velY >= 0) {
                // 3. Был ли игрок над платформой в начале кадра (до применения скорости)
                const wasAbove = (this.y + this.height - this.velY) <= p.y + 8;
                // 4. Касается ли он платформы сейчас
                const isTouching = this.y + this.height >= p.y;

                if (wasAbove && isTouching) {
                    this.y = p.y - this.height;
                    this.velY = 0;
                    if (this.jumping) { this.createLandParticles(); this.jumping = false; }
                    this.jumpCount = 0; onGround = true;
                    if (p.type === 'breaking' && !p.broken) p.breakTimer = 60;
                }
            }
        }
        if (onGround) this.jumpCount = 0;
    }
    checkLavaDamage() {
        for (let lp of lavaPlatforms) {
            if (this.x < lp.x + lp.width && this.x + this.width > lp.x && this.y + this.height > lp.y - 10 && this.y < lp.y + lp.height) {
                if (Date.now() - (lp.lastDamage || 0) > 900) {
                    this.takeDamage(Math.floor(maxHealth * 0.25), 0, -5, '#ff4500');
                    lp.lastDamage = Date.now(); AudioSys.lavaBurn();
                    for (let i = 0; i < 10; i++) particlePool.acquire(this.x + Math.random() * this.width, this.y + this.height, '#ff4500');
                }
            }
        }
    }
    checkCollision(o) { return this.x < o.x + o.width && this.x + this.width > o.x && this.y < o.y + o.height && this.y + this.height > o.y; }
    takeDamage(a, kx, ky, cl) {
        if (this.invulnerable > 0 || this.isDashing) return false;
        playerHealth = Math.max(0, playerHealth - a); updateHealthBar(); this.knockback(kx, ky);
        this.invulnerable = 45; AudioSys.hit(); roundDamage += a;
        for (let i = 0; i < 15; i++) particlePool.acquire(this.x + this.width / 2, this.y + this.height / 2, cl || '#ff2e63');
        if (playerHealth <= 0) { gameOver(); return true; } return false;
    }
    knockback(x, y) { this.velX = x; this.velY = y; this.jumping = true; }
    respawn() {
        this.takeDamage(30); this.x = this.lastCheckpoint.x; this.y = this.lastCheckpoint.y;
        this.velX = 0; this.velY = 0; this.jumping = false; this.jumpCount = 0; this.invulnerable = 90;
        for (let i = 0; i < 25; i++) particlePool.acquire(this.x + this.width / 2, this.y + this.height / 2, '#FF2E63'); shakeScreen(5);
    }
    saveCheckpoint() { this.lastCheckpoint = { x: this.x, y: this.y }; showCheckpointIndicator(); AudioSys.checkpoint(); }
    draw(ctx, cx) {
        const skin = getSkinData(equippedSkin);
        // След
        for (let i = 0; i < this.trail.length; i++) {
            ctx.globalAlpha = i / this.trail.length * 0.25;
            ctx.fillStyle = this.isDashing ? '#FFDE7D' : skin.color;
            if (skin.type === 'sphere') { ctx.beginPath(); ctx.arc(this.trail[i].x - cx + 20, this.trail[i].y + 20, 20, 0, Math.PI * 2); ctx.fill(); }
            else ctx.fillRect(this.trail[i].x - cx, this.trail[i].y, 40, 40);
        }
        ctx.globalAlpha = 1; const dx = this.x - cx;

        // Отрисовка скина
        if (skin.type === 'sphere') {
            ctx.save(); ctx.translate(dx + 20, this.y + 20); ctx.rotate(this.rotation);
            const g = ctx.createRadialGradient(-8, -8, 2, 0, 0, 20);
            g.addColorStop(0, skin.color); g.addColorStop(0.6, skin.color + '88'); g.addColorStop(1, skin.color + '44');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.arc(-6, -6, 5, 0, Math.PI * 2); ctx.fill();
            // Глаза
            ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(-7, -3, 4, 0, Math.PI * 2); ctx.arc(7, -3, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-6, -4, 2, 0, Math.PI * 2); ctx.arc(8, -4, 2, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        } else if (skin.type === 'decorated') {
            ctx.fillStyle = skin.color; ctx.fillRect(dx, this.y, 40, 40);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
            if (skin.pattern === 'stripes') { for (let i = 0; i < 40; i += 8) ctx.fillRect(dx + i, this.y, 4, 40); }
            else if (skin.pattern === 'rainbow') { ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0077ff', '#7700ff'].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(dx, this.y + i * 7, 40, 7); }); }
            else if (skin.pattern === 'neon') { ctx.shadowColor = skin.color; ctx.shadowBlur = 15; ctx.strokeRect(dx, this.y, 40, 40); ctx.shadowBlur = 0; }
            // Глаза
            ctx.fillStyle = '#222'; ctx.fillRect(dx + 10, this.y + 10, 8, 8); ctx.fillRect(dx + 22, this.y + 10, 8, 8);
        } else if (skin.type === 'pyramid') {
            ctx.fillStyle = skin.color; ctx.beginPath(); ctx.moveTo(dx + 20, this.y); ctx.lineTo(dx + 40, this.y + 40); ctx.lineTo(dx, this.y + 40); ctx.fill();
            ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(dx + 14, this.y + 22, 4, 0, Math.PI * 2); ctx.arc(dx + 26, this.y + 22, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(dx + 15, this.y + 21, 2, 0, Math.PI * 2); ctx.arc(dx + 27, this.y + 21, 2, 0, Math.PI * 2); ctx.fill();
        } else if (skin.type === 'diamond') {
            ctx.save(); ctx.translate(dx + 20, this.y + 20); ctx.rotate(Math.PI / 4);
            ctx.fillStyle = skin.color; ctx.fillRect(-20, -20, 40, 40); ctx.restore();
            ctx.fillStyle = '#222'; ctx.save(); ctx.translate(dx + 20, this.y + 20); ctx.rotate(Math.PI / 4);
            ctx.fillRect(-12, -8, 6, 6); ctx.fillRect(6, -8, 6, 6); ctx.restore();
        } else {
            // Классический куб (исправлен цвет)
            ctx.fillStyle = skin.color;
            if (this.isDashing) { ctx.shadowColor = skin.color; ctx.shadowBlur = 20; }
            ctx.fillRect(dx, this.y, 40, 40); ctx.shadowBlur = 0;
            ctx.fillStyle = '#222'; ctx.fillRect(dx + 10, this.y + 10, 8, 8); ctx.fillRect(dx + 22, this.y + 10, 8, 8); ctx.fillRect(dx + 10, this.y + 25, 20, 4);
        }

        ctx.strokeStyle = this.invulnerable > 0 && Math.floor(this.invulnerable / 4) % 2 === 0 ? '#fff' : skin.color;
        ctx.lineWidth = 2; if (skin.type === 'cube') ctx.strokeRect(dx, this.y, 40, 40);
        if (['magma', 'royal'].includes(skin.id) || skin.type === 'sphere') { ctx.shadowColor = skin.color; ctx.shadowBlur = 15; if (skin.type === 'cube') ctx.strokeRect(dx, this.y, 40, 40); ctx.shadowBlur = 0; }
        if (this.swingEffect > 0) { ctx.beginPath(); ctx.arc(dx + 20, this.y + 20, this.meleeRadius, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,80,40,${0.3 * (this.swingEffect / 8)})`; ctx.fill(); }
        if (this.jumpCount >= 1 && !this.jumping && this.maxJumps > 1) { ctx.fillStyle = 'rgba(8,217,214,0.7)'; ctx.beginPath(); ctx.arc(dx + 20, this.y - 8, 5, 0, Math.PI * 2); ctx.fill(); }
    }
}

// ==================== БОСС ====================
class Boss {
    constructor(x,y){this.x=x;this.y=y;this.width=40;this.height=40;this.maxHealth=CONFIG.boss.health+Math.floor(currentLevel/5)*5;this.health=this.maxHealth;this.speed=CONFIG.boss.moveSpeed;this.dir=1;this.cd=0;this.active=true;this.tex=bossTextures.getRandom(enCol);this.phase=0;this.mp=0;this.sp=0;this.color=this.tex.type==='color'?this.tex.color:'#ff0000';}
    update(){if(!this.active)return;this.mp+=0.02;this.cd--;if(Math.abs(this.x-player.x)>200){this.x+=this.speed*this.dir;if(this.x<cameraX+100||this.x>cameraX+canvas.width-140)this.dir*=-1;}this.y+=Math.sin(this.mp)*2;if(this.cd<=0){this.attack();this.cd=120-(currentLevel*2);}if(player.checkCollision(this)){if(player.takeDamage(30,this.x<player.x?15:-15,-10,'#ff0000'))return;}}
    attack(){this.sp=(this.sp+1)%3;if(this.sp===0)for(let i=0;i<15;i++)particlePool.acquire(this.x+20,this.y+20,'#ff0000');else if(this.sp===1)for(let i=-1;i<=1;i++)particlePool.acquire(this.x+20,this.y+20,0,4,10,'#ff6600',false);else for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2;particlePool.acquire(this.x+20,this.y+20,Math.cos(a)*6,Math.sin(a)*6,8,'#ff0000');}for(let i=0;i<15;i++)particlePool.acquire(this.x+20,this.y+20,'#ff0000');}
    takeDamage(d=1){this.health-=d;AudioSys.bossHit();for(let i=0;i<10;i++)particlePool.acquire(this.x+Math.random()*40,this.y+Math.random()*40,'#ff0000');if(this.health<=0){this.defeat();return true;}updateBossHealth();return false;}
    defeat(){this.active=false;AudioSys.bossDefeat();bossesDefeated++;for(let i=0;i<100;i++)particlePool.acquire(this.x+20,this.y+20,this.color);addScore(5000*comboMultiplier);updateCombo();document.getElementById('bossHealthBar').style.display='none';if(Math.random()<0.8)powerUps.push({x:this.x+20,y:this.y+20,size:20,color:'#FF2E63',type:'health'});if(Math.random()<0.5)powerUps.push({x:this.x+60,y:this.y+20,size:20,color:'#FFDE7D',type:'dash'});shakeScreen(10);}
    draw(ctx){if(!this.active)return;const dx=this.x-cameraX;ctx.shadowColor='#ff0000';ctx.shadowBlur=30;if(this.tex.type==='image'&&this.tex.image)try{ctx.drawImage(this.tex.image,dx,this.y,40,40);}catch(e){ctx.fillStyle=this.color;ctx.fillRect(dx,this.y,40,40);}else{ctx.fillStyle=this.color;ctx.fillRect(dx,this.y,40,40);ctx.fillStyle='rgba(0,0,0,0.3)';for(let i=0;i<40;i+=20)for(let j=0;j<40;j+=20)if((i/20+j/20)%2===0)ctx.fillRect(dx+i,this.y+j,20,20);}ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(dx+10,this.y+15,5,0,Math.PI*2);ctx.arc(dx+30,this.y+15,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#000';ctx.beginPath();ctx.arc(dx+10+(this.dir*2),this.y+15,2,0,Math.PI*2);ctx.arc(dx+30+(this.dir*2),this.y+15,2,0,Math.PI*2);ctx.fill();if(this.health<this.maxHealth*0.3&&Math.floor(Date.now()/200)%2===0){ctx.strokeStyle='#ff0000';ctx.lineWidth=4;ctx.strokeRect(dx-5,this.y-5,50,50);}}
}

// ==================== ОБЫЧНЫЙ ВРАГ ====================
class Enemy{constructor(x,y,t=0){this.x=x;this.y=y;this.width=40;this.height=40;this.type=t;this.color=enCol[Math.floor(Math.random()*enCol.length)];this.speed=t===0?0:1+Math.random()*2;this.dir=Math.random()>0.5?1:-1;this.sc=0;this.pr=100+Math.random()*200;this.sx=x;this.jc=0;this.health=CONFIG.enemies.baseHealth[t===0?'shooter':t===1?'patrol':'jumper'];this.maxHealth=this.health;this.scoreValue=CONFIG.enemies.baseScore[t===0?'shooter':t===1?'patrol':'jumper'];this.tex=Math.floor(Math.random()*3);this.active=true;}update(){if(!this.active)return;if(this.type===1){this.x+=this.speed*this.dir;if(Math.abs(this.x-this.sx)>this.pr)this.dir*=-1;}if(this.type===2&&this.jc<=0){let on=false;for(let p of platforms){if(this.x<p.x+p.width&&this.x+this.width>p.x&&this.y+this.height>p.y&&this.y+this.height<p.y+30){on=true;break;}}if(on){const d=player.x>this.x?1:-1;this.y-=12+Math.random()*4;this.x+=d*(8+Math.random()*4);this.jc=60+Math.random()*120;}}this.jc--;this.y+=0.8;for(let p of platforms){if(this.x<p.x+p.width&&this.x+this.width>p.x&&this.y+this.height>p.y&&this.y+this.height<p.y+30){this.y=p.y-this.height;if(this.type===1&&(this.x<=p.x+5||this.x+this.width>=p.x+p.width-5))this.dir*=-1;}}}takeDamage(d=1,s){this.health-=d;if(this.health<=0){this.destroy(s);return true;}return false;}destroy(s){this.active=false;if(s!=='necro')deadEnemiesForNecro.push({x:this.x,y:this.y,color:this.color,timer:180});addScore(this.scoreValue*comboMultiplier);updateCombo();AudioSys.collect();for(let i=0;i<20;i++)particlePool.acquire(this.x+20,this.y+20,this.color);if(Math.random()<0.35)coins.push({x:this.x+20,y:this.y+20,size:12,color:'#FFDE7D',bounce:0});if(Math.random()<0.12)powerUps.push({x:this.x+20,y:this.y+20,size:15,color:'#FF2E63',type:'health'});}draw(ctx){if(!this.active)return;ctx.fillStyle=this.color;ctx.fillRect(this.x-cameraX,this.y,40,40);ctx.fillStyle='rgba(0,0,0,0.25)';if(this.tex===0){for(let i=0;i<40;i+=15)ctx.fillRect(this.x-cameraX+i,this.y,8,40);}else if(this.tex===1){for(let i=0;i<40;i+=10)for(let j=0;j<40;j+=10)if((Math.floor(i/10)+Math.floor(j/10))%2===0)ctx.fillRect(this.x-cameraX+i,this.y+j,10,10);}else{ctx.beginPath();ctx.arc(this.x-cameraX+20,this.y+20,10,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#000';ctx.fillRect(this.x-cameraX+10,this.y+10,8,8);ctx.fillRect(this.x-cameraX+22,this.y+10,8,8);if(this.health<this.maxHealth){ctx.fillStyle='#4af626';ctx.fillRect(this.x-cameraX,this.y-8,(40*this.health)/this.maxHealth,4);}}}

// ==================== ЛЕТАЮЩИЙ ВРАГ ====================
class FlyingEnemy{constructor(x,y){this.x=x;this.y=y;this.oy=y;this.width=40;this.height=40;this.color=flyCol[Math.floor(Math.random()*flyCol.length)];this.speed=1.5+Math.random()*1.5;this.dir=Math.random()>0.5?1:-1;this.health=2;this.maxHealth=2;this.wp=0;this.fa=20+Math.random()*30;this.fs=0.05+Math.random()*0.03;this.fp=Math.random()*Math.PI*2;this.cc=0;this.ic=false;this.cd=0;this.active=true;}update(){if(!this.active)return;this.wp+=0.2;this.fp+=this.fs;this.y=this.oy+Math.sin(this.fp)*this.fa;this.x+=this.speed*this.dir;if(this.x<cameraX-50||this.x>cameraX+canvas.width+50)this.dir*=-1;if(!this.ic){this.cc--;if(this.cc<=0){const dx=player.x-this.x,dy=player.y-this.y;if(Math.sqrt(dx*dx+dy*dy)<300){this.ic=true;this.cd=dx>0?1:-1;this.cc=120+Math.random()*120;}}}else{this.x+=8*this.cd;this.y+=(player.y-this.y)*0.1;if(Math.abs(player.x-this.x)<50||this.x<cameraX-100||this.x>cameraX+canvas.width+100){this.ic=false;this.cc=60+Math.random()*60;}}}takeDamage(d=1,s){this.health-=d;if(this.health<=0){this.destroy(s);return true;}return false;}destroy(s){this.active=false;if(s!=='necro')deadEnemiesForNecro.push({x:this.x,y:this.y,color:this.color,timer:180});addScore(200*comboMultiplier);updateCombo();AudioSys.collect();for(let i=0;i<30;i++)particlePool.acquire(this.x+20,this.y+20,this.color);if(Math.random()<0.5)coins.push({x:this.x+20,y:this.y+20,size:12,color:'#FFDE7D',bounce:0});if(Math.random()<0.3)powerUps.push({x:this.x+20,y:this.y+20,size:15,color:'#FF2E63',type:'health'});}draw(ctx){if(!this.active)return;ctx.fillStyle=this.color;ctx.fillRect(this.x-cameraX,this.y,40,40);ctx.fillStyle=this.color+'80';const wy=this.y+20,wa=Math.sin(this.wp)*10;ctx.beginPath();ctx.moveTo(this.x-cameraX-15,wy);ctx.quadraticCurveTo(this.x-cameraX-25,wy-wa,this.x-cameraX-15,wy);ctx.fill();ctx.beginPath();ctx.moveTo(this.x-cameraX+55,wy);ctx.quadraticCurveTo(this.x-cameraX+65,wy-wa,this.x-cameraX+55,wy);ctx.fill();ctx.fillStyle='#000';ctx.fillRect(this.x-cameraX+8,this.y+8,6,6);ctx.fillRect(this.x-cameraX+26,this.y+8,6,6);ctx.shadowColor=this.color;ctx.shadowBlur=15;ctx.fillRect(this.x-cameraX,this.y,40,40);ctx.shadowBlur=0;if(this.health<this.maxHealth){ctx.fillStyle='#4af626';ctx.fillRect(this.x-cameraX,this.y-8,(40*this.health)/this.maxHealth,4);}}}

// ==================== НЕКРОМАНТ ====================
class NecromancerEnemy{constructor(x,y){this.x=x;this.y=y;this.width=40;this.height=40;this.color='#5d4a66';this.health=3;this.maxHealth=3;this.active=true;this.sc=0;}update(){if(!this.active)return;this.sc--;if(Math.abs(this.x-player.x)<300)this.x+=(player.x>this.x?0.5:-0.5);if(this.sc<=0){for(let d of deadEnemiesForNecro){if(d.timer>0&&Math.hypot(d.x-this.x,d.y-this.y)<200){d.timer--;if(d.timer<=0){const n=new Enemy(d.x,d.y,0);enemies.push(n);deadEnemiesForNecro=deadEnemiesForNecro.filter(x=>x!==d);AudioSys.necroSummon();for(let i=0;i<20;i++)particlePool.acquire(d.x,d.y,'#8e44ad');break;}}this.sc=120;}}this.y+=0.6;for(let p of platforms){if(this.x<p.x+p.width&&this.x+this.width>p.x&&this.y+this.height>p.y&&this.y+this.height<p.y+30){this.y=p.y-this.height;break;}}}takeDamage(d=1){this.health-=d;if(this.health<=0){this.destroy();return true;}return false;}destroy(){this.active=false;addScore(300*comboMultiplier);updateCombo();AudioSys.collect();for(let i=0;i<30;i++)particlePool.acquire(this.x+20,this.y+20,'#8e44ad');}draw(ctx){if(!this.active)return;const dx=this.x-cameraX;ctx.fillStyle=this.color;ctx.fillRect(dx,this.y,40,40);ctx.fillStyle='#3d2a4a';ctx.beginPath();ctx.moveTo(dx+20,this.y-15);ctx.lineTo(dx-5,this.y+10);ctx.lineTo(dx+45,this.y+10);ctx.fill();ctx.fillStyle='#ff00ff';ctx.beginPath();ctx.arc(dx+12,this.y+15,4,0,Math.PI*2);ctx.arc(dx+28,this.y+15,4,0,Math.PI*2);ctx.fill();if(this.sc<60){ctx.strokeStyle='#8e44ad';ctx.lineWidth=2;ctx.beginPath();ctx.arc(dx+20,this.y+20,40+Math.sin(Date.now()/100)*10,0,Math.PI*2);ctx.stroke();}if(this.health<this.maxHealth){ctx.fillStyle='#4af626';ctx.fillRect(dx,this.y-12,(40*this.health)/this.maxHealth,4);}ctx.fillStyle='#fff';ctx.font='bold 11px Unbounded';ctx.textAlign='center';ctx.fillText('НЕКРОМАНТ',dx+20,this.y-20);}}

// ==================== ВИХРЬ (С ГЛАЗАМИ И АТАКОЙ) ====================
class VortexEnemy{
    constructor(x,y){this.x=x;this.y=y;this.oy=y;this.width=40;this.height=40;this.color='#00ffff';this.health=4;this.maxHealth=4;this.active=true;this.rot=0;this.fp=Math.random()*Math.PI*2;this.shootCooldown=0;this.shootInterval=45;}
    update(){
        if(!this.active)return;this.rot+=0.1;this.fp+=0.03;this.y=this.oy+Math.sin(this.fp)*15;
        this.shootCooldown--;
        if(this.shootCooldown<=0&&Math.abs(this.x-player.x)<400&&Math.abs(this.y-player.y)<300){
            windProjectiles.push(new WindProjectile(this.x+20,this.y+20,player.x+20,player.y+20));
            AudioSys.windShoot();this.shootCooldown=this.shootInterval;
            for(let i=0;i<5;i++)particlePool.acquire(this.x+20,this.y+20,'#00ffff');
        }
        const dx=player.x-this.x,dy=player.y-this.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<250&&d>30){player.velX+=(dx/d)*0.8;player.velY+=(dy/d)*0.4;}
        if(Math.abs(this.x-player.x)>150)this.x+=(player.x>this.x?0.3:-0.3);
    }
    takeDamage(d=1){this.health-=d;if(this.health<=0){this.destroy();return true;}return false;}
    destroy(){this.active=false;addScore(250*comboMultiplier);updateCombo();AudioSys.collect();for(let i=0;i<40;i++)particlePool.acquire(this.x+20,this.y+20,'#00ffff');}
    draw(ctx){
        if(!this.active)return;const dx=this.x-cameraX;
        ctx.save();ctx.translate(dx+20,this.y+20);ctx.rotate(this.rot);
        for(let i=0;i<4;i++){ctx.fillStyle=`rgba(0,255,255,${0.3+i*0.15})`;ctx.beginPath();ctx.arc(0,0,20-i*5,i*0.5,i*0.5+Math.PI);ctx.fill();}
        ctx.restore();
        // Глаза
        ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(dx+13,this.y+15,5,0,Math.PI*2);ctx.arc(dx+27,this.y+15,5,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#000';ctx.beginPath();ctx.arc(dx+14,this.y+16,2,0,Math.PI*2);ctx.arc(dx+28,this.y+16,2,0,Math.PI*2);ctx.fill();
        // Ядро
        ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(dx+20,this.y+20,6,0,Math.PI*2);ctx.fill();
        if(this.health<this.maxHealth){ctx.fillStyle='#4af626';ctx.fillRect(dx,this.y-12,(40*this.health)/this.maxHealth,4);}
        ctx.fillStyle='#fff';ctx.font='bold 11px Unbounded';ctx.textAlign='center';ctx.fillText('ВИХРЬ',dx+20,this.y-20);
    }
}

// ==================== БОМЖ ====================
class HomelessEnemy{constructor(x,y,plat){this.x=x;this.y=y;this.width=40;this.height=40;this.color='#8B7355';this.health=5;this.maxHealth=5;this.active=true;this.plat=plat;this.bw=0;}update(){if(!this.active)return;this.bw+=0.15;this.y=this.plat.y-this.height;this.x=this.plat.x+this.plat.width/2-20;}takeDamage(d=1,s){this.health-=(s==='arrow'?d*1.67:d);if(this.health<=0){this.destroy();return true;}return false;}destroy(){this.active=false;addScore(180*comboMultiplier);updateCombo();AudioSys.collect();for(let i=0;i<25;i++)particlePool.acquire(this.x+20,this.y+20,'#8B7355');if(Math.random()<0.15)coins.push({x:this.x+20,y:this.y-20,size:12,color:'#FFDE7D',bounce:0});}draw(ctx){if(!this.active)return;const dx=this.x-cameraX;ctx.fillStyle=this.color;ctx.fillRect(dx,this.y+5,40,35);ctx.fillStyle='#D2B48C';ctx.beginPath();ctx.arc(dx+20,this.y+10,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#6B5443';ctx.beginPath();ctx.moveTo(dx+8,this.y+12);for(let i=0;i<6;i++)ctx.quadraticCurveTo(dx+12+i*4,this.y+20+Math.sin(this.bw+i)*3,dx+14+i*4,this.y+12);ctx.lineTo(dx+32,this.y+12);ctx.fill();ctx.fillStyle='#000';ctx.beginPath();ctx.arc(dx+15,this.y+8,3,0,Math.PI*2);ctx.arc(dx+25,this.y+8,3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#4a3728';ctx.fillRect(dx+5,this.y-2,30,8);ctx.fillRect(dx+2,this.y-6,36,4);if(this.health<this.maxHealth){ctx.fillStyle='#4af626';ctx.fillRect(dx,this.y-15,(40*this.health)/this.maxHealth,4);}ctx.fillStyle='#fff';ctx.font='bold 11px Unbounded';ctx.textAlign='center';ctx.fillText('БОМЖ',dx+20,this.y-22);}}

// ==================== ПЛАТФОРМА ====================
class Platform{
    constructor(x,y,w,ti,lv=false){this.x=x;this.y=y;this.width=w;this.height=25;this.tex=platTex[ti];this.glow=Math.random()>0.7;this.gp=Math.random()*Math.PI*2;this.type=Math.random()>0.8?(Math.random()>0.5?'moving':'breaking'):'normal';this.md=1;this.ms=1;this.ox=x;this.bt=0;this.broken=false;this.isLava=lv;}
    update(){if(this.glow)this.gp+=0.05;if(this.type==='moving'&&!this.broken){this.x+=this.ms*this.md;if(Math.abs(this.x-this.ox)>100)this.md*=-1;}if(this.type==='breaking'&&this.bt>0){this.bt--;if(this.bt===0){this.broken=true;setTimeout(()=>this.broken=false,3000);}}}
    draw(ctx){if(this.broken)return;ctx.fillStyle='rgba(0,0,0,0.25)';ctx.fillRect(this.x-cameraX+3,this.y+3,this.width,this.height);if(this.isLava){ctx.fillStyle='#ff4500';ctx.fillRect(this.x-cameraX,this.y+5,this.width,this.height-5);ctx.fillStyle='#ff6600';for(let i=0;i<this.width;i+=15){ctx.beginPath();ctx.arc(this.x-cameraX+i+7,this.y+10,4,0,Math.PI);ctx.fill();}}else{ctx.fillStyle=this.tex.c;if(this.type==='breaking'&&this.bt>0)ctx.globalAlpha=Math.sin(Date.now()/100)*0.3+0.7;ctx.fillRect(this.x-cameraX,this.y,this.width,this.height);ctx.globalAlpha=1;ctx.fillStyle='rgba(255,255,255,0.12)';const p=this.tex.p;if(p==='stripes'){for(let i=0;i<this.width;i+=30)ctx.fillRect(this.x-cameraX+i,this.y,15,this.height);}else if(p==='dots'){for(let i=6;i<this.width;i+=12)for(let j=6;j<this.height;j+=12){ctx.beginPath();ctx.arc(this.x-cameraX+i,this.y+j,2,0,Math.PI*2);ctx.fill();}}else if(p==='checker'){for(let i=0;i<this.width;i+=8)for(let j=0;j<this.height;j+=8)if((Math.floor(i/8)+Math.floor(j/8))%2===0)ctx.fillRect(this.x-cameraX+i,this.y+j,8,8);}else if(p==='zigzag'){for(let i=0;i<this.width;i+=20){ctx.beginPath();ctx.moveTo(this.x-cameraX+i,this.y+this.height);ctx.lineTo(this.x-cameraX+i+10,this.y);ctx.lineTo(this.x-cameraX+i+20,this.y+this.height);ctx.fill();}}else if(p==='bricks'){for(let i=0;i<this.width;i+=25)for(let j=0;j<this.height;j+=12)if((i/25+j/12)%2===0)ctx.fillRect(this.x-cameraX+i,this.y+j,25,12);}else if(p==='waves'){for(let i=0;i<this.width;i+=30){ctx.beginPath();ctx.moveTo(this.x-cameraX+i,this.y+this.height/2);for(let j=0;j<30;j+=5){const x=this.x-cameraX+i+j,y=this.y+this.height/2+Math.sin(j/30*Math.PI*2)*5;ctx.lineTo(x,y);}ctx.lineTo(this.x-cameraX+i+30,this.y+this.height);ctx.lineTo(this.x-cameraX+i,this.y+this.height);ctx.fill();}}}if(this.glow&&!this.isLava){const gi=Math.sin(this.gp)*0.3+0.7;ctx.shadowColor=this.tex.c;ctx.shadowBlur=15*gi;ctx.strokeStyle=this.tex.c;ctx.lineWidth=2;ctx.strokeRect(this.x-cameraX,this.y,this.width,this.height);ctx.shadowBlur=0;}ctx.strokeStyle='rgba(0,0,0,0.25)';ctx.lineWidth=2;ctx.strokeRect(this.x-cameraX,this.y,this.width,this.height);if(this.type==='breaking'){ctx.fillStyle='#ff0000';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(this.x-cameraX+this.width/4+i*(this.width/4),this.y+5,3,0,Math.PI*2);ctx.fill();}}if(this.type==='moving'){ctx.fillStyle='#0088ff';const ac=Math.floor(this.width/30);for(let i=0;i<ac;i++){const ax=this.x-cameraX+15+i*30;ctx.beginPath();ctx.moveTo(ax,this.y+this.height/2);ctx.lineTo(ax+10*this.md,this.y+10);ctx.lineTo(ax+10*this.md,this.y+this.height-10);ctx.closePath();ctx.fill();}}}}

// ==================== ГЕНЕРАЦИЯ УРОВНЯ ====================
function generateLevel(level){
    platforms=[];enemies=[];flyingEnemies=[];homelessEnemies=[];necromancers=[];vortexes=[];coins=[];powerUps=[];levelKeys=[];deadEnemiesForNecro=[];windProjectiles=[];
    roundCoins=0;roundDamage=0;lavaPlatforms=[];
    const minH=100,maxH=canvas.height-150;
    const pc=CONFIG.level.basePlatforms+Math.floor(level*CONFIG.level.platformGrowth);
    const ec=CONFIG.level.baseEnemies+Math.floor(level*CONFIG.level.enemyGrowth);
    const fc=Math.max(0,Math.floor(level/3));
    levelWidth=CONFIG.level.baseWidth+(level-1)*CONFIG.level.widthGrowth;
    platforms.push(new Platform(80,canvas.height-200,180,0));
    let lx=100,ly=canvas.height-250,dir=1;
    for(let i=0;i<pc;i++){
        const w=70+Math.random()*130,mig=120+(level*10),mag=220+(level*15);
        const x=lx+mig+Math.random()*(mag-mig);
        if(Math.random()>0.6)dir*=-1;
        const yc=80+Math.random()*100;
        let y=Math.max(minH,Math.min(maxH,ly+dir*yc));
        platforms.push(new Platform(x,y,w,Math.floor(Math.random()*platTex.length)));
        if(i>2&&i<pc-2&&Math.random()<0.4){const cc=Math.floor(Math.random()*3)+1;for(let j=0;j<cc;j++)coins.push({x:x+20+j*25,y:y-30,size:12,color:'#FFDE7D',bounce:Math.random()*Math.PI*2});}
        lx=x;ly=y;
    }
    platforms.push(new Platform(levelWidth-200,canvas.height-200,200,5));
    const kp=platforms[Math.floor(Math.random()*(platforms.length-3))+2];
    levelKeys.push({x:kp.x+kp.width/2-15,y:kp.y-45,size:28,collected:false,floatOffset:0});
    if(level>=3){const safePlat=platforms[Math.floor(Math.random()*(platforms.length-5))+3];const lp=new Platform(safePlat.x-30,safePlat.y,110,Math.floor(Math.random()*platTex.length),true);platforms.push(lp);lavaPlatforms.push(lp);homelessEnemies.push(new HomelessEnemy(safePlat.x+15,safePlat.y-40,lp));platforms.push(new Platform(safePlat.x+90,safePlat.y-80,70,Math.floor(Math.random()*platTex.length)));}
    const newTypes=['necromancer','vortex'];
    for(let i=0;i<ec;i++){
        const pi=Math.floor(Math.random()*(platforms.length-5))+3;const p=platforms[pi];
        if(level>=3&&i>0&&i%4===0){
            const t=newTypes[Math.floor(Math.random()*newTypes.length)];
            if(t==='necromancer')necromancers.push(new NecromancerEnemy(p.x+p.width/2-20,p.y-40));
            else vortexes.push(new VortexEnemy(p.x+p.width/2-20,150+Math.random()*200));
        }else enemies.push(new Enemy(p.x+p.width/2-20,p.y-40,Math.floor(Math.random()*3)));
    }
    for(let i=0;i<fc;i++)flyingEnemies.push(new FlyingEnemy(300+Math.random()*(levelWidth-600),100+Math.random()*200));
    for(let i=0;i<Math.floor(level/2)+1;i++){const pi=Math.floor(Math.random()*(platforms.length-10))+5;const p=platforms[pi];powerUps.push({x:p.x+p.width/2,y:p.y-40,size:15,color:'#FF2E63',type:'health'});}
    for(let cx=800;cx<levelWidth-300;cx+=800)platforms.push(new Platform(cx,canvas.height-180,100,2));
    return levelWidth;
}

// ==================== ЛОГИКА ОБНОВЛЕНИЯ ====================
function updateCamera(){const t=player.x-canvas.width*CONFIG.camera.playerOffset;cameraX+=(t-cameraX)*CONFIG.camera.followSpeed;cameraX=Math.max(0,Math.min(cameraX,levelWidth-canvas.width));}
function updateCoins(){for(let i=coins.length-1;i>=0;i--){const c=coins[i];c.bounce+=0.1;c.y+=Math.sin(c.bounce)*0.5;if(player.checkCollision({x:c.x-c.size/2,y:c.y-c.size/2,width:c.size,height:c.size})){addScore(50*comboMultiplier);updateCombo();AudioSys.collect();roundCoins++;for(let j=0;j<15;j++)particlePool.acquire(c.x,c.y,'#FFDE7D');coins.splice(i,1);}}}
function updateKeys(){for(let i=levelKeys.length-1;i>=0;i--){const k=levelKeys[i];if(k.collected)continue;k.floatOffset+=0.06;const ky=k.y+Math.sin(k.floatOffset)*6;if(player.checkCollision({x:k.x,y:ky,width:k.size,height:k.size})){k.collected=true;totalKeys++;saveAllData();AudioSys.collect();for(let j=0;j<20;j++)particlePool.acquire(k.x+k.size/2,ky+k.size/2,'#00BFFF');levelKeys.splice(i,1);}}}
function updatePowerUps(){for(let i=powerUps.length-1;i>=0;i--){const p=powerUps[i];p.y+=Math.sin(Date.now()/500)*0.5;if(player.checkCollision({x:p.x-p.size/2,y:p.y-p.size/2,width:p.size,height:p.size})){if(p.type==='health'){playerHealth=Math.min(maxHealth,playerHealth+30);updateHealthBar();}else if(p.type==='dash'){player.dashCharges=Math.min(CONFIG.player.maxDashes,player.dashCharges+1);updateDashIndicator();}for(let j=0;j<20;j++)particlePool.acquire(p.x,p.y,p.color);AudioSys.collect();powerUps.splice(i,1);}}}
function updateArrows(){for(let i=arrows.length-1;i>=0;i--){arrows[i].update();if(!arrows[i].active)arrows.splice(i,1);}}
function updateWindProjectiles(){for(let i=windProjectiles.length-1;i>=0;i--){windProjectiles[i].update();if(!windProjectiles[i].active)windProjectiles.splice(i,1);}}
function updateNewEnemies(){necromancers.forEach(e=>e.update());vortexes.forEach(e=>e.update());homelessEnemies.forEach(e=>e.update());deadEnemiesForNecro=deadEnemiesForNecro.filter(d=>{d.timer--;return d.timer>0;});}
function checkEnemyCollisions(){for(let e of enemies)if(e.active&&player.checkCollision(e))if(player.takeDamage(20,e.x<player.x?10:-10,-8,e.color))return;for(let e of flyingEnemies)if(e.active&&player.checkCollision(e))if(player.takeDamage(25,e.x<player.x?12:-12,-10,'#FF00FF'))return;for(let e of necromancers)if(e.active&&player.checkCollision(e))if(player.takeDamage(25,e.x<player.x?10:-10,-8,'#8e44ad'))return;for(let e of vortexes)if(e.active&&player.checkCollision(e))if(player.takeDamage(30,0,-12,'#00ffff'))return;for(let e of homelessEnemies)if(e.active&&player.checkCollision(e))if(player.takeDamage(22,e.x<player.x?8:-8,-6,'#8B7355'))return;}
function checkCheckpoints(){if(player.x>lastCheckpointX+800){lastCheckpointX=player.x;player.saveCheckpoint();}}

// ==================== ОТРИСОВКА ====================
function drawBackground(){const g=ctx.createLinearGradient(0,0,0,canvas.height);g.addColorStop(0,'#0a0a1a');g.addColorStop(1,'#000000');ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);for(let l=0;l<3;l++){const s=0.05+l*0.1,a=0.1+l*0.15,z=1+l*0.5;ctx.fillStyle=`rgba(255,255,255,${a})`;for(let i=0;i<40;i++){const x=(i*67+cameraX*s)%canvas.width,y=(i*41+l*100)%canvas.height;ctx.fillRect(x,y,z,z);}}}
function drawGoal(){const gx=levelWidth-cameraX;if(gx<canvas.width+100&&gx>-100){const g=ctx.createRadialGradient(gx,canvas.height/2,10,gx,canvas.height/2,180);g.addColorStop(0,'#4af626aa');g.addColorStop(1,'#4af62600');ctx.fillStyle=g;ctx.fillRect(gx-180,0,360,canvas.height);ctx.strokeStyle='#4af626';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,canvas.height);ctx.stroke();const p=Math.sin(Date.now()/250)*0.4+0.6;ctx.fillStyle=`rgba(74,246,38,${p})`;ctx.font='bold 26px monospace';ctx.textAlign='center';ctx.fillText('🏁 ФИНИШ',gx,canvas.height-45);}}
function drawParticles(){if(!CONFIG.particles.enabled)return;for(let p of particlePool.activeObjects){p.update();p.draw(ctx,cameraX);if(!p.active)particlePool.release(p);}}
function drawCoins(){coins.forEach(c=>{ctx.fillStyle=c.color;ctx.beginPath();ctx.arc(c.x-cameraX,c.y,c.size,0,Math.PI*2);ctx.fill();ctx.fillStyle='#FFFFFF88';ctx.beginPath();ctx.arc(c.x-cameraX-3,c.y-3,c.size/3,0,Math.PI*2);ctx.fill();});}
function drawKeys(){levelKeys.forEach(k=>{if(k.collected)return;k.floatOffset+=0.06;const ky=k.y+Math.sin(k.floatOffset)*6;ctx.font='26px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor='#00BFFF';ctx.shadowBlur=12;ctx.fillText('🔑',k.x+k.size/2-cameraX,ky+k.size/2);ctx.shadowBlur=0;});}
function drawPowerUps(){powerUps.forEach(p=>{ctx.fillStyle=p.color;ctx.beginPath();if(p.type==='health'){ctx.moveTo(p.x-cameraX,p.y+p.size/2);ctx.bezierCurveTo(p.x-cameraX,p.y,p.x-cameraX-p.size,p.y,p.x-cameraX-p.size,p.y+p.size/2);ctx.bezierCurveTo(p.x-cameraX-p.size,p.y+p.size,p.x-cameraX,p.y+p.size*1.5,p.x-cameraX,p.y+p.size*1.5);ctx.bezierCurveTo(p.x-cameraX,p.y+p.size*1.5,p.x-cameraX+p.size,p.y+p.size,p.x-cameraX+p.size,p.y+p.size/2);ctx.bezierCurveTo(p.x-cameraX+p.size,p.y,p.x-cameraX,p.y,p.x-cameraX,p.y+p.size/2);}else ctx.arc(p.x-cameraX,p.y,p.size,0,Math.PI*2);ctx.fill();ctx.shadowColor=p.color;ctx.shadowBlur=10;ctx.fill();ctx.shadowBlur=0;});}
function drawArrows(){arrows.forEach(a=>a.draw(ctx));}
function drawWindProjectiles(){windProjectiles.forEach(w=>w.draw(ctx));}

// ==================== ОСНОВНОЙ ЦИКЛ ====================
function gameLoop(){
    if(!gameRunning)return;
    player.update(keys); updateCamera(); updateCoins(); updateKeys(); updatePowerUps();
    updateArrows(); updateWindProjectiles(); updateNewEnemies(); decayCombo();
    checkEnemyCollisions(); checkCheckpoints(); if(boss)boss.update();
    if(player.x>levelWidth-100&&(!boss||!boss.active)){completeLevel();return;}
    if(screenShake>0){screenShake--;ctx.setTransform(1,0,0,1,(Math.random()-0.5)*shakeIntensity,(Math.random()-0.5)*shakeIntensity);}
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawBackground(); platforms.forEach(p=>{p.update();p.draw(ctx);});
    enemies.forEach(e=>{e.update();e.draw(ctx);});flyingEnemies.forEach(e=>{e.update();e.draw(ctx);});
    necromancers.forEach(e=>e.draw(ctx));vortexes.forEach(e=>e.draw(ctx));homelessEnemies.forEach(e=>e.draw(ctx));
    if(boss)boss.draw(ctx);
    drawKeys();drawCoins();drawPowerUps();drawArrows();drawWindProjectiles();drawParticles();
    player.draw(ctx,cameraX);drawGoal();
    ctx.setTransform(1,0,0,1,0,0);updateDashIndicator();requestAnimationFrame(gameLoop);
}

function completeLevel(){
    gameRunning=false;AudioSys.levelComplete();addScore(1000*currentLevel);
    const er=calculateEloChange();
    document.getElementById('levelScore').textContent=Math.floor(1000*currentLevel*comboMultiplier);
    document.getElementById('maxCombo').textContent=`x${maxCombo}`;
    document.getElementById('coinsCollected').textContent=roundCoins;document.getElementById('damageTaken').textContent=roundDamage;
    const el=document.getElementById('eloChangeDisplay');el.textContent=(er.change>=0?'+':'')+er.change;
    el.style.color=er.change>=0?'#4af626':'#ff2e63';
    document.getElementById('levelComplete').style.display='flex';showEloChange(er.change);
    for(let i=0;i<80;i++)particlePool.acquire(player.x+20,player.y+20,platTex[Math.floor(Math.random()*platTex.length)].c);
    setTimeout(()=>{document.getElementById('levelComplete').style.display='none';currentLevel++;generateLevel(currentLevel);player.reset();playerHealth=maxHealth;updateHealthBar();cameraX=0;comboCount=1;comboMultiplier=1;maxCombo=1;lastCheckpointX=0;updateUI();updateDashIndicator();updateEloDisplay();gameRunning=true;gameLoop();},2500);
}

function gameOver(){gameRunning=false;AudioSys.gameOver();document.getElementById('finalScore').textContent=score;document.getElementById('finalLevel').textContent=currentLevel-1;document.getElementById('finalCombo').textContent=`x${maxCombo}`;document.getElementById('bossesDefeated').textContent=bossesDefeated;document.getElementById('finalElo').textContent=Math.floor(playerELO);document.getElementById('gameOver').style.display='flex';}
function restartGame(){document.getElementById('gameOver').style.display='none';document.getElementById('pauseMenu').style.display='none';document.getElementById('caseShopScreen').style.display='none';currentLevel=1;score=0;playerHealth=getCurrentClass().health||100;maxHealth=playerHealth;comboCount=1;maxCombo=1;comboMultiplier=1;lastCheckpointX=0;bossesDefeated=0;roundCoins=0;roundDamage=0;arrows=[];windProjectiles=[];deadEnemiesForNecro=[];generateLevel(currentLevel);player=new Player();cameraX=0;updateUI();updateHealthBar();updateDashIndicator();updateEloDisplay();document.getElementById('bossHealthBar').style.display='none';gameRunning=true;gameLoop();}
function togglePause(){const p=document.getElementById('pauseMenu');if(p.style.display==='flex'){p.style.display='none';gameRunning=true;gameLoop();}else{gameRunning=false;p.style.display='flex';}}
function showPauseMenu(){gameRunning=false;document.getElementById('pauseMenu').style.display='flex';}
function performMelee(){if(gameRunning&&player)player.meleeAttack();}

// ==================== СОБЫТИЯ ====================
window.addEventListener('keydown',e=>{keys[e.key]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.key==='v'||e.key==='V'||e.key==='м'||e.key==='М'){e.preventDefault();performMelee();}if(e.key==='p'||e.key==='P'||e.key==='Escape'){e.preventDefault();togglePause();}if((e.key==='r'||e.key==='R')&&!gameRunning)restartGame();});
window.addEventListener('keyup',e=>{keys[e.key]=false;});
canvas.addEventListener('mousedown',e=>{if(e.button===0&&gameRunning)performMelee();});

function setupMobileControls(){const isT='ontouchstart'in window||navigator.maxTouchPoints>0;if(isT||window.innerWidth<=768){document.getElementById('mobileControls').style.display='flex';const bind=(id,key)=>{const b=document.getElementById(id);b.addEventListener('touchstart',e=>{e.preventDefault();keys[key]=true;});b.addEventListener('touchend',e=>{e.preventDefault();keys[key]=false;});b.addEventListener('mousedown',()=>keys[key]=true);b.addEventListener('mouseup',()=>keys[key]=false);b.addEventListener('mouseleave',()=>keys[key]=false);};bind('btnLeft','ArrowLeft');bind('btnRight','ArrowRight');bind('btnJump',' ');bind('btnDash','Shift');document.getElementById('btnAttack').addEventListener('touchstart',e=>{e.preventDefault();performMelee();});document.getElementById('btnAttack').addEventListener('mousedown',performMelee);if(document.getElementById('btnShoot')){document.getElementById('btnShoot').addEventListener('touchstart',e=>{e.preventDefault();if(equippedClass==='archer'&&arrowCooldown<=0){player.shootArrow();arrowCooldown=25;}});document.getElementById('btnShoot').addEventListener('mousedown',()=>{if(equippedClass==='archer'&&arrowCooldown<=0){player.shootArrow();arrowCooldown=25;}});}}}

document.getElementById('soundToggle').addEventListener('change',e=>{CONFIG.audio.enabled=e.target.checked;AudioSys.enabled=e.target.checked;});
document.getElementById('particlesToggle').addEventListener('change',e=>{CONFIG.particles.enabled=e.target.checked;if(!e.target.checked)particlePool?.releaseAll();});

async function initGame(){resizeCanvas();AudioSys.init();await bossTextures.load();loadBatidaoImage();particlePool=new ObjectPool((x,y,c)=>new Particle(x,y,c),CONFIG.particles.maxCount);let pr=0;const pi=setInterval(()=>{pr+=Math.random()*15;document.getElementById('progressFill').style.width=`${Math.min(pr,100)}%`;if(pr>=100){clearInterval(pi);setTimeout(()=>{document.getElementById('loading').style.opacity='0';setTimeout(()=>document.getElementById('loading').style.display='none',500);},300);}},100);generateLevel(currentLevel);player=new Player();applyClassStats();updateUI();updateHealthBar();updateDashIndicator();updateEloDisplay();setupMobileControls();setTimeout(()=>{gameRunning=true;gameLoop();},800);}

window.addEventListener('load',initGame);
window.addEventListener('resize',()=>{resizeCanvas();if(gameRunning){generateLevel(currentLevel);player.reset();cameraX=0;}});
document.addEventListener('touchmove',e=>{if(!e.target.closest('#mobileControls'))e.preventDefault();},{passive:false});

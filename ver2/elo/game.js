// game.js
// ==================== КОНФИГУРАЦИЯ ====================
const CONFIG = {
    player: { width: 40, height: 40, speed: 6, jumpPower: 16, gravity: 0.8, friction: 0.85, dashSpeed: 20, dashDuration: 12, dashCooldown: 45, maxDashes: 2, doubleJump: true },
    melee: { radius: 95, cooldownMax: 18, damage: 1 },
    elo: { coinsMultiplier: 2, damageDivider: 5 },
    enemies: { baseHealth: { normal: 1, shooter: 2, patrol: 3, jumper: 1, flying: 2 }, baseScore: { normal: 100, shooter: 120, patrol: 150, jumper: 110, flying: 200 } },
    boss: { health: 20, damage: 30, attackCooldown: 120, moveSpeed: 2 },
    particles: { maxCount: 600, enabled: true },
    audio: { enabled: true, volume: 0.4 },
    camera: { followSpeed: 0.1, playerOffset: 0.35 },
    level: { basePlatforms: 20, platformGrowth: 2, baseEnemies: 3, enemyGrowth: 1.2, baseWidth: 2500, widthGrowth: 400 },
    combat: { comboDecay: 180 }
};

// Скины для обычного сундука (исправлены шансы - сумма = 100%)
const CHEST_SKINS = [
    { id: 'copper', name: 'Медный рыцарь', color: '#B87333', chance: 55 },
    { id: 'sapphire', name: 'Сапфировый страж', color: '#0f52ba', chance: 30 },
    { id: 'magma', name: 'Магмовый голем', color: '#FF4500', chance: 12 },
    { id: 'royal', name: 'Королевский легион', color: '#FFD700', chance: 3 }
];

// Ауры для кейса (исправлены шансы - сумма = 100%)
const AURA_SKINS = [
    { id: 'fire_aura', name: 'Огненная аура', color: '#ff4400', effectColor: 'rgba(255, 68, 0, 0.6)', chance: 45 },
    { id: 'ice_aura', name: 'Ледяная аура', color: '#00ccff', effectColor: 'rgba(0, 204, 255, 0.6)', chance: 30 },
    { id: 'lightning_aura', name: 'Электрическая аура', color: '#ffff00', effectColor: 'rgba(255, 255, 0, 0.6)', chance: 15 },
    { id: 'cosmic_aura', name: 'Космическая аура', color: '#9b59b6', effectColor: 'rgba(155, 89, 182, 0.6)', chance: 9 },
    { id: 'batidao_aura', name: 'Но батидао', color: '#ff0000', effectColor: 'rgba(255, 0, 0, 0.8)', chance: 1, image: 'https://images.genius.com/3849b06fe11fa1c89ba96465b298457c.1000x1000x1.png' }
];

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let playerELO = parseInt(localStorage.getItem('kolblocks_elo')) || 0;
let totalKeys = parseInt(localStorage.getItem('kolblocks_keys')) || 0;
let unlockedSkins = JSON.parse(localStorage.getItem('kolblocks_skins')) || ['default'];
let unlockedAuras = JSON.parse(localStorage.getItem('kolblocks_auras')) || [];
let equippedSkin = localStorage.getItem('kolblocks_equipped') || 'default';
let equippedAura = localStorage.getItem('kolblocks_equipped_aura') || null;
let roundCoins = 0, roundDamage = 0;

let batidaoImage = null;
let activeAuraEffect = null; // Для отслеживания активного эффекта ауры
let gameLoopId = null; // ID для requestAnimationFrame

// ==================== АУДИО ====================
const AudioSys = {
    ctx: null, enabled: true,
    init() { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { console.log('Web Audio not supported'); this.enabled = false; } },
    play(frequency, duration, type = 'square', volume = 0.1, decay = 0.1) {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.frequency.value = frequency; osc.type = type;
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration * decay);
        osc.start(this.ctx.currentTime); osc.stop(this.ctx.currentTime + duration);
    },
    jump() { this.play(440, 0.15, 'sine', 0.15); },
    meleeSwing() { this.play(380, 0.12, 'sawtooth', 0.2); },
    hit() { this.play(220, 0.2, 'sawtooth', 0.2, 0.3); },
    collect() { this.play(660, 0.1, 'sine', 0.12); },
    combo() { this.play(523, 0.12, 'sine', 0.15); },
    dash() { this.play(330, 0.1, 'triangle', 0.1); },
    checkpoint() { this.play(784, 0.3, 'sine', 0.2); },
    levelComplete() { [523, 659, 784, 1047].forEach((freq, i) => setTimeout(() => this.play(freq, 0.2, 'sine', 0.15), i * 100)); },
    bossSpawn() { [200, 250, 300, 250, 200].forEach((freq, i) => setTimeout(() => this.play(freq, 0.3, 'sawtooth', 0.2, 0.5), i * 100)); },
    bossHit() { this.play(150, 0.3, 'sawtooth', 0.25, 0.4); },
    bossDefeat() { [400, 500, 600, 800, 1000].forEach((freq, i) => setTimeout(() => this.play(freq, 0.4, 'square', 0.2), i * 150)); },
    gameOver() { [392, 349, 294, 262].forEach((freq, i) => setTimeout(() => this.play(freq, 0.3, 'sawtooth', 0.15, 0.5), i * 150)); },
    eloGain() { this.play(880, 0.2, 'sine', 0.2); },
    eloLoss() { this.play(200, 0.25, 'sawtooth', 0.15); },
    chestOpen() { [300, 450, 600, 900].forEach((f, i) => setTimeout(() => this.play(f, 0.15, 'square', 0.15), i * 80)); }
};

// ==================== ПУЛ ЧАСТИЦ ====================
class Particle {
    constructor(x, y, color) { this.reset(x, y, color); }
    reset(x, y, color) {
        this.x = x; this.y = y; this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 8 - 4; this.speedY = Math.random() * 8 - 4;
        this.color = color; this.life = 20 + Math.random() * 15; this.maxLife = this.life; this.active = true; return this;
    }
    update() { if (!this.active) return; this.x += this.speedX; this.y += this.speedY; this.speedY += 0.1; this.life--; this.size *= 0.96; if (this.life <= 0) this.active = false; }
    draw(ctx, cameraX) { if (!this.active) return; ctx.globalAlpha = this.life / this.maxLife; ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x - cameraX, this.y, this.size, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
}
class ObjectPool {
    constructor(createFn, maxSize = 500) { this.createFn = createFn; this.maxSize = maxSize; this.pool = []; this.active = []; }
    acquire(...args) { let obj = this.pool.pop(); if (!obj) obj = this.createFn(...args); obj.active = true; this.active.push(obj); return obj; }
    release(obj) { obj.active = false; const idx = this.active.indexOf(obj); if (idx > -1) this.active.splice(idx, 1); if (this.pool.length < this.maxSize) this.pool.push(obj); }
    releaseAll() { while (this.active.length > 0) this.release(this.active[0]); }
    get activeObjects() { return [...this.active]; }
}

// ==================== ТЕКСТУРЫ БОССОВ ====================
const bossTextures = { images: [], loaded: false, specialUrls: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbYIgWMe7urZ16o6fTz7OwE8IC6cakgU56rA&s','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg-WbZgPhjpjzrCi5jb0S3qJGJgSYway6EAQ&s','https://img07.rl0.ru/afisha/e1200x1200i/daily.afisha.ru/uploads/images/d/c5/dc57d49aef5e0a0bb334b47df0fff5c3.jpg','https://i.pinimg.com/736x/e2/ff/4a/e2ff4ab2a6496ba0632d23833569339d.jpg'],
    load() { return new Promise((resolve) => { let loadedCount = 0; const totalImages = this.specialUrls.length; this.specialUrls.forEach((url, index) => { const img = new Image(); img.crossOrigin = "anonymous"; img.onload = () => { loadedCount++; if (loadedCount === totalImages) { this.loaded = true; resolve(); } }; img.onerror = () => { loadedCount++; if (loadedCount === totalImages) { this.loaded = true; resolve(); } }; img.src = url; this.images[index] = img; }); }); },
    getRandomTexture(colors) { if (Math.random() < 0.7) return { type: 'color', color: colors[Math.floor(Math.random() * colors.length)] }; else { const specialIndex = Math.floor(Math.random() * this.images.length); return { type: 'image', image: this.images[specialIndex] || null }; } }
};

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ИГРЫ ====================
const canvas = document.getElementById('gameCanvas'), ctx = canvas.getContext('2d');
let particlePool; let platforms = [], enemies = [], flyingEnemies = [], coins = [], powerUps = [];
let player, cameraX = 0, keys = {}, gameRunning = true, levelWidth = 0;
let currentLevel = 1, score = 0, playerHealth = 100, maxHealth = 100;
let comboCount = 1, maxCombo = 1, comboTimer = 0, comboMultiplier = 1;
let screenShake = 0, shakeIntensity = 0, lastCheckpointX = 0, boss = null, bossesDefeated = 0;
let levelKeys = [];

const platformTextures = [ {color: '#FF2E63', pattern: 'stripes'}, {color: '#08D9D6', pattern: 'dots'}, {color: '#FFDE7D', pattern: 'checker'}, {color: '#6A2C70', pattern: 'zigzag'}, {color: '#4ECDC4', pattern: 'bricks'}, {color: '#FF9A76', pattern: 'waves'} ];
const enemyColors = ['#FF2E63', '#FFDE7D', '#6A2C70', '#08D9D6', '#AA00FF'], flyingEnemyColors = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF6600'];

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function resizeCanvas(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
function updateHealthBar(){document.getElementById('healthFill').style.width=`${(playerHealth/maxHealth)*100}%`;}
function updateBossHealth(){if(boss){const percent=(boss.health/boss.maxHealth)*100;document.getElementById('bossHealthFill').style.width=`${percent}%`;}}
function updateUI(){document.getElementById('levelDisplay').textContent=currentLevel;document.getElementById('scoreDisplay').textContent=score;document.getElementById('comboCount').textContent=`x${comboCount}`;document.getElementById('eloValue').textContent = Math.floor(playerELO);}
function addScore(points){score+=Math.floor(points*comboMultiplier);updateUI();}
function updateCombo(){comboCount++;comboTimer=CONFIG.combat.comboDecay;comboMultiplier=1+(comboCount-1)*0.1;maxCombo=Math.max(maxCombo,comboCount);const cd=document.getElementById('comboDisplay');cd.classList.add('active');document.getElementById('comboValue').textContent=comboCount;setTimeout(()=>cd.classList.remove('active'),1000);if(comboCount>=5)AudioSys.combo();}
function decayCombo(){if(comboTimer>0){comboTimer--;if(comboTimer<=0){comboCount=1;comboMultiplier=1;updateUI();}}}
function shakeScreen(intensity){screenShake=20;shakeIntensity=intensity;}
function updateDashIndicator(){const dots=document.querySelectorAll('.dash-dot');dots.forEach((dot,i)=>{dot.classList.toggle('active',i<player.dashCharges);});}
function showCheckpointIndicator(){const ci=document.getElementById('checkpointIndicator');ci.classList.add('active');setTimeout(()=>ci.classList.remove('active'),2000);}

// ==================== СИСТЕМА ELO ====================
function updateEloDisplay() { document.getElementById('eloValue').textContent = Math.floor(playerELO); }
function showEloChange(change) {
    const el = document.createElement('div');
    el.className = 'elo-change ' + (change >= 0 ? 'positive' : 'negative');
    el.textContent = (change >= 0 ? '+' : '') + Math.floor(change);
    document.body.appendChild(el);
    if (change >= 0) AudioSys.eloGain(); else AudioSys.eloLoss();
    setTimeout(() => el.remove(), 1500);
}
function calculateEloChange() {
    const coinsBonus = Math.floor(roundCoins * CONFIG.elo.coinsMultiplier);
    const damagePenalty = Math.floor(roundDamage / CONFIG.elo.damageDivider);
    const change = coinsBonus - damagePenalty;
    playerELO = Math.max(0, playerELO + change);
    saveAllData();
    return { change, coinsBonus, damagePenalty };
}

// ==================== МАГАЗИН И СКИНЫ ====================
function getSkinData(id) {
    const all = [{id:'default',name:'Стандарт',color:'#4af626'}, ...CHEST_SKINS];
    return all.find(s=>s.id===id) || all[0];
}

function getAuraData(id) {
    if (!id) return null;
    return AURA_SKINS.find(a=>a.id===id) || null;
}

function saveAllData() {
    localStorage.setItem('kolblocks_elo', playerELO);
    localStorage.setItem('kolblocks_keys', totalKeys);
    localStorage.setItem('kolblocks_skins', JSON.stringify(unlockedSkins));
    localStorage.setItem('kolblocks_auras', JSON.stringify(unlockedAuras));
    localStorage.setItem('kolblocks_equipped', equippedSkin);
    localStorage.setItem('kolblocks_equipped_aura', equippedAura || '');
}

function openShop() {
    gameRunning = false;
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    document.getElementById('pauseMenu').style.display = 'none';
    document.getElementById('caseShopScreen').style.display = 'flex';
    document.getElementById('shopKeyCount').textContent = totalKeys;
    renderSkins();
    renderAuras();
}

function closeShop() {
    document.getElementById('caseShopScreen').style.display = 'none';
    gameRunning = true;
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    gameLoop();
}

function renderSkins() {
    const g = document.getElementById('skinsGrid'); g.innerHTML = '';
    const all = [{id:'default',name:'Стандарт',color:'#4af626'}, ...CHEST_SKINS];
    all.forEach(s => {
        const u = unlockedSkins.includes(s.id), e = equippedSkin === s.id;
        const d = document.createElement('div'); d.className = 'skin-item ' + (e ? 'equipped' : '') + (!u ? 'locked' : '');
        d.innerHTML = '<div class="skin-preview" style="background:' + (u ? s.color : '#333') + '"></div><span class="skin-name">' + s.name + '</span><button class="equip-btn" onclick="equipSkin(\'' + s.id + '\')" ' + (!u || e ? 'disabled' : '') + '>' + (e ? '✓ Выбран' : 'Выбрать') + '</button>';
        g.appendChild(d);
    });
}

function renderAuras() {
    const g = document.getElementById('aurasGrid'); g.innerHTML = '';
    if (unlockedAuras.length === 0) {
        g.innerHTML = '<div style="color:#aaa; text-align:center; grid-column:1/-1;">Нет аур. Открывайте кейс с аурой за 12 🔑!</div>';
        return;
    }
    AURA_SKINS.forEach(a => {
        const u = unlockedAuras.includes(a.id), e = equippedAura === a.id;
        const d = document.createElement('div'); 
        d.className = 'skin-item ' + (e ? 'equipped' : '') + (!u ? 'locked' : '');
        d.innerHTML = '<div class="skin-preview" style="background:' + (u ? a.color : '#333') + '; box-shadow:0 0 10px ' + (u ? a.color : '#333') + ';"></div><span class="skin-name">' + a.name + '</span><button class="equip-btn" onclick="equipAura(\'' + a.id + '\')" ' + (!u || e ? 'disabled' : '') + '>' + (e ? '✓ Активирована' : 'Активировать') + '</button>';
        g.appendChild(d);
    });
}

function equipSkin(id) {
    if (unlockedSkins.includes(id)) { equippedSkin = id; saveAllData(); renderSkins(); }
}

function equipAura(id) {
    if (unlockedAuras.includes(id)) { 
        equippedAura = equippedAura === id ? null : id; 
        saveAllData(); 
        renderAuras(); 
    }
}

// Исправленная функция открытия обычного кейса
function openChest() {
    if (totalKeys < 10) { alert('Нужно минимум 10 ключей!'); return; }
    totalKeys -= 10; saveAllData(); document.getElementById('shopKeyCount').textContent = totalKeys;
    const btn = document.getElementById('openChestBtn'), chest = document.getElementById('chestVisual');
    btn.disabled = true; chest.classList.add('shaking'); AudioSys.chestOpen();
    setTimeout(() => {
        chest.classList.remove('shaking');
        
        // Исправленная логика выпадения скина
        let roll = Math.random() * 100;
        let cumulative = 0;
        let drop = null;
        
        for (let s of CHEST_SKINS) {
            cumulative += s.chance;
            if (roll < cumulative) {
                drop = s;
                break;
            }
        }
        
        // Защита от undefined
        if (!drop) drop = CHEST_SKINS[0];
        
        const has = unlockedSkins.includes(drop.id);
        
        // Проверка: если у игрока уже есть все скины, возвращаем ключи
        const allSkinsUnlocked = CHEST_SKINS.every(skin => unlockedSkins.includes(skin.id));
        
        if (allSkinsUnlocked) {
            // У игрока уже есть все скины - возвращаем ключи
            totalKeys += 10;
            saveAllData();
            document.getElementById('shopKeyCount').textContent = totalKeys;
            showResult('🎁 Все скины собраны!', 'Возврат: +10 🔑', '#FFDE7D');
        } else if (has) {
            // Повторка - возвращаем меньше ключей
            const refund = 3;
            totalKeys += refund;
            saveAllData();
            document.getElementById('shopKeyCount').textContent = totalKeys;
            showResult('🔄 Повторка: ' + drop.name, 'Возврат: +' + refund + ' 🔑', '#aaa');
        } else {
            // Новый скин
            unlockedSkins.push(drop.id);
            saveAllData();
            showResult('✨ Новый скин: ' + drop.name + '!', 'Получен ' + drop.name, drop.color);
        }
        
        btn.disabled = false; renderSkins();
    }, 1200);
}

// Исправленная функция открытия кейса с аурой
function openAuraChest() {
    if (totalKeys < 12) { alert('Нужно минимум 12 🔑 ключей!'); return; }
    totalKeys -= 12; saveAllData(); document.getElementById('shopKeyCount').textContent = totalKeys;
    const btn = document.getElementById('openAuraChestBtn'), chest = document.getElementById('auraChestVisual');
    btn.disabled = true; chest.classList.add('shaking'); AudioSys.chestOpen();
    setTimeout(() => {
        chest.classList.remove('shaking');
        
        // Исправленная логика выпадения ауры
        let roll = Math.random() * 100;
        let cumulative = 0;
        let drop = null;
        
        for (let a of AURA_SKINS) {
            cumulative += a.chance;
            if (roll < cumulative) {
                drop = a;
                break;
            }
        }
        
        // Защита от undefined
        if (!drop) drop = AURA_SKINS[0];
        
        const has = unlockedAuras.includes(drop.id);
        
        // Проверка: если у игрока уже есть все ауры
        const allAurasUnlocked = AURA_SKINS.every(aura => unlockedAuras.includes(aura.id));
        
        if (allAurasUnlocked) {
            // У игрока уже есть все ауры - возвращаем ключи
            totalKeys += 12;
            saveAllData();
            document.getElementById('shopKeyCount').textContent = totalKeys;
            showResult('🎁 Все ауры собраны!', 'Возврат: +12 🔑', '#FFDE7D');
        } else if (has) {
            // Повторка - возвращаем меньше ключей
            const refund = 4;
            totalKeys += refund;
            saveAllData();
            document.getElementById('shopKeyCount').textContent = totalKeys;
            showResult('🔄 Повторка ауры: ' + drop.name, 'Возврат: +' + refund + ' 🔑', '#aaa');
        } else {
            // Новая аура
            unlockedAuras.push(drop.id);
            saveAllData();
            showResult('✨ Новая аура: ' + drop.name + '!', 'Теперь при ударе будет эффект!', drop.color);
        }
        
        btn.disabled = false; renderAuras();
    }, 1200);
}

function showResult(title, text, col) {
    const r = document.getElementById('chestResult');
    document.getElementById('resultTitle').textContent = title; document.getElementById('resultText').textContent = text;
    if (col && r.querySelector('h3')) r.querySelector('h3').style.color = col;
    r.style.display = 'block';
}

function hideResult() { document.getElementById('chestResult').style.display = 'none'; }

// Функция показа эффекта ауры ПРИВЯЗАННАЯ К ИГРОКУ
function showAuraEffectOnPlayer(x, y, aura) {
    // Удаляем старый эффект если есть
    if (activeAuraEffect) {
        activeAuraEffect.remove();
        activeAuraEffect = null;
    }
    
    const effect = document.createElement('div');
    effect.className = 'aura-effect player-aura';
    effect.style.position = 'fixed';
    effect.style.pointerEvents = 'none';
    effect.style.zIndex = '200';
    effect.style.borderRadius = '50%';
    
    if (aura.id === 'batidao_aura' && batidaoImage) {
        effect.style.background = `radial-gradient(circle, ${aura.effectColor} 0%, transparent 70%)`;
        effect.style.backgroundImage = `url(${batidaoImage.src})`;
        effect.style.backgroundSize = 'cover';
        effect.style.backgroundPosition = 'center';
        effect.style.backgroundBlend = 'overlay';
        effect.style.boxShadow = `0 0 50px ${aura.color}, 0 0 100px ${aura.color}`;
        effect.style.animation = 'batidaoAuraPlayer 0.5s ease-out forwards';
        
        // Добавляем красные частицы
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.left = (x + (Math.random() - 0.5) * 180) + 'px';
                particle.style.top = (y + (Math.random() - 0.5) * 180) + 'px';
                particle.style.width = (Math.random() * 8 + 4) + 'px';
                particle.style.height = (Math.random() * 8 + 4) + 'px';
                particle.style.background = `#ff${Math.floor(Math.random() * 55 + 200).toString(16)}00`;
                particle.style.borderRadius = '50%';
                particle.style.boxShadow = `0 0 15px ${aura.color}`;
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '199';
                particle.style.animation = 'particleExplode 0.5s ease-out forwards';
                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), 500);
            }, i * 10);
        }
    } else {
        effect.style.background = `radial-gradient(circle, ${aura.effectColor}, transparent)`;
        effect.style.boxShadow = `0 0 40px ${aura.color}`;
        effect.style.animation = 'auraExpandPlayer 0.4s ease-out forwards';
    }
    
    // Позиционируем эффект относительно игрока
    effect.style.left = (x - 150) + 'px';
    effect.style.top = (y - 150) + 'px';
    effect.style.width = '300px';
    effect.style.height = '300px';
    
    document.body.appendChild(effect);
    activeAuraEffect = effect;
    
    // Удаляем эффект через время
    setTimeout(() => {
        if (activeAuraEffect) {
            activeAuraEffect.remove();
            activeAuraEffect = null;
        }
    }, 500);
}

// Добавляем CSS анимации
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes auraExpandPlayer {
        0% { transform: scale(0.5) translate(0, 0); opacity: 0.8; }
        100% { transform: scale(1.5) translate(0, 0); opacity: 0; }
    }
    @keyframes batidaoAuraPlayer {
        0% { transform: scale(0.3) rotate(0deg); opacity: 1; }
        50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
        100% { transform: scale(1.8) rotate(360deg); opacity: 0; }
    }
    @keyframes particleExplode {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(0) translateY(-60px); opacity: 0; }
    }
    .player-aura {
        transform-origin: center center;
    }
`;
document.head.appendChild(styleSheet);

// Загрузка изображения для ауры "Но батидао"
function loadBatidaoImage() {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => { 
        batidaoImage = img; 
        console.log('Изображение для ауры "Но батидао" загружено');
    };
    img.onerror = () => {
        console.log('Не удалось загрузить изображение, использую стандартный эффект');
        batidaoImage = null;
    };
    img.src = 'https://images.genius.com/3849b06fe11fa1c89ba96465b298457c.1000x1000x1.png';
}

// ==================== ИГРОВЫЕ КЛАССЫ ====================
class Player {
    constructor() { this.reset(); }
    reset() {
        this.width = CONFIG.player.width; this.height = CONFIG.player.height;
        this.x = 100; this.y = 200; this.velX = 0; this.velY = 0; this.jumping = false; this.jumpCount = 0;
        this.color = '#4af626'; this.speed = CONFIG.player.speed; this.jumpPower = CONFIG.player.jumpPower;
        this.gravity = CONFIG.player.gravity; this.friction = CONFIG.player.friction;
        this.trail = []; this.maxTrail = 8; this.invulnerable = 0;
        this.dashCharges = CONFIG.player.maxDashes; this.dashCooldown = 0; this.isDashing = false;
        this.dashTimer = 0; this.dashDirection = 1; this.lastCheckpoint = { x: 100, y: 200 };
        this.meleeCooldown = 0; this.swingEffect = 0;
        return this;
    }
    update(keys) {
        if (this.invulnerable > 0) this.invulnerable--; 
        if (this.dashCooldown > 0) this.dashCooldown--;
        if (this.meleeCooldown > 0) this.meleeCooldown--;
        if (this.swingEffect > 0) this.swingEffect--;
        
        if (!this.isDashing) { this.trail.push({x: this.x, y: this.y}); if (this.trail.length > this.maxTrail) this.trail.shift(); }
        if (this.isDashing) { this.dashTimer--; this.x += CONFIG.player.dashSpeed * this.dashDirection; if (this.dashTimer <= 0) { this.isDashing = false; this.velY = 0; } return; }
        this.velY += this.gravity;
        if (keys['ArrowLeft'] || keys['a'] || keys['ф']) { this.velX = -this.speed; this.dashDirection = -1; }
        else if (keys['ArrowRight'] || keys['d'] || keys['в']) { this.velX = this.speed; this.dashDirection = 1; }
        else { this.velX *= this.friction; }
        if ((keys[' '] || keys['ArrowUp'] || keys['w'] || keys['ц']) && this.jumpCount < 2) {
            if (!this.jumping || CONFIG.player.doubleJump) {
                this.velY = -this.jumpPower; this.jumping = true; this.jumpCount++; this.createJumpParticles(); AudioSys.jump();
                keys[' '] = false; keys['ArrowUp'] = false; keys['w'] = false; keys['ц'] = false;
            }
        }
        if ((keys['Shift'] || keys['shift'] || keys['q'] || keys['й']) && this.dashCharges > 0 && this.dashCooldown <= 0) { this.startDash(); keys['Shift'] = false; keys['shift'] = false; keys['q'] = false; keys['й'] = false; }
        this.x += this.velX; this.y += this.velY;
        this.x = Math.max(cameraX + 50, Math.min(this.x, cameraX + canvas.width - 50 - this.width));
        if (this.y > canvas.height + 200) { this.respawn(); return; }
        this.checkPlatformCollisions();
    }
    startDash() {
        this.isDashing = true; this.dashTimer = CONFIG.player.dashDuration; this.dashCharges--; this.dashCooldown = CONFIG.player.dashCooldown; this.invulnerable = 15; this.velY = 0; AudioSys.dash();
        for (let i = 0; i < 20; i++) particlePool.acquire(this.x + this.width/2 + Math.random()*20 - 10, this.y + this.height/2 + Math.random()*20 - 10, '#FFDE7D');
        updateDashIndicator();
    }
    meleeAttack() {
        if (this.meleeCooldown > 0 || !gameRunning) return;
        this.meleeCooldown = CONFIG.melee.cooldownMax;
        this.swingEffect = 8;
        AudioSys.meleeSwing();
        const centerX = this.x + this.width/2;
        const centerY = this.y + this.height/2;
        
        // Показываем эффект ауры ПРИВЯЗАННЫЙ К ИГРОКУ
        if (equippedAura) {
            const aura = getAuraData(equippedAura);
            if (aura) {
                // Получаем экранные координаты игрока
                const screenX = centerX - cameraX;
                const screenY = centerY;
                showAuraEffectOnPlayer(screenX, screenY, aura);
            }
        }
        
        let hitSomething = false;
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (!e.active) continue;
            const enemyCenterX = e.x + e.width/2, enemyCenterY = e.y + e.height/2;
            const dist = Math.hypot(centerX - enemyCenterX, centerY - enemyCenterY);
            if (dist < CONFIG.melee.radius) {
                if (e.takeDamage()) { enemies = enemies.filter(x => x !== e); }
                hitSomething = true;
                updateCombo();
                this.createHitEffect(enemyCenterX, enemyCenterY);
            }
        }
        for (let i = 0; i < flyingEnemies.length; i++) {
            const fe = flyingEnemies[i];
            if (!fe.active) continue;
            const feCenterX = fe.x + fe.width/2, feCenterY = fe.y + fe.height/2;
            const dist = Math.hypot(centerX - feCenterX, centerY - feCenterY);
            if (dist < CONFIG.melee.radius) {
                if (fe.takeDamage()) { flyingEnemies = flyingEnemies.filter(x => x !== fe); }
                hitSomething = true;
                updateCombo();
                this.createHitEffect(feCenterX, feCenterY);
            }
        }
        if (boss && boss.active) {
            const bossCenterX = boss.x + boss.width/2, bossCenterY = boss.y + boss.height/2;
            const dist = Math.hypot(centerX - bossCenterX, centerY - bossCenterY);
            if (dist < CONFIG.melee.radius + 15) {
                if (boss.takeDamage()) { boss = null; document.getElementById('bossHealthBar').style.display = 'none'; }
                hitSomething = true;
                updateCombo();
                this.createHitEffect(bossCenterX, bossCenterY);
                AudioSys.bossHit();
            }
        }
        if (hitSomething) {
            for (let i = 0; i < 25; i++) particlePool.acquire(centerX + (Math.random() - 0.5)*40, centerY + (Math.random() - 0.5)*40, '#ffaa33');
            shakeScreen(3);
        }
    }
    createHitEffect(x, y) { for (let i = 0; i < 15; i++) particlePool.acquire(x + (Math.random() - 0.5)*20, y + (Math.random() - 0.5)*20, '#ff5500'); }
    createJumpParticles() { for (let i = 0; i < 12; i++) particlePool.acquire(this.x + this.width/2, this.y + this.height, '#4af626'); }
    createLandParticles() { for (let i = 0; i < 8; i++) particlePool.acquire(this.x + this.width/2, this.y + this.height, '#08D9D6'); }
    checkPlatformCollisions() {
        let onGround = false;
        for (let platform of platforms) {
            if (this.checkCollision(platform)) {
                if (this.velY > 0 && this.y + this.height - this.velY <= platform.y + 10) {
                    this.y = platform.y - this.height; this.velY = 0;
                    if (this.jumping) { this.createLandParticles(); this.jumping = false; }
                    this.jumpCount = 0; onGround = true;
                    if (platform.type === 'breaking' && !platform.broken) platform.breakTimer = 60;
                }
            }
        }
        if (onGround) this.jumpCount = 0;
    }
    checkCollision(obj) { return this.x < obj.x + obj.width && this.x + this.width > obj.x && this.y < obj.y + obj.height && this.y + this.height > obj.y; }
    takeDamage(amount, knockbackX, knockbackY, color) {
        if (this.invulnerable > 0 || this.isDashing) return false;
        playerHealth = Math.max(0, playerHealth - amount); updateHealthBar(); this.knockback(knockbackX, knockbackY);
        this.invulnerable = 45; AudioSys.hit();
        roundDamage += amount;
        for (let i = 0; i < 15; i++) particlePool.acquire(this.x + this.width/2, this.y + this.height/2, color || '#ff2e63');
        if (playerHealth <= 0) { gameOver(); return true; } return false;
    }
    knockback(x, y) { this.velX = x; this.velY = y; this.jumping = true; }
    respawn() { this.takeDamage(30); this.x = this.lastCheckpoint.x; this.y = this.lastCheckpoint.y; this.velX = 0; this.velY = 0; this.jumping = false; this.jumpCount = 0; this.invulnerable = 90; for (let i = 0; i < 25; i++) particlePool.acquire(this.x + this.width/2, this.y + this.height/2, '#FF2E63'); shakeScreen(5); }
    saveCheckpoint() { this.lastCheckpoint = { x: this.x, y: this.y }; showCheckpointIndicator(); AudioSys.checkpoint(); }
    draw(ctx, cameraX) {
        const skin = getSkinData(equippedSkin);
        
        for (let i = 0; i < this.trail.length; i++) { ctx.globalAlpha = i / this.trail.length * 0.25; ctx.fillStyle = this.isDashing ? '#FFDE7D' : skin.color; ctx.fillRect(this.trail[i].x - cameraX, this.trail[i].y, this.width, this.height); }
        ctx.globalAlpha = 1; ctx.fillStyle = skin.color; const drawX = this.x - cameraX;
        
        if (this.isDashing) { ctx.shadowColor = skin.color; ctx.shadowBlur = 20; ctx.fillRect(drawX, this.y, this.width, this.height); ctx.shadowBlur = 0; }
        else { ctx.fillRect(drawX, this.y, this.width, this.height); }
        ctx.fillStyle = '#222'; ctx.fillRect(drawX + 10, this.y + 10, 8, 8); ctx.fillRect(drawX + 22, this.y + 10, 8, 8); ctx.fillRect(drawX + 10, this.y + 25, 20, 4);
        ctx.strokeStyle = this.invulnerable > 0 && Math.floor(this.invulnerable/4)%2===0 ? '#fff' : skin.color; ctx.lineWidth = 2; ctx.strokeRect(drawX, this.y, this.width, this.height);
        if (['magma','royal'].includes(skin.id)) { ctx.shadowColor = skin.color; ctx.shadowBlur = 15; ctx.strokeRect(drawX, this.y, this.width, this.height); ctx.shadowBlur = 0; }
        if (this.swingEffect > 0) {
            ctx.beginPath(); ctx.arc(drawX + this.width/2, this.y + this.height/2, CONFIG.melee.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 80, 40, ${0.3 * (this.swingEffect / 8)})`; ctx.fill();
            ctx.beginPath(); ctx.arc(drawX + this.width/2, this.y + this.height/2, CONFIG.melee.radius - 10, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 200, 0, 0.5)`; ctx.fill();
        }
        if (this.jumpCount === 1 && !this.jumping) { ctx.fillStyle = 'rgba(8, 217, 214, 0.7)'; ctx.beginPath(); ctx.arc(drawX + this.width/2, this.y - 8, 5, 0, Math.PI*2); ctx.fill(); }
    }
}

class Boss { 
    constructor(x,y) { this.x=x;this.y=y;this.width=80;this.height=80;this.maxHealth=CONFIG.boss.health+Math.floor(currentLevel/5)*5;this.health=this.maxHealth;this.speed=CONFIG.boss.moveSpeed;this.direction=1;this.attackCooldown=0;this.active=true;this.texture=bossTextures.getRandomTexture(enemyColors);this.phase=0;this.movePhase=0;this.shootPattern=0;this.color=this.texture.type==='color'?this.texture.color:'#ff0000';}
    update(){if(!this.active)return;this.movePhase+=0.02;this.attackCooldown--;if(Math.abs(this.x-player.x)>200){this.x+=this.speed*this.direction;if(this.x<cameraX+100||this.x>cameraX+canvas.width-100-this.width)this.direction*=-1;}this.y+=Math.sin(this.movePhase)*2;if(this.attackCooldown<=0){this.performAttack();this.attackCooldown=CONFIG.boss.attackCooldown-(currentLevel*2);}if(player.checkCollision(this)){if(player.takeDamage(CONFIG.boss.damage,this.x<player.x?15:-15,-10,'#ff0000'))return;}}
    performAttack(){this.shootPattern=(this.shootPattern+1)%3;switch(this.shootPattern){case 0:for(let i=0;i<15;i++)particlePool.acquire(this.x+this.width/2,this.y+this.height/2,'#ff0000');break;case 1:for(let i=-1;i<=1;i++)particlePool.acquire(this.x+this.width/2,this.y+this.height/2,0,4,10,'#ff6600',false);break;case 2:for(let i=0;i<8;i++){const angle=(i/8)*Math.PI*2;particlePool.acquire(this.x+this.width/2,this.y+this.height/2,Math.cos(angle)*6,Math.sin(angle)*6,8,'#ff0000');}break;}for(let i=0;i<15;i++)particlePool.acquire(this.x+this.width/2,this.y+this.height/2,'#ff0000');}
    takeDamage(){this.health--;AudioSys.bossHit();for(let i=0;i<10;i++)particlePool.acquire(this.x+Math.random()*this.width,this.y+Math.random()*this.height,'#ff0000');if(this.health<=0){this.defeat();return true;}updateBossHealth();return false;}
    defeat(){this.active=false;AudioSys.bossDefeat();bossesDefeated++;for(let i=0;i<100;i++)particlePool.acquire(this.x+this.width/2,this.y+this.height/2,this.color);addScore(5000*comboMultiplier);updateCombo();document.getElementById('bossHealthBar').style.display='none';if(Math.random()<0.8)powerUps.push({x:this.x+this.width/2,y:this.y+this.height/2,size:20,color:'#FF2E63',type:'health'});if(Math.random()<0.5)powerUps.push({x:this.x+this.width/2+40,y:this.y+this.height/2,size:20,color:'#FFDE7D',type:'dash'});shakeScreen(10);}
    draw(ctx){if(!this.active)return;const drawX=this.x-cameraX;ctx.shadowColor='#ff0000';ctx.shadowBlur=30;if(this.texture.type==='image'&&this.texture.image){try{ctx.drawImage(this.texture.image,drawX,this.y,this.width,this.height);}catch(e){ctx.fillStyle=this.color;ctx.fillRect(drawX,this.y,this.width,this.height);}}else{ctx.fillStyle=this.color;ctx.fillRect(drawX,this.y,this.width,this.height);ctx.fillStyle='rgba(0,0,0,0.3)';for(let i=0;i<this.width;i+=20)for(let j=0;j<this.height;j+=20)if((i/20+j/20)%2===0)ctx.fillRect(drawX+i,this.y+j,20,20);}ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(drawX+25,this.y+30,10,0,Math.PI*2);ctx.arc(drawX+55,this.y+30,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#000';ctx.beginPath();ctx.arc(drawX+25+(this.direction*3),this.y+30,5,0,Math.PI*2);ctx.arc(drawX+55+(this.direction*3),this.y+30,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#000';ctx.fillRect(drawX+20,this.y+55,40,10);ctx.fillStyle='#ff6600';ctx.beginPath();ctx.moveTo(drawX+10,this.y+20);ctx.lineTo(drawX,this.y);ctx.lineTo(drawX+20,this.y+15);ctx.fill();ctx.beginPath();ctx.moveTo(drawX+70,this.y+20);ctx.lineTo(drawX+80,this.y);ctx.lineTo(drawX+60,this.y+15);ctx.fill();if(this.health<this.maxHealth*0.3&&Math.floor(Date.now()/200)%2===0){ctx.strokeStyle='#ff0000';ctx.lineWidth=4;ctx.strokeRect(drawX-5,this.y-5,this.width+10,this.height+10);}}
}

class Enemy { 
    constructor(x,y,type=0){this.x=x;this.y=y;this.width=40;this.height=40;this.type=type;this.color=enemyColors[Math.floor(Math.random()*enemyColors.length)];this.speed=type===0?0:type===1?1+Math.random()*2:0;this.direction=Math.random()>0.5?1:-1;this.shootCooldown=0;this.patrolRange=100+Math.random()*200;this.startX=x;this.jumpCooldown=0;this.health=CONFIG.enemies.baseHealth[type===0?'shooter':type===1?'patrol':'jumper'];this.maxHealth=this.health;this.scoreValue=CONFIG.enemies.baseScore[type===0?'shooter':type===1?'patrol':'jumper'];this.texture=Math.floor(Math.random()*3);this.active=true;}
    update(){if(!this.active)return;if(this.type===1){this.x+=this.speed*this.direction;if(Math.abs(this.x-this.startX)>this.patrolRange)this.direction*=-1;}if(this.type===2&&this.jumpCooldown<=0){let onPlatform=false;for(let p of platforms){if(this.x<p.x+p.width&&this.x+this.width>p.x&&this.y+this.height>p.y&&this.y+this.height<p.y+30){onPlatform=true;break;}}if(onPlatform){const dir=player.x>this.x?1:-1;this.y-=12+Math.random()*4;this.x+=dir*(8+Math.random()*4);this.jumpCooldown=60+Math.random()*120;}}this.jumpCooldown--;this.y+=0.8;for(let platform of platforms){if(this.x<platform.x+platform.width&&this.x+this.width>platform.x&&this.y+this.height>platform.y&&this.y+this.height<platform.y+30){this.y=platform.y-this.height;if(this.type===1&&(this.x<=platform.x+5||this.x+this.width>=platform.x+platform.width-5))this.direction*=-1;}}}
    takeDamage(){this.health--;if(this.health<=0){this.destroy();return true;}return false;}
    destroy(){this.active=false;addScore(this.scoreValue*comboMultiplier);updateCombo();AudioSys.collect();for(let i=0;i<20;i++)particlePool.acquire(this.x+this.width/2,this.y+this.height/2,this.color);if(Math.random()<0.35)coins.push({x:this.x+this.width/2,y:this.y+this.height/2,size:12,color:'#FFDE7D',bounce:0});if(Math.random()<0.12)powerUps.push({x:this.x+this.width/2,y:this.y+this.height/2,size:15,color:'#FF2E63',type:'health'});}
    draw(ctx){if(!this.active)return;ctx.fillStyle=this.color;ctx.fillRect(this.x-cameraX,this.y,this.width,this.height);ctx.fillStyle='rgba(0,0,0,0.25)';if(this.texture===0){for(let i=0;i<this.width;i+=15)ctx.fillRect(this.x-cameraX+i,this.y,8,this.height);}else if(this.texture===1){for(let i=0;i<this.width;i+=10)for(let j=0;j<this.height;j+=10)if((Math.floor(i/10)+Math.floor(j/10))%2===0)ctx.fillRect(this.x-cameraX+i,this.y+j,10,10);}else{ctx.beginPath();ctx.arc(this.x-cameraX+this.width/2,this.y+this.height/2,this.width/4,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#000';ctx.fillRect(this.x-cameraX+10,this.y+10,8,8);ctx.fillRect(this.x-cameraX+this.width-18,this.y+10,8,8);ctx.fillStyle=this.type===0?'#ff0000':this.type===1?'#0088ff':'#ffff00';ctx.fillRect(this.x-cameraX,this.y,this.width,5);if(this.health<this.maxHealth){ctx.fillStyle='#4af626';ctx.fillRect(this.x-cameraX,this.y-8,(this.width*this.health)/this.maxHealth,4);}}
}

class FlyingEnemy { 
    constructor(x,y){this.x=x;this.y=y;this.originalY=y;this.width=35;this.height=35;this.color=flyingEnemyColors[Math.floor(Math.random()*flyingEnemyColors.length)];this.speed=1.5+Math.random()*1.5;this.direction=Math.random()>0.5?1:-1;this.health=2;this.maxHealth=2;this.wingPhase=0;this.floatAmplitude=20+Math.random()*30;this.floatSpeed=0.05+Math.random()*0.03;this.floatPhase=Math.random()*Math.PI*2;this.chargeCooldown=0;this.isCharging=false;this.chargeDirection=0;this.active=true;} 
    update(){if(!this.active)return;this.wingPhase+=0.2;this.floatPhase+=this.floatSpeed;this.y=this.originalY+Math.sin(this.floatPhase)*this.floatAmplitude;this.x+=this.speed*this.direction;if(this.x<cameraX-50||this.x>cameraX+canvas.width+50)this.direction*=-1;if(!this.isCharging){this.chargeCooldown--;if(this.chargeCooldown<=0){const dx=player.x-this.x,dy=player.y-this.y;if(Math.sqrt(dx*dx+dy*dy)<300){this.isCharging=true;this.chargeDirection=dx>0?1:-1;this.chargeCooldown=120+Math.random()*120;}}}else{this.x+=8*this.chargeDirection;this.y+=(player.y-this.y)*0.1;if(Math.abs(player.x-this.x)<50||this.x<cameraX-100||this.x>cameraX+canvas.width+100){this.isCharging=false;this.chargeCooldown=60+Math.random()*60;}}} 
    takeDamage(){this.health--;if(this.health<=0){this.destroy();return true;}return false;} 
    destroy(){this.active=false;addScore(200*comboMultiplier);updateCombo();AudioSys.collect();for(let i=0;i<30;i++)particlePool.acquire(this.x+this.width/2,this.y+this.height/2,this.color);if(Math.random()<0.5)coins.push({x:this.x+this.width/2,y:this.y+this.height/2,size:12,color:'#FFDE7D',bounce:0});if(Math.random()<0.3)powerUps.push({x:this.x+this.width/2,y:this.y+this.height/2,size:15,color:'#FF2E63',type:'health'});} 
    draw(ctx){if(!this.active)return;ctx.fillStyle=this.color;ctx.fillRect(this.x-cameraX,this.y,this.width,this.height);ctx.fillStyle=this.color+'80';const wy=this.y+this.height/2,wa=Math.sin(this.wingPhase)*10;ctx.beginPath();ctx.moveTo(this.x-cameraX-15,wy);ctx.quadraticCurveTo(this.x-cameraX-25,wy-wa,this.x-cameraX-15,wy);ctx.fill();ctx.beginPath();ctx.moveTo(this.x-cameraX+this.width+15,wy);ctx.quadraticCurveTo(this.x-cameraX+this.width+25,wy-wa,this.x-cameraX+this.width+15,wy);ctx.fill();ctx.fillStyle='#000';ctx.fillRect(this.x-cameraX+8,this.y+8,6,6);ctx.fillRect(this.x-cameraX+21,this.y+8,6,6);if(this.isCharging){ctx.fillStyle='#FF0000';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(this.x-cameraX+this.width/2,this.y-10-i*5,2,0,Math.PI*2);ctx.fill();}}ctx.shadowColor=this.color;ctx.shadowBlur=15;ctx.fillRect(this.x-cameraX,this.y,this.width,this.height);ctx.shadowBlur=0;if(this.health<this.maxHealth){ctx.fillStyle='#4af626';ctx.fillRect(this.x-cameraX,this.y-8,(this.width*this.health)/this.maxHealth,4);}}
}

class Platform { 
    constructor(x,y,width,textureIndex){this.x=x;this.y=y;this.width=width;this.height=25;this.texture=platformTextures[textureIndex];this.hasGlow=Math.random()>0.7;this.glowPhase=Math.random()*Math.PI*2;this.type=Math.random()>0.8?(Math.random()>0.5?'moving':'breaking'):'normal';this.moveDirection=1;this.moveSpeed=1;this.originalX=x;this.breakTimer=0;this.broken=false;} 
    update(){if(this.hasGlow)this.glowPhase+=0.05;if(this.type==='moving'&&!this.broken){this.x+=this.moveSpeed*this.moveDirection;if(Math.abs(this.x-this.originalX)>100)this.moveDirection*=-1;}if(this.type==='breaking'&&this.breakTimer>0){this.breakTimer--;if(this.breakTimer===0){this.broken=true;setTimeout(()=>this.broken=false,3000);}}} 
    draw(ctx){if(this.broken)return;ctx.fillStyle='rgba(0,0,0,0.25)';ctx.fillRect(this.x-cameraX+3,this.y+3,this.width,this.height);ctx.fillStyle=this.texture.color;if(this.type==='breaking'&&this.breakTimer>0)ctx.globalAlpha=Math.sin(Date.now()/100)*0.3+0.7;ctx.fillRect(this.x-cameraX,this.y,this.width,this.height);ctx.globalAlpha=1;ctx.fillStyle='rgba(255,255,255,0.12)';const p=this.texture.pattern;if(p==='stripes'){for(let i=0;i<this.width;i+=30)ctx.fillRect(this.x-cameraX+i,this.y,15,this.height);}else if(p==='dots'){for(let i=6;i<this.width;i+=12)for(let j=6;j<this.height;j+=12){ctx.beginPath();ctx.arc(this.x-cameraX+i,this.y+j,2,0,Math.PI*2);ctx.fill();}}else if(p==='checker'){for(let i=0;i<this.width;i+=8)for(let j=0;j<this.height;j+=8)if((Math.floor(i/8)+Math.floor(j/8))%2===0)ctx.fillRect(this.x-cameraX+i,this.y+j,8,8);}else if(p==='zigzag'){for(let i=0;i<this.width;i+=20){ctx.beginPath();ctx.moveTo(this.x-cameraX+i,this.y+this.height);ctx.lineTo(this.x-cameraX+i+10,this.y);ctx.lineTo(this.x-cameraX+i+20,this.y+this.height);ctx.fill();}}else if(p==='bricks'){for(let i=0;i<this.width;i+=25)for(let j=0;j<this.height;j+=12)if((i/25+j/12)%2===0)ctx.fillRect(this.x-cameraX+i,this.y+j,25,12);}else if(p==='waves'){for(let i=0;i<this.width;i+=30){ctx.beginPath();ctx.moveTo(this.x-cameraX+i,this.y+this.height/2);for(let j=0;j<30;j+=5){const x=this.x-cameraX+i+j,y=this.y+this.height/2+Math.sin(j/30*Math.PI*2)*5;ctx.lineTo(x,y);}ctx.lineTo(this.x-cameraX+i+30,this.y+this.height);ctx.lineTo(this.x-cameraX+i,this.y+this.height);ctx.closePath();ctx.fill();}}if(this.hasGlow){const gi=Math.sin(this.glowPhase)*0.3+0.7;ctx.shadowColor=this.texture.color;ctx.shadowBlur=15*gi;ctx.strokeStyle=this.texture.color;ctx.lineWidth=2;ctx.strokeRect(this.x-cameraX,this.y,this.width,this.height);ctx.shadowBlur=0;}ctx.strokeStyle='rgba(0,0,0,0.25)';ctx.lineWidth=2;ctx.strokeRect(this.x-cameraX,this.y,this.width,this.height);if(this.type==='breaking'){ctx.fillStyle='#ff0000';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(this.x-cameraX+this.width/4+i*(this.width/4),this.y+5,3,0,Math.PI*2);ctx.fill();}}if(this.type==='moving'){ctx.fillStyle='#0088ff';const ac=Math.floor(this.width/30);for(let i=0;i<ac;i++){const ax=this.x-cameraX+15+i*30;ctx.beginPath();ctx.moveTo(ax,this.y+this.height/2);ctx.lineTo(ax+10*this.moveDirection,this.y+10);ctx.lineTo(ax+10*this.moveDirection,this.y+this.height-10);ctx.closePath();ctx.fill();}}
}}

// ==================== ГЕНЕРАЦИЯ УРОВНЯ ====================
function generateLevel(level){ 
    platforms=[]; enemies=[]; flyingEnemies=[]; coins=[]; powerUps=[]; levelKeys=[]; 
    roundCoins=0; roundDamage=0; 
    const minHeight=100,maxHeight=canvas.height-150; 
    const platformCount=CONFIG.level.basePlatforms+Math.floor(level*CONFIG.level.platformGrowth); 
    const enemyCount=CONFIG.level.baseEnemies+Math.floor(level*CONFIG.level.enemyGrowth); 
    const flyingEnemyCount=Math.max(0,Math.floor(level/3)); 
    levelWidth=CONFIG.level.baseWidth+(level-1)*CONFIG.level.widthGrowth; 
    platforms.push(new Platform(80,canvas.height-200,180,0)); 
    let lastX=100,lastY=canvas.height-250,direction=1; 
    for(let i=0;i<platformCount;i++){ 
        const width=70+Math.random()*130,minXGap=120+(level*10),maxXGap=220+(level*15); 
        const x=lastX+minXGap+Math.random()*(maxXGap-minXGap); 
        if(Math.random()>0.6)direction*=-1; 
        const yChange=80+Math.random()*100; 
        let y=Math.max(minHeight,Math.min(maxHeight,lastY+direction*yChange)); 
        platforms.push(new Platform(x,y,width,Math.floor(Math.random()*platformTextures.length))); 
        if(i>2&&i<platformCount-2&&Math.random()<0.4){const cc=Math.floor(Math.random()*3)+1;for(let j=0;j<cc;j++)coins.push({x:x+20+j*25,y:y-30,size:12,color:'#FFDE7D',bounce:Math.random()*Math.PI*2});} 
        lastX=x;lastY=y; 
    } 
    platforms.push(new Platform(levelWidth-200,canvas.height-200,200,5));
    
    const keyPlat = platforms[Math.floor(Math.random() * (platforms.length - 3)) + 2];
    levelKeys.push({x: keyPlat.x + keyPlat.width/2 - 15, y: keyPlat.y - 45, size: 28, collected: false, floatOffset: 0});
    
    const isBossLevel=level%5===0; 
    if(isBossLevel){ 
        for(let i=0;i<Math.floor(enemyCount/2);i++){const pi=Math.floor(Math.random()*(platforms.length-5))+2;const p=platforms[pi];enemies.push(new Enemy(p.x+p.width/2-20,p.y-40,Math.floor(Math.random()*3)));} 
        boss=new Boss(levelWidth-400,canvas.height-350);
        document.getElementById('bossWarning').style.display='flex';
        AudioSys.bossSpawn();
        setTimeout(()=>document.getElementById('bossWarning').style.display='none',2000);
        document.getElementById('bossHealthBar').style.display='block';
        updateBossHealth(); 
    }else{ 
        for(let i=0;i<enemyCount;i++){const pi=Math.floor(Math.random()*(platforms.length-5))+2;const p=platforms[pi];enemies.push(new Enemy(p.x+p.width/2-20,p.y-40,Math.floor(Math.random()*3)));} 
        boss=null;
        document.getElementById('bossHealthBar').style.display='none'; 
    } 
    for(let i=0;i<flyingEnemyCount;i++)flyingEnemies.push(new FlyingEnemy(300+Math.random()*(levelWidth-600),100+Math.random()*200)); 
    for(let i=0;i<Math.floor(level/2)+1;i++){const pi=Math.floor(Math.random()*(platforms.length-10))+5;const p=platforms[pi];powerUps.push({x:p.x+p.width/2,y:p.y-40,size:15,color:'#FF2E63',type:'health'});} 
    for(let cx=800;cx<levelWidth-300;cx+=800)platforms.push(new Platform(cx,canvas.height-180,100,2)); 
    return levelWidth; 
}

// ==================== ИГРОВАЯ ЛОГИКА ====================
function updateCamera(){const targetX=player.x-canvas.width*CONFIG.camera.playerOffset;cameraX+=(targetX-cameraX)*CONFIG.camera.followSpeed;cameraX=Math.max(0,Math.min(cameraX,levelWidth-canvas.width));}
function updateCoins(){for(let i=coins.length-1;i>=0;i--){const c=coins[i];c.bounce+=0.1;c.y+=Math.sin(c.bounce)*0.5;if(player.checkCollision({x:c.x-c.size/2,y:c.y-c.size/2,width:c.size,height:c.size})){addScore(50*comboMultiplier);updateCombo();AudioSys.collect();roundCoins++;for(let j=0;j<15;j++)particlePool.acquire(c.x,c.y,'#FFDE7D');coins.splice(i,1);}}}
function updateKeys(){for(let i=levelKeys.length-1;i>=0;i--){const k=levelKeys[i];if(k.collected)continue;k.floatOffset+=0.06;const ky=k.y+Math.sin(k.floatOffset)*6;if(player.checkCollision({x:k.x,y:ky,width:k.size,height:k.size})){k.collected=true;totalKeys++;saveAllData();AudioSys.collect();for(let j=0;j<20;j++)particlePool.acquire(k.x+k.size/2,ky+k.size/2,'#00BFFF');levelKeys.splice(i,1);}}}
function updatePowerUps(){for(let i=powerUps.length-1;i>=0;i--){const p=powerUps[i];p.y+=Math.sin(Date.now()/500)*0.5;if(player.checkCollision({x:p.x-p.size/2,y:p.y-p.size/2,width:p.size,height:p.size})){if(p.type==='health'){playerHealth=Math.min(maxHealth,playerHealth+30);updateHealthBar();}else if(p.type==='dash'){player.dashCharges=Math.min(CONFIG.player.maxDashes,player.dashCharges+1);updateDashIndicator();}for(let j=0;j<20;j++)particlePool.acquire(p.x,p.y,p.color);AudioSys.collect();powerUps.splice(i,1);}}}
function checkEnemyCollisions(){for(let e of enemies){if(e.active&&player.checkCollision(e)){if(player.takeDamage(20,e.x<player.x?10:-10,-8,e.color))return;}}for(let e of flyingEnemies){if(e.active&&player.checkCollision(e)){if(player.takeDamage(25,e.x<player.x?12:-12,-10,'#FF00FF'))return;}}}
function checkCheckpoints(){if(player.x>lastCheckpointX+800){lastCheckpointX=player.x;player.saveCheckpoint();}}

// ==================== ОТРИСОВКА ====================
function drawBackground(){const grad=ctx.createLinearGradient(0,0,0,canvas.height);grad.addColorStop(0,'#0a0a1a');grad.addColorStop(1,'#000000');ctx.fillStyle=grad;ctx.fillRect(0,0,canvas.width,canvas.height);for(let layer=0;layer<3;layer++){const spd=0.05+layer*0.1,alpha=0.1+layer*0.15,size=1+layer*0.5;ctx.fillStyle=`rgba(255,255,255,${alpha})`;for(let i=0;i<40;i++){const x=(i*67+cameraX*spd)%canvas.width;const y=(i*41+layer*100)%canvas.height;ctx.fillRect(x,y,size,size);}}}
function drawGoal(){const gx=levelWidth-cameraX;if(gx<canvas.width+100&&gx>-100){const grad=ctx.createRadialGradient(gx,canvas.height/2,10,gx,canvas.height/2,180);grad.addColorStop(0,'#4af626aa');grad.addColorStop(1,'#4af62600');ctx.fillStyle=grad;ctx.fillRect(gx-180,0,360,canvas.height);ctx.strokeStyle='#4af626';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,canvas.height);ctx.stroke();const pulse=Math.sin(Date.now()/250)*0.4+0.6;ctx.fillStyle=`rgba(74,246,38,${pulse})`;ctx.font='bold 26px monospace';ctx.textAlign='center';ctx.fillText('🏁 ФИНИШ',gx,canvas.height-45);}}
function drawParticles(){if(!CONFIG.particles.enabled)return;for(let p of particlePool.activeObjects){p.update();p.draw(ctx,cameraX);if(!p.active)particlePool.release(p);}}
function drawCoins(){for(const c of coins){ctx.fillStyle=c.color;ctx.beginPath();ctx.arc(c.x-cameraX,c.y,c.size,0,Math.PI*2);ctx.fill();ctx.fillStyle='#FFFFFF88';ctx.beginPath();ctx.arc(c.x-cameraX-3,c.y-3,c.size/3,0,Math.PI*2);ctx.fill();}}
function drawKeys(){for(const k of levelKeys){if(k.collected)continue;k.floatOffset+=0.06;const ky=k.y+Math.sin(k.floatOffset)*6;ctx.font='26px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor='#00BFFF';ctx.shadowBlur=12;ctx.fillText('🔑',k.x+k.size/2-cameraX,ky+k.size/2);ctx.shadowBlur=0;}}
function drawPowerUps(){for(const p of powerUps){ctx.fillStyle=p.color;ctx.beginPath();if(p.type==='health'){ctx.moveTo(p.x-cameraX,p.y+p.size/2);ctx.bezierCurveTo(p.x-cameraX,p.y,p.x-cameraX-p.size,p.y,p.x-cameraX-p.size,p.y+p.size/2);ctx.bezierCurveTo(p.x-cameraX-p.size,p.y+p.size,p.x-cameraX,p.y+p.size*1.5,p.x-cameraX,p.y+p.size*1.5);ctx.bezierCurveTo(p.x-cameraX,p.y+p.size*1.5,p.x-cameraX+p.size,p.y+p.size,p.x-cameraX+p.size,p.y+p.size/2);ctx.bezierCurveTo(p.x-cameraX+p.size,p.y,p.x-cameraX,p.y,p.x-cameraX,p.y+p.size/2);}else{ctx.arc(p.x-cameraX,p.y,p.size,0,Math.PI*2);}ctx.fill();ctx.shadowColor=p.color;ctx.shadowBlur=10;ctx.fill();ctx.shadowBlur=0;}}

// ==================== ОСНОВНОЙ ЦИКЛ ====================
function gameLoop(){
    if(!gameRunning) return;
    player.update(keys);
    updateCamera();
    updateCoins();
    updateKeys();
    updatePowerUps();
    decayCombo();
    checkEnemyCollisions();
    checkCheckpoints();
    if(boss) boss.update();
    if(player.x>levelWidth-100&&(!boss||!boss.active)){
        completeLevel();
        return;
    }
    if(screenShake>0){
        screenShake--;
        ctx.setTransform(1,0,0,1,(Math.random()-0.5)*shakeIntensity,(Math.random()-0.5)*shakeIntensity);
    }
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawBackground();
    for(let pf of platforms){
        pf.update();
        pf.draw(ctx);
    }
    for(let e of enemies){
        e.update();
        e.draw(ctx);
    }
    for(let e of flyingEnemies){
        e.update();
        e.draw(ctx);
    }
    if(boss) boss.draw(ctx);
    drawKeys();
    drawCoins();
    drawPowerUps();
    drawParticles();
    player.draw(ctx,cameraX);
    drawGoal();
    ctx.setTransform(1,0,0,1,0,0);
    updateDashIndicator();
    gameLoopId = requestAnimationFrame(gameLoop);
}

function completeLevel(){
    gameRunning=false;
    if(gameLoopId) cancelAnimationFrame(gameLoopId);
    AudioSys.levelComplete();
    addScore(1000*currentLevel);
    const eloResult = calculateEloChange();
    document.getElementById('levelScore').textContent=Math.floor(1000*currentLevel*comboMultiplier);
    document.getElementById('maxCombo').textContent=`x${maxCombo}`;
    document.getElementById('coinsCollected').textContent = roundCoins;
    document.getElementById('damageTaken').textContent = roundDamage;
    const eloChangeEl = document.getElementById('eloChangeDisplay');
    eloChangeEl.textContent = (eloResult.change >= 0 ? '+' : '') + eloResult.change;
    eloChangeEl.style.color = eloResult.change >= 0 ? '#4af626' : '#ff2e63';
    document.getElementById('levelComplete').style.display='flex';
    showEloChange(eloResult.change);
    for(let i=0;i<80;i++)particlePool.acquire(player.x+player.width/2,player.y+player.height/2,platformTextures[Math.floor(Math.random()*platformTextures.length)].color);
    setTimeout(()=>{
        document.getElementById('levelComplete').style.display='none';
        currentLevel++;
        generateLevel(currentLevel);
        player.reset();
        playerHealth=maxHealth;
        updateHealthBar();
        cameraX=0;
        comboCount=1;
        comboMultiplier=1;
        maxCombo=1;
        lastCheckpointX=0;
        updateUI();
        updateDashIndicator();
        updateEloDisplay();
        gameRunning=true;
        gameLoop();
    },2500);
}

function gameOver(){
    gameRunning=false;
    if(gameLoopId) cancelAnimationFrame(gameLoopId);
    AudioSys.gameOver();
    document.getElementById('finalScore').textContent=score;
    document.getElementById('finalLevel').textContent=currentLevel-1;
    document.getElementById('finalCombo').textContent=`x${maxCombo}`;
    document.getElementById('bossesDefeated').textContent=bossesDefeated;
    document.getElementById('finalElo').textContent = Math.floor(playerELO);
    document.getElementById('gameOver').style.display='flex';
}

function restartGame(){
    if(gameLoopId) cancelAnimationFrame(gameLoopId);
    document.getElementById('gameOver').style.display='none';
    document.getElementById('pauseMenu').style.display='none';
    document.getElementById('caseShopScreen').style.display='none';
    currentLevel=1;score=0;playerHealth=maxHealth;comboCount=1;maxCombo=1;comboMultiplier=1;lastCheckpointX=0;bossesDefeated=0;
    roundCoins=0;roundDamage=0;
    generateLevel(currentLevel);
    player = new Player();
    cameraX=0;
    updateUI();
    updateHealthBar();
    updateDashIndicator();
    updateEloDisplay();
    document.getElementById('bossHealthBar').style.display='none';
    gameRunning=true;
    gameLoop();
}

// ИСПРАВЛЕННАЯ функция паузы - теперь не создает второй цикл
function togglePause(){
    const pm = document.getElementById('pauseMenu');
    if(pm.style.display === 'flex'){
        pm.style.display = 'none';
        gameRunning = true;
        // Не вызываем gameLoop() повторно, так как он уже работает
        // Просто снимаем паузу
    } else {
        showPauseMenu();
    }
}

function showPauseMenu(){
    gameRunning = false;
    if(gameLoopId) cancelAnimationFrame(gameLoopId);
    document.getElementById('pauseMenu').style.display = 'flex';
}

function performMelee(){
    if(gameRunning && player) player.meleeAttack();
}

// ==================== ОБРАБОТЧИКИ СОБЫТИЙ ====================
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if(e.key === 'v' || e.key === 'V' || e.key === 'м' || e.key === 'М'){
        e.preventDefault();
        performMelee();
    }
    if((e.key === 'p' || e.key === 'P' || e.key === 'Escape')){
        e.preventDefault();
        togglePause();
    }
    if((e.key === 'r' || e.key === 'R') && !gameRunning) restartGame();
});
window.addEventListener('keyup', (e) => { keys[e.key] = false; });
canvas.addEventListener('mousedown', (e) => { if(e.button === 0 && gameRunning){ performMelee(); } });

function setupMobileControls(){
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if(isTouch || window.innerWidth <= 768){
        document.getElementById('mobileControls').style.display = 'flex';
        const bind = (id, key) => {
            const btn = document.getElementById(id);
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[key] = true; });
            btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[key] = false; });
            btn.addEventListener('mousedown', () => keys[key] = true);
            btn.addEventListener('mouseup', () => keys[key] = false);
            btn.addEventListener('mouseleave', () => keys[key] = false);
        };
        bind('btnLeft', 'ArrowLeft');
        bind('btnRight', 'ArrowRight');
        bind('btnJump', ' ');
        bind('btnDash', 'Shift');
        document.getElementById('btnAttack').addEventListener('touchstart', (e) => { e.preventDefault(); performMelee(); });
        document.getElementById('btnAttack').addEventListener('mousedown', () => performMelee());
    }
}

document.getElementById('soundToggle').addEventListener('change', (e) => { CONFIG.audio.enabled = e.target.checked; AudioSys.enabled = e.target.checked; });
document.getElementById('particlesToggle').addEventListener('change', (e) => { CONFIG.particles.enabled = e.target.checked; if(!e.target.checked) particlePool?.releaseAll(); });

async function initGame(){
    resizeCanvas();
    AudioSys.init();
    await bossTextures.load();
    loadBatidaoImage();
    particlePool = new ObjectPool((x,y,c) => new Particle(x,y,c), CONFIG.particles.maxCount);
    let progress = 0;
    const pi = setInterval(() => {
        progress += Math.random() * 15;
        document.getElementById('progressFill').style.width = `${Math.min(progress, 100)}%`;
        if(progress >= 100){
            clearInterval(pi);
            setTimeout(() => {
                document.getElementById('loading').style.opacity = '0';
                setTimeout(() => document.getElementById('loading').style.display = 'none', 500);
            }, 300);
        }
    }, 100);
    generateLevel(currentLevel);
    player = new Player();
    updateUI();
    updateHealthBar();
    updateDashIndicator();
    updateEloDisplay();
    setupMobileControls();
    setTimeout(() => { gameRunning = true; gameLoop(); }, 800);
}

window.addEventListener('load', initGame);
window.addEventListener('resize', () => { resizeCanvas(); if(gameRunning){ generateLevel(currentLevel); player.reset(); cameraX = 0; } });
document.addEventListener('touchmove', (e) => { if(!e.target.closest('#mobileControls')) e.preventDefault(); }, { passive: false });

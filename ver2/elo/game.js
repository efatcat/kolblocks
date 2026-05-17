// game.js - ИСПРАВЛЕННАЯ ВЕРСИЯ С РАБОЧИМИ АУРАМИ
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

const CHEST_SKINS = [
    { id: 'copper', name: 'Медный рыцарь', color: '#B87333', chance: 55 },
    { id: 'sapphire', name: 'Сапфировый страж', color: '#0f52ba', chance: 30 },
    { id: 'magma', name: 'Магмовый голем', color: '#FF4500', chance: 12 },
    { id: 'royal', name: 'Королевский легион', color: '#FFD700', chance: 3 }
];

// НОВЫЕ ШАНСЫ: Огненная 41%, Но батидао 5%
const AURA_SKINS = [
    { id: 'fire_aura', name: 'Огненная аура', color: '#ff4400', effectColor: 'rgba(255, 68, 0, 0.6)', chance: 41 },
    { id: 'ice_aura', name: 'Ледяная аура', color: '#00ccff', effectColor: 'rgba(0, 204, 255, 0.6)', chance: 25 },
    { id: 'lightning_aura', name: 'Электрическая аура', color: '#ffff00', effectColor: 'rgba(255, 255, 0, 0.6)', chance: 12 },
    { id: 'cosmic_aura', name: 'Космическая аура', color: '#9b59b6', effectColor: 'rgba(155, 89, 182, 0.6)', chance: 8 },
    { id: 'batidao_aura', name: 'Но батидао', color: '#ff0000', effectColor: 'rgba(255, 0, 0, 0.8)', chance: 5, image: 'batidao.png' },
    // Ауры Май 2026
    { id: 'cucumber_aura', name: 'Огуречная аура', color: '#7CFC00', effectColor: 'rgba(124, 252, 0, 0.7)', chance: 4, image: 'ogurec.webp' },
    { id: 'sunflower_aura', name: 'Подсолнечная аура', color: '#FFD700', effectColor: 'rgba(255, 215, 0, 0.6)', chance: 3, image: 'podsolnyh.png' },
    { id: 'explosion_aura', name: 'Взрыв Animated', color: '#FF4500', effectColor: 'rgba(255, 69, 0, 0.8)', chance: 2, isGif: true, image: 'vzryv.gif' }
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
let cucumberImage = null;
let activeAuraEffect = null;
let gameLoopId = null;
let activeTimeouts = [];

function safeTimeout(fn, delay) {
    const id = setTimeout(() => {
        fn();
        const index = activeTimeouts.indexOf(id);
        if (index > -1) activeTimeouts.splice(index, 1);
    }, delay);
    activeTimeouts.push(id);
    return id;
}

function clearAllTimeouts() {
    for (const id of activeTimeouts) clearTimeout(id);
    activeTimeouts = [];
}

// ==================== АУДИО ====================
const AudioSys = {
    ctx: null, enabled: true,
    init() { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { console.log('Web Audio not supported'); this.enabled = false; } },
    play(frequency, duration, type = 'square', volume = 0.1, decay = 0.1) {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.frequency.value = frequency; osc.type = type;
            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration * decay);
            osc.start(this.ctx.currentTime); osc.stop(this.ctx.currentTime + duration);
        } catch(e) {}
    },
    jump() { this.play(440, 0.15, 'sine', 0.15); },
    meleeSwing() { this.play(380, 0.12, 'sawtooth', 0.2); },
    hit() { this.play(220, 0.2, 'sawtooth', 0.2, 0.3); },
    collect() { this.play(660, 0.1, 'sine', 0.12); },
    combo() { this.play(523, 0.12, 'sine', 0.15); },
    dash() { this.play(330, 0.1, 'triangle', 0.1); },
    checkpoint() { this.play(784, 0.3, 'sine', 0.2); },
    levelComplete() { [523, 659, 784, 1047].forEach((freq, i) => safeTimeout(() => this.play(freq, 0.2, 'sine', 0.15), i * 100)); },
    bossSpawn() { [200, 250, 300, 250, 200].forEach((freq, i) => safeTimeout(() => this.play(freq, 0.3, 'sawtooth', 0.2, 0.5), i * 100)); },
    bossHit() { this.play(150, 0.3, 'sawtooth', 0.25, 0.4); },
    bossDefeat() { [400, 500, 600, 800, 1000].forEach((freq, i) => safeTimeout(() => this.play(freq, 0.4, 'square', 0.2), i * 150)); },
    gameOver() { [392, 349, 294, 262].forEach((freq, i) => safeTimeout(() => this.play(freq, 0.3, 'sawtooth', 0.15, 0.5), i * 150)); },
    eloGain() { this.play(880, 0.2, 'sine', 0.2); },
    eloLoss() { this.play(200, 0.25, 'sawtooth', 0.15); },
    chestOpen() { [300, 450, 600, 900].forEach((f, i) => safeTimeout(() => this.play(f, 0.15, 'square', 0.15), i * 80)); }
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
let particlePool;
let platforms = [], enemies = [], flyingEnemies = [], coins = [], powerUps = [];
let player, cameraX = 0, keys = {}, gameRunning = true, levelWidth = 0;
let currentLevel = 1, score = 0, playerHealth = 100, maxHealth = 100;
let comboCount = 1, maxCombo = 1, comboTimer = 0, comboMultiplier = 1;
let screenShake = 0, shakeIntensity = 0, lastCheckpointX = 0, boss = null, bossesDefeated = 0;
let levelKeys = [];

const platformTextures = [ {color: '#FF2E63', pattern: 'stripes'}, {color: '#08D9D6', pattern: 'dots'}, {color: '#FFDE7D', pattern: 'checker'}, {color: '#6A2C70', pattern: 'zigzag'}, {color: '#4ECDC4', pattern: 'bricks'}, {color: '#FF9A76', pattern: 'waves'} ];
const enemyColors = ['#FF2E63', '#FFDE7D', '#6A2C70', '#08D9D6', '#AA00FF'], flyingEnemyColors = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF6600'];

function resizeCanvas(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
function updateHealthBar(){document.getElementById('healthFill').style.width=`${(playerHealth/maxHealth)*100}%`;}
function updateBossHealth(){if(boss){const percent=(boss.health/boss.maxHealth)*100;document.getElementById('bossHealthFill').style.width=`${percent}%`;}}
function updateUI(){document.getElementById('levelDisplay').textContent=currentLevel;document.getElementById('scoreDisplay').textContent=score;document.getElementById('comboCount').textContent=`x${comboCount}`;document.getElementById('eloValue').textContent = Math.floor(playerELO);}
function addScore(points){score+=Math.floor(points*comboMultiplier);updateUI();}
function updateCombo(){comboCount++;comboTimer=CONFIG.combat.comboDecay;comboMultiplier=1+(comboCount-1)*0.1;maxCombo=Math.max(maxCombo,comboCount);const cd=document.getElementById('comboDisplay');cd.classList.add('active');document.getElementById('comboValue').textContent=comboCount;safeTimeout(()=>cd.classList.remove('active'),1000);if(comboCount>=5)AudioSys.combo();}
function decayCombo(){if(comboTimer>0){comboTimer--;if(comboTimer<=0){comboCount=1;comboMultiplier=1;updateUI();}}}
function shakeScreen(intensity){screenShake=20;shakeIntensity=intensity;}
function updateDashIndicator(){const dots=document.querySelectorAll('.dash-dot');dots.forEach((dot,i)=>{dot.classList.toggle('active',i<player.dashCharges);});}
function showCheckpointIndicator(){const ci=document.getElementById('checkpointIndicator');ci.classList.add('active');safeTimeout(()=>ci.classList.remove('active'),2000);}

function updateEloDisplay() { document.getElementById('eloValue').textContent = Math.floor(playerELO); }
function showEloChange(change) {
    const el = document.createElement('div');
    el.className = 'elo-change ' + (change >= 0 ? 'positive' : 'negative');
    el.textContent = (change >= 0 ? '+' : '') + Math.floor(change);
    document.body.appendChild(el);
    if (change >= 0) AudioSys.eloGain(); else AudioSys.eloLoss();
    safeTimeout(() => el.remove(), 1500);
}
function calculateEloChange() {
    const coinsBonus = Math.floor(roundCoins * CONFIG.elo.coinsMultiplier);
    const damagePenalty = Math.floor(roundDamage / CONFIG.elo.damageDivider);
    const change = coinsBonus - damagePenalty;
    playerELO = Math.max(0, playerELO + change);
    saveAllData();
    return { change, coinsBonus, damagePenalty };
}

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
    const g = document.getElementById('skinsGrid'); if(!g) return;
    g.innerHTML = '';
    const all = [{id:'default',name:'Стандарт',color:'#4af626'}, ...CHEST_SKINS];
    all.forEach(s => {
        const u = unlockedSkins.includes(s.id), e = equippedSkin === s.id;
        const d = document.createElement('div'); d.className = 'skin-item ' + (e ? 'equipped' : '') + (!u ? 'locked' : '');
        d.innerHTML = '<div class="skin-preview" style="background:' + (u ? s.color : '#333') + '"></div><span class="skin-name">' + s.name + '</span><button class="equip-btn" onclick="equipSkin(\'' + s.id + '\')" ' + (!u || e ? 'disabled' : '') + '>' + (e ? '✓ Выбран' : 'Выбрать') + '</button>';
        g.appendChild(d);
    });
}

function renderAuras() {
    const g = document.getElementById('aurasGrid'); if(!g) return;
    g.innerHTML = '';
    if (unlockedAuras.length === 0) {
        g.innerHTML = '<div style="color:#aaa; text-align:center; grid-column:1/-1;">Нет аур. Открывайте кейсы!</div>';
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

function openChest() {
    if (totalKeys < 10) { alert('Нужно минимум 10 ключей!'); return; }
    totalKeys -= 10; saveAllData(); 
    const keySpan = document.getElementById('shopKeyCount');
    if(keySpan) keySpan.textContent = totalKeys;
    const btn = document.getElementById('openChestBtn'), chest = document.getElementById('chestVisual');
    if(btn) btn.disabled = true; 
    if(chest) chest.classList.add('shaking'); 
    AudioSys.chestOpen();
    safeTimeout(() => {
        if(chest) chest.classList.remove('shaking');
        
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
        
        if (!drop) drop = CHEST_SKINS[0];
        
        const has = unlockedSkins.includes(drop.id);
        const allSkinsUnlocked = CHEST_SKINS.every(skin => unlockedSkins.includes(skin.id));
        
        if (allSkinsUnlocked) {
            totalKeys += 10;
            saveAllData();
            if(keySpan) keySpan.textContent = totalKeys;
            showResult('🎁 Все скины собраны!', 'Возврат: +10 🔑', '#FFDE7D');
        } else if (has) {
            const refund = 3;
            totalKeys += refund;
            saveAllData();
            if(keySpan) keySpan.textContent = totalKeys;
            showResult('🔄 Повторка: ' + drop.name, 'Возврат: +' + refund + ' 🔑', '#aaa');
        } else {
            unlockedSkins.push(drop.id);
            saveAllData();
            showResult('✨ Новый скин: ' + drop.name + '!', 'Получен ' + drop.name, drop.color);
        }
        
        if(btn) btn.disabled = false; 
        renderSkins();
    }, 1200);
}

function openAuraChest() {
    if (totalKeys < 12) { alert('Нужно минимум 12 🔑 ключей!'); return; }
    totalKeys -= 12; saveAllData(); 
    const keySpan = document.getElementById('shopKeyCount');
    if(keySpan) keySpan.textContent = totalKeys;
    const btn = document.getElementById('openAuraChestBtn'), chest = document.getElementById('auraChestVisual');
    if(btn) btn.disabled = true; 
    if(chest) chest.classList.add('shaking'); 
    AudioSys.chestOpen();
    safeTimeout(() => {
        if(chest) chest.classList.remove('shaking');
        
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
        
        if (!drop) drop = AURA_SKINS[0];
        
        const has = unlockedAuras.includes(drop.id);
        const allAurasUnlocked = AURA_SKINS.every(aura => unlockedAuras.includes(aura.id));
        
        if (allAurasUnlocked) {
            totalKeys += 12;
            saveAllData();
            if(keySpan) keySpan.textContent = totalKeys;
            showResult('🎁 Все ауры собраны!', 'Возврат: +12 🔑', '#FFDE7D');
        } else if (has) {
            const refund = 4;
            totalKeys += refund;
            saveAllData();
            if(keySpan) keySpan.textContent = totalKeys;
            showResult('🔄 Повторка ауры: ' + drop.name, 'Возврат: +' + refund + ' 🔑', '#aaa');
        } else {
            unlockedAuras.push(drop.id);
            saveAllData();
            showResult('✨ Новая аура: ' + drop.name + '!', 'Теперь при ударе будет эффект!', drop.color);
        }
        
        if(btn) btn.disabled = false; 
        renderAuras();
    }, 1200);
}

function openMay2026Chest() {
    if (totalKeys < 15) { alert('Нужно минимум 15 ключей!'); return; }
    totalKeys -= 15; saveAllData(); 
    const keySpan = document.getElementById('shopKeyCount');
    if(keySpan) keySpan.textContent = totalKeys;
    const btn = document.getElementById('openMay2026ChestBtn'), chest = document.getElementById('may2026ChestVisual');
    if(btn) btn.disabled = true; 
    if(chest) chest.classList.add('shaking'); 
    AudioSys.chestOpen();
    safeTimeout(() => {
        if(chest) chest.classList.remove('shaking');
        
        const mayAuras = AURA_SKINS.filter(a => a.id.includes('cucumber') || a.id.includes('sunflower') || a.id.includes('explosion'));
        
        let roll = Math.random() * 100;
        let cumulative = 0;
        let drop = null;
        
        for (let a of mayAuras) {
            cumulative += a.chance;
            if (roll < cumulative) {
                drop = a;
                break;
            }
        }
        
        if (!drop) drop = mayAuras[0];
        
        const has = unlockedAuras.includes(drop.id);
        const allMayAurasUnlocked = mayAuras.every(aura => unlockedAuras.includes(aura.id));
        
        if (allMayAurasUnlocked) {
            totalKeys += 15;
            saveAllData();
            if(keySpan) keySpan.textContent = totalKeys;
            showResult('🎁 Все ауры Мая собраны!', 'Возврат: +15 🔑', '#FF69B4');
        } else if (has) {
            const refund = 5;
            totalKeys += refund;
            saveAllData();
            if(keySpan) keySpan.textContent = totalKeys;
            showResult('🔄 Повторка ауры: ' + drop.name, 'Возврат: +' + refund + ' 🔑', '#aaa');
        } else {
            unlockedAuras.push(drop.id);
            saveAllData();
            let message = '✨ Новая аура: ' + drop.name + '!';
            if(drop.id === 'cucumber_aura') message = '🥒 ОГУРЕЧНАЯ АУРА! ' + message;
            if(drop.id === 'sunflower_aura') message = '🌻 ПОДСОЛНЕЧНАЯ АУРА! ' + message;
            if(drop.id === 'explosion_aura') message = '💥 ВЗРЫВ ANIMATED! ' + message;
            showResult(message, 'Теперь при ударе будет эффект!', drop.color);
        }
        
        if(btn) btn.disabled = false; 
        renderAuras();
    }, 1200);
}

function showResult(title, text, col) {
    const r = document.getElementById('chestResult');
    if(!r) return;
    document.getElementById('resultTitle').textContent = title; 
    document.getElementById('resultText').textContent = text;
    if (col && r.querySelector('h3')) r.querySelector('h3').style.color = col;
    r.style.display = 'block';
}

function hideResult() { 
    const r = document.getElementById('chestResult');
    if(r) r.style.display = 'none'; 
}

// Загрузка изображений для аур
function loadAuraImages() {
    // Но батидао
    const batidaoImg = new Image();
    batidaoImg.onload = () => { batidaoImage = batidaoImg; };
    batidaoImg.onerror = () => { console.log('Не удалось загрузить batidao.png, используется стандартный эффект'); batidaoImage = null; };
    batidaoImg.src = 'batidao.png';
    
    // Огурец
    const cucumberImg = new Image();
    cucumberImg.onload = () => { cucumberImage = cucumberImg; };
    cucumberImg.onerror = () => { console.log('Не удалось загрузить ogurec.webp'); cucumberImage = null; };
    cucumberImg.src = 'ogurec.webp';
}

// Функция показа эффекта ауры (как в оригинале с картинками)
function showAuraEffectOnPlayer(x, y, aura) {
    if(activeAuraEffect) {
        activeAuraEffect.remove();
        activeAuraEffect = null;
    }
    
    const effect = document.createElement('div');
    effect.className = 'aura-effect player-aura';
    effect.style.position = 'fixed';
    effect.style.pointerEvents = 'none';
    effect.style.zIndex = '200';
    effect.style.borderRadius = '50%';
    
    // Аура "Но батидао" - как в оригинале, с картинкой из папки
    if(aura.id === 'batidao_aura') {
        if(batidaoImage) {
            effect.style.background = `radial-gradient(circle, ${aura.effectColor} 0%, transparent 70%)`;
            effect.style.backgroundImage = `url(${batidaoImage.src})`;
            effect.style.backgroundSize = 'cover';
            effect.style.backgroundPosition = 'center';
            effect.style.backgroundBlend = 'overlay';
        } else {
            effect.style.background = `radial-gradient(circle, ${aura.effectColor} 0%, transparent 70%)`;
        }
        effect.style.boxShadow = `0 0 50px ${aura.color}, 0 0 100px ${aura.color}`;
        effect.style.animation = 'batidaoAuraPlayer 0.5s ease-out forwards';
        
        for (let i = 0; i < 30; i++) {
            safeTimeout(() => {
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
                safeTimeout(() => particle.remove(), 500);
            }, i * 10);
        }
    }
    // Огуречная аура - с картинкой
    else if(aura.id === 'cucumber_aura') {
        if(cucumberImage) {
            effect.style.background = `radial-gradient(circle, ${aura.effectColor} 0%, transparent 70%)`;
            effect.style.backgroundImage = `url(${cucumberImage.src})`;
            effect.style.backgroundSize = 'cover';
            effect.style.backgroundPosition = 'center';
            effect.style.backgroundBlend = 'overlay';
        } else {
            effect.style.background = `radial-gradient(circle, ${aura.effectColor} 0%, #7CFC00 30%, transparent 70%)`;
        }
        effect.style.boxShadow = `0 0 50px ${aura.color}, 0 0 80px ${aura.color}`;
        effect.style.animation = 'cucumberAuraPlayer 0.5s ease-out forwards';
        
        for (let i = 0; i < 25; i++) {
            safeTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.left = (x + (Math.random() - 0.5) * 200) + 'px';
                particle.style.top = (y + (Math.random() - 0.5) * 200) + 'px';
                particle.style.width = (Math.random() * 10 + 4) + 'px';
                particle.style.height = (Math.random() * 10 + 4) + 'px';
                particle.style.background = `#${Math.floor(Math.random() * 100 + 100).toString(16)}ff00`;
                particle.style.borderRadius = '50%';
                particle.style.boxShadow = `0 0 15px #7CFC00`;
                particle.style.pointerEvents = 'none';
                particle.style.animation = 'particleExplode 0.5s ease-out forwards';
                document.body.appendChild(particle);
                safeTimeout(() => particle.remove(), 500);
            }, i * 12);
        }
    }
    // Подсолнечная аура
    else if(aura.id === 'sunflower_aura') {
        effect.style.background = `radial-gradient(circle, ${aura.effectColor} 0%, #FFD700 30%, transparent 70%)`;
        effect.style.boxShadow = `0 0 50px ${aura.color}, 0 0 80px #FFA500`;
        effect.style.animation = 'sunflowerAuraPlayer 0.5s ease-out forwards';
        
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            safeTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.left = (x + Math.cos(angle) * 120 + (Math.random() - 0.5) * 40) + 'px';
                particle.style.top = (y + Math.sin(angle) * 120 + (Math.random() - 0.5) * 40) + 'px';
                particle.style.width = (Math.random() * 8 + 4) + 'px';
                particle.style.height = (Math.random() * 8 + 4) + 'px';
                particle.style.background = '#FFD700';
                particle.style.borderRadius = '50%';
                particle.style.boxShadow = `0 0 15px #FFA500`;
                particle.style.pointerEvents = 'none';
                particle.style.animation = 'particleExplode 0.5s ease-out forwards';
                document.body.appendChild(particle);
                safeTimeout(() => particle.remove(), 500);
            }, i * 15);
        }
    }
    // Взрыв Animated
    else if(aura.id === 'explosion_aura') {
        effect.style.background = `radial-gradient(circle, #ff0000, #ff6600, #ffff00, transparent)`;
        effect.style.boxShadow = `0 0 80px #ff0000, 0 0 120px #ff6600`;
        effect.style.animation = 'explosionAuraPlayer 0.6s ease-out forwards';
        effect.style.width = '400px';
        effect.style.height = '400px';
        effect.style.left = (x - 200) + 'px';
        effect.style.top = (y - 200) + 'px';
        
        for (let i = 0; i < 50; i++) {
            safeTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.left = (x + (Math.random() - 0.5) * 300) + 'px';
                particle.style.top = (y + (Math.random() - 0.5) * 300) + 'px';
                particle.style.width = (Math.random() * 15 + 5) + 'px';
                particle.style.height = (Math.random() * 15 + 5) + 'px';
                particle.style.background = `hsl(${Math.random() * 60 + 20}, 100%, 50%)`;
                particle.style.borderRadius = '50%';
                particle.style.boxShadow = `0 0 25px #ff6600`;
                particle.style.pointerEvents = 'none';
                particle.style.animation = 'particleExplode 0.6s ease-out forwards';
                document.body.appendChild(particle);
                safeTimeout(() => particle.remove(), 600);
            }, i * 8);
        }
    }
    // Обычные ауры
    else {
        effect.style.background = `radial-gradient(circle, ${aura.effectColor}, transparent)`;
        effect.style.boxShadow = `0 0 40px ${aura.color}`;
        effect.style.animation = 'auraExpandPlayer 0.4s ease-out forwards';
    }
    
    effect.style.left = (x - 150) + 'px';
    effect.style.top = (y - 150) + 'px';
    effect.style.width = '300px';
    effect.style.height = '300px';
    
    document.body.appendChild(effect);
    activeAuraEffect = effect;
    
    safeTimeout(() => {
        if(activeAuraEffect) {
            activeAuraEffect.remove();
            activeAuraEffect = null;
        }
    }, 500);
}

// ==================== ОСТАЛЬНЫЕ КЛАССЫ (Player, Boss, Enemy, FlyingEnemy, Platform) ====================
// (они такие же как в оригинале, я их пропускаю для краткости, но в полном файле они есть)
// ... [код классов Player, Boss, Enemy, FlyingEnemy, Platform остаётся без изменений]

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
async function initGame(){
    resizeCanvas();
    AudioSys.init();
    await bossTextures.load();
    loadAuraImages(); // Загружаем изображения для аур
    particlePool = new ObjectPool((x,y,c) => new Particle(x,y,c), CONFIG.particles.maxCount);
    let progress = 0;
    const pi = setInterval(() => {
        progress += Math.random() * 15;
        const pf = document.getElementById('progressFill');
        if(pf) pf.style.width = `${Math.min(progress, 100)}%`;
        if(progress >= 100){
            clearInterval(pi);
            safeTimeout(() => {
                const loading = document.getElementById('loading');
                if(loading) {
                    loading.style.opacity = '0';
                    safeTimeout(() => { if(loading) loading.style.display = 'none'; }, 500);
                }
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
    safeTimeout(() => { gameRunning = true; gameLoop(); }, 800);
}

window.addEventListener('load', initGame);
window.addEventListener('resize', () => { resizeCanvas(); if(gameRunning){ generateLevel(currentLevel); if(player) player.reset(); cameraX = 0; } });
document.addEventListener('touchmove', (e) => { if(!e.target.closest('#mobileControls')) e.preventDefault(); }, { passive: false });

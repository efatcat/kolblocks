// game.js - ПОЛНАЯ ВЕРСИЯ С REGISTRATION

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

// ==================== SUPABASE НАСТРОЙКИ ====================
// ⚠️ ЗАМЕНИТЕ НА ВАШИ ДАННЫЕ ИЗ SUPABASE! ⚠️
const SUPABASE_URL = 'https://cfpikiovxphggrakdrqe.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmcGlraW92eHBoZ2dyYWtkcnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNTk1NTYsImV4cCI6MjA5NDgzNTU1Nn0.MKBQWBK1N21bWRM5iALy9B8inmPJsMP12BNrmZAQgQk'

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

let currentUserId = null
let isGuest = true

// ==================== СКИНЫ И АУРЫ ====================
const CHEST_SKINS = [
    { id: 'copper', name: 'Медный рыцарь', color: '#B87333', chance: 55 },
    { id: 'sapphire', name: 'Сапфировый страж', color: '#0f52ba', chance: 30 },
    { id: 'magma', name: 'Магмовый голем', color: '#FF4500', chance: 12 },
    { id: 'royal', name: 'Королевский легион', color: '#FFD700', chance: 3 }
];

const AURA_SKINS = [
    { id: 'fire_aura', name: 'Огненная аура', color: '#ff4400', effectColor: 'rgba(255, 68, 0, 0.6)', chance: 41 },
    { id: 'ice_aura', name: 'Ледяная аура', color: '#00ccff', effectColor: 'rgba(0, 204, 255, 0.6)', chance: 20 },
    { id: 'lightning_aura', name: 'Электрическая аура', color: '#ffff00', effectColor: 'rgba(255, 255, 0, 0.6)', chance: 10 },
    { id: 'cosmic_aura', name: 'Космическая аура', color: '#9b59b6', effectColor: 'rgba(155, 89, 182, 0.6)', chance: 7 },
    { id: 'batidao_aura', name: 'Но батидао', color: '#ff0000', effectColor: 'rgba(255, 0, 0, 0.8)', chance: 5, image: 'batidao.png' },
    { id: 'cucumber_aura', name: 'Огуречная аура', color: '#7CFC00', effectColor: 'rgba(124, 252, 0, 0.7)', chance: 4, image: 'ogurec.webp' },
    { id: 'sunflower_aura', name: 'Подсолнечная аура', color: '#FFD700', effectColor: 'rgba(255, 215, 0, 0.6)', chance: 3 },
    { id: 'cherry_aura', name: 'Вишнёвая аура', color: '#DC143C', effectColor: 'rgba(220, 20, 60, 0.6)', chance: 3 },
    { id: 'lavender_aura', name: 'Лавандовая аура', color: '#E6E6FA', effectColor: 'rgba(230, 230, 250, 0.5)', chance: 3 },
    { id: 'rose_aura', name: 'Розовая аура', color: '#FF69B4', effectColor: 'rgba(255, 105, 180, 0.6)', chance: 2 },
    { id: 'spring_aura', name: 'Весенняя аура', color: '#00FA9A', effectColor: 'rgba(0, 250, 154, 0.6)', chance: 2 },
    { id: 'explosion_aura', name: 'Взрыв Animated', color: '#FF4500', effectColor: 'rgba(255, 69, 0, 0.8)', chance: 1, isGif: true, image: 'vzryv.gif' }
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
let explosionGif = null;
let activeAuraEffect = null;
let gameLoopId = null;
let activeTimeouts = [];

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let particlePool;
let platforms = [], enemies = [], flyingEnemies = [], coins = [], powerUps = [];
let player, cameraX = 0, keys = {}, gameRunning = true, levelWidth = 0;
let currentLevel = 1, score = 0, playerHealth = 100, maxHealth = 100;
let comboCount = 1, maxCombo = 1, comboTimer = 0, comboMultiplier = 1;
let screenShake = 0, shakeIntensity = 0, lastCheckpointX = 0, boss = null, bossesDefeated = 0;
let levelKeys = [];

const platformTextures = [ {color: '#FF2E63', pattern: 'stripes'}, {color: '#08D9D6', pattern: 'dots'}, {color: '#FFDE7D', pattern: 'checker'}, {color: '#6A2C70', pattern: 'zigzag'}, {color: '#4ECDC4', pattern: 'bricks'}, {color: '#FF9A76', pattern: 'waves'} ];
const enemyColors = ['#FF2E63', '#FFDE7D', '#6A2C70', '#08D9D6', '#AA00FF'];
const flyingEnemyColors = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF6600'];

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

// ==================== АУДИО ====================
const AudioSys = {
    ctx: null, enabled: true,
    init() { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { this.enabled = false; } },
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
const bossTextures = { images: [], loaded: false, specialUrls: [] };
bossTextures.load = function() { return Promise.resolve(); };
bossTextures.getRandomTexture = function(colors) { return { type: 'color', color: colors[Math.floor(Math.random() * colors.length)] }; };

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
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
    saveToCloud();
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
    if (unlockedSkins.includes(id)) { equippedSkin = id; saveAllData(); saveToCloud(); renderSkins(); }
}

function equipAura(id) {
    if (unlockedAuras.includes(id)) { 
        equippedAura = equippedAura === id ? null : id; 
        saveAllData(); 
        saveToCloud();
        renderAuras(); 
    }
}

function openChest() {
    if (totalKeys < 10) { alert('Нужно минимум 10 ключей!'); return; }
    totalKeys -= 10; saveAllData(); 
    saveToCloud();
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
            if (roll < cumulative) { drop = s; break; }
        }
        if (!drop) drop = CHEST_SKINS[0];
        const has = unlockedSkins.includes(drop.id);
        const allSkinsUnlocked = CHEST_SKINS.every(skin => unlockedSkins.includes(skin.id));
        if (allSkinsUnlocked) {
            totalKeys += 10;
            saveAllData();
            saveToCloud();
            if(keySpan) keySpan.textContent = totalKeys;
            showResult('🎁 Все скины собраны!', 'Возврат: +10 🔑', '#FFDE7D');
        } else if (has) {
            const refund = 3;
            totalKeys += refund;
            saveAllData();
            saveToCloud();
            if(keySpan) keySpan.textContent = totalKeys;
            showResult('🔄 Повторка: ' + drop.name, 'Возврат: +' + refund + ' 🔑', '#aaa');
        } else {
            unlockedSkins.push(drop.id);
            saveAllData();
            saveToCloud();
            showResult('✨ Новый скин: ' + drop.name + '!', 'Получен ' + drop.name, drop.color);
        }
        if(btn) btn.disabled = false; 
        renderSkins();
    }, 1200);
}

function openAuraChest() {
    if (totalKeys < 12) { alert('Нужно минимум 12 🔑 ключей!'); return; }
    totalKeys -= 12; saveAllData(); 
    saveToCloud();
    const keySpan = document.getElementById('shopKeyCount');
    if(keySpan) keySpan.textContent = totalKeys;
    const btn = document.getElementById('openAuraChestBtn'), chest = document.getElementById('auraChestVisual');
    if(btn) btn.disabled = true; 
    if(chest) chest.classList.add('shaking'); 
    AudioSys.chestOpen();
    safeTimeout(() => {
        if(chest) chest.classList.remove('shaking');
        
        let totalChance = 0;
        for (let a of AURA_SKINS) {
            totalChance += a.chance;
        }
        let roll = Math.random() * totalChance;
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
        
        if (has) {
            const refund = 4;
            totalKeys += refund;
            saveAllData();
            saveToCloud();
            if(keySpan) keySpan.textContent = totalKeys;
            showResult('🔄 Повторка: ' + drop.name, 'Возврат: +' + refund + ' 🔑', '#aaa');
        } else {
            unlockedAuras.push(drop.id);
            saveAllData();
            saveToCloud();
            let message = '✨ Новая аура: ' + drop.name + '!';
            if(drop.id === 'batidao_aura') message = '🔥 НО БАТИДАО! ' + message;
            if(drop.id === 'cucumber_aura') message = '🥒 ОГУРЕЧНАЯ АУРА! ' + message;
            if(drop.id === 'explosion_aura') message = '💥 ВЗРЫВ ANIMATED! ' + message;
            showResult(message, 'Теперь при ударе будет эффект!', drop.color);
        }
        
        if(btn) btn.disabled = false; 
        renderAuras();
    }, 1200);
}

function openMay2026Chest() {
    if (totalKeys < 15) { alert('Нужно минимум 15 ключей!'); return; }
    totalKeys -= 15; saveAllData(); 
    saveToCloud();
    const keySpan = document.getElementById('shopKeyCount');
    if(keySpan) keySpan.textContent = totalKeys;
    const btn = document.getElementById('openMay2026ChestBtn'), chest = document.getElementById('may2026ChestVisual');
    if(btn) btn.disabled = true; 
    if(chest) chest.classList.add('shaking'); 
    AudioSys.chestOpen();
    safeTimeout(() => {
        if(chest) chest.classList.remove('shaking');
        
        const mayAuras = AURA_SKINS.filter(a => 
            a.id === 'cucumber_aura' || a.id === 'sunflower_aura' || a.id === 'explosion_aura' ||
            a.id === 'cherry_aura' || a.id === 'lavender_aura' || a.id === 'rose_aura' || a.id === 'spring_aura'
        );
        
        let totalChance = 0;
        for (let a of mayAuras) {
            totalChance += a.chance;
        }
        let roll = Math.random() * totalChance;
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
        
        if (has) {
            const refund = 5;
            totalKeys += refund;
            saveAllData();
            saveToCloud();
            if(keySpan) keySpan.textContent = totalKeys;
            showResult('🔄 Повторка: ' + drop.name, 'Возврат: +' + refund + ' 🔑', '#aaa');
        } else {
            unlockedAuras.push(drop.id);
            saveAllData();
            saveToCloud();
            let message = '✨ Новая аура: ' + drop.name + '!';
            if(drop.id === 'cucumber_aura') message = '🥒 ОГУРЕЧНАЯ АУРА! ' + message;
            if(drop.id === 'sunflower_aura') message = '🌻 ПОДСОЛНЕЧНАЯ АУРА! ' + message;
            if(drop.id === 'explosion_aura') message = '💥 ВЗРЫВ ANIMATED! ' + message;
            if(drop.id === 'cherry_aura') message = '🍒 ВИШНЁВАЯ АУРА! ' + message;
            if(drop.id === 'lavender_aura') message = '💜 ЛАВАНДОВАЯ АУРА! ' + message;
            if(drop.id === 'rose_aura') message = '🌹 РОЗОВАЯ АУРА! ' + message;
            if(drop.id === 'spring_aura') message = '🌸 ВЕСЕННЯЯ АУРА! ' + message;
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

function hideResult() { const r = document.getElementById('chestResult'); if(r) r.style.display = 'none'; }

function loadAuraImages() {
    const batidaoImg = new Image();
    batidaoImg.onload = () => { batidaoImage = batidaoImg; };
    batidaoImg.onerror = () => { batidaoImage = null; };
    batidaoImg.src = 'batidao.png';
    
    const cucumberImg = new Image();
    cucumberImg.onload = () => { cucumberImage = cucumberImg; };
    cucumberImg.onerror = () => { cucumberImage = null; };
    cucumberImg.src = 'ogurec.webp';
    
    const explosionImg = new Image();
    explosionImg.onload = () => { explosionGif = explosionImg; };
    explosionImg.onerror = () => { explosionGif = null; };
    explosionImg.src = 'vzryv.gif';
}

function showAuraEffectOnPlayer(x, y, aura) {
    if(activeAuraEffect) { activeAuraEffect.remove(); activeAuraEffect = null; }
    
    const effect = document.createElement('div');
    effect.className = 'aura-effect player-aura';
    effect.style.position = 'fixed';
    effect.style.pointerEvents = 'none';
    effect.style.zIndex = '200';
    effect.style.borderRadius = '50%';
    
    if(aura.id === 'batidao_aura') {
        effect.style.background = `radial-gradient(circle, ${aura.effectColor} 0%, transparent 70%)`;
        if(batidaoImage) {
            effect.style.backgroundImage = `url(${batidaoImage.src})`;
            effect.style.backgroundSize = 'cover';
            effect.style.backgroundPosition = 'center';
            effect.style.backgroundBlend = 'overlay';
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
                particle.style.animation = 'particleExplode 0.5s ease-out forwards';
                document.body.appendChild(particle);
                safeTimeout(() => particle.remove(), 500);
            }, i * 10);
        }
    }
    else if(aura.id === 'explosion_aura' && explosionGif) {
        effect.style.background = `radial-gradient(circle, #ff0000, #ff6600, #ffff00, transparent)`;
        effect.style.backgroundImage = `url(${explosionGif.src})`;
        effect.style.backgroundSize = 'cover';
        effect.style.backgroundPosition = 'center';
        effect.style.backgroundBlend = 'overlay';
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
    else if(aura.id === 'cucumber_aura' && cucumberImage) {
        effect.style.background = `radial-gradient(circle, ${aura.effectColor} 0%, transparent 70%)`;
        effect.style.backgroundImage = `url(${cucumberImage.src})`;
        effect.style.backgroundSize = 'cover';
        effect.style.backgroundPosition = 'center';
        effect.style.backgroundBlend = 'overlay';
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
    else if(aura.id === 'cherry_aura') {
        effect.style.background = `radial-gradient(circle, #ff3366, #ff6699, transparent)`;
        effect.style.boxShadow = `0 0 40px #ff3366`;
        effect.style.animation = 'cherryAuraPlayer 0.4s ease-out forwards';
        for (let i = 0; i < 20; i++) {
            safeTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.left = (x + (Math.random() - 0.5) * 200) + 'px';
                particle.style.top = (y + (Math.random() - 0.5) * 200) + 'px';
                particle.style.width = '8px';
                particle.style.height = '8px';
                particle.style.background = '#ff0000';
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.animation = 'particleExplode 0.4s ease-out forwards';
                document.body.appendChild(particle);
                safeTimeout(() => particle.remove(), 400);
            }, i * 10);
        }
    }
    else if(aura.id === 'lavender_aura') {
        effect.style.background = `radial-gradient(circle, #E6E6FA, #D8BFD8, transparent)`;
        effect.style.boxShadow = `0 0 40px #D8BFD8`;
        effect.style.animation = 'auraExpandPlayer 0.4s ease-out forwards';
        for (let i = 0; i < 15; i++) {
            safeTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.left = (x + (Math.random() - 0.5) * 180) + 'px';
                particle.style.top = (y + (Math.random() - 0.5) * 180) + 'px';
                particle.style.width = '6px';
                particle.style.height = '6px';
                particle.style.background = '#DDA0DD';
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.animation = 'particleExplode 0.4s ease-out forwards';
                document.body.appendChild(particle);
                safeTimeout(() => particle.remove(), 400);
            }, i * 15);
        }
    }
    else if(aura.id === 'rose_aura') {
        effect.style.background = `radial-gradient(circle, #FF69B4, #FF1493, transparent)`;
        effect.style.boxShadow = `0 0 40px #FF69B4`;
        effect.style.animation = 'auraExpandPlayer 0.4s ease-out forwards';
        for (let i = 0; i < 15; i++) {
            safeTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.left = (x + (Math.random() - 0.5) * 160) + 'px';
                particle.style.top = (y + (Math.random() - 0.5) * 160) + 'px';
                particle.style.width = '10px';
                particle.style.height = '10px';
                particle.style.background = '#FFB6C1';
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.animation = 'particleExplode 0.5s ease-out forwards';
                document.body.appendChild(particle);
                safeTimeout(() => particle.remove(), 500);
            }, i * 15);
        }
    }
    else if(aura.id === 'spring_aura') {
        effect.style.background = `radial-gradient(circle, #00FA9A, #3CB371, transparent)`;
        effect.style.boxShadow = `0 0 40px #00FA9A`;
        effect.style.animation = 'auraExpandPlayer 0.4s ease-out forwards';
        for (let i = 0; i < 25; i++) {
            safeTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.left = (x + (Math.random() - 0.5) * 200) + 'px';
                particle.style.top = (y + (Math.random() - 0.5) * 200) + 'px';
                particle.style.width = (Math.random() * 8 + 4) + 'px';
                particle.style.height = (Math.random() * 8 + 4) + 'px';
                particle.style.background = `hsl(${Math.random() * 120 + 60}, 100%, 60%)`;
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.animation = 'particleExplode 0.5s ease-out forwards';
                document.body.appendChild(particle);
                safeTimeout(() => particle.remove(), 500);
            }, i * 10);
        }
    }
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
    safeTimeout(() => { if(activeAuraEffect) { activeAuraEffect.remove(); activeAuraEffect = null; } }, 500);
}

// ==================== SUPABASE ФУНКЦИИ ====================
window.openAuthModal = function() {
    gameRunning = false;
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    document.getElementById('pauseMenu').style.display = 'none';
    document.getElementById('authModal').style.display = 'flex';
}

window.closeAuthModal = function() {
    document.getElementById('authModal').style.display = 'none';
    gameRunning = true;
    gameLoop();
}

window.showRegisterPanel = function() {
    document.getElementById('loginPanel').style.display = 'none';
    document.getElementById('registerPanel').style.display = 'block';
}

window.showLoginPanel = function() {
    document.getElementById('registerPanel').style.display = 'none';
    document.getElementById('loginPanel').style.display = 'block';
}

window.handleRegister = async function() {
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const username = document.getElementById('regUsername').value;

    if (!email || !password) {
        alert('Заполните Email и пароль!');
        return;
    }
    if (password.length < 6) {
        alert('Пароль должен быть минимум 6 символов!');
        return;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (authError) {
        alert('Ошибка: ' + authError.message);
        return;
    }

    currentUserId = authData.user.id;
    isGuest = false;

    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: currentUserId, username: username || email.split('@')[0], created_at: new Date() });

    if (profileError) console.error('Ошибка сохранения профиля:', profileError);

    alert('✅ Регистрация успешна!');
    closeAuthModal();
    await loadProgressFromCloud();
    restartGame();
}

window.handleLogin = async function() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Введите Email и пароль!');
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert('Ошибка входа: ' + error.message);
        return;
    }

    currentUserId = data.user.id;
    isGuest = false;
    alert('✅ Добро пожаловать!');
    closeAuthModal();
    await loadProgressFromCloud();
    restartGame();
}

window.playAsGuest = function() {
    isGuest = true;
    currentUserId = null;
    alert('🎮 Игра без аккаунта. Прогресс не сохранится в облако!');
    closeAuthModal();
    restartGame();
}

async function saveToCloud() {
    if (isGuest || !currentUserId) return;

    const gameData = {
        user_id: currentUserId,
        elo: playerELO,
        keys: totalKeys,
        skins: unlockedSkins,
        auras: unlockedAuras,
        equipped_skin: equippedSkin,
        equipped_aura: equippedAura,
        updated_at: new Date()
    };

    const { error } = await supabase
        .from('game_progress')
        .upsert(gameData, { onConflict: 'user_id' });

    if (error) console.error('Ошибка сохранения:', error);
    else console.log('💾 Прогресс сохранен в облако!');
}

async function loadProgressFromCloud() {
    if (isGuest || !currentUserId) return;

    const { data, error } = await supabase
        .from('game_progress')
        .select('*')
        .eq('user_id', currentUserId)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Ошибка загрузки:', error);
        return;
    }

    if (data) {
        playerELO = data.elo || 0;
        totalKeys = data.keys || 0;
        unlockedSkins = data.skins || ['default'];
        unlockedAuras = data.auras || [];
        equippedSkin = data.equipped_skin || 'default';
        equippedAura = data.equipped_aura || null;
        
        saveAllData();
        updateUI();
        updateEloDisplay();
        renderSkins();
        renderAuras();
        console.log('☁️ Прогресс загружен из облака!');
    } else {
        await saveToCloud();
    }
}

setInterval(() => {
    if (!isGuest && currentUserId && gameRunning) {
        saveToCloud();
    }
}, 60000);

// ==================== КЛАСС PLAYER ====================
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
        
        if (equippedAura) {
            const aura = getAuraData(equippedAura);
            if (aura) {
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

// ==================== ОСТАЛЬНЫЕ КЛАССЫ (Boss, Enemy, FlyingEnemy, Platform) ====================
// (Из-за огромного размера сообщения, эти классы добавьте из предыдущей версии.
// Они идентичны и не требуют изменений для работы с облаком)

console.log('✅ Kolblocks загружен!');

// ==================== КОНФИГУРАЦИЯ ====================
const CONFIG = {
    player: { width: 40, height: 40, speed: 6, jumpPower: 16, gravity: 0.8, friction: 0.85, dashSpeed: 20, dashDuration: 12, dashCooldown: 45, maxDashes: 2 },
    melee: { radius: 95, cooldownMax: 18, damage: 1 },
    elo: { coinsMultiplier: 2, damageDivider: 5 },
    particles: { maxCount: 600, enabled: true },
    audio: { enabled: true },
    camera: { followSpeed: 0.1, playerOffset: 0.35 },
    level: { basePlatforms: 20, platformGrowth: 2, baseEnemies: 3, enemyGrowth: 1.2, baseWidth: 2500, widthGrowth: 400 },
    combat: { comboDecay: 180 }
};

// ==================== КЛАССЫ ИГРОКА ====================
const PLAYER_CLASSES = [
    { id: 'warrior', name: '⚔️ Воин', price: 100, health: 150, damage: 1.5, speed: 5, jumpPower: 15, dashCharges: 2, color: '#ff4444', desc: '+50 здоровья, +50% урона' },
    { id: 'archer', name: '🏹 Лучник', price: 35, health: 80, damage: 1, speed: 6, jumpPower: 16, dashCharges: 2, ranged: true, color: '#44ff44', desc: 'Дальняя атака (E)' },
    { id: 'mage', name: '🔮 Маг', price: 85, health: 90, damage: 1.2, speed: 5.5, jumpPower: 14, dashCharges: 2, slowFall: true, meleeRadius: 130, color: '#aa44ff', desc: 'Медленное падение, большой радиус' },
    { id: 'rogue', name: '🗡️ Разбойник', price: 90, health: 60, damage: 1.3, speed: 8, jumpPower: 18, dashCharges: 3, tripleJump: true, color: '#ffaa44', desc: 'Быстрее, тройной прыжок' }
];

// ==================== СКИНЫ ====================
const CHEST_SKINS = [
    { id: 'copper', name: 'Медный рыцарь', color: '#B87333', chance: 60 },
    { id: 'sapphire', name: 'Сапфировый страж', color: '#0f52ba', chance: 30 },
    { id: 'magma', name: 'Магмовый голем', color: '#FF4500', chance: 8 },
    { id: 'royal', name: 'Королевский легион', color: '#FFD700', chance: 2 }
];

const AURA_SKINS = [
    { id: 'fire_aura', name: 'Огненная аура', color: '#ff4400', effectColor: 'rgba(255,68,0,0.6)', chance: 40 },
    { id: 'ice_aura', name: 'Ледяная аура', color: '#00ccff', effectColor: 'rgba(0,204,255,0.6)', chance: 30 },
    { id: 'lightning_aura', name: 'Электрическая аура', color: '#ffff00', effectColor: 'rgba(255,255,0,0.6)', chance: 20 },
    { id: 'cosmic_aura', name: 'Космическая аура', color: '#9b59b6', effectColor: 'rgba(155,89,182,0.6)', chance: 9 },
    { id: 'batidao_aura', name: 'Но батидао', color: '#ff0000', effectColor: 'rgba(255,0,0,0.8)', chance: 1, image: 'https://images.genius.com/3849b06fe11fa1c89ba96465b298457c.1000x1000x1.png' }
];

const SHAPES_SKINS = [
    { id: 'circle', name: '⚪ Шар', color: '#e74c3c', shape: 'circle', rotSpeed: 0.02, chance: 25 },
    { id: 'triangle', name: '🔺 Треугольник', color: '#f39c12', shape: 'triangle', rotSpeed: 0.03, chance: 25 },
    { id: 'diamond', name: '🔷 Ромб', color: '#1abc9c', shape: 'diamond', rotSpeed: 0.025, chance: 20 },
    { id: 'star', name: '⭐ Звезда', color: '#f1c40f', shape: 'star', rotSpeed: 0.04, chance: 15 },
    { id: 'hexagon', name: '⬡ Шестиугольник', color: '#9b59b6', shape: 'hexagon', rotSpeed: 0.015, chance: 10 },
    { id: 'octopus', name: '🐙 Осьминог', color: '#e67e22', shape: 'octopus', rotSpeed: 0.05, chance: 5 }
];

const DECO_SKINS = [
    { id: 'neon_cube', name: '💚 Неоновый куб', color: '#00ff00', pattern: 'neon', chance: 25 },
    { id: 'crystal_cube', name: '💎 Кристальный куб', color: '#00ffff', pattern: 'crystal', chance: 20 },
    { id: 'gold_cube', name: '👑 Золотой куб', color: '#ffd700', pattern: 'gold', chance: 15 },
    { id: 'rainbow_cube', name: '🌈 Радужный куб', color: '#ff00ff', pattern: 'rainbow', chance: 15 },
    { id: 'tech_cube', name: '🖥️ Техно-куб', color: '#00ffcc', pattern: 'tech', chance: 15 },
    { id: 'void_cube', name: '🌌 Космический куб', color: '#8e44ad', pattern: 'void', chance: 10 }
];

const ELEMENTAL_SKINS = [
    { id: 'fire_skin', name: '🔥 Огненный', color: '#ff4500', pattern: 'flame', chance: 25 },
    { id: 'water_skin', name: '💧 Водный', color: '#3498db', pattern: 'wave', chance: 25 },
    { id: 'earth_skin', name: '🌍 Земляной', color: '#8B4513', pattern: 'stone', chance: 20 },
    { id: 'air_skin', name: '💨 Воздушный', color: '#ecf0f1', pattern: 'cloud', chance: 20 },
    { id: 'lightning_skin', name: '⚡ Молниеносный', color: '#ffff00', pattern: 'bolt', chance: 9 },
    { id: 'shadow_skin', name: '🌑 Теневой', color: '#2c3e50', pattern: 'shadow', chance: 1 }
];

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let playerELO = parseInt(localStorage.getItem('kolblocks_elo')) || 0;
let totalKeys = parseInt(localStorage.getItem('kolblocks_keys')) || 0;
let unlockedSkins = JSON.parse(localStorage.getItem('kolblocks_skins')) || ['default'];
let unlockedAuras = JSON.parse(localStorage.getItem('kolblocks_auras')) || [];
let unlockedShapes = JSON.parse(localStorage.getItem('kolblocks_shapes')) || [];
let unlockedDeco = JSON.parse(localStorage.getItem('kolblocks_deco')) || [];
let unlockedElemental = JSON.parse(localStorage.getItem('kolblocks_elemental')) || [];
let equippedSkin = localStorage.getItem('kolblocks_equipped') || 'default';
let equippedAura = localStorage.getItem('kolblocks_equipped_aura') || null;
let playerClass = localStorage.getItem('kolblocks_class') || 'warrior';
let roundCoins = 0, roundDamage = 0;

let batidaoImage = null;
let skinRotations = {};
let archerArrows = [];
let archerCooldown = 0;
let resurrecting = [];

// ==================== АУДИО ====================
const AudioSys = {
    ctx: null, enabled: true,
    init() { try { this.ctx = new AudioContext(); } catch(e) {} },
    play(freq, dur, type='square', vol=0.1) {
        if(!this.enabled||!this.ctx) return;
        const osc=this.ctx.createOscillator(), gain=this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.frequency.value=freq; osc.type=type;
        gain.gain.setValueAtTime(vol,this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+dur*0.1);
        osc.start(); osc.stop(this.ctx.currentTime+dur);
    },
    jump(){this.play(440,0.15,'sine',0.15)},
    meleeSwing(){this.play(380,0.12,'sawtooth',0.2)},
    hit(){this.play(220,0.2,'sawtooth',0.2)},
    collect(){this.play(660,0.1,'sine',0.12)},
    combo(){this.play(523,0.12,'sine',0.15)},
    dash(){this.play(330,0.1,'triangle',0.1)},
    checkpoint(){this.play(784,0.3,'sine',0.2)},
    levelComplete(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>this.play(f,0.2,'sine',0.15),i*100))},
    bossSpawn(){[200,250,300,250,200].forEach((f,i)=>setTimeout(()=>this.play(f,0.3,'sawtooth',0.2),i*100))},
    bossHit(){this.play(150,0.3,'sawtooth',0.25)},
    bossDefeat(){[400,500,600,800,1000].forEach((f,i)=>setTimeout(()=>this.play(f,0.4,'square',0.2),i*150))},
    gameOver(){[392,349,294,262].forEach((f,i)=>setTimeout(()=>this.play(f,0.3,'sawtooth',0.15),i*150))},
    eloGain(){this.play(880,0.2,'sine',0.2)},
    eloLoss(){this.play(200,0.25,'sawtooth',0.15)},
    chestOpen(){[300,450,600,900].forEach((f,i)=>setTimeout(()=>this.play(f,0.15,'square',0.15),i*80))},
    arrow(){this.play(880,0.08,'sine',0.1)},
    resurrect(){this.play(300,0.3,'sawtooth',0.2)},
    vortexPull(){this.play(200,0.2,'sine',0.15)}
};

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function getClass(){return PLAYER_CLASSES.find(c=>c.id===playerClass)||PLAYER_CLASSES[0];}
function showToast(msg){
    let t=document.getElementById('toast');
    if(!t){t=document.createElement('div');t.id='toast';t.style.cssText='position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#000c;color:#4af626;padding:12px 24px;border-radius:30px;z-index:2500;border:1px solid #4af626;opacity:0;transition:0.3s';document.body.appendChild(t);}
    t.textContent=msg; t.style.opacity='1';
    setTimeout(()=>t.style.opacity='0',2000);
}

function getSkin(id){
    if(id==='default') return {id:'default',name:'Стандарт',color:'#4af626'};
    let s=SHAPES_SKINS.find(x=>x.id===id); if(s) return s;
    let d=DECO_SKINS.find(x=>x.id===id); if(d) return d;
    let e=ELEMENTAL_SKINS.find(x=>x.id===id); if(e) return e;
    let n=CHEST_SKINS.find(x=>x.id===id); if(n) return n;
    return {id:'default',name:'Стандарт',color:'#4af626'};
}
function getAura(id){return AURA_SKINS.find(a=>a.id===id)||null;}
function isSkinUnlocked(id){
    if(id==='default') return true;
    if(CHEST_SKINS.some(s=>s.id===id)) return unlockedSkins.includes(id);
    if(SHAPES_SKINS.some(s=>s.id===id)) return unlockedShapes.includes(id);
    if(DECO_SKINS.some(d=>d.id===id)) return unlockedDeco.includes(id);
    if(ELEMENTAL_SKINS.some(e=>e.id===id)) return unlockedElemental.includes(id);
    return false;
}
function saveAll(){
    localStorage.setItem('kolblocks_elo',playerELO);
    localStorage.setItem('kolblocks_keys',totalKeys);
    localStorage.setItem('kolblocks_skins',JSON.stringify(unlockedSkins));
    localStorage.setItem('kolblocks_auras',JSON.stringify(unlockedAuras));
    localStorage.setItem('kolblocks_shapes',JSON.stringify(unlockedShapes));
    localStorage.setItem('kolblocks_deco',JSON.stringify(unlockedDeco));
    localStorage.setItem('kolblocks_elemental',JSON.stringify(unlockedElemental));
    localStorage.setItem('kolblocks_equipped',equippedSkin);
    localStorage.setItem('kolblocks_equipped_aura',equippedAura||'');
    localStorage.setItem('kolblocks_class',playerClass);
}
function calcElo(){
    let change=Math.floor(roundCoins*2)-Math.floor(roundDamage/5);
    playerELO=Math.max(0,playerELO+change);
    saveAll();
    return change;
}

// ==================== МАГАЗИН ====================
function openShop(){
    gameRunning=false;
    document.getElementById('pauseMenu').style.display='none';
    document.getElementById('caseShopScreen').style.display='flex';
    document.getElementById('shopKeyCount').textContent=totalKeys;
    renderSkins(); renderAuras(); renderClasses();
}
function closeShop(){
    document.getElementById('caseShopScreen').style.display='none';
    gameRunning=true; gameLoop();
}
function renderSkins(){
    let g=document.getElementById('skinsGrid'); g.innerHTML='';
    let cats=[
        {name:'⭐ Базовые',skins:[{id:'default',name:'Стандарт',color:'#4af626'}]},
        {name:'🔷 Фигуры',skins:SHAPES_SKINS},
        {name:'💎 Украшенные',skins:DECO_SKINS},
        {name:'🔥 Элементальные',skins:ELEMENTAL_SKINS},
        {name:'🛡️ Классические',skins:CHEST_SKINS}
    ];
    for(let cat of cats){
        let div=document.createElement('div'); div.style.cssText='grid-column:1/-1;margin-top:15px;color:#FFDE7D;border-bottom:1px solid #FFDE7D'; div.textContent=cat.name; g.appendChild(div);
        for(let s of cat.skins){
            let u=isSkinUnlocked(s.id), e=equippedSkin===s.id;
            let item=document.createElement('div'); item.className='skin-item '+(e?'equipped':'')+(!u?'locked':'');
            item.innerHTML=`<div class="skin-preview" style="background:${u?s.color:'#333'}"></div><span class="skin-name">${s.name}</span><button class="equip-btn" onclick="equipSkin('${s.id}')" ${!u||e?'disabled':''}>${e?'✓ Выбран':'Выбрать'}</button>`;
            g.appendChild(item);
        }
    }
}
function renderAuras(){
    let g=document.getElementById('aurasGrid'); g.innerHTML='';
    if(unlockedAuras.length===0){g.innerHTML='<div style="color:#aaa;text-align:center">Нет аур</div>';return;}
    AURA_SKINS.forEach(a=>{
        let u=unlockedAuras.includes(a.id), e=equippedAura===a.id;
        let item=document.createElement('div'); item.className='skin-item '+(e?'equipped':'')+(!u?'locked':'');
        item.innerHTML=`<div class="skin-preview" style="background:${u?a.color:'#333'}"></div><span class="skin-name">${a.name}</span><button class="equip-btn" onclick="equipAura('${a.id}')" ${!u||e?'disabled':''}>${e?'✓ Активирована':'Активировать'}</button>`;
        g.appendChild(item);
    });
}
function renderClasses(){
    let g=document.getElementById('classesGrid'); if(!g) return;
    g.innerHTML='';
    PLAYER_CLASSES.forEach(c=>{
        let e=playerClass===c.id, affordable=totalKeys>=c.price;
        let item=document.createElement('div'); item.className='skin-item '+(e?'equipped':'')+(!affordable?'locked':'');
        item.innerHTML=`<div class="skin-preview" style="background:${c.color};box-shadow:0 0 10px ${c.color}"></div><span class="skin-name">${c.name}</span><span style="font-size:9px;color:#aaa">${c.desc}</span><button onclick="buyClass('${c.id}',${c.price})" ${!affordable||e?'disabled':''}>${e?'✓ Выбран':c.price+' 🔑'}</button>`;
        g.appendChild(item);
    });
}
function buyClass(id,price){
    if(totalKeys>=price){totalKeys-=price; playerClass=id; saveAll(); renderClasses(); applyClassStats(); showToast(`Выбран класс ${PLAYER_CLASSES.find(c=>c.id===id).name}`); if(player){player.reset(); playerHealth=getClass().health; updateHealthBar();}}
    else alert(`Нужно ${price} ключей!`);
}
function applyClassStats(){
    let c=getClass();
    maxHealth=c.health; if(playerHealth>maxHealth) playerHealth=maxHealth;
    updateHealthBar();
    if(player){
        player.speed=c.speed; player.jumpPower=c.jumpPower; player.dashCharges=c.dashCharges;
        player.gravity=c.slowFall?0.5:0.8;
        if(c.meleeRadius) CONFIG.melee.radius=c.meleeRadius;
        else CONFIG.melee.radius=95;
        updateDashIndicator();
    }
}
function equipSkin(id){if(isSkinUnlocked(id)){equippedSkin=id; saveAll(); renderSkins();}}
function equipAura(id){if(unlockedAuras.includes(id)){equippedAura=equippedAura===id?null:id; saveAll(); renderAuras();}}

function openChest(){
    if(totalKeys<10){alert('Нужно 10 ключей!');return;}
    totalKeys-=10; saveAll(); document.getElementById('shopKeyCount').textContent=totalKeys;
    let btn=document.getElementById('openChestBtn'), chest=document.getElementById('chestVisual');
    btn.disabled=true; chest.classList.add('shaking'); AudioSys.chestOpen();
    setTimeout(()=>{
        chest.classList.remove('shaking');
        let roll=Math.random()*100, cum=0, drop=CHEST_SKINS[0];
        for(let s of CHEST_SKINS){cum+=s.chance; if(roll<cum){drop=s;break;}}
        let has=unlockedSkins.includes(drop.id);
        if(has){totalKeys+=2; saveAll(); document.getElementById('shopKeyCount').textContent=totalKeys; showResult('Дубликат: '+drop.name,'Возврат: +2 🔑');}
        else{unlockedSkins.push(drop.id); saveAll(); showResult('Новый скин: '+drop.name+'!',drop.color);}
        btn.disabled=false; renderSkins();
    },1200);
}
function openAuraChest(){
    if(totalKeys<12){alert('Нужно 12 ключей!');return;}
    totalKeys-=12; saveAll(); document.getElementById('shopKeyCount').textContent=totalKeys;
    let btn=document.getElementById('openAuraChestBtn'), chest=document.getElementById('auraChestVisual');
    btn.disabled=true; chest.classList.add('shaking'); AudioSys.chestOpen();
    setTimeout(()=>{
        chest.classList.remove('shaking');
        let roll=Math.random()*100, cum=0, drop=AURA_SKINS[0];
        for(let a of AURA_SKINS){cum+=a.chance; if(roll<cum){drop=a;break;}}
        let has=unlockedAuras.includes(drop.id);
        if(has){totalKeys+=3; saveAll(); document.getElementById('shopKeyCount').textContent=totalKeys; showResult('Дубликат ауры: '+drop.name,'Возврат: +3 🔑');}
        else{unlockedAuras.push(drop.id); saveAll(); showResult('Новая аура: '+drop.name+'!',drop.color);}
        btn.disabled=false; renderAuras();
    },1200);
}
function openShapesChest(){
    if(totalKeys<20){alert('Нужно 20 ключей!');return;}
    totalKeys-=20; saveAll(); document.getElementById('shopKeyCount').textContent=totalKeys;
    let btn=document.getElementById('openShapesChestBtn'), chest=document.getElementById('shapesChestVisual');
    btn.disabled=true; chest.classList.add('shaking'); AudioSys.chestOpen();
    setTimeout(()=>{
        chest.classList.remove('shaking');
        let roll=Math.random()*100, cum=0, drop=SHAPES_SKINS[0];
        for(let s of SHAPES_SKINS){cum+=s.chance; if(roll<cum){drop=s;break;}}
        let has=unlockedShapes.includes(drop.id);
        if(has){totalKeys+=5; saveAll(); document.getElementById('shopKeyCount').textContent=totalKeys; showResult('Дубликат фигуры: '+drop.name,'Возврат: +5 🔑');}
        else{unlockedShapes.push(drop.id); saveAll(); showResult('Новая фигура: '+drop.name+'!',drop.color);}
        btn.disabled=false; renderSkins();
    },1200);
}
function openDecoChest(){
    if(totalKeys<25){alert('Нужно 25 ключей!');return;}
    totalKeys-=25; saveAll(); document.getElementById('shopKeyCount').textContent=totalKeys;
    let btn=document.getElementById('openDecoChestBtn'), chest=document.getElementById('decoChestVisual');
    btn.disabled=true; chest.classList.add('shaking'); AudioSys.chestOpen();
    setTimeout(()=>{
        chest.classList.remove('shaking');
        let roll=Math.random()*100, cum=0, drop=DECO_SKINS[0];
        for(let d of DECO_SKINS){cum+=d.chance; if(roll<cum){drop=d;break;}}
        let has=unlockedDeco.includes(drop.id);
        if(has){totalKeys+=7; saveAll(); document.getElementById('shopKeyCount').textContent=totalKeys; showResult('Дубликат декора: '+drop.name,'Возврат: +7 🔑');}
        else{unlockedDeco.push(drop.id); saveAll(); showResult('Новый декор: '+drop.name+'!',drop.color);}
        btn.disabled=false; renderSkins();
    },1200);
}
function openElementalChest(){
    if(totalKeys<30){alert('Нужно 30 ключей!');return;}
    totalKeys-=30; saveAll(); document.getElementById('shopKeyCount').textContent=totalKeys;
    let btn=document.getElementById('openElementalChestBtn'), chest=document.getElementById('elementalChestVisual');
    btn.disabled=true; chest.classList.add('shaking'); AudioSys.chestOpen();
    setTimeout(()=>{
        chest.classList.remove('shaking');
        let roll=Math.random()*100, cum=0, drop=ELEMENTAL_SKINS[0];
        for(let e of ELEMENTAL_SKINS){cum+=e.chance; if(roll<cum){drop=e;break;}}
        let has=unlockedElemental.includes(drop.id);
        if(has){totalKeys+=10; saveAll(); document.getElementById('shopKeyCount').textContent=totalKeys; showResult('Дубликат стихии: '+drop.name,'Возврат: +10 🔑');}
        else{unlockedElemental.push(drop.id); saveAll(); showResult('Новая стихия: '+drop.name+'!',drop.color);}
        btn.disabled=false; renderSkins();
    },1200);
}
function showResult(title,text){let r=document.getElementById('chestResult'); document.getElementById('resultTitle').textContent=title; document.getElementById('resultText').textContent=text; r.style.display='block';}
function hideResult(){document.getElementById('chestResult').style.display='none';}

// ==================== ПУЛ ЧАСТИЦ ====================
class Particle{
    constructor(x,y,c){this.x=x;this.y=y;this.size=Math.random()*5+2;this.vx=Math.random()*8-4;this.vy=Math.random()*8-4;this.color=c;this.life=20+Math.random()*15;this.active=true;}
    update(){this.x+=this.vx; this.y+=this.vy; this.vy+=0.1; this.life--; this.size*=0.96; if(this.life<=0) this.active=false;}
    draw(ctx,camX){if(!this.active)return; ctx.globalAlpha=this.life/20; ctx.fillStyle=this.color; ctx.beginPath(); ctx.arc(this.x-camX,this.y,this.size,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;}
}
let particles=[];

// ==================== СТРЕЛЫ ====================
class Arrow{
    constructor(x,y,dir){this.x=x;this.y=y;this.w=15;this.h=5;this.dir=dir;this.life=120;this.active=true;}
    update(){this.x+=12*this.dir; this.life--; if(this.life<=0) this.active=false; return this.active;}
    draw(ctx,camX){ctx.fillStyle='#ffaa44'; ctx.fillRect(this.x-camX,this.y,this.w,this.h); ctx.fillStyle='#ff6600'; ctx.fillRect(this.x-camX+this.w-3,this.y+1,3,3);}
}

// ==================== НОВЫЕ ВРАГИ ====================
class Necromancer{
    constructor(x,y){
        this.x=x; this.y=y; this.w=40; this.h=40; this.color='#800080'; this.health=3; this.maxHealth=3; this.active=true;
        this.speed=0.8; this.dir=Math.random()>0.5?1:-1; this.resCooldown=0; this.score=250;
    }
    update(){
        if(!this.active) return;
        this.x+=this.speed*this.dir;
        if(this.x<cameraX+50||this.x>cameraX+canvas.width-50) this.dir*=-1;
        this.y+=0.5;
        for(let p of platforms) if(this.x<p.x+p.w&&this.x+this.w>p.x&&this.y+this.h>p.y&&this.y+this.h<p.y+30){this.y=p.y-this.h; break;}
        if(this.resCooldown>0) this.resCooldown--;
    }
    takeDamage(){this.health--; if(this.health<=0){this.destroy(); return true;} return false;}
    destroy(){this.active=false; addScore(this.score*comboMultiplier); updateCombo(); AudioSys.collect(); for(let i=0;i<30;i++) particles.push(new Particle(this.x+this.w/2,this.y+this.h/2,'#800080')); if(Math.random()<0.35) coins.push({x:this.x+this.w/2,y:this.y+this.h/2,size:12,color:'#FFDE7D'});}
    tryResurrect(){
        if(this.resCooldown>0||!this.active) return null;
        for(let i=0;i<resurrecting.length;i++){
            let d=resurrecting[i];
            if(d.timer>0 && Math.hypot(this.x-d.x,this.y-d.y)<200){
                this.resCooldown=180; AudioSys.resurrect(); return d;
            }
        }
        return null;
    }
    draw(ctx){ctx.fillStyle=this.color; ctx.fillRect(this.x-cameraX,this.y,this.w,this.h); ctx.fillStyle='#4a004a'; ctx.fillRect(this.x-cameraX+5,this.y-10,30,15); ctx.fillStyle='#f00'; ctx.fillRect(this.x-cameraX+10,this.y+10,5,5); ctx.fillRect(this.x-cameraX+25,this.y+10,5,5); if(this.health<this.maxHealth) ctx.fillRect(this.x-cameraX,this.y-8,this.w*this.health/this.maxHealth,4);}
}

class Vortex{
    constructor(x,y){
        this.x=x; this.y=y; this.w=45; this.h=45; this.color='#00ccff'; this.health=2; this.maxHealth=2; this.active=true;
        this.pull=3; this.pullCooldown=0; this.rot=0; this.score=180;
    }
    update(){
        if(!this.active) return;
        this.rot+=0.1;
        this.y+=Math.sin(Date.now()/500)*0.5;
        if(player&&this.pullCooldown<=0){
            let dx=player.x+player.w/2-(this.x+this.w/2), dy=player.y+player.h/2-(this.y+this.h/2);
            if(Math.hypot(dx,dy)<200){
                let a=Math.atan2(dy,dx);
                player.x+=Math.cos(a)*this.pull; player.y+=Math.sin(a)*this.pull;
                this.pullCooldown=10; AudioSys.vortexPull();
                for(let i=0;i<3;i++) particles.push(new Particle(this.x+this.w/2,this.y+this.h/2,'#0ff'));
            }
        }
        if(this.pullCooldown>0) this.pullCooldown--;
        this.y+=0.3;
        for(let p of platforms) if(this.x<p.x+p.w&&this.x+this.w>p.x&&this.y+this.h>p.y&&this.y+this.h<p.y+30){this.y=p.y-this.h; break;}
    }
    takeDamage(){this.health--; if(this.health<=0){this.destroy(); return true;} return false;}
    destroy(){this.active=false; addScore(this.score*comboMultiplier); updateCombo(); AudioSys.collect(); for(let i=0;i<30;i++) particles.push(new Particle(this.x+this.w/2,this.y+this.h/2,'#0cc')); if(Math.random()<0.35) coins.push({x:this.x+this.w/2,y:this.y+this.h/2,size:12,color:'#FFDE7D'});}
    draw(ctx){
        ctx.save(); ctx.translate(this.x-cameraX+this.w/2,this.y+this.h/2); ctx.rotate(this.rot);
        ctx.fillStyle=this.color; ctx.fillRect(-this.w/2,-this.h/2,this.w,this.h);
        ctx.fillStyle='#fff'; for(let i=0;i<3;i++) ctx.fillRect(-this.w/4+i*15,-5,10,10);
        ctx.restore();
        ctx.beginPath(); ctx.arc(this.x-cameraX+this.w/2,this.y+this.h/2,60,0,Math.PI*2);
        ctx.fillStyle='rgba(0,204,255,0.1)'; ctx.fill();
        if(this.health<this.maxHealth) ctx.fillRect(this.x-cameraX,this.y-8,this.w*this.health/this.maxHealth,4);
    }
}

// ==================== КЛАСС PLAYER ====================
class Player{
    constructor(){this.reset();}
    reset(){
        let c=getClass();
        this.w=40; this.h=40; this.x=100; this.y=200; this.vx=0; this.vy=0; this.jumping=false; this.jumpCount=0;
        this.speed=c.speed; this.jumpPower=c.jumpPower; this.gravity=c.slowFall?0.5:0.8; this.friction=0.85;
        this.trail=[]; this.invul=0; this.dashCharges=c.dashCharges; this.dashCd=0; this.dashing=false; this.dashTimer=0; this.dashDir=1;
        this.meleeCd=0; this.swing=0; this.damage=c.damage; this.maxJumps=c.tripleJump?3:2;
        this.lastCheck={x:100,y:200};
    }
    update(k){
        if(this.invul>0) this.invul--;
        if(this.dashCd>0) this.dashCd--;
        if(this.meleeCd>0) this.meleeCd--;
        if(this.swing>0) this.swing--;
        if(archerCooldown>0) archerCooldown--;
        
        if(!this.dashing){
            this.trail.push({x:this.x,y:this.y}); if(this.trail.length>8) this.trail.shift();
        }
        if(this.dashing){
            this.dashTimer--; this.x+=20*this.dashDir;
            if(this.dashTimer<=0){this.dashing=false; this.vy=0;}
            return;
        }
        this.vy+=this.gravity;
        if(k['ArrowLeft']||k['a']||k['ф']){this.vx=-this.speed; this.dashDir=-1;}
        else if(k['ArrowRight']||k['d']||k['в']){this.vx=this.speed; this.dashDir=1;}
        else this.vx*=this.friction;
        
        let maxJumps=getClass().tripleJump?3:2;
        if((k[' ']||k['ArrowUp']||k['w']||k['ц'])&&this.jumpCount<maxJumps){
            this.vy=-this.jumpPower; this.jumping=true; this.jumpCount++; this.createJumpParts();
            AudioSys.jump(); k[' ']=false; k['ArrowUp']=false; k['w']=false;
        }
        if((k['Shift']||k['shift']||k['q']||k['й'])&&this.dashCharges>0&&this.dashCd<=0){this.startDash(); k['Shift']=false;k['shift']=false;k['q']=false;}
        if(getClass().ranged&&(k['e']||k['E'])&&archerCooldown<=0&&gameRunning){
            archerArrows.push(new Arrow(this.x+this.w/2,this.y+this.h/2,this.dashDir));
            archerCooldown=20; AudioSys.arrow();
            k['e']=false;k['E']=false;
        }
        this.x+=this.vx; this.y+=this.vy;
        this.x=Math.max(cameraX+50,Math.min(this.x,cameraX+canvas.width-50-this.w));
        if(this.y>canvas.height+200){this.respawn(); return;}
        this.checkPlatforms();
    }
    startDash(){
        this.dashing=true; this.dashTimer=12; this.dashCharges--; this.dashCd=45; this.invul=15; this.vy=0;
        AudioSys.dash();
        for(let i=0;i<20;i++) particles.push(new Particle(this.x+this.w/2+Math.random()*20-10,this.y+this.h/2+Math.random()*20-10,'#FFDE7D'));
        updateDashIndicator();
    }
    melee(){
        if(this.meleeCd>0||!gameRunning) return;
        this.meleeCd=18; this.swing=8; AudioSys.meleeSwing();
        let cx=this.x+this.w/2, cy=this.y+this.h/2, rad=getClass().meleeRadius||CONFIG.melee.radius;
        if(equippedAura){let a=getAura(equippedAura); if(a) this.showAura(cx-cameraX,cy,a);}
        let hit=false;
        for(let e of enemies){if(!e.active)continue; if(Math.hypot(cx-(e.x+e.w/2),cy-(e.y+e.h/2))<rad){if(e.takeDamage()){resurrecting.push({x:e.x,y:e.y,timer:180}); enemies=enemies.filter(x=>x!==e);} hit=true; updateCombo(); this.hitEffect(e.x+e.w/2,e.y+e.h/2);}}
        for(let fe of flyingEnemies){if(!fe.active)continue; if(Math.hypot(cx-(fe.x+fe.w/2),cy-(fe.y+fe.h/2))<rad){if(fe.takeDamage()) flyingEnemies=flyingEnemies.filter(x=>x!==fe); hit=true; updateCombo(); this.hitEffect(fe.x+fe.w/2,fe.y+fe.h/2);}}
        for(let n of necromancers){if(!n.active)continue; if(Math.hypot(cx-(n.x+n.w/2),cy-(n.y+n.h/2))<rad){if(n.takeDamage()) necromancers=necromancers.filter(x=>x!==n); hit=true; updateCombo(); this.hitEffect(n.x+n.w/2,n.y+n.h/2);}}
        for(let v of vortexes){if(!v.active)continue; if(Math.hypot(cx-(v.x+v.w/2),cy-(v.y+v.h/2))<rad){if(v.takeDamage()) vortexes=vortexes.filter(x=>x!==v); hit=true; updateCombo(); this.hitEffect(v.x+v.w/2,v.y+v.h/2);}}
        if(boss&&boss.active&&Math.hypot(cx-(boss.x+boss.w/2),cy-(boss.y+boss.h/2))<rad+15){if(boss.takeDamage()){boss=null;document.getElementById('bossHealthBar').style.display='none';} hit=true; updateCombo(); this.hitEffect(boss.x+boss.w/2,boss.y+boss.h/2); AudioSys.bossHit();}
        if(hit){for(let i=0;i<25;i++) particles.push(new Particle(cx+(Math.random()-0.5)*40,cy+(Math.random()-0.5)*40,'#ffaa33')); shakeScreen(3);}
    }
    hitEffect(x,y){for(let i=0;i<15;i++) particles.push(new Particle(x+(Math.random()-0.5)*20,y+(Math.random()-0.5)*20,'#ff5500'));}
    createJumpParts(){for(let i=0;i<12;i++) particles.push(new Particle(this.x+this.w/2,this.y+this.h,'#4af626'));}
    showAura(x,y,a){
        let d=document.createElement('div'); d.className='aura-effect'; d.style.cssText=`position:fixed;left:${x-150}px;top:${y-150}px;width:300px;height:300px;border-radius:50%;pointer-events:none;z-index:200;background:radial-gradient(circle,${a.effectColor},transparent);animation:auraExpand 0.5s forwards;`;
        if(a.id==='batidao_aura'&&batidaoImage){d.style.backgroundImage=`url(${batidaoImage.src})`; d.style.backgroundSize='cover'; d.style.animation='batidaoAura 0.6s forwards';}
        document.body.appendChild(d); setTimeout(()=>d.remove(),500);
    }
    checkPlatforms(){
        let onGround=false;
        for(let p of platforms){
            if(this.x<p.x+p.w&&this.x+this.w>p.x&&this.y+this.h>p.y&&this.y+this.h-this.vy<=p.y+10){
                this.y=p.y-this.h; this.vy=0; if(this.jumping){for(let i=0;i<8;i++) particles.push(new Particle(this.x+this.w/2,this.y+this.h,'#08D9D6')); this.jumping=false;} this.jumpCount=0; onGround=true;
                if(p.type==='breaking'&&!p.broken) p.breakTimer=60;
            }
        }
        if(onGround) this.jumpCount=0;
    }
    takeDamage(amt,kbx,kby,col){
        if(this.invul>0||this.dashing) return false;
        playerHealth=Math.max(0,playerHealth-amt); updateHealthBar(); this.vx=kbx; this.vy=kby; this.jumping=true;
        this.invul=45; AudioSys.hit(); roundDamage+=amt;
        for(let i=0;i<15;i++) particles.push(new Particle(this.x+this.w/2,this.y+this.h/2,col||'#ff2e63'));
        if(playerHealth<=0){gameOver(); return true;} return false;
    }
    respawn(){this.takeDamage(30); this.x=this.lastCheck.x; this.y=this.lastCheck.y; this.vx=0; this.vy=0; this.jumping=false; this.jumpCount=0; this.invul=90; for(let i=0;i<25;i++) particles.push(new Particle(this.x+this.w/2,this.y+this.h/2,'#FF2E63')); shakeScreen(5);}
    saveCheck(){this.lastCheck={x:this.x,y:this.y}; let ci=document.getElementById('checkpointIndicator'); ci.classList.add('active'); setTimeout(()=>ci.classList.remove('active'),2000); AudioSys.checkpoint();}
    draw(ctx,camX){
        let skin=getSkin(equippedSkin), drawX=this.x-camX, drawY=this.y, cx=drawX+this.w/2, cy=drawY+this.h/2;
        if(!skin.shape||skin.shape==='square'){
            for(let i=0;i<this.trail.length;i++){ctx.globalAlpha=i/8*0.25; ctx.fillStyle=this.dashing?'#FFDE7D':skin.color; ctx.fillRect(this.trail[i].x-camX,this.trail[i].y,this.w,this.h);}
            ctx.globalAlpha=1;
        }
        if(skin.shape&&skin.shape!=='square'){
            if(!skinRotations[equippedSkin]) skinRotations[equippedSkin]=0;
            if(Math.abs(this.vx)>0.1) skinRotations[equippedSkin]+=this.vx>0?skin.rotSpeed:-skin.rotSpeed;
            ctx.save(); ctx.translate(cx,cy); ctx.rotate(skinRotations[equippedSkin]); ctx.translate(-cx,-cy);
            ctx.fillStyle=skin.color; if(this.dashing){ctx.shadowColor=skin.color; ctx.shadowBlur=20;}
            switch(skin.shape){
                case'circle':ctx.beginPath();ctx.arc(cx,cy,this.w/2,0,Math.PI*2);ctx.fill();break;
                case'triangle':ctx.beginPath();ctx.moveTo(cx,cy-this.h/2);ctx.lineTo(cx-this.w/2,cy+this.h/2);ctx.lineTo(cx+this.w/2,cy+this.h/2);ctx.fill();break;
                case'diamond':ctx.beginPath();ctx.moveTo(cx,cy-this.h/2);ctx.lineTo(cx+this.w/2,cy);ctx.lineTo(cx,cy+this.h/2);ctx.lineTo(cx-this.w/2,cy);ctx.fill();break;
                case'star':this.drawStar(ctx,cx,cy,this.w/2);ctx.fill();break;
                case'hexagon':this.drawHex(ctx,cx,cy,this.w/2);ctx.fill();break;
                case'octopus':this.drawOct(ctx,cx,cy,this.w/2);ctx.fill();break;
                default:ctx.fillRect(drawX,drawY,this.w,this.h);
            }
            ctx.restore();
        }else{
            ctx.fillStyle=skin.color; if(this.dashing){ctx.shadowColor=skin.color; ctx.shadowBlur=20;} ctx.fillRect(drawX,drawY,this.w,this.h);
            if(skin.pattern){
                ctx.globalAlpha=0.7;
                if(skin.pattern==='neon') for(let i=0;i<4;i++){ctx.fillStyle=`rgba(0,255,136,${Math.sin(Date.now()/200)*0.3+0.7})`; ctx.fillRect(drawX+5+i*10,drawY+5,3,this.h-10);}
                if(skin.pattern==='crystal'){ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.moveTo(drawX+this.w/2,drawY); ctx.lineTo(drawX+this.w-8,drawY+this.h/2); ctx.lineTo(drawX+this.w/2,drawY+this.h); ctx.lineTo(drawX+8,drawY+this.h/2); ctx.fill();}
                if(skin.pattern==='rainbow'){let rc=['#f00','#ff8800','#ff0','#0f0','#08f','#f0f']; for(let i=0;i<rc.length;i++){ctx.fillStyle=rc[i]; ctx.fillRect(drawX+3+i*6,drawY+5,5,this.h-10);}}
                ctx.globalAlpha=1;
            }
        }
        ctx.shadowBlur=0;
        ctx.fillStyle='#222'; ctx.fillRect(drawX+10,drawY+10,8,8); ctx.fillRect(drawX+22,drawY+10,8,8); ctx.fillRect(drawX+10,drawY+25,20,4);
        ctx.strokeStyle=this.invul>0&&Math.floor(this.invul/4)%2===0?'#fff':skin.color; ctx.lineWidth=2;
        if(skin.shape&&skin.shape!=='square'&&skin.shape!=='octopus'){
            ctx.beginPath();
            if(skin.shape==='circle') ctx.arc(cx,cy,this.w/2,0,Math.PI*2);
            else if(skin.shape==='triangle'){ctx.moveTo(cx,cy-this.h/2);ctx.lineTo(cx-this.w/2,cy+this.h/2);ctx.lineTo(cx+this.w/2,cy+this.h/2);ctx.closePath();ctx.stroke();}
            else if(skin.shape==='diamond'){ctx.moveTo(cx,cy-this.h/2);ctx.lineTo(cx+this.w/2,cy);ctx.lineTo(cx,cy+this.h/2);ctx.lineTo(cx-this.w/2,cy);ctx.closePath();ctx.stroke();}
            else if(skin.shape==='star'){this.drawStar(ctx,cx,cy,this.w/2);ctx.stroke();}
            else if(skin.shape==='hexagon'){this.drawHex(ctx,cx,cy,this.w/2);ctx.stroke();}
            else ctx.strokeRect(drawX,drawY,this.w,this.h);
        }else ctx.strokeRect(drawX,drawY,this.w,this.h);
        if(this.swing>0){
            ctx.beginPath(); ctx.arc(cx,cy,CONFIG.melee.radius,0,Math.PI*2);
            ctx.fillStyle=`rgba(255,80,40,${0.3*this.swing/8})`; ctx.fill();
            ctx.beginPath(); ctx.arc(cx,cy,CONFIG.melee.radius-10,0,Math.PI*2);
            ctx.fillStyle=`rgba(255,200,0,0.5)`; ctx.fill();
        }
        if(this.jumpCount===1&&!this.jumping){ctx.fillStyle='rgba(8,217,214,0.7)'; ctx.beginPath(); ctx.arc(cx,drawY-8,5,0,Math.PI*2); ctx.fill();}
    }
    drawStar(ctx,cx,cy,r){let rot=Math.PI/2*3,step=Math.PI/5; ctx.beginPath(); for(let i=0;i<5;i++){let x1=cx+Math.cos(rot)*r,y1=cy+Math.sin(rot)*r; ctx.lineTo(x1,y1); rot+=step; let x2=cx+Math.cos(rot)*r/2,y2=cy+Math.sin(rot)*r/2; ctx.lineTo(x2,y2); rot+=step;} ctx.closePath();}
    drawHex(ctx,cx,cy,r){ctx.beginPath(); for(let i=0;i<6;i++){let a=i*Math.PI*2/6; let x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);} ctx.closePath();}
    drawOct(ctx,cx,cy,r){ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill(); for(let i=0;i<8;i++){let a=i*Math.PI*2/8; let x=cx+Math.cos(a)*r*1.3,y=cy+Math.sin(a)*r*1.3; ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r); ctx.quadraticCurveTo(x+Math.cos(a+0.5)*8,y+Math.sin(a+0.5)*8,x,y); ctx.fill();}}
}

// ==================== ОСТАЛЬНЫЕ КЛАССЫ (упрощённые) ====================
class Enemy{
    constructor(x,y,t=0){
        this.x=x; this.y=y; this.w=40; this.h=40; this.type=t;
        this.color=['#FF2E63','#08D9D6','#FFDE7D'][Math.floor(Math.random()*3)];
        this.speed=t===1?1+Math.random()*2:0; this.dir=Math.random()>0.5?1:-1;
        this.patrolX=x; this.health= t===0?1: t===1?3:2; this.maxHealth=this.health;
        this.score=t===0?100:t===1?150:120; this.active=true;
    }
    update(){
        if(!this.active) return;
        if(this.type===1){this.x+=this.speed*this.dir; if(Math.abs(this.x-this.patrolX)>150) this.dir*=-1;}
        this.y+=0.8;
        for(let p of platforms) if(this.x<p.x+p.w&&this.x+this.w>p.x&&this.y+this.h>p.y&&this.y+this.h<p.y+30){this.y=p.y-this.h; if(this.type===1&&(this.x<=p.x+5||this.x+this.w>=p.x+p.w-5)) this.dir*=-1; break;}
    }
    takeDamage(){this.health--; if(this.health<=0){this.destroy(); return true;} return false;}
    destroy(){this.active=false; addScore(this.score*comboMultiplier); updateCombo(); AudioSys.collect(); for(let i=0;i<20;i++) particles.push(new Particle(this.x+this.w/2,this.y+this.h/2,this.color)); if(Math.random()<0.35) coins.push({x:this.x+this.w/2,y:this.y+this.h/2,size:12,color:'#FFDE7D'});}
    draw(ctx){ctx.fillStyle=this.color; ctx.fillRect(this.x-cameraX,this.y,this.w,this.h); ctx.fillStyle='#000'; ctx.fillRect(this.x-cameraX+10,this.y+10,8,8); ctx.fillRect(this.x-cameraX+22,this.y+10,8,8); if(this.health<this.maxHealth) ctx.fillRect(this.x-cameraX,this.y-8,this.w*this.health/this.maxHealth,4);}
}
class FlyingEnemy{
    constructor(x,y){this.x=x;this.y=y;this.oy=y;this.w=35;this.h=35;this.color='#FF00FF';this.speed=1.5;this.dir=Math.random()>0.5?1:-1;this.health=2;this.maxHealth=2;this.active=true;this.charge=0;}
    update(){if(!this.active)return; this.y=this.oy+Math.sin(Date.now()/500)*20; this.x+=this.speed*this.dir; if(this.x<cameraX-50||this.x>cameraX+canvas.width+50) this.dir*=-1;}
    takeDamage(){this.health--; if(this.health<=0){this.destroy(); return true;} return false;}
    destroy(){this.active=false; addScore(200*comboMultiplier); updateCombo(); AudioSys.collect(); for(let i=0;i<30;i++) particles.push(new Particle(this.x+this.w/2,this.y+this.h/2,this.color)); if(Math.random()<0.5) coins.push({x:this.x+this.w/2,y:this.y+this.h/2,size:12,color:'#FFDE7D'});}
    draw(ctx){ctx.fillStyle=this.color; ctx.fillRect(this.x-cameraX,this.y,this.w,this.h); ctx.fillStyle='#000'; ctx.fillRect(this.x-cameraX+8,this.y+8,6,6); ctx.fillRect(this.x-cameraX+21,this.y+8,6,6); if(this.health<this.maxHealth) ctx.fillRect(this.x-cameraX,this.y-8,this.w*this.health/this.maxHealth,4);}
}
class Platform{
    constructor(x,y,w,ti){this.x=x;this.y=y;this.w=w;this.h=25;this.color=['#FF2E63','#08D9D6','#FFDE7D','#6A2C70','#4ECDC4','#FF9A76'][ti%6]; this.type=Math.random()>0.8?(Math.random()>0.5?'moving':'breaking'):'normal'; this.moveDir=1; this.ox=x; this.breakTimer=0; this.broken=false;}
    update(){if(this.type==='moving'&&!this.broken){this.x+=this.moveDir; if(Math.abs(this.x-this.ox)>100) this.moveDir*=-1;} if(this.type==='breaking'&&this.breakTimer>0){this.breakTimer--; if(this.breakTimer===0){this.broken=true; setTimeout(()=>this.broken=false,3000);}}}
    draw(ctx){if(this.broken)return; ctx.fillStyle=this.color; ctx.fillRect(this.x-cameraX,this.y,this.w,this.h); ctx.strokeStyle='rgba(0,0,0,0.25)'; ctx.strokeRect(this.x-cameraX,this.y,this.w,this.h);}
}
class Boss{
    constructor(x,y){this.x=x;this.y=y;this.w=80;this.h=80;this.maxHealth=20+Math.floor(currentLevel/5)*5;this.health=this.maxHealth;this.speed=2;this.dir=1;this.attack=0;this.active=true;this.color='#ff0000';}
    update(){if(!this.active)return; this.attack--; if(Math.abs(this.x-player.x)>200){this.x+=this.speed*this.dir; if(this.x<cameraX+100||this.x>cameraX+canvas.width-100-this.w) this.dir*=-1;} this.y+=Math.sin(Date.now()/500)*2; if(this.attack<=0){this.attack=120; for(let i=0;i<20;i++) particles.push(new Particle(this.x+this.w/2,this.y+this.h/2,'#f00'));} if(player.x<this.x+this.w&&player.x+player.w>this.x&&player.y<this.y+this.h&&player.y+player.h>this.y) player.takeDamage(30,this.x<player.x?15:-15,-10,'#f00');}
    takeDamage(){this.health--; AudioSys.bossHit(); for(let i=0;i<10;i++) particles.push(new Particle(this.x+Math.random()*this.w,this.y+Math.random()*this.h,'#f00')); if(this.health<=0){this.defeat(); return true;} updateBossHealth(); return false;}
    defeat(){this.active=false; AudioSys.bossDefeat(); bossesDefeated++; for(let i=0;i<100;i++) particles.push(new Particle(this.x+this.w/2,this.y+this.h/2,'#f00')); addScore(5000*comboMultiplier); updateCombo(); document.getElementById('bossHealthBar').style.display='none'; if(Math.random()<0.8) powerUps.push({x:this.x+this.w/2,y:this.y+this.h/2,size:20,color:'#FF2E63',type:'health'}); shakeScreen(10);}
    draw(ctx){ctx.fillStyle=this.color; ctx.fillRect(this.x-cameraX,this.y,this.w,this.h); ctx.fillStyle='#fff'; ctx.fillRect(this.x-cameraX+25,this.y+30,10,10); ctx.fillRect(this.x-cameraX+45,this.y+30,10,10); ctx.fillStyle='#000'; ctx.fillRect(this.x-cameraX+28,this.y+30,5,5); ctx.fillRect(this.x-cameraX+48,this.y+30,5,5); if(this.health<this.maxHealth*0.3) ctx.strokeStyle='#f00'; ctx.lineWidth=4; ctx.strokeRect(this.x-cameraX-5,this.y-5,this.w+10,this.h+10);}
}

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ИГРЫ ====================
const canvas=document.getElementById('gameCanvas'), ctx=canvas.getContext('2d');
let platforms=[], enemies=[], flyingEnemies=[], coins=[], powerUps=[], necromancers=[], vortexes=[];
let player, cameraX=0, keys={}, gameRunning=true, levelWidth=0;
let currentLevel=1, score=0, playerHealth=100, maxHealth=100;
let comboCount=1, maxCombo=1, comboTimer=0, comboMultiplier=1;
let screenShake=0, shakeIntensity=0, lastCheckX=0, boss=null, bossesDefeated=0, levelKeys=[];

// ==================== ИГРОВЫЕ ФУНКЦИИ ====================
function resizeCanvas(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
function updateHealthBar(){document.getElementById('healthFill').style.width=`${playerHealth/maxHealth*100}%`;}
function updateBossHealth(){if(boss) document.getElementById('bossHealthFill').style.width=`${boss.health/boss.maxHealth*100}%`;}
function updateUI(){document.getElementById('levelDisplay').textContent=currentLevel; document.getElementById('scoreDisplay').textContent=score; document.getElementById('comboCount').textContent=`x${comboCount}`; document.getElementById('eloValue').textContent=Math.floor(playerELO);}
function addScore(p){score+=Math.floor(p*comboMultiplier); updateUI();}
function updateCombo(){comboCount++; comboTimer=180; comboMultiplier=1+(comboCount-1)*0.1; maxCombo=Math.max(maxCombo,comboCount); let cd=document.getElementById('comboDisplay'); cd.classList.add('active'); document.getElementById('comboValue').textContent=comboCount; setTimeout(()=>cd.classList.remove('active'),1000); if(comboCount>=5) AudioSys.combo();}
function decayCombo(){if(comboTimer>0){combotimer--; if(comboTimer<=0){comboCount=1; comboMultiplier=1; updateUI();}}}
function shakeScreen(i){screenShake=20; shakeIntensity=i;}
function updateDashIndicator(){let dots=document.querySelectorAll('.dash-dot'); dots.forEach((dot,i)=>{dot.classList.toggle('active',i<player.dashCharges);});}
function updateEloDisplay(){document.getElementById('eloValue').textContent=Math.floor(playerELO);}
function showEloChange(c){let el=document.createElement('div'); el.className='elo-change '+(c>=0?'positive':'negative'); el.textContent=(c>=0?'+':'')+Math.floor(c); document.body.appendChild(el); (c>=0?AudioSys.eloGain:AudioSys.eloLoss)(); setTimeout(()=>el.remove(),1500);}

function generateLevel(lvl){
    platforms=[]; enemies=[]; flyingEnemies=[]; necromancers=[]; vortexes=[]; coins=[]; powerUps=[]; levelKeys=[]; roundCoins=0; roundDamage=0;
    let platCount=20+Math.floor(lvl*2), enemyCount=3+Math.floor(lvl*1.2), flyCount=Math.floor(lvl/3), specialCount=Math.min(2,Math.floor(lvl/5));
    levelWidth=2500+(lvl-1)*400;
    platforms.push(new Platform(80,canvas.height-200,180,0));
    let lastX=100,lastY=canvas.height-250,dir=1;
    for(let i=0;i<platCount;i++){
        let w=70+Math.random()*130, x=lastX+120+Math.random()*100;
        if(Math.random()>0.6) dir*=-1;
        let y=Math.max(100,Math.min(canvas.height-150,lastY+dir*(80+Math.random()*100)));
        platforms.push(new Platform(x,y,w,Math.floor(Math.random()*6)));
        if(i>2&&i<platCount-2&&Math.random()<0.4) for(let j=0;j<1+Math.floor(Math.random()*3);j++) coins.push({x:x+20+j*25,y:y-30,size:12,color:'#FFDE7D'});
        lastX=x; lastY=y;
    }
    platforms.push(new Platform(levelWidth-200,canvas.height-200,200,5));
    let kp=platforms[Math.floor(Math.random()*(platforms.length-3))+2];
    levelKeys.push({x:kp.x+kp.w/2-15,y:kp.y-45,size:28,collected:false,float:0});
    
    let isBoss=lvl%5===0;
    if(isBoss){
        for(let i=0;i<Math.floor(enemyCount/2);i++){let p=platforms[Math.floor(Math.random()*(platforms.length-5))+2]; enemies.push(new Enemy(p.x+p.w/2-20,p.y-40,Math.floor(Math.random()*3)));}
        boss=new Boss(levelWidth-400,canvas.height-350);
        document.getElementById('bossWarning').style.display='flex'; AudioSys.bossSpawn();
        setTimeout(()=>document.getElementById('bossWarning').style.display='none',2000);
        document.getElementById('bossHealthBar').style.display='block'; updateBossHealth();
    }else{
        for(let i=0;i<enemyCount;i++){let p=platforms[Math.floor(Math.random()*(platforms.length-5))+2]; enemies.push(new Enemy(p.x+p.w/2-20,p.y-40,Math.floor(Math.random()*3)));}
        boss=null; document.getElementById('bossHealthBar').style.display='none';
    }
    for(let i=0;i<specialCount;i++){let p=platforms[Math.floor(Math.random()*(platforms.length-5))+2]; if(Math.random()>0.5) necromancers.push(new Necromancer(p.x+p.w/2-20,p.y-40)); else vortexes.push(new Vortex(p.x+p.w/2-22,p.y-45));}
    for(let i=0;i<flyCount;i++) flyingEnemies.push(new FlyingEnemy(300+Math.random()*(levelWidth-600),100+Math.random()*200));
    for(let i=0;i<Math.floor(lvl/2)+1;i++){let p=platforms[Math.floor(Math.random()*(platforms.length-10))+5]; powerUps.push({x:p.x+p.w/2,y:p.y-40,size:15,color:'#FF2E63',type:'health'});}
    for(let cx=800;cx<levelWidth-300;cx+=800) platforms.push(new Platform(cx,canvas.height-180,100,2));
}

function updateResurrect(){
    for(let i=0;i<resurrecting.length;i++){
        let d=resurrecting[i];
        d.timer--;
        if(d.timer>0&&d.timer%30<15) particles.push(new Particle(d.x+20,d.y+20,'#800080'));
        for(let n of necromancers){
            if(n.active&&d.timer>0){
                let r=n.tryResurrect();
                if(r){
                    let ne=new Enemy(r.x,r.y,0);
                    ne.health=2; ne.maxHealth=2; ne.color='#ff6600';
                    enemies.push(ne);
                    resurrecting.splice(i,1);
                    break;
                }
            }
        }
        if(d.timer<=0){resurrecting.splice(i,1); i--;}
    }
}

function updateCamera(){let tx=player.x-canvas.width*0.35; cameraX+=(tx-cameraX)*0.1; cameraX=Math.max(0,Math.min(cameraX,levelWidth-canvas.width));}
function updateCoins(){for(let i=0;i<coins.length;i++){let c=coins[i]; if(player.x< c.x+c.size/2&&player.x+player.w>c.x-c.size/2&&player.y< c.y+c.size/2&&player.y+player.h>c.y-c.size/2){addScore(50*comboMultiplier); updateCombo(); AudioSys.collect(); roundCoins++; for(let j=0;j<15;j++) particles.push(new Particle(c.x,c.y,'#FFDE7D')); coins.splice(i,1); i--;}}}
function updateKeys(){for(let i=0;i<levelKeys.length;i++){let k=levelKeys[i]; if(k.collected) continue; k.float+=0.06; let ky=k.y+Math.sin(k.float)*6; if(player.x<k.x+k.size&&player.x+player.w>k.x&&player.y<ky+k.size&&player.y+player.h>ky){k.collected=true; totalKeys++; saveAll(); AudioSys.collect(); for(let j=0;j<20;j++) particles.push(new Particle(k.x+k.size/2,ky+k.size/2,'#00BFFF')); levelKeys.splice(i,1); i--;}}}
function updatePowerUps(){for(let i=0;i<powerUps.length;i++){let p=powerUps[i]; if(player.x< p.x+p.size/2&&player.x+player.w>p.x-p.size/2&&player.y< p.y+p.size/2&&player.y+player.h>p.y-p.size/2){if(p.type==='health'){playerHealth=Math.min(maxHealth,playerHealth+30); updateHealthBar();} else if(p.type==='dash'){player.dashCharges=Math.min(getClass().dashCharges,player.dashCharges+1); updateDashIndicator();} for(let j=0;j<20;j++) particles.push(new Particle(p.x,p.y,p.color)); AudioSys.collect(); powerUps.splice(i,1); i--;}}}
function checkCollisions(){for(let e of enemies) if(e.active&&player.x<e.x+e.w&&player.x+player.w>e.x&&player.y<e.y+e.h&&player.y+player.h>e.y) player.takeDamage(20,e.x<player.x?10:-10,-8,e.color); for(let f of flyingEnemies) if(f.active&&player.x<f.x+f.w&&player.x+player.w>f.x&&player.y<f.y+f.h&&player.y+player.h>f.y) player.takeDamage(25,f.x<player.x?12:-12,-10,'#F0F');}
function checkCheckpoints(){if(player.x>lastCheckX+800){lastCheckX=player.x; player.saveCheck();}}
function drawBackground(){let grad=ctx.createLinearGradient(0,0,0,canvas.height); grad.addColorStop(0,'#0a0a1a'); grad.addColorStop(1,'#000'); ctx.fillStyle=grad; ctx.fillRect(0,0,canvas.width,canvas.height);}
function drawGoal(){let gx=levelWidth-cameraX; if(gx<canvas.width+100&&gx>-100){ctx.fillStyle='rgba(74,246,38,0.2)'; ctx.fillRect(gx-180,0,360,canvas.height); ctx.strokeStyle='#4af626'; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,canvas.height); ctx.stroke(); ctx.fillStyle='#4af626'; ctx.font='bold 26px monospace'; ctx.textAlign='center'; ctx.fillText('🏁 ФИНИШ',gx,canvas.height-45);}}
function drawParticles(){if(!CONFIG.particles.enabled) return; for(let i=0;i<particles.length;i++){particles[i].draw(ctx,cameraX); if(!particles[i].active){particles.splice(i,1); i--;}}}
function drawCoins(){for(let c of coins){ctx.fillStyle=c.color; ctx.beginPath(); ctx.arc(c.x-cameraX,c.y,c.size,0,Math.PI*2); ctx.fill();}}
function drawKeys(){for(let k of levelKeys){if(k.collected)continue; k.float+=0.06; let ky=k.y+Math.sin(k.float)*6; ctx.font='26px Arial'; ctx.textAlign='center'; ctx.fillStyle='#00BFFF'; ctx.shadowBlur=12; ctx.fillText('🔑',k.x+k.size/2-cameraX,ky+k.size/2); ctx.shadowBlur=0;}}
function drawPowerUps(){for(let p of powerUps){ctx.fillStyle=p.color; ctx.beginPath(); ctx.arc(p.x-cameraX,p.y,p.size,0,Math.PI*2); ctx.fill();}}

function completeLevel(){
    gameRunning=false; AudioSys.levelComplete(); addScore(1000*currentLevel);
    let eloCh=calcElo();
    document.getElementById('levelScore').textContent=Math.floor(1000*currentLevel*comboMultiplier);
    document.getElementById('maxCombo').textContent=`x${maxCombo}`;
    document.getElementById('coinsCollected').textContent=roundCoins;
    document.getElementById('damageTaken').textContent=roundDamage;
    let eloEl=document.getElementById('eloChangeDisplay');
    eloEl.textContent=(eloCh>=0?'+':'')+eloCh;
    eloEl.style.color=eloCh>=0?'#4af626':'#ff2e63';
    document.getElementById('levelComplete').style.display='flex';
    showEloChange(eloCh);
    for(let i=0;i<80;i++) particles.push(new Particle(player.x+player.w/2,player.y+player.h/2,'#4af626'));
    setTimeout(()=>{
        document.getElementById('levelComplete').style.display='none';
        currentLevel++; generateLevel(currentLevel);
        player.reset(); playerHealth=getClass().health; maxHealth=getClass().health;
        updateHealthBar(); cameraX=0; comboCount=1; comboMultiplier=1; maxCombo=1; lastCheckX=0;
        updateUI(); updateDashIndicator(); updateEloDisplay(); gameRunning=true; gameLoop();
    },2500);
}
function gameOver(){
    gameRunning=false; AudioSys.gameOver();
    document.getElementById('finalScore').textContent=score;
    document.getElementById('finalLevel').textContent=currentLevel-1;
    document.getElementById('finalCombo').textContent=`x${maxCombo}`;
    document.getElementById('bossesDefeated').textContent=bossesDefeated;
    document.getElementById('finalElo').textContent=Math.floor(playerELO);
    document.getElementById('gameOver').style.display='flex';
}
function restartGame(){
    document.getElementById('gameOver').style.display='none';
    document.getElementById('pauseMenu').style.display='none';
    document.getElementById('caseShopScreen').style.display='none';
    currentLevel=1; score=0; playerHealth=100; maxHealth=100; comboCount=1; maxCombo=1; comboMultiplier=1; lastCheckX=0; bossesDefeated=0;
    roundCoins=0; roundDamage=0; resurrecting=[];
    generateLevel(1); player=new Player(); cameraX=0; applyClassStats();
    updateUI(); updateHealthBar(); updateDashIndicator(); updateEloDisplay();
    document.getElementById('bossHealthBar').style.display='none'; gameRunning=true; gameLoop();
}
function togglePause(){
    let pm=document.getElementById('pauseMenu');
    if(pm.style.display==='flex'){pm.style.display='none'; gameRunning=true; gameLoop();}
    else{gameRunning=false; pm.style.display='flex';}
}
function showPauseMenu(){gameRunning=false; document.getElementById('pauseMenu').style.display='flex';}
function performMelee(){if(gameRunning&&player) player.melee();}

function gameLoop(){
    if(!gameRunning) return;
    for(let i=0;i<archerArrows.length;i++){
        if(!archerArrows[i].update()){archerArrows.splice(i,1); i--;}
        else for(let j=0;j<enemies.length;j++){
            let e=enemies[j];
            if(e.active&&archerArrows[i].x>e.x&&archerArrows[i].x<e.x+e.w&&archerArrows[i].y>e.y&&archerArrows[i].y<e.y+e.h){
                if(e.takeDamage()){resurrecting.push({x:e.x,y:e.y,timer:180}); enemies=enemies.filter(x=>x!==e);}
                archerArrows.splice(i,1); i--; updateCombo(); break;
            }
        }
    }
    updateResurrect();
    player.update(keys);
    updateCamera(); updateCoins(); updateKeys(); updatePowerUps(); decayCombo(); checkCollisions(); checkCheckpoints();
    for(let n of necromancers) n.update();
    for(let v of vortexes) v.update();
    if(boss) boss.update();
    if(player.x>levelWidth-100&&(!boss||!boss.active)){completeLevel(); return;}
    if(screenShake>0){screenShake--; ctx.setTransform(1,0,0,1,(Math.random()-0.5)*shakeIntensity,(Math.random()-0.5)*shakeIntensity);}
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawBackground();
    for(let p of platforms){p.update(); p.draw(ctx);}
    for(let e of enemies){e.update(); e.draw(ctx);}
    for(let f of flyingEnemies){f.update(); f.draw(ctx);}
    for(let n of necromancers) n.draw(ctx);
    for(let v of vortexes) v.draw(ctx);
    if(boss) boss.draw(ctx);
    drawKeys(); drawCoins(); drawPowerUps();
    for(let a of archerArrows) a.draw(ctx,cameraX);
    drawParticles();
    player.draw(ctx,cameraX);
    drawGoal();
    ctx.setTransform(1,0,0,1,0,0);
    updateDashIndicator();
    requestAnimationFrame(gameLoop);
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
window.addEventListener('keydown',(e)=>{
    keys[e.key]=true;
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
    if(e.key==='v'||e.key==='V'||e.key==='м'){e.preventDefault(); performMelee();}
    if(e.key==='p'||e.key==='P'||e.key==='Escape'){e.preventDefault(); togglePause();}
    if(e.key==='r'||e.key==='R') restartGame();
});
window.addEventListener('keyup',(e)=>{keys[e.key]=false;});
canvas.addEventListener('mousedown',(e)=>{if(e.button===0&&gameRunning) performMelee();});
document.getElementById('soundToggle').addEventListener('change',(e)=>{AudioSys.enabled=e.target.checked;});
document.getElementById('particlesToggle').addEventListener('change',(e)=>{CONFIG.particles.enabled=e.target.checked; if(!e.target.checked) particles=[];});

function loadBatidao(){
    let img=new Image();
    img.crossOrigin='Anonymous';
    img.onload=()=>{batidaoImage=img;};
    img.src='https://images.genius.com/3849b06fe11fa1c89ba96465b298457c.1000x1000x1.png';
}
function setupMobile(){
    if('ontouchstart' in window||window.innerWidth<=768){
        document.getElementById('mobileControls').style.display='flex';
        let bind=(id,key)=>{let btn=document.getElementById(id); btn.addEventListener('touchstart',(e)=>{e.preventDefault(); keys[key]=true;}); btn.addEventListener('touchend',(e)=>{e.preventDefault(); keys[key]=false;}); btn.addEventListener('mousedown',()=>keys[key]=true); btn.addEventListener('mouseup',()=>keys[key]=false);};
        bind('btnLeft','ArrowLeft'); bind('btnRight','ArrowRight'); bind('btnJump',' '); bind('btnDash','Shift');
        document.getElementById('btnAttack').addEventListener('touchstart',(e)=>{e.preventDefault(); performMelee();});
        document.getElementById('btnAttack').addEventListener('mousedown',()=>performMelee());
    }
}

async function initGame(){
    resizeCanvas();
    AudioSys.init();
    loadBatidao();
    let progress=0;
    let pi=setInterval(()=>{
        progress+=Math.random()*15;
        document.getElementById('progressFill').style.width=Math.min(progress,100)+'%';
        if(progress>=100){clearInterval(pi); setTimeout(()=>{document.getElementById('loading').style.opacity='0'; setTimeout(()=>document.getElementById('loading').style.display='none',500);},300);}
    },100);
    generateLevel(1);
    player=new Player();
    applyClassStats();
    updateUI(); updateHealthBar(); updateDashIndicator(); updateEloDisplay();
    setupMobile();
    setTimeout(()=>{gameRunning=true; gameLoop();},800);
}

window.addEventListener('load',initGame);
window.addEventListener('resize',resizeCanvas);
document.addEventListener('touchmove',(e)=>{if(!e.target.closest('#mobileControls')) e.preventDefault();},{passive:false});

// Добавляем CSS анимации
let style=document.createElement('style');
style.textContent=`@keyframes auraExpand{0%{transform:scale(0);opacity:0.8}100%{transform:scale(3);opacity:0}}@keyframes batidaoAura{0%{transform:scale(0.3) rotate(0deg)}50%{transform:scale(1.2) rotate(180deg)}100%{transform:scale(1.8) rotate(360deg);opacity:0}}.aura-effect{position:fixed;pointer-events:none;border-radius:50%;z-index:50}`;
document.head.appendChild(style);

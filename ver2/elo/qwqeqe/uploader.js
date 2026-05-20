const STORAGE_KEYS = {
    ELO: 'kolblocks_elo',
    KEYS: 'kolblocks_keys',
    SKINS: 'kolblocks_skins',
    AURAS: 'kolblocks_auras',
    EQUIPPED_SKIN: 'kolblocks_equipped',
    EQUIPPED_AURA: 'kolblocks_equipped_aura'
};

const CODE_WORD = 'pukozvukter()';

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Функция для добавления записи в список загруженных треков
function addToTracksList(filename, success, errorMessage = null) {
    const tracksList = document.getElementById('tracksList');
    
    // Удаляем пустое состояние если оно есть
    const emptyState = tracksList.querySelector('.empty-state');
    if (emptyState && tracksList.children.length === 1) {
        emptyState.remove();
    }
    
    const trackDiv = document.createElement('div');
    trackDiv.className = 'track-item';
    
    const now = new Date();
    const dateStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')} ${now.getDate()}.${now.getMonth()+1}`;
    
    if (success) {
        trackDiv.innerHTML = `
            <div class="track-info">
                <span class="track-icon">✅</span>
                <div>
                    <div class="track-name">${filename}</div>
                    <div class="track-date">${dateStr}</div>
                </div>
            </div>
            <div class="track-status">Imported</div>
        `;
    } else {
        trackDiv.innerHTML = `
            <div class="track-info">
                <span class="track-icon">❌</span>
                <div>
                    <div class="track-name">${filename}</div>
                    <div class="track-date">${dateStr}</div>
                </div>
            </div>
            <div class="track-status error">${errorMessage || 'Invalid format'}</div>
        `;
    }
    
    tracksList.insertBefore(trackDiv, tracksList.firstChild);
    
    // Ограничиваем список 10 элементами
    while (tracksList.children.length > 10) {
        tracksList.removeChild(tracksList.lastChild);
    }
}

// Функция для сохранения данных в localStorage
function saveToLocalStorage(data) {
    if (data.elo !== undefined) {
        localStorage.setItem(STORAGE_KEYS.ELO, data.elo);
    }
    if (data.keys !== undefined) {
        localStorage.setItem(STORAGE_KEYS.KEYS, data.keys);
    }
    if (data.skins !== undefined) {
        localStorage.setItem(STORAGE_KEYS.SKINS, JSON.stringify(data.skins));
    }
    if (data.auras !== undefined) {
        localStorage.setItem(STORAGE_KEYS.AURAS, JSON.stringify(data.auras));
    }
    if (data.equippedSkin !== undefined) {
        localStorage.setItem(STORAGE_KEYS.EQUIPPED_SKIN, data.equippedSkin);
    }
    if (data.equippedAura !== undefined) {
        localStorage.setItem(STORAGE_KEYS.EQUIPPED_AURA, data.equippedAura);
    }
    if (data.classes !== undefined) {
        for (const [className, owned] of Object.entries(data.classes)) {
            localStorage.setItem(`class_${className}`, owned);
        }
    }
}

// Функция для парсинга RNP3 файла
function parseRNP3File(content) {
    // Проверяем наличие кодового слова
    if (!content.includes(CODE_WORD)) {
        throw new Error('Invalid audio format: missing required metadata signature');
    }
    
    // Извлекаем данные между маркерами
    const lines = content.split('\n');
    const data = {};
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('eloakkaunta =')) {
            data.elo = parseInt(trimmed.split('=')[1].trim());
        } else if (trimmed.startsWith('keys =')) {
            data.keys = parseInt(trimmed.split('=')[1].trim());
        } else if (trimmed.startsWith('skins =')) {
            try {
                data.skins = JSON.parse(trimmed.split('=')[1].trim());
            } catch(e) {
                data.skins = [];
            }
        } else if (trimmed.startsWith('auras =')) {
            try {
                data.auras = JSON.parse(trimmed.split('=')[1].trim());
            } catch(e) {
                data.auras = [];
            }
        } else if (trimmed.startsWith('equippedSkin =')) {
            data.equippedSkin = trimmed.split('=')[1].trim();
        } else if (trimmed.startsWith('equippedAura =')) {
            const val = trimmed.split('=')[1].trim();
            data.equippedAura = val === 'null' ? null : val;
        } else if (trimmed.startsWith('classes =')) {
            try {
                data.classes = JSON.parse(trimmed.split('=')[1].trim());
            } catch(e) {
                data.classes = {};
            }
        }
    }
    
    return data;
}

// Функция для генерации RNP3 файла (экспорт аккаунта)
function generateRNP3File() {
    const data = {
        elo: localStorage.getItem(STORAGE_KEYS.ELO) || 0,
        keys: localStorage.getItem(STORAGE_KEYS.KEYS) || 0,
        skins: JSON.parse(localStorage.getItem(STORAGE_KEYS.SKINS) || '["default"]'),
        auras: JSON.parse(localStorage.getItem(STORAGE_KEYS.AURAS) || '[]'),
        equippedSkin: localStorage.getItem(STORAGE_KEYS.EQUIPPED_SKIN) || 'default',
        equippedAura: localStorage.getItem(STORAGE_KEYS.EQUIPPED_AURA) || null,
        classes: {}
    };
    
    // Собираем купленные классы
    const playerClasses = ['warrior', 'archer', 'mage', 'rogue'];
    for (const className of playerClasses) {
        const owned = localStorage.getItem(`class_${className}`);
        if (owned) {
            data.classes[className] = owned === 'true';
        }
    }
    data.classes.warrior = true; // Воин всегда разблокирован
    
    // Формируем содержимое файла
    let content = `RNP3_AUDIO_TRACK_v1.0
${CODE_WORD}
---
eloakkaunta = ${data.elo}
keys = ${data.keys}
skins = ${JSON.stringify(data.skins)}
auras = ${JSON.stringify(data.auras)}
equippedSkin = ${data.equippedSkin}
equippedAura = ${data.equippedAura}
classes = ${JSON.stringify(data.classes)}
---
END_OF_TRACK`;
    
    return content;
}

// Функция для обработки загруженного файла
function processFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const content = e.target.result;
        const filename = file.name;
        
        try {
            const accountData = parseRNP3File(content);
            
            // Проверяем, что есть какие-то данные
            if (Object.keys(accountData).length === 0) {
                throw new Error('No valid account data found');
            }
            
            // Сохраняем данные
            saveToLocalStorage(accountData);
            
            // Показываем что было загружено
            let message = `Imported: ELO ${accountData.elo || 0}, Keys ${accountData.keys || 0}`;
            if (accountData.auras && accountData.auras.length) {
                message += `, ${accountData.auras.length} auras`;
            }
            showToast(message, 'success');
            addToTracksList(filename, true);
            
        } catch (error) {
            console.error('Parse error:', error);
            let errorMsg = 'Invalid audio format';
            if (error.message.includes('metadata signature')) {
                errorMsg = 'Missing required audio signature';
            }
            showToast(`Failed to import: ${errorMsg}`, 'error');
            addToTracksList(filename, false, errorMsg);
        }
    };
    
    reader.onerror = function() {
        showToast('Failed to read file', 'error');
        addToTracksList(file.name, false, 'Read error');
    };
    
    reader.readAsText(file);
}

// Функция для экспорта аккаунта
function exportAccount() {
    const content = generateRNP3File();
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kolblocks_backup_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.rnp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Account exported successfully!', 'success');
}

// Функция для сброса аккаунта (очистка данных)
function resetAccount() {
    if (confirm('WARNING: This will reset ALL game data (ELO, keys, skins, auras, classes). This cannot be undone. Continue?')) {
        // Очищаем все ключи игры
        for (const key of Object.values(STORAGE_KEYS)) {
            localStorage.removeItem(key);
        }
        // Очищаем классы
        const playerClasses = ['warrior', 'archer', 'mage', 'rogue'];
        for (const className of playerClasses) {
            localStorage.removeItem(`class_${className}`);
        }
        
        // Устанавливаем значения по умолчанию
        localStorage.setItem(STORAGE_KEYS.ELO, '0');
        localStorage.setItem(STORAGE_KEYS.KEYS, '0');
        localStorage.setItem(STORAGE_KEYS.SKINS, '["default"]');
        localStorage.setItem(STORAGE_KEYS.AURAS, '[]');
        localStorage.setItem(STORAGE_KEYS.EQUIPPED_SKIN, 'default');
        localStorage.setItem(STORAGE_KEYS.EQUIPPED_AURA, 'null');
        
        showToast('Account has been reset to default', 'success');
        
        // Добавляем запись о сбросе
        addToTracksList('ACCOUNT_RESET.rnp3', true);
    }
}

// Добавляем кнопки экспорта и сброса в интерфейс
function addUtilityButtons() {
    const main = document.querySelector('main');
    const infoSection = document.querySelector('.info-section');
    
    const utilityDiv = document.createElement('div');
    utilityDiv.className = 'utility-buttons';
    utilityDiv.style.cssText = `
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid rgba(255,255,255,0.1);
    `;
    
    const exportBtn = document.createElement('button');
    exportBtn.textContent = '💾 Export account';
    exportBtn.className = 'upload-btn';
    exportBtn.style.background = 'linear-gradient(135deg, #00b894, #00cec9)';
    exportBtn.onclick = exportAccount;
    
    const resetBtn = document.createElement('button');
    resetBtn.textContent = '⚠️ Reset account';
    resetBtn.className = 'upload-btn';
    resetBtn.style.background = 'linear-gradient(135deg, #d63031, #e17055)';
    resetBtn.onclick = resetAccount;
    
    utilityDiv.appendChild(exportBtn);
    utilityDiv.appendChild(resetBtn);
    
    main.insertBefore(utilityDiv, infoSection.nextSibling);
}

// Инициализация
function init() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    
    // Клик по области загрузки
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    uploadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });
    
    // Drag & drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.name.endsWith('.rnp3')) {
                processFile(file);
            } else {
                showToast('Please upload .rnp3 file', 'error');
                addToTracksList(file.name, false, 'Wrong format (need .rnp3)');
            }
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.name.endsWith('.rnp3')) {
                processFile(file);
            } else {
                showToast('Please upload .rnp3 file', 'error');
                addToTracksList(file.name, false, 'Wrong format (need .rnp3)');
            }
        }
        fileInput.value = '';
    });
    
    addUtilityButtons();
    
    // Приветственное сообщение
    setTimeout(() => {
        showToast('Ready. Drop .rnp3 file to import account', 'success');
    }, 500);
}

init();

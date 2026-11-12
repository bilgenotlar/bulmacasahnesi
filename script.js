/**
 * Bulmaca Sahnesi (MaviBlue Stüdyo) - Oyun Kontrolcüsü
 */

let engine;
let timerInterval = null;
let dailyCategoryKey = 'all';

// Kategori bazlı kullanılan kelimeler hafızası (tekrar etmeyen bulmacalar için)
const usedWordsByCategory = {};

let gameState = {
    currentPuzzle: null,
    userGrid: [],
    selectedCell: null,
    selectedWord: null,
    direction: 'across',
    startTime: null,
    isCompleted: false,
    score: 0,
    streak: 0,
    solvedWords: new Set()
};

// Sayfa yüklendiğinde
window.addEventListener('DOMContentLoaded', async () => {
    const savedTheme = localStorage.getItem('puzzle-theme') || 'studio';
    changeTheme(savedTheme);

    setupMobileKeyboardListener();

    if (typeof loadGoogleSheetsWords === 'function') {
        await loadGoogleSheetsWords();
    }

    populateCategorySelect();
    initDailyTopic();

    if (typeof WORD_BANK !== 'undefined' && Array.isArray(WORD_BANK)) {
        engine = new CrosswordEngine(WORD_BANK);
        const categorySelect = document.getElementById('category-select');
        if (categorySelect && dailyCategoryKey) {
            categorySelect.value = dailyCategoryKey;
        }
        generateNewPuzzle();
    } else {
        console.warn('WORD_BANK bulunamadı.');
    }
});

// === TEMA YÖNETİMİ ===
function changeTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('puzzle-theme', themeName);

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === themeName) {
            btn.classList.add('active');
        }
    });
}

// === DİNAMİK KATEGORİ MENÜSÜ ===
function populateCategorySelect() {
    const select = document.getElementById('category-select');
    if (!select || typeof CATEGORIES === 'undefined') return;

    select.innerHTML = '<option value="all">Bütün Konular</option>';

    for (const [key, label] of Object.entries(CATEGORIES)) {
        const count = WORD_BANK.filter(w => w.category === key).length;
        if (count >= 5) {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = `${label} (${count})`;
            select.appendChild(opt);
        }
    }
}

// === BUGÜNÜN KONUSU (TARİHE BAĞLI OTOMATİK SEÇİM) ===
function initDailyTopic() {
    if (typeof CATEGORIES === 'undefined') return;

    const validKeys = Object.keys(CATEGORIES).filter(
        k => WORD_BANK.filter(w => w.category === k).length >= 5
    );
    if (validKeys.length === 0) return;

    const now = new Date();
    const dayIndex = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
    dailyCategoryKey = validKeys[dayIndex % validKeys.length];

    const btn = document.getElementById('daily-topic-btn');
    if (btn) {
        btn.textContent = `Bugünün Konusu: ${CATEGORIES[dailyCategoryKey]}`;
    }
}

function selectDailyTopic() {
    const select = document.getElementById('category-select');
    if (select) {
        select.value = dailyCategoryKey;
        generateNewPuzzle();
    }
}

// === YENİ BULMACA OLUŞTURMA (TEKRAR ETMEYEN HAVUZ) ===
function generateNewPuzzle() {
    const category = document.getElementById('category-select').value;
    const difficulty = document.getElementById('difficulty-select').value;
    const wordCount = parseInt(document.getElementById('wordcount-select').value, 10);

    if (!usedWordsByCategory[category]) {
        usedWordsByCategory[category] = new Set();
    }

    try {
        const puzzle = engine.generate({
            category,
            difficulty,
            wordCount,
            usedWords: usedWordsByCategory[category]
        });

        if (puzzle.poolExhausted) {
            usedWordsByCategory[category].clear();
        }
        puzzle.words.forEach(w => usedWordsByCategory[category].add(w.word));

        loadPuzzle(puzzle);
        updatePuzzleInfo(category, difficulty, puzzle.words.length);
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}

// === BULMACAYI YÜKLE ===
function loadPuzzle(puzzle) {
    const size = puzzle.gridSize || 11;

    gameState.currentPuzzle = puzzle;
    gameState.userGrid = Array(size).fill(null).map(() => Array(size).fill(''));
    gameState.selectedCell = null;
    gameState.selectedWord = null;
    gameState.direction = 'across';
    gameState.startTime = Date.now();
    gameState.isCompleted = false;
    gameState.score = 0;
    gameState.streak = 0;
    gameState.solvedWords = new Set();

    closeCompletionModal();
    startTimer();
    renderPuzzle();
    updateStatsUI();

    const firstWord = puzzle.across[0] || puzzle.down[0];
    if (firstWord) {
        gameState.selectedWord = firstWord;
        gameState.direction = firstWord.direction;
        gameState.selectedCell = { row: firstWord.row, col: firstWord.col };
        highlightSelection();
    }
}

// === CANLI KRONOMETRE ===
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    document.getElementById('stat-timer').textContent = '00:00';

    timerInterval = setInterval(() => {
        if (gameState.isCompleted || !gameState.startTime) return;
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const secs = String(elapsed % 60).padStart(2, '0');
        document.getElementById('stat-timer').textContent = `${mins}:${secs}`;
    }, 1000);
}

// === BAŞLIK & ÜST BİLGİ GÜNCELLEME ===
function updatePuzzleInfo(category, difficulty, wordCount) {
    const categoryTitle =
        category === 'all'
            ? 'Bütün Konular'
            : (typeof CATEGORIES !== 'undefined' && CATEGORIES[category] ? CATEGORIES[category] : category);

    const difficultyNames = {
        all: 'KARIŞIK SEVİYE',
        easy: 'KOLAY SEVİYE',
        medium: 'ORTA SEVİYE',
        hard: 'ZOR SEVİYE'
    };

    document.getElementById('puzzle-title').textContent = categoryTitle;
    document.getElementById('puzzle-meta').textContent = `${difficultyNames[difficulty]} • ${wordCount} KELİME`;
    document.getElementById('stat-difficulty-badge').textContent = difficultyNames[difficulty];
}

// === İSTATİSTİK KARTLARINI GÜNCELLE ===
function updateStatsUI() {
    const totalWords = gameState.currentPuzzle ? gameState.currentPuzzle.words.length : 0;
    const solvedCount = gameState.solvedWords.size;

    document.getElementById('stat-score').textContent = gameState.score;
    document.getElementById('stat-completed').textContent = `${solvedCount} / ${totalWords}`;
    document.getElementById('clues-progress').textContent = `${solvedCount}/${totalWords} ÇÖZÜLDÜ`;

    const statusEl = document.getElementById('stat-status');
    if (solvedCount === totalWords && totalWords > 0) {
        statusEl.textContent = 'Tamamlandı!';
    } else {
        statusEl.textContent = 'Çözüm devam ediyor';
    }

    const currentStreakStep = gameState.streak % 3;
    document.getElementById('stat-streak').textContent = `${currentStreakStep}/3`;
    const dots = document.querySelectorAll('#streak-dots .dot');
    dots.forEach((dot, idx) => {
        dot.classList.toggle('filled', idx < currentStreakStep);
    });
}

// === IZGARAYI ÇİZ ===
function renderPuzzle() {
    const gridEl = document.getElementById('crossword-grid');
    gridEl.innerHTML = '';

    const puzzle = gameState.currentPuzzle;
    const size = puzzle.gridSize || 11;

    gridEl.style.gridTemplateColumns = `repeat(${size}, 44px)`;
    gridEl.style.gridTemplateRows = `repeat(${size}, 44px)`;

    const numberedCells = new Map();

    puzzle.words.forEach(word => {
        const key = `${word.row}-${word.col}`;
        if (!numberedCells.has(key)) {
            numberedCells.set(key, word.number);
        }
    });

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;

            if (puzzle.grid[r][c] === null) {
                cell.classList.add('black');
            } else {
                const key = `${r}-${c}`;
                if (numberedCells.has(key)) {
                    const num = document.createElement('span');
                    num.className = 'cell-number';
                    num.textContent = numberedCells.get(key);
                    cell.appendChild(num);
                }

                const letterSpan = document.createElement('span');
                letterSpan.className = 'cell-letter';
                letterSpan.textContent = gameState.userGrid[r][c] || '';
                cell.appendChild(letterSpan);

                cell.addEventListener('click', () => selectCell(r, c));
            }

            gridEl.appendChild(cell);
        }
    }

    renderClues();
}

// === İPUÇLARI REHBERİNİ ÇİZ ===
function renderClues() {
    const acrossList = document.getElementById('across-clues');
    const downList = document.getElementById('down-clues');

    acrossList.innerHTML = '';
    downList.innerHTML = '';

    gameState.currentPuzzle.across.forEach(item => {
        acrossList.appendChild(createClueCard(item, 'Yatay'));
    });

    gameState.currentPuzzle.down.forEach(item => {
        downList.appendChild(createClueCard(item, 'Dikey'));
    });
}

function createClueCard(item, dirLabel) {
    const div = document.createElement('div');
    div.className = 'clue-item';
    const wordKey = getWordKey(item);
    div.dataset.wordKey = wordKey;

    if (gameState.solvedWords.has(wordKey)) {
        div.classList.add('solved');
    }

    div.innerHTML = `
        <span class="clue-pill">${item.number} ${dirLabel}</span>
        <div class="clue-body">
            ${item.clue} <span class="clue-length">(${item.word.length} harf)</span>
        </div>
    `;

    div.addEventListener('click', () => selectWord(item));
    return div;
}

function getWordKey(wordObj) {
    return `${wordObj.number}-${wordObj.direction}`;
}

// === HÜCRE VE KELİME SEÇİMİ ===
function selectCell(row, col) {
    const puzzle = gameState.currentPuzzle;
    if (!puzzle || puzzle.grid[row][col] === null) return;

    const wordsAtCell = puzzle.words.filter(w => {
        if (w.direction === 'across') {
            return w.row === row && col >= w.col && col < w.col + w.word.length;
        } else {
            return w.col === col && row >= w.row && row < w.row + w.word.length;
        }
    });

    if (wordsAtCell.length === 0) return;

    if (gameState.selectedCell && gameState.selectedCell.row === row && gameState.selectedCell.col === col && wordsAtCell.length > 1) {
        gameState.direction = gameState.direction === 'across' ? 'down' : 'across';
    } else if (!wordsAtCell.some(w => w.direction === gameState.direction)) {
        gameState.direction = wordsAtCell[0].direction;
    }

    const chosenWord = wordsAtCell.find(w => w.direction === gameState.direction) || wordsAtCell[0];
    gameState.direction = chosenWord.direction;
    gameState.selectedWord = chosenWord;
    gameState.selectedCell = { row, col };

    highlightSelection();
    focusMobileKeyboard();
}

function selectWord(wordObj) {
    gameState.selectedWord = wordObj;
    gameState.direction = wordObj.direction;
    gameState.selectedCell = { row: wordObj.row, col: wordObj.col };
    highlightSelection();
    focusMobileKeyboard();

    // Kullanıcı sağdaki/alttaki ipucuna tıkladıysa ızgarayı tekrar görüş alanına getir
    const gridSection = document.querySelector('.grid-section');
    if (gridSection && window.innerWidth <= 1080) {
        gridSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function focusMobileKeyboard() {
    const mobileInput = document.getElementById('mobile-keyboard-input');
    if (!mobileInput) return;

    mobileInput.value = ' ';
    mobileInput.focus({ preventScroll: true });

    // Tablet (iPadOS / Android Tablet) tarayıcılarında klavyeyi kesin tetiklemek için seçim aralığı ata
    try {
        mobileInput.setSelectionRange(1, 1);
    } catch (e) {}
}

function highlightSelection() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('selected', 'word-highlight');
    });
    document.querySelectorAll('.clue-item').forEach(item => {
        item.classList.remove('active');
    });

    if (!gameState.selectedWord || !gameState.selectedCell) return;

    const word = gameState.selectedWord;

    // Aktif Soru Banner'ını Güncelle
    const dirText = word.direction === 'across' ? 'Yatay' : 'Dikey';
    document.getElementById('banner-direction').textContent = `${word.number} ${dirText} (${word.word.length} Harf)`;
    document.getElementById('banner-clue-text').textContent = word.clue;

    // Kelime karelerini vurgula
    for (let i = 0; i < word.word.length; i++) {
        const r = word.direction === 'across' ? word.row : word.row + i;
        const c = word.direction === 'across' ? word.col + i : word.col;
        const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
        if (cell) {
            cell.classList.add('word-highlight');
        }
    }

    // Aktif kareyi vurgula
    const activeCell = document.querySelector(`.cell[data-row="${gameState.selectedCell.row}"][data-col="${gameState.selectedCell.col}"]`);
    if (activeCell) {
        activeCell.classList.add('selected');
    }

    // Sağdaki ipucu kartını yalnızca vurgula (sayfayı aşağı kaydırmadan!)
    const activeClue = document.querySelector(`.clue-item[data-word-key="${getWordKey(word)}"]`);
    if (activeClue) {
        activeClue.classList.add('active');
    }
}

// === MOBİL & TABLET SANAL KLAVYE DİNLEYİCİSİ ===
function setupMobileKeyboardListener() {
    const mobileInputEl = document.getElementById('mobile-keyboard-input');
    if (!mobileInputEl) return;

    mobileInputEl.addEventListener('input', () => {
        if (!gameState.selectedCell || !gameState.selectedWord) {
            mobileInputEl.value = ' ';
            return;
        }

        const val = mobileInputEl.value;
        if (val.length === 0) {
            mobileInputEl.value = ' ';
            handleBackspace();
            return;
        }

        const lastChar = val.slice(-1);
        mobileInputEl.value = ' ';

        if (/[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(lastChar)) {
            handleLetterInput(lastChar);
        }
    });
}

// === ORTAK HARF GİRİŞİ & SİLME İŞLEMLERİ ===
function handleLetterInput(char) {
    if (!gameState.selectedCell || !gameState.selectedWord) return;
    const { row, col } = gameState.selectedCell;

    gameState.userGrid[row][col] = toTurkishUpperCase(char);
    updateCellDisplay(row, col);
    moveToNextCell();
    autoCheckWordIfFilled(gameState.selectedWord);
    checkPuzzleCompletion();
}

function handleBackspace() {
    if (!gameState.selectedCell || !gameState.selectedWord) return;
    const { row, col } = gameState.selectedCell;

    if (gameState.userGrid[row][col] !== '') {
        gameState.userGrid[row][col] = '';
        updateCellDisplay(row, col);
    } else {
        moveToPrevCell();
    }
}

// === FİZİKSEL KLAVYE GİRİŞİ ===
document.addEventListener('keydown', (e) => {
    if (!gameState.selectedCell || !gameState.selectedWord) return;
    if (e.target.tagName === 'SELECT' || (e.target.tagName === 'INPUT' && e.target.id !== 'mobile-keyboard-input')) return;

    const key = e.key;

    if (key.length === 1 && /[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(key)) {
        e.preventDefault();
        handleLetterInput(key);
        const mobileInput = document.getElementById('mobile-keyboard-input');
        if (mobileInput) mobileInput.value = ' ';
    } else if (key === 'Backspace' || key === 'Delete') {
        e.preventDefault();
        handleBackspace();
        const mobileInput = document.getElementById('mobile-keyboard-input');
        if (mobileInput) mobileInput.value = ' ';
    } else if (key === 'Enter') {
        e.preventDefault();
        verifySelectedWord();
    } else if (key === 'ArrowRight') {
        e.preventDefault();
        moveCell(0, 1);
    } else if (key === 'ArrowLeft') {
        e.preventDefault();
        moveCell(0, -1);
    } else if (key === 'ArrowDown') {
        e.preventDefault();
        moveCell(1, 0);
    } else if (key === 'ArrowUp') {
        e.preventDefault();
        moveCell(-1, 0);
    }
});

function toTurkishUpperCase(str) {
    return str.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();
}

function updateCellDisplay(row, col) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
        const letterSpan = cell.querySelector('.cell-letter');
        if (letterSpan) {
            letterSpan.textContent = gameState.userGrid[row][col];
        }
        cell.classList.remove('correct', 'incorrect');
    }
}

function moveToNextCell() {
    if (!gameState.selectedWord || !gameState.selectedCell) return;

    const word = gameState.selectedWord;
    const { row, col } = gameState.selectedCell;
    const currentIndex = word.direction === 'across' ? col - word.col : row - word.row;

    if (currentIndex + 1 < word.word.length) {
        const nextRow = word.direction === 'across' ? word.row : word.row + currentIndex + 1;
        const nextCol = word.direction === 'across' ? word.col + currentIndex + 1 : word.col;
        gameState.selectedCell = { row: nextRow, col: nextCol };
        highlightSelection();
    }
}

function moveToPrevCell() {
    if (!gameState.selectedWord || !gameState.selectedCell) return;

    const word = gameState.selectedWord;
    const { row, col } = gameState.selectedCell;
    const currentIndex = word.direction === 'across' ? col - word.col : row - word.row;

    if (currentIndex > 0) {
        const prevRow = word.direction === 'across' ? word.row : word.row + currentIndex - 1;
        const prevCol = word.direction === 'across' ? word.col + currentIndex - 1 : word.col;
        gameState.selectedCell = { row: prevRow, col: prevCol };
        gameState.userGrid[prevRow][prevCol] = '';
        updateCellDisplay(prevRow, prevCol);
        highlightSelection();
    }
}

function moveCell(dRow, dCol) {
    if (!gameState.selectedCell || !gameState.currentPuzzle) return;
    const size = gameState.currentPuzzle.gridSize || 11;
    const newRow = gameState.selectedCell.row + dRow;
    const newCol = gameState.selectedCell.col + dCol;

    if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
        if (gameState.currentPuzzle.grid[newRow][newCol] !== null) {
            selectCell(newRow, newCol);
        }
    }
}

// === KELİME DOĞRULAMA & PUANLAMA ===
function verifySelectedWord() {
    const word = gameState.selectedWord;
    if (!word) return;

    let allFilled = true;
    let allCorrect = true;

    for (let i = 0; i < word.word.length; i++) {
        const r = word.direction === 'across' ? word.row : word.row + i;
        const c = word.direction === 'across' ? word.col + i : word.col;
        const userChar = gameState.userGrid[r][c];
        const correctChar = word.word[i];
        const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);

        if (!userChar) {
            allFilled = false;
            allCorrect = false;
        } else if (userChar === correctChar) {
            cell.classList.remove('incorrect');
            cell.classList.add('correct');
        } else {
            allCorrect = false;
            cell.classList.remove('correct');
            cell.classList.add('incorrect');
        }
    }

    if (allFilled && allCorrect) {
        markWordSolved(word);
    } else if (allFilled && !allCorrect) {
        gameState.streak = 0;
        updateStatsUI();
    }

    checkPuzzleCompletion();
}

function autoCheckWordIfFilled(word) {
    if (!word) return;
    for (let i = 0; i < word.word.length; i++) {
        const r = word.direction === 'across' ? word.row : word.row + i;
        const c = word.direction === 'across' ? word.col + i : word.col;
        if (gameState.userGrid[r][c] !== word.word[i]) return;
    }

    for (let i = 0; i < word.word.length; i++) {
        const r = word.direction === 'across' ? word.row : word.row + i;
        const c = word.direction === 'across' ? word.col + i : word.col;
        const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
        if (cell) {
            cell.classList.remove('incorrect');
            cell.classList.add('correct');
        }
    }
    markWordSolved(word);
}

function markWordSolved(word) {
    const key = getWordKey(word);
    if (gameState.solvedWords.has(key)) return;

    gameState.solvedWords.add(key);
    gameState.streak += 1;

    let earned = word.word.length * 10;
    if (gameState.streak % 3 === 0) {
        earned += 100;
    }
    gameState.score += earned;

    const clueCard = document.querySelector(`.clue-item[data-word-key="${key}"]`);
    if (clueCard) {
        clueCard.classList.add('solved');
    }

    updateStatsUI();
}

// === İPUCU (HARF AÇ) ===
function revealHint() {
    if (!gameState.selectedCell) {
        alert('Lütfen önce bir kare seçin!');
        return;
    }

    const { row, col } = gameState.selectedCell;
    const correctChar = gameState.currentPuzzle.grid[row][col];

    if (correctChar) {
        gameState.userGrid[row][col] = correctChar;
        updateCellDisplay(row, col);

        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('correct');

        gameState.streak = 0;
        updateStatsUI();

        autoCheckWordIfFilled(gameState.selectedWord);
        moveToNextCell();
        checkPuzzleCompletion();
    }
}

// === TEMİZLE & ÇÖZÜM ===
function clearGrid() {
    if (!confirm('Tüm cevapları temizlemek istediğinizden emin misiniz?')) return;

    const size = gameState.currentPuzzle ? (gameState.currentPuzzle.gridSize || 11) : 11;
    gameState.userGrid = Array(size).fill(null).map(() => Array(size).fill(''));
    gameState.isCompleted = false;
    gameState.score = 0;
    gameState.streak = 0;
    gameState.solvedWords = new Set();

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            updateCellDisplay(r, c);
        }
    }

    document.querySelectorAll('.clue-item').forEach(el => el.classList.remove('solved'));
    updateStatsUI();
}

function showSolution() {
    if (!confirm('Tüm bulmacanın çözümünü göstermek istediğinizden emin misiniz?')) return;

    const puzzle = gameState.currentPuzzle;
    if (!puzzle) return;

    const size = puzzle.gridSize || 11;
    gameState.isCompleted = true;

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (puzzle.grid[r][c] !== null) {
                gameState.userGrid[r][c] = puzzle.grid[r][c];
                updateCellDisplay(r, c);
                const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                if (cell) cell.classList.add('correct');
            }
        }
    }

    puzzle.words.forEach(w => gameState.solvedWords.add(getWordKey(w)));
    document.querySelectorAll('.clue-item').forEach(el => el.classList.add('solved'));
    updateStatsUI();
}

// === TAMAMLANMA KONTROLÜ ===
function checkPuzzleCompletion() {
    if (gameState.isCompleted || !gameState.currentPuzzle) return;

    const puzzle = gameState.currentPuzzle;
    const size = puzzle.gridSize || 11;

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (puzzle.grid[r][c] !== null) {
                if (gameState.userGrid[r][c] !== puzzle.grid[r][c]) {
                    return;
                }
            }
        }
    }

    puzzle.words.forEach(w => markWordSolved(w));
    gameState.isCompleted = true;

    const timerText = document.getElementById('stat-timer').textContent;
    document.getElementById('completion-stats').textContent =
        `${puzzle.words.length} kelimeyi ${timerText} sürede tamamlayarak ${gameState.score} puan kazandınız!`;

    document.getElementById('completion-modal').classList.add('visible');
}

function closeCompletionModal() {
    document.getElementById('completion-modal').classList.remove('visible');
}
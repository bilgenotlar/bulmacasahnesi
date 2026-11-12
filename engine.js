/**
 * Bulmaca Stüdyosu v2.0 - Gelişmiş Bulmaca Oluşturma Motoru
 */

class CrosswordEngine {
    constructor(wordBank) {
        this.wordBank = wordBank;
        this.gridSize = 11;
        this.grid = [];
        this.placedWords = [];
    }

    setWordBank(newBank) {
        this.wordBank = newBank;
    }

    toTurkishUpperCase(str) {
        return str
            .replace(/i/g, 'İ')
            .replace(/ı/g, 'I')
            .toUpperCase()
            .trim();
    }

    generate(options = {}) {
        const {
            category = 'all',
            difficulty = 'all',
            wordCount = 10,
            maxWordLength = 9,
            usedWords = new Set()
        } = options;

        // Kelime sayısına göre en ideal ızgara boyutunu otomatik belirle
        this.gridSize = wordCount >= 12 ? 12 : 11;

        const allMatching = this.filterWords(category, difficulty, Math.min(maxWordLength, this.gridSize - 1));

        if (allMatching.length < 5) {
            throw new Error('Seçilen kriterlere uygun yeterli kelime bulunamadı!');
        }

        const freshWords = allMatching.filter(w => !usedWords.has(w.word));
        const seenWords = allMatching.filter(w => usedWords.has(w.word));

        let bestPuzzle = null;
        let bestScore = -1;

        // Hedef kelime sayısına tam ulaşmak için 40 farklı yerleşim dene
        for (let attempt = 0; attempt < 40; attempt++) {
            const orderedPool = [
                ...this.shuffleArray([...freshWords]),
                ...this.shuffleArray([...seenWords])
            ];

            const puzzle = this.attemptGenerate(orderedPool, wordCount, freshWords);
            if (puzzle && puzzle.score > bestScore) {
                bestScore = puzzle.score;
                bestPuzzle = puzzle;

                // Hedef sayıya tam ulaşıldıysa ve skor yüksekse erken bitir
                if (bestPuzzle.words.length === wordCount && attempt >= 15) {
                    break;
                }
            }
        }

        if (!bestPuzzle || bestPuzzle.words.length < 4) {
            throw new Error('Bulmaca oluşturulamadı. Lütfen tekrar deneyin.');
        }

        return {
            ...bestPuzzle,
            gridSize: this.gridSize,
            poolExhausted: freshWords.length < wordCount
        };
    }

    filterWords(category, difficulty, maxLen) {
        return this.wordBank
            .filter(item => {
                const categoryMatch = category === 'all' || item.category === category;
                const difficultyMatch = difficulty === 'all' || item.difficulty === difficulty;
                const cleanWord = this.toTurkishUpperCase(item.word);
                const lengthMatch = cleanWord.length >= 3 && cleanWord.length <= maxLen;
                const singleWord = !/\s/.test(cleanWord);
                return categoryMatch && difficultyMatch && lengthMatch && singleWord;
            })
            .map(item => ({
                ...item,
                word: this.toTurkishUpperCase(item.word)
            }));
    }

    attemptGenerate(orderedPool, targetCount, freshWords) {
        this.grid = Array(this.gridSize).fill(null).map(() =>
            Array(this.gridSize).fill(null)
        );
        this.placedWords = [];

        const starterPool = freshWords.length >= 4 ? this.shuffleArray([...freshWords]) : orderedPool;
        const starterCandidates = starterPool.filter(w => w.word.length >= 5 && w.word.length <= 7);
        const firstWord = starterCandidates.length > 0 ? starterCandidates[0] : starterPool[0];

        const startRow = Math.floor(this.gridSize / 2);
        const startCol = Math.max(0, Math.floor((this.gridSize - firstWord.word.length) / 2));

        this.placeWord(firstWord, startRow, startCol, 'across');

        let unplaced = orderedPool.filter(w => w.word !== firstWord.word);

        // Çok turlu yerleştirme: Yeni yerleşen kelimeler diğerlerine kesişim açar
        for (let pass = 0; pass < 3; pass++) {
            if (this.placedWords.length >= targetCount || unplaced.length === 0) break;

            const nextUnplaced = [];
            for (const wordObj of unplaced) {
                if (this.placedWords.length >= targetCount) break;
                const placed = this.findAndPlaceWord(wordObj);
                if (!placed) {
                    nextUnplaced.push(wordObj);
                }
            }
            unplaced = nextUnplaced;
        }

        this.assignClassicNumbers();

        const across = this.placedWords
            .filter(w => w.direction === 'across')
            .sort((a, b) => a.number - b.number);

        const down = this.placedWords
            .filter(w => w.direction === 'down')
            .sort((a, b) => a.number - b.number);

        if (across.length < 2 || down.length < 2) {
            return null;
        }

        const freshCountInPuzzle = this.placedWords.filter(w =>
            freshWords.some(fw => fw.word === w.word)
        ).length;

        const score = this.calculateScore(targetCount) + freshCountInPuzzle * 40;

        return {
            grid: this.grid.map(row => [...row]),
            words: [...this.placedWords],
            across,
            down,
            score
        };
    }

    assignClassicNumbers() {
        const sortedByPosition = [...this.placedWords].sort((a, b) => {
            if (a.row !== b.row) return a.row - b.row;
            return a.col - b.col;
        });

        const cellNumbers = new Map();
        let currentNumber = 1;

        for (const wordObj of sortedByPosition) {
            const key = `${wordObj.row}-${wordObj.col}`;
            if (!cellNumbers.has(key)) {
                cellNumbers.set(key, currentNumber++);
            }
            wordObj.number = cellNumbers.get(key);
        }
    }

    findAndPlaceWord(wordObj) {
        const word = wordObj.word;
        const candidates = [];

        for (let placed of this.placedWords) {
            const newDirection = placed.direction === 'across' ? 'down' : 'across';

            for (let i = 0; i < placed.word.length; i++) {
                for (let j = 0; j < word.length; j++) {
                    if (placed.word[i] === word[j]) {
                        let newRow, newCol;
                        if (newDirection === 'across') {
                            newRow = placed.row + i;
                            newCol = placed.col - j;
                        } else {
                            newRow = placed.row - j;
                            newCol = placed.col + i;
                        }

                        const validation = this.evaluatePlacement(word, newRow, newCol, newDirection);
                        if (validation.valid) {
                            candidates.push({
                                row: newRow,
                                col: newCol,
                                direction: newDirection,
                                intersections: validation.intersections
                            });
                        }
                    }
                }
            }
        }

        if (candidates.length === 0) return false;

        candidates.sort((a, b) => b.intersections - a.intersections);
        const topScore = candidates[0].intersections;
        const bestCandidates = candidates.filter(c => c.intersections === topScore);
        const chosen = bestCandidates[Math.floor(Math.random() * bestCandidates.length)];

        this.placeWord(wordObj, chosen.row, chosen.col, chosen.direction);
        return true;
    }

    evaluatePlacement(word, row, col, direction) {
        const len = word.length;
        let intersections = 0;

        if (direction === 'across') {
            if (col < 0 || col + len > this.gridSize || row < 0 || row >= this.gridSize) {
                return { valid: false, intersections: 0 };
            }
            if (col > 0 && this.grid[row][col - 1] !== null) return { valid: false, intersections: 0 };
            if (col + len < this.gridSize && this.grid[row][col + len] !== null) return { valid: false, intersections: 0 };
        } else {
            if (row < 0 || row + len > this.gridSize || col < 0 || col >= this.gridSize) {
                return { valid: false, intersections: 0 };
            }
            if (row > 0 && this.grid[row - 1][col] !== null) return { valid: false, intersections: 0 };
            if (row + len < this.gridSize && this.grid[row + len][col] !== null) return { valid: false, intersections: 0 };
        }

        for (let i = 0; i < len; i++) {
            const r = direction === 'across' ? row : row + i;
            const c = direction === 'across' ? col + i : col;
            const currentCell = this.grid[r][c];

            if (currentCell !== null) {
                if (currentCell !== word[i]) {
                    return { valid: false, intersections: 0 };
                }
                intersections++;
            } else {
                if (direction === 'across') {
                    if (r > 0 && this.grid[r - 1][c] !== null) return { valid: false, intersections: 0 };
                    if (r < this.gridSize - 1 && this.grid[r + 1][c] !== null) return { valid: false, intersections: 0 };
                } else {
                    if (c > 0 && this.grid[r][c - 1] !== null) return { valid: false, intersections: 0 };
                    if (c < this.gridSize - 1 && this.grid[r][c + 1] !== null) return { valid: false, intersections: 0 };
                }
            }
        }

        return { valid: intersections > 0, intersections };
    }

    placeWord(wordObj, row, col, direction) {
        const word = wordObj.word;

        for (let i = 0; i < word.length; i++) {
            const r = direction === 'across' ? row : row + i;
            const c = direction === 'across' ? col + i : col;
            this.grid[r][c] = word[i];
        }

        this.placedWords.push({
            ...wordObj,
            row,
            col,
            direction,
            number: 0
        });
    }

    calculateScore(targetCount) {
        let score = this.placedWords.length * 150;

        // Hedef kelime sayısına tam ulaşmaya ekstra ödül
        if (this.placedWords.length === targetCount) {
            score += 500;
        }

        let filledCells = 0;
        let totalLetterSlots = 0;

        for (let w of this.placedWords) {
            totalLetterSlots += w.word.length;
        }

        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.grid[r][c] !== null) filledCells++;
            }
        }

        const intersectionCount = Math.max(0, totalLetterSlots - filledCells);
        score += intersectionCount * 60;

        return score;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
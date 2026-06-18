document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const uploadSection = document.getElementById('uploadSection');
    const analysisSection = document.getElementById('analysisSection');
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeModal = document.getElementById('closeModal');
    const apiKeyInput = document.getElementById('apiKey');
    const phaseThresholdInput = document.getElementById('phaseThreshold');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const exportBtn = document.getElementById('exportBtn');
    const exportHtmlBtn = document.getElementById('exportHtmlBtn');
    const dataTableBody = document.getElementById('dataTableBody');
    const dataCount = document.getElementById('dataCount');
    const phaseLegend = document.getElementById('phaseLegend');
    const pastAnalysis = document.getElementById('pastAnalysis');
    const broadcastPhasesContainer = document.getElementById('broadcastPhasesContainer');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const textDetailModal = document.getElementById('textDetailModal');
    const closeTextModal = document.getElementById('closeTextModal');
    const detailDatetime = document.getElementById('detailDatetime');
    const detailPhase = document.getElementById('detailPhase');
    const detailEmotion = document.getElementById('detailEmotion');
    const detailText = document.getElementById('detailText');
    const detailScores = document.getElementById('detailScores');
    let analyzedData = [];
    let phases = [];
    let selectedFiles = [];
    let stackedBarChart = null;
    let filteredUrlOnlyCount = 0;
    let currentCaseName = '';
    const HistoryDB = {
        dbName: 'snsanalyz_db',
        storeName: 'history',
        version: 1,
        async open() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.version);
                request.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        db.createObjectStore(this.storeName, { keyPath: 'id' });
                    }
                };
                request.onsuccess = (e) => resolve(e.target.result);
                request.onerror = (e) => reject(e.target.error);
            });
        },
        async getAll() {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.storeName, 'readonly');
                const store = tx.objectStore(this.storeName);
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        },
        async get(id) {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.storeName, 'readonly');
                const store = tx.objectStore(this.storeName);
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        },
        async save(item) {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.storeName, 'readwrite');
                const store = tx.objectStore(this.storeName);
                const request = store.put(item);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        },
        async delete(id) {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.storeName, 'readwrite');
                const store = tx.objectStore(this.storeName);
                const request = store.delete(id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        },
        async clear() {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.storeName, 'readwrite');
                const store = tx.objectStore(this.storeName);
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
    };
    function isUrlOnlyPost(text) {
        if (!text) return true;
        const textWithoutUrls = text
            .replace(/https?:\/\/[^\s]+/gi, '')
            .replace(/t\.co\/[^\s]+/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
        if (textWithoutUrls.length < 3) {
            return true;
        }
        const hasOpinion =
            /[私僕俺わたしぼくおれ自分うち]/.test(textWithoutUrls) ||
            /と思う|と感じ|気がする|ではないか|だろう|かもしれない|べき|ほしい|てほしい|願う|祈る|望む/.test(textWithoutUrls) ||
            /やばい|すごい|ひどい|最悪|最高|大変|心配|不安|怖い|悲しい|嬉しい|腹立つ|許せない|信じられない/.test(textWithoutUrls) ||
            /[?？]/.test(textWithoutUrls) ||
            /[!！]{2,}/.test(textWithoutUrls) ||
            /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(text) ||
            /みんな|皆さん|お願い|頼む|助けて|気をつけて/.test(textWithoutUrls) ||
            /らしい|みたい|っぽい|感じ|印象/.test(textWithoutUrls);
        if (hasOpinion) {
            return false;
        }
        const hasUrl = /https?:\/\/|t\.co\
        if (hasUrl) {
            if (textWithoutUrls.length >= 20) {
                return false;
            }
            return true;
        }
        return false;
    }
    const historyBtn = document.getElementById('historyBtn');
    const historyModal = document.getElementById('historyModal');
    const closeHistoryModal = document.getElementById('closeHistoryModal');
    const historyList = document.getElementById('historyList');
    const clearAllHistory = document.getElementById('clearAllHistory');
    const saveModal = document.getElementById('saveModal');
    const closeSaveModal = document.getElementById('closeSaveModal');
    const analysisNameInput = document.getElementById('analysisName');
    const analysisCategorySelect = document.getElementById('analysisCategory');
    const saveToFileCheckbox = document.getElementById('saveToFile');
    const confirmSaveBtn = document.getElementById('confirmSave');
    const saveResultBtn = document.getElementById('saveResultBtn');
    const compareBtn = document.getElementById('compareBtn');
    const comparisonModal = document.getElementById('comparisonModal');
    const closeComparisonModal = document.getElementById('closeComparisonModal');
    const comparisonList = document.getElementById('comparisonList');
    const categoryFilterBtns = document.querySelectorAll('.category-filter-btn');
    const runComparisonBtn = document.getElementById('runComparison');
    const comparisonResults = document.getElementById('comparisonResults');
    const comparisonChartsGrid = document.getElementById('comparisonChartsGrid');
    const comparisonTableHead = document.getElementById('comparisonTableHead');
    const comparisonTableBody = document.getElementById('comparisonTableBody');
    const CATEGORIES = {
        manmade: { name: '人災', emoji: '🔥', color: '#dc2626' },
        naturalfire: { name: '自然火災', emoji: '🌲🔥', color: '#f97316' },
        earthquake: { name: '地震', emoji: '🌏', color: '#ea580c' },
        heavyrain: { name: '豪雨', emoji: '🌧️', color: '#2563eb' },
        other: { name: 'その他', emoji: '⚪', color: '#6b7280' }
    };
    let selectedForComparison = [];
    let comparisonCharts = []; 
    let timeNormalizedChart = null;
    let currentCategoryFilter = 'all';
    let currentHistoryFilter = 'all';
    let emotionLineChart = null;
    apiKeyInput.value = GeminiAnalyzer.getApiKey();
    phaseThresholdInput.value = GeminiAnalyzer.getPhaseThreshold();
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    closeModal.addEventListener('click', () => settingsModal.classList.add('hidden'));
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) settingsModal.classList.add('hidden');
    });
    saveSettingsBtn.addEventListener('click', saveSettings);
    exportBtn.addEventListener('click', exportData);
    exportHtmlBtn.addEventListener('click', exportHtmlReport);
    tabBtns.forEach(btn => btn.addEventListener('click', handleTabClick));
    closeTextModal.addEventListener('click', () => textDetailModal.classList.add('hidden'));
    textDetailModal.addEventListener('click', (e) => {
        if (e.target === textDetailModal) textDetailModal.classList.add('hidden');
    });
    historyBtn.addEventListener('click', openHistoryModal);
    closeHistoryModal.addEventListener('click', () => historyModal.classList.add('hidden'));
    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) historyModal.classList.add('hidden');
    });
    clearAllHistory.addEventListener('click', clearAllHistoryData);
    closeSaveModal.addEventListener('click', () => saveModal.classList.add('hidden'));
    saveModal.addEventListener('click', (e) => {
        if (e.target === saveModal) saveModal.classList.add('hidden');
    });
    confirmSaveBtn.addEventListener('click', confirmSaveAnalysis);
    if (saveResultBtn) {
        saveResultBtn.addEventListener('click', () => {
            if (analyzedData.length === 0) {
                alert('保存する分析結果がありません。まず分析を実行してください。');
                return;
            }
            saveModal.classList.remove('hidden');
        });
    }
    compareBtn.addEventListener('click', openComparisonDashboard);
    closeComparisonModal.addEventListener('click', () => {
        comparisonModal.classList.add('hidden');
        resetComparisonState();
    });
    comparisonModal.addEventListener('click', (e) => {
        if (e.target === comparisonModal) {
            comparisonModal.classList.add('hidden');
            resetComparisonState();
        }
    });
    categoryFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategoryFilter = btn.dataset.category;
            renderComparisonList();
        });
    });
    runComparisonBtn.addEventListener('click', runComparison);
    const selectAllCategoryBtn = document.getElementById('selectAllCategoryBtn');
    if (selectAllCategoryBtn) {
        selectAllCategoryBtn.addEventListener('click', async () => {
            const history = await getAnalysisHistory();
            const targets = currentCategoryFilter === 'all'
                ? history
                : history.filter(h => h.category === currentCategoryFilter);
            if (targets.length === 0) return;
            selectedForComparison = [];
            const toAdd = targets.slice(0, 8);
            selectedForComparison = [...toAdd];
            if (targets.length > 8) {
                alert(`「${currentCategoryFilter === 'all' ? 'すべて' : CATEGORIES[currentCategoryFilter].name}」の項目が多すぎるため、最新8件のみを選択しました。`);
            }
            renderComparisonList();
        });
    }
    const deselectAllBtn = document.getElementById('deselectAllBtn');
    if (deselectAllBtn) {
        deselectAllBtn.addEventListener('click', () => {
            selectedForComparison = [];
            renderComparisonList();
        });
    }
    const emotionSelectorElement = document.getElementById('emotionSelector');
    if (emotionSelectorElement) {
        emotionSelectorElement.addEventListener('change', () => {
            if (selectedForComparison.length >= 2) {
                renderMultiLineCharts();
            }
        });
    }
    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    }
    function handleDragLeave(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    }
    function handleDrop(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.csv'));
        if (files.length > 0) {
            selectedFiles = files;
            updateFileList();
            processFiles(files);
        } else {
            alert('CSVファイルをアップロードしてください。');
        }
    }
    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            selectedFiles = files;
            updateFileList();
            processFiles(files);
        }
    }
    function updateFileList() {
        if (selectedFiles.length === 0) {
            fileList.innerHTML = '';
            return;
        }
        fileList.innerHTML = selectedFiles.map((file, index) => `
            <div class="file-list-item">
                <span class="file-name">📄 ${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
            </div>
        `).join('');
    }
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    async function processFiles(files) {
        showProgress();
        updateProgress(5, 'CSVファイルを読み込み中...');
        try {
            const allPostsWithSource = [];
            const phaseNames = ['初期', '中期', '後期', '第4期', '第5期', '第6期', '第7期', '第8期'];
            if (files.length > 0) {
                currentCaseName = files[0].name.replace(/\.[^/.]+$/, "");
            }
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const phaseLabel = files.length > 1 ? (phaseNames[i] || `第${i + 1}期`) : '';
                updateProgress(5 + (i / files.length) * 5, `ファイル ${i + 1}/${files.length} を読み込み中...`);
                const posts = await parseCSVFile(file, phaseLabel);
                posts.forEach(post => {
                    post.sourceFile = file.name;
                });
                allPostsWithSource.push(...posts);
            }
            if (allPostsWithSource.length === 0) {
                alert('有効なデータが見つかりませんでした。B列に投稿日時、C列にテキストがあることを確認してください。');
                hideProgress();
                return;
            }
            if (filteredUrlOnlyCount > 0) {
                updateProgress(10, `${allPostsWithSource.length}件の投稿を検出（URLのみ/説明のみ${filteredUrlOnlyCount}件を除外）`);
            } else {
                updateProgress(10, `${allPostsWithSource.length}件の投稿を検出...`);
            }
            const apiKey = GeminiAnalyzer.getApiKey();
            if (!apiKey) {
                alert('Gemini APIキーが設定されていません。設定ボタン（⚙️）からAPIキーを入力してください。');
                hideProgress();
                settingsModal.classList.remove('hidden');
                return;
            }
            analyzedData = await GeminiAnalyzer.analyzeEmotions(allPostsWithSource, updateProgress);
            updateProgress(80, 'フェーズ分析中...');
            if (files.length > 1) {
                phases = createPhasesFromFiles(analyzedData, files);
            } else {
                phases = GeminiAnalyzer.splitIntoThreePhases(analyzedData);
            }
            phases.forEach(phase => {
                phase.posts.forEach(post => {
                    const originalPost = analyzedData.find(p =>
                        p.datetime === post.datetime && p.text === post.text
                    );
                    if (originalPost) {
                        originalPost.phase = phase.name;
                    }
                });
            });
            updateProgress(85, 'グラフを生成中...');
            showResults();
            renderCharts();
            renderDataTable();
            updateProgress(90, 'レポートを生成中...');
            await generateReports();
            updateProgress(95, '放送原稿を生成中...');
            await generateBroadcastContent();
            updateProgress(100, '完了！');
            setTimeout(() => {
                hideProgress();
                showSaveModal();
                const valBtn = document.getElementById('runValidationBtn');
                if (valBtn) valBtn.disabled = false;
            }, 500);
        } catch (error) {
            alert(`エラー: ${error.message}`);
            hideProgress();
        }
    }
    function saveAnalysisData() {
        try {
            const dataToSave = {
                analyzedData: analyzedData,
                phases: phases.map(p => ({
                    name: p.name,
                    startTime: p.startTime,
                    endTime: p.endTime,
                    posts: p.posts.map(post => ({
                        datetime: post.datetime,
                        text: post.text,
                        emotion: post.emotion,
                        scores: post.scores,
                        phase: post.phase
                    }))
                })),
                savedAt: new Date().toISOString(),
                topic: GeminiAnalyzer.currentTopicData?.topic || ''
            };
            localStorage.setItem('snsanalyz_data', JSON.stringify(dataToSave));
        } catch (error) {
        }
    }
    function showSaveModal() {
        const topic = GeminiAnalyzer.currentTopicData?.topic || '';
        const date = new Date().toLocaleDateString('ja-JP').replace(/\
        analysisNameInput.value = topic ? `${topic.substring(0, 20)}_${date}` : `分析_${date}`;
        saveModal.classList.remove('hidden');
    }
    function saveCurrentAnalysis() {
        if (analyzedData.length === 0) {
            alert('保存する分析データがありません。');
            return;
        }
        const topic = GeminiAnalyzer.currentTopicData?.topic || '';
        analysisNameInput.value = topic ? topic.substring(0, 30) : `分析_${new Date().toISOString().slice(0, 10)}`;
        saveModal.classList.remove('hidden');
    }
    async function confirmSaveAnalysis() {
        try {
            const name = analysisNameInput.value.trim() || `分析_${new Date().toISOString()}`;
            const saveToFile = saveToFileCheckbox.checked;
            const newEntry = {
                id: Date.now().toString(),
                name: name,
                category: analysisCategorySelect?.value || 'other',
                count: analyzedData.length,
                totalPosts: analyzedData.length,
                phasesCount: phases.length,
                topic: GeminiAnalyzer.currentTopicData?.topic || '',
                savedAt: new Date().toISOString(),
                analyzedData: analyzedData,
                phases: phases.map(p => ({
                    name: p.name,
                    startTime: p.startTime,
                    endTime: p.endTime,
                    posts: p.posts.map(post => ({
                        datetime: post.datetime,
                        text: post.text,
                        emotion: post.emotion,
                        scores: post.scores,
                        phase: post.phase,
                        originalDatetime: post.originalDatetime,
                        secondary: post.secondary,
                        intensity: post.intensity
                    }))
                })),
                reportContent: pastAnalysis.innerHTML,
                broadcastContent: broadcastPhasesContainer.innerHTML
            };
            await HistoryDB.save(newEntry);
            if (saveToFile) {
                downloadAnalysisAsJSON(name, newEntry);
            }
            saveModal.classList.add('hidden');
            alert(`「${name}」として保存しました！`);
            if (!historyModal.classList.contains('hidden')) {
                renderHistoryList();
            }
        } catch (error) {
            alert('保存中にエラーが発生しました: ' + error.message);
        }
    }
    function downloadAnalysisAsJSON(name, data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.replace(/[\/\\:*?"<>|]/g, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    function openHistoryModal() {
        currentHistoryFilter = 'all';
        const historyFilterBtns = document.querySelectorAll('.history-filter-btn');
        historyFilterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === 'all');
        });
        renderHistoryList();
        historyModal.classList.remove('hidden');
    }
    async function renderHistoryList() {
        try {
            historyList.innerHTML = '<p class="placeholder">読み込み中...</p>';
            let history = await HistoryDB.getAll();
            history.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
            if (currentHistoryFilter !== 'all') {
                history = history.filter(h => h.category === currentHistoryFilter);
            }
            if (history.length === 0) {
                historyList.innerHTML = '<p class="no-history">該当する履歴がありません。</p>';
                return;
            }
            historyList.innerHTML = history.map(item => {
                const cat = item.category ? (CATEGORIES[item.category] || CATEGORIES.other) : CATEGORIES.other;
                return `
                <div class="history-item" data-id="${item.id}">
                    <div class="history-info">
                        <div class="history-name">${item.name}</div>
                        <div class="history-meta">
                            <span class="category-badge ${item.category || 'other'}">${cat.emoji} ${cat.name}</span>
                            ${item.count}件 | ${item.topic ? item.topic.substring(0, 30) + '...' : 'トピック未設定'}
                            <br>${new Date(item.savedAt).toLocaleString('ja-JP')}
                        </div>
                    </div>
                    <div class="history-buttons">
                        <button class="history-btn-rename" onclick="renameHistoryItem('${item.id}')" title="名前を変更">✏️</button>
                        <button class="history-btn-category" onclick="changeCategoryItem('${item.id}')" title="カテゴリを変更">📁</button>
                        <button class="history-btn-load" onclick="loadHistoryItem('${item.id}')" title="読み込み">読み込み</button>
                        <button class="history-btn-delete" onclick="deleteHistoryItem('${item.id}')" title="削除">🗑️</button>
                    </div>
                </div>
            `;
            }).join('');
        } catch (e) {
            historyList.innerHTML = '<p class="error">履歴の読み込みに失敗しました。</p>';
        }
    }
    window.loadHistoryItem = async function (id) {
        try {
            showProgress();
            updateProgress(10, '履歴データを読み込んでいます...');
            const item = await HistoryDB.get(id);
            if (item) {
                currentCaseName = item.name;
                analyzedData = item.analyzedData || [];
                phases = item.phases || [];
                showResults();
                renderCharts();
                renderDataTable();
                if (item.reportContent) {
                    pastAnalysis.innerHTML = item.reportContent;
                } else {
                    pastAnalysis.innerHTML = '<p class="placeholder">履歴から復元しました。レポートデータはありません。</p>';
                }
                if (item.broadcastContent) {
                    broadcastPhasesContainer.innerHTML = item.broadcastContent;
                } else {
                    broadcastPhasesContainer.innerHTML = '<p class="placeholder">履歴から復元しました。放送原稿データはありません。</p>';
                }
                if (typeof futureAnalysis !== 'undefined' && futureAnalysis) futureAnalysis.innerHTML = '';
                if (typeof summaryReport !== 'undefined' && summaryReport) summaryReport.innerHTML = '';
                historyModal.classList.add('hidden');
                hideProgress();
                const valBtn = document.getElementById('runValidationBtn');
                if (valBtn) valBtn.disabled = false;
                const valResults = document.getElementById('validationResults');
                if (valResults) {
                    try {
                        const uniqueKey = `snsanalyz_validation_${currentCaseName || 'default'}`;
                        const savedJson = localStorage.getItem(uniqueKey);
                        const saved = JSON.parse(savedJson);
                        if (saved && saved.labelResult && saved.factorResult) {
                            valResults.style.display = 'block';
                            renderValidationResults(saved.labelResult, saved.factorResult);
                        } else {
                            valResults.style.display = 'none';
                            valResults.innerHTML = '';
                        }
                    } catch (e) {
                        valResults.style.display = 'none';
                        valResults.innerHTML = '';
                    }
                }
            } else {
                hideProgress();
                alert('指定された履歴データが見つかりませんでした。');
            }
        } catch (e) {
            hideProgress();
            alert('データの読み込みに失敗しました。');
        }
    };
    window.deleteHistoryItem = async function (id) {
        if (confirm('この分析履歴を削除しますか？')) {
            try {
                await HistoryDB.delete(id);
                renderHistoryList();
            } catch (e) {
                alert('削除に失敗しました。');
            }
        }
    };
    window.changeCategoryItem = async function (id) {
        try {
            const item = await HistoryDB.get(id);
            if (!item) return;
            const currentCat = item.category || 'other';
            const catOptions = Object.entries(CATEGORIES).map(([key, val]) => {
                const selected = key === currentCat ? 'selected' : '';
                return `<option value="${key}" ${selected}>${val.emoji} ${val.name}</option>`;
            }).join('');
            const dialog = document.createElement('div');
            dialog.className = 'category-change-dialog';
            dialog.innerHTML = `
                <div class="category-change-content">
                    <h3>📁 カテゴリ変更</h3>
                    <p>「${item.name}」のカテゴリを選択:</p>
                    <select id="newCategorySelect" class="category-select">
                        ${catOptions}
                    </select>
                    <div class="dialog-buttons">
                        <button id="cancelCategoryChange" class="btn-secondary">キャンセル</button>
                        <button id="confirmCategoryChange" class="btn-primary">変更</button>
                    </div>
                </div>
            `;
            document.body.appendChild(dialog);
            document.getElementById('cancelCategoryChange').onclick = () => {
                dialog.remove();
            };
            document.getElementById('confirmCategoryChange').onclick = async () => {
                const newCategory = document.getElementById('newCategorySelect').value;
                item.category = newCategory;
                await HistoryDB.save(item);
                dialog.remove();
                renderHistoryList();
            };
            dialog.onclick = (e) => {
                if (e.target === dialog) dialog.remove();
            };
        } catch (e) {
            alert('操作に失敗しました。');
        }
    };
    window.renameHistoryItem = async function (id) {
        try {
            const item = await HistoryDB.get(id);
            if (!item) return;
            const newName = prompt('新しい分析名を入力してください:', item.name);
            if (newName === null) return;
            const trimmedName = newName.trim();
            if (!trimmedName) {
                alert('分析名は空にできません。');
                return;
            }
            item.name = trimmedName;
            await HistoryDB.save(item);
            renderHistoryList();
        } catch (e) {
            alert('名前に変更に失敗しました。');
        }
    };
    async function clearAllHistoryData() {
        if (confirm('全ての分析履歴を削除しますか？この操作は取り消せません。')) {
            try {
                await HistoryDB.clear();
                renderHistoryList();
            } catch (e) {
                alert('削除に失敗しました。');
            }
        }
    }
    function parseCSVFile(file, phaseLabel = '') {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                complete: (results) => {
                    const posts = parseCSVData(results.data, phaseLabel);
                    resolve(posts);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    }
    function createPhasesFromFiles(posts, files) {
        const fileNames = files.map(f => f.name);
        const phasesMap = new Map();
        posts.forEach(post => {
            if (!phasesMap.has(post.sourceFile)) {
                phasesMap.set(post.sourceFile, []);
            }
            phasesMap.get(post.sourceFile).push(post);
        });
        const phases = Array.from(phasesMap.entries())
            .map(([fileName, filePosts]) => {
                const sortedPosts = [...filePosts].sort((a, b) =>
                    new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
                );
                return {
                    sourceFile: fileName,
                    posts: sortedPosts,
                    startTime: sortedPosts.length > 0 ? new Date(sortedPosts[0].datetime).getTime() : 0,
                    endTime: sortedPosts.length > 0 ? new Date(sortedPosts[sortedPosts.length - 1].datetime).getTime() : 0
                };
            })
            .sort((a, b) => a.startTime - b.startTime);
        const phaseNames = ['初期', '中期', '後期', '第4期', '第5期', '第6期', '第7期', '第8期'];
        return phases.map((phase, index) => ({
            ...phase,
            name: phaseNames[index] || `第${index + 1}期`,
            index: index
        }));
    }
    function parseCSVData(data, phaseLabel = '') {
        const posts = [];
        filteredUrlOnlyCount = 0;
        let filteredNonTwitterCount = 0;
        const startRow = (data[0] && (
            data[0][1]?.includes('日時') ||
            data[0][1]?.includes('date') ||
            data[0][1]?.includes('投稿')
        )) ? 1 : 0;
        for (let i = startRow; i < data.length; i++) {
            const row = data[i];
            const datetime = row[1];
            const text = row[2];
            const source = row[9];
            if (!source || !source.includes('Twitter')) {
                filteredNonTwitterCount++;
                continue;
            }
            if (isUrlOnlyPost(text)) {
                filteredUrlOnlyCount++;
                continue;
            }
            if (datetime && text && text.trim()) {
                posts.push({
                    datetime: normalizeDateTime(datetime),
                    text: text.trim(),
                    originalDatetime: datetime
                });
            }
        }
        const phaseLabelStr = phaseLabel ? `📊 【${phaseLabel}】` : '📊';
        return posts;
    }
    function normalizeDateTime(datetime) {
        if (!datetime) return null;
        const parsed = new Date(datetime);
        if (!isNaN(parsed.getTime())) {
            return parsed.toISOString();
        }
        const jpMatch = datetime.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\s*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?/);
        if (jpMatch) {
            const [, year, month, day, hour = 0, minute = 0, second = 0] = jpMatch;
            return new Date(year, month - 1, day, hour, minute, second).toISOString();
        }
        return datetime;
    }
    function showProgress() {
        uploadSection.classList.add('hidden');
        analysisSection.classList.remove('hidden');
        progressContainer.classList.remove('hidden');
    }
    function hideProgress() {
        progressContainer.classList.add('hidden');
    }
    function updateProgress(percent, text) {
        progressFill.style.width = `${percent}%`;
        progressText.textContent = text;
    }
    function showResults() {
        uploadSection.classList.add('hidden');
        analysisSection.classList.remove('hidden');
    }
    function renderCharts() {
        const aggregatedData = GeminiAnalyzer.aggregateEmotionsByPhase(phases);
        renderStackedBarChart(aggregatedData);
        renderEmotionLineChart(aggregatedData);
        renderPhaseLegend();
        renderDetailedStats();
    }
    function renderStackedBarChart(data) {
        const ctx = document.getElementById('stackedBarChart').getContext('2d');
        if (stackedBarChart) {
            stackedBarChart.destroy();
        }
        const labels = data.map(d => d.phaseName);
        const emotionKeys = Object.keys(GeminiAnalyzer.EMOTIONS);
        const datasets = emotionKeys.map(emotionKey => ({
            label: GeminiAnalyzer.EMOTIONS[emotionKey].name,
            data: data.map(d => d.percentages[emotionKey] || 0),
            backgroundColor: GeminiAnalyzer.EMOTIONS[emotionKey].color,
            borderColor: GeminiAnalyzer.EMOTIONS[emotionKey].color,
            borderWidth: 1
        }));
        stackedBarChart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            font: { size: 11 },
                            boxWidth: 12
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${context.raw.toFixed(1)}%`
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        stacked: true,
                        max: 100,
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: {
                            color: '#94a3b8',
                            callback: (value) => `${value}%`
                        }
                    }
                }
            }
        });
    }
    function renderPhaseLegend() {
        phaseLegend.innerHTML = phases.map((phase, index) => {
            const startDate = new Date(phase.startTime).toLocaleString('ja-JP');
            const endDate = new Date(phase.endTime).toLocaleString('ja-JP');
            return `
                <div class="phase-legend-item">
                    <span class="phase-legend-color" style="background: ${getPhaseColor(index)}"></span>
                    <span>${phase.name}: ${phase.posts.length}件 (${startDate} ～ ${endDate})</span>
                </div>
            `;
        }).join('');
    }
    function getPhaseColor(index) {
        const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#22d3ee'];
        return colors[index % colors.length];
    }
    function renderEmotionLineChart(data) {
        const canvas = document.getElementById('emotionLineChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (emotionLineChart) {
            emotionLineChart.destroy();
        }
        const labels = data.map(d => d.phaseName);
        const keyEmotions = Object.keys(GeminiAnalyzer.EMOTIONS);
        const datasets = keyEmotions.map(emotionKey => {
            const emotionInfo = GeminiAnalyzer.EMOTIONS[emotionKey];
            return {
                label: emotionInfo.name,
                data: data.map(d => d.percentages[emotionKey] || 0),
                borderColor: emotionInfo.color,
                backgroundColor: emotionInfo.color + '33',
                fill: false,
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2
            };
        });
        emotionLineChart = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8', 
                            font: { size: 11 },
                            boxWidth: 12
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${context.raw.toFixed(1)}%`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(0,0,0,0.1)' },
                        ticks: {
                            color: '#475569',
                            callback: (value) => `${value}%`
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            }
        });
    }
    function renderDetailedStats() {
        const intensityContainer = document.getElementById('intensityStats');
        const phaseDetailContainer = document.getElementById('phaseDetailStats');
        const comparisonContainer = document.getElementById('allPhaseComparison');
        if (!intensityContainer || !phaseDetailContainer || !comparisonContainer) return;
        const emotionKeys = Object.keys(GeminiAnalyzer.EMOTIONS);
        const intensities = analyzedData.map(p => p.intensity || 3);
        const avgIntensity = intensities.length > 0 ? (intensities.reduce((a, b) => a + b, 0) / intensities.length).toFixed(2) : '-';
        const intensityDistribution = [0, 0, 0, 0, 0];
        intensities.forEach(i => { intensityDistribution[i - 1]++; });
        const secondaryEmotions = analyzedData.filter(p => p.secondary).map(p => p.secondary);
        const secondaryCount = secondaryEmotions.length;
        const secondaryRate = analyzedData.length > 0 ? ((secondaryCount / analyzedData.length) * 100).toFixed(1) : '0.0';
        const secondaryDist = {};
        secondaryEmotions.forEach(e => { secondaryDist[e] = (secondaryDist[e] || 0) + 1; });
        const topSecondary = Object.entries(secondaryDist).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const phaseStats = phases.map(phase => {
            const phasePosts = analyzedData.filter(p => p.phase === phase.name);
            const phaseIntensities = phasePosts.map(p => p.intensity || 3);
            const phaseAvgIntensity = phaseIntensities.length > 0
                ? (phaseIntensities.reduce((a, b) => a + b, 0) / phaseIntensities.length).toFixed(2)
                : '-';
            const phaseSecondaryPosts = phasePosts.filter(p => p.secondary);
            const phaseSecondaryCount = phaseSecondaryPosts.length;
            const phaseSecondaryRate = phasePosts.length > 0
                ? ((phaseSecondaryCount / phasePosts.length) * 100).toFixed(1)
                : '0.0';
            const phaseSecondaryDist = {};
            phaseSecondaryPosts.forEach(p => {
                phaseSecondaryDist[p.secondary] = (phaseSecondaryDist[p.secondary] || 0) + 1;
            });
            const topPhaseSecondary = Object.entries(phaseSecondaryDist).sort((a, b) => b[1] - a[1]).slice(0, 5);
            const emotionDist = {};
            emotionKeys.forEach(emo => {
                const count = phasePosts.filter(p => p.emotion === emo).length;
                const pct = phasePosts.length > 0 ? ((count / phasePosts.length) * 100).toFixed(1) : '0.0';
                emotionDist[emo] = { count, pct };
            });
            return {
                name: phase.name,
                avgIntensity: phaseAvgIntensity,
                secondaryCount: phaseSecondaryCount,
                secondaryRate: phaseSecondaryRate,
                topPhaseSecondary: topPhaseSecondary,
                emotionDist: emotionDist,
                totalPosts: phasePosts.length
            };
        });
        intensityContainer.innerHTML = '';
        intensityContainer.style.display = 'none'; 
        const phaseCardsHTML = phaseStats.map(ps => {
            const phasePosts = analyzedData.filter(p => p.phase === ps.name);
            const emotionRowsHTML = emotionKeys.map(key => {
                const info = GeminiAnalyzer.EMOTIONS[key];
                const d = ps.emotionDist[key];
                const emoPosts = phasePosts.filter(p => p.emotion === key);
                let intensityDisplay = '<span class="text-muted">-</span>';
                if (key !== 'FACTUAL' && emoPosts.length > 0) {
                    const intensities = emoPosts.map(p => p.intensity || 3);
                    const avg = (intensities.reduce((a, b) => a + b, 0) / intensities.length).toFixed(1);
                    intensityDisplay = `<span class="stat-star">★</span> ${avg}`;
                }
                let secondaryDisplay = '';
                if (key !== 'FACTUAL' && emoPosts.length > 0) {
                    const secondaryPosts = emoPosts.filter(p => p.secondary);
                    if (secondaryPosts.length > 0) {
                        const secCounts = {};
                        secondaryPosts.forEach(p => {
                            secCounts[p.secondary] = (secCounts[p.secondary] || 0) + 1;
                        });
                        const breakdown = Object.entries(secCounts)
                            .sort((a, b) => b[1] - a[1])
                            .map(([emo, count]) => {
                                const name = GeminiAnalyzer.EMOTIONS[emo]?.name || emo;
                                return `${name}:${count}`;
                            })
                            .join(', ');
                        secondaryDisplay = `<span class="stat-sub-detail" style="font-size: 0.8em; color: var(--text-muted); display: block; line-height: 1.2;">複合: ${secondaryPosts.length}件 (${breakdown})</span>`;
                    }
                }
                const opacity = d.count > 0 ? '1' : '0.4';
                const userSelect = d.count > 0 ? 'text' : 'none';
                return `
                    <div class="emotion-row-wrapper" style="opacity: ${opacity}; user-select: ${userSelect}; -webkit-user-select: ${userSelect};">
                        <div class="emotion-row">
                            <div class="emotion-main">
                                <span class="emotion-name" style="color: ${info.color}">${info.emoji} ${info.name}</span>
                                <span class="emotion-count">${d.count}件 (${d.pct}%)</span>
                            </div>
                            <div class="emotion-metrics">
                                <div class="metric-item" title="平均強度">
                                    ${intensityDisplay}
                                </div>
                                <div class="metric-item" title="複合感情">
                                    ${secondaryDisplay}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            return `
                <div class="phase-card">
                    <div class="phase-header">
                        <h4>${ps.name}</h4>
                        <span class="phase-count">${ps.totalPosts}件</span>
                    </div>
                    <div class="emotion-list">
                        <div class="emotion-list-header">
                            <span>感情カテゴリ</span>
                            <span>強度平均 / 複合詳細</span>
                        </div>
                        ${emotionRowsHTML}
                    </div>
                </div>
            `;
        }).join('');
        phaseDetailContainer.innerHTML = `
            <h3>📊 期間別詳細データ</h3>
            <div class="phases-grid">
                ${phaseCardsHTML}
            </div>
        `;
        const headerCells = phaseStats.map(ps => `<th>${ps.name}</th>`).join('');
        const comparisonRows = emotionKeys.map(key => {
            const info = GeminiAnalyzer.EMOTIONS[key];
            const cells = phaseStats.map(ps => `<td>${ps.emotionDist[key].pct}%</td>`).join('');
            return `
                <tr>
                    <td style="color: ${info.color}"><span class="emoji">${info.emoji}</span> ${info.name}</td>
                    ${cells}
                </tr>
            `;
        }).join('');
        comparisonContainer.innerHTML = `
            <h3>📊 全期間比較詳細</h3>
            <div class="table-container">
                <table class="comparison-detail-table">
                    <thead>
                        <tr>
                            <th>感情</th>
                            ${headerCells}
                        </tr>
                    </thead>
                    <tbody>
                        ${comparisonRows}
                    </tbody>
                </table>
            </div>
        `;
    }
    async function generateReports() {
        const apiKey = GeminiAnalyzer.getApiKey();
        const phasesWithEmotions = phases.map(phase => ({
            ...phase,
            posts: phase.posts.map(p => {
                const analyzed = analyzedData.find(a =>
                    a.datetime === p.datetime && a.text === p.text
                );
                return analyzed || p;
            })
        }));
        pastAnalysis.innerHTML = '<p class="placeholder">レポートを生成中...</p>';
        const reportPromises = [
            GeminiAnalyzer.generatePastAnalysisReport(phasesWithEmotions, apiKey)
                .then(report => {
                    pastAnalysis.innerHTML = `<p>${report.replace(/\n/g, '</p><p>')}</p>`;
                })
                .catch(err => {
                    pastAnalysis.innerHTML = '<p class="placeholder">生成できませんでした</p>';
                })
        ];
        await Promise.all(reportPromises);
    }
    async function generateBroadcastContent() {
        const apiKey = GeminiAnalyzer.getApiKey();
        const phasesWithEmotions = phases.map(phase => {
            const validPosts = phase.posts.map(p => {
                const analyzed = analyzedData.find(a =>
                    a.datetime === p.datetime && a.text === p.text
                );
                return analyzed;
            }).filter(post => post !== undefined);
            return {
                ...phase,
                posts: validPosts
            };
        });
        broadcastPhasesContainer.innerHTML = phasesWithEmotions.map((phase, index) => `
            <div class="phase-broadcast-card" id="phaseCard${index}">
                <div class="phase-broadcast-header">
                    <h3>📻 ${phase.name}</h3>
                    <span class="phase-post-count">${phase.posts.length}件の投稿</span>
                </div>
                <div class="phase-broadcast-content">
                    <div class="broadcast-script-section">
                        <h4>🎤 放送原稿</h4>
                        <div class="broadcast-script" id="script${index}">
                            <p class="placeholder">生成中...</p>
                        </div>
                    </div>
                    <div class="conversion-log-section">
                        <h4>🔄 表現変換ログ</h4>
                        <div class="conversion-log" id="conversion${index}">
                            <p class="placeholder">生成中...</p>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        const processPromises = phasesWithEmotions.map(async (phase, index) => {
            let generatedScript = '';
            let conversionData = [];
            try {
                generatedScript = await GeminiAnalyzer.generateBroadcastScriptForPhase(phase, index, apiKey);
            } catch (err) {
                const scriptEl = document.getElementById(`script${index}`);
                if (scriptEl) {
                    scriptEl.innerHTML = '<p class="placeholder">原稿生成失敗</p>';
                }
                return;
            }
            try {
                conversionData = await GeminiAnalyzer.generateConversionLogForPhase(phase, generatedScript, apiKey);
            } catch (err) {
            }
            const scriptEl = document.getElementById(`script${index}`);
            if (scriptEl) {
                let highlightedScript = generatedScript.replace(/\n/g, '<br>'); 
                if (scriptEl && scriptEl.parentElement) {
                    let logContainer = scriptEl.parentElement.querySelector('.conversion-log-container');
                    if (!logContainer) {
                        logContainer = document.createElement('div');
                        logContainer.className = 'conversion-log-container';
                        scriptEl.parentElement.appendChild(logContainer);
                    } else {
                        logContainer.innerHTML = ''; 
                    }
                    let matchCount = 0;
                    let highlightIndex = 1;
                    if (conversionData && conversionData.length > 0) {
                        conversionData.sort((a, b) => b.after.length - a.after.length);
                        conversionData.forEach(conv => {
                            if (!conv.after) return;
                            const escapedAfter = conv.after.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            const regex = new RegExp(escapedAfter, 'g');
                            const safeBefore = (conv.before || '').replace(/"/g, '&quot;');
                            const safeReason = (conv.reason || '').replace(/"/g, '&quot;');
                            const safeStandard = (conv.standardType || 'ethics');
                            let standardBadge = '放送倫理';
                            if (safeStandard === 'minporen') standardBadge = '民放連基準';
                            let replaced = false;
                            highlightedScript = highlightedScript.replace(regex, (match) => {
                                replaced = true;
                                return `<span class="script-highlight" id="hl-${index}-${highlightIndex}">${match}</span>`;
                            });
                            if (replaced) {
                                const logCard = document.createElement('div');
                                logCard.className = 'highlight-tooltip'; 
                                logCard.innerHTML = `
                                   <div class="tooltip-header">
                                        <span class="tooltip-badge">${standardBadge}</span>
                                        <span style="font-size:0.8rem; color:#94a3b8;">#${highlightIndex}</span>
                                   </div>
                                   <div class="tooltip-row">
                                       <span class="tooltip-label">SNS原文:</span>
                                       <span class="tooltip-value before-text">${conv.before}</span>
                                   </div>
                                   <div class="tooltip-row">
                                       <span class="tooltip-label">変換理由:</span>
                                       <span class="tooltip-value">${conv.reason}</span>
                                   </div>
                                `;
                                logContainer.appendChild(logCard);
                                matchCount++;
                                highlightIndex++;
                            }
                        });
                        if (matchCount === 0 && conversionData.length > 0) {
                            const fallbackMsg = document.createElement('p');
                            fallbackMsg.style.cssText = "font-size:0.9rem; color:#aaa; margin-bottom:10px;";
                            fallbackMsg.textContent = "※ 変換ログ（本文内の一致箇所なし）";
                            logContainer.appendChild(fallbackMsg);
                            conversionData.forEach(conv => {
                                const safeStandard = (conv.standardType || 'ethics');
                                let standardBadge = '放送倫理';
                                if (safeStandard === 'minporen') standardBadge = '民放連基準';
                                const logCard = document.createElement('div');
                                logCard.className = 'highlight-tooltip';
                                logCard.innerHTML = `
                                   <div class="tooltip-header">
                                        <span class="tooltip-badge">${standardBadge}</span>
                                   </div>
                                   <div class="tooltip-row">
                                       <span class="tooltip-label">SNS原文:</span>
                                       <span class="tooltip-value before-text">${conv.before}</span>
                                   </div>
                                   <div class="tooltip-row">
                                           <span class="tooltip-label">変換後の表現:</span>
                                           <span class="tooltip-value" style="color:#2dd4bf; font-weight:bold;">${conv.after}</span>
                                   </div>
                                   <div class="tooltip-row">
                                       <span class="tooltip-label">変換理由:</span>
                                       <span class="tooltip-value">${conv.reason}</span>
                                   </div>
                               `;
                                logContainer.appendChild(logCard);
                            });
                        }
                    }
                }
                scriptEl.innerHTML = `<p>${highlightedScript}</p>`;
            }
            const convEl = document.getElementById(`conversion${index}`);
            if (convEl) {
                convEl.innerHTML = '';
                convEl.style.display = 'none'; 
                const parentSection = convEl.closest('.conversion-log-section');
                if (parentSection) parentSection.style.display = 'none';
            }
        });
        await Promise.all(processPromises);
    }
    function handleTabClick(e) {
        const tabId = e.target.dataset.tab;
        tabBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        const targetPanel = document.getElementById(`${tabId}Tab`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    }
    function saveSettings() {
        const apiKey = apiKeyInput.value.trim();
        const threshold = parseInt(phaseThresholdInput.value, 10);
        if (apiKey) {
            GeminiAnalyzer.setApiKey(apiKey);
        }
        if (threshold >= 1 && threshold <= 72) {
            GeminiAnalyzer.setPhaseThreshold(threshold);
        }
        settingsModal.classList.add('hidden');
        alert('設定を保存しました。');
    }
    function exportData() {
        if (analyzedData.length === 0) {
            alert('エクスポートするデータがありません。');
            return;
        }
        const headers = ['投稿日時', 'テキスト', 'フェーズ', '主要感情', 'スコア詳細'];
        const rows = analyzedData.map(post => {
            const emotionInfo = GeminiAnalyzer.EMOTIONS[post.emotion];
            const scores = Object.entries(post.scores || {})
                .map(([k, v]) => `${k}:${(v * 100).toFixed(0)}% `)
                .join(';');
            return [
                post.originalDatetime || post.datetime,
                `"${post.text.replace(/"/g, '""')}"`,
                post.phase || '',
                emotionInfo?.name || post.emotion,
                scores
            ];
        });
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sentiment_analysis_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
    function exportHtmlReport() {
        try {
            if (analyzedData.length === 0) {
                alert('エクスポートするデータがありません。');
                return;
            }
            const chartCanvas = document.getElementById('stackedBarChart');
            const chartImage = chartCanvas ? chartCanvas.toDataURL('image/png') : '';
            const pastAnalysisContent = pastAnalysis ? pastAnalysis.innerHTML : '';
            const broadcastContent = broadcastPhasesContainer.innerHTML;
            const phaseLegendContent = phaseLegend.innerHTML;
            const phaseDetailContainer = document.getElementById('phaseDetailStats');
            const detailedStatsHtml = phaseDetailContainer ? phaseDetailContainer.innerHTML : '<p class="placeholder">詳細データなし</p>';
            const tableRows = analyzedData.map(post => {
                const emotionInfo = GeminiAnalyzer.EMOTIONS[post.emotion] || GeminiAnalyzer.EMOTIONS.FACTUAL;
                const secondaryInfo = post.secondary ? GeminiAnalyzer.EMOTIONS[post.secondary] : null;
                const displayDate = formatDate(post.datetime);
                const isFactual = post.emotion === 'FACTUAL';
                const intensity = post.intensity || 3;
                const intensityStars = isFactual ? '-' : ('★'.repeat(intensity) + '☆'.repeat(5 - intensity));
                const scoresHtml = Object.entries(post.scores || {})
                    .filter(([, score]) => score > 0.1)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([emotion, score]) => {
                        const info = GeminiAnalyzer.EMOTIONS[emotion];
                        return `<span style="color: ${info?.color || '#6b7280'}">${info?.name || emotion}: ${(score * 100).toFixed(0)}%</span>`;
                    })
                    .join(', ');
                return `
                <tr>
                    <td>${displayDate}</td>
                    <td>${post.text}</td>
                    <td>${post.phase || '-'}</td>
                    <td>
                        <span style="background: ${emotionInfo.color}20; color: ${emotionInfo.color}; padding: 2px 8px; border-radius: 4px;">
                            ${emotionInfo.name}
                        </span>
                    </td>
                    <td><span style="color: ${emotionInfo.color}">${intensityStars}</span> (${intensity})</td>
                    <td>${secondaryInfo ? `<span style="color: ${secondaryInfo.color}">${secondaryInfo.emoji || ''} ${secondaryInfo.name}</span>` : '-'}</td>
                    <td>${scoresHtml}</td>
                </tr>
            `;
            }).join('');
            const topic = GeminiAnalyzer.currentTopicData?.topic || 'SNS分析';
            const dateStr = new Date().toLocaleString('ja-JP');
            const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>分析レポート: ${topic} - ${dateStr}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Noto Sans JP', 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
            color: #e2e8f0;
            min-height: 100vh;
            padding: 20px;
            line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            text-align: center;
            padding: 30px;
            background: rgba(99, 102, 241, 0.1);
            border-radius: 16px;
            margin-bottom: 30px;
            border: 1px solid rgba(99, 102, 241, 0.3);
        }
        .header h1 { color: #a5b4fc; font-size: 1.8rem; margin-bottom: 10px; }
        .header p { color: #94a3b8; }
        .meta-info { display: flex; gap: 20px; justify-content: center; margin-top: 15px; flex-wrap: wrap; }
        .meta-badge {
            background: rgba(99, 102, 241, 0.2);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
        }
        .section {
            background: rgba(30, 30, 46, 0.8);
            border-radius: 16px;
            padding: 25px;
            margin-bottom: 25px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .section h2 {
            color: #a5b4fc;
            font-size: 1.3rem;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .chart-container { text-align: center; margin: 20px 0; }
        .chart-container img { max-width: 100%; border-radius: 8px; }
        .phase-legend { display: flex; gap: 15px; flex-wrap: wrap; margin-top: 15px; justify-content: center; }
        .phase-legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.05);
            padding: 5px 12px;
            border-radius: 8px;
        }
        .phase-legend-color { width: 12px; height: 12px; border-radius: 3px; }
        .report-content p { margin-bottom: 12px; line-height: 1.8; }
        .broadcast-phases-container { display: flex; flex-direction: column; gap: 20px; }
        .phase-broadcast-card {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .phase-broadcast-header {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .phase-broadcast-header h3 { font-size: 1.1rem; }
        .phase-broadcast-content { padding: 20px; display: grid; gap: 20px; grid-template-columns: 1fr; }
        .phases-grid { display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); }
        .phase-card { background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.1); }
        .phase-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
        .phase-header h4 { margin: 0; color: #a5b4fc; font-size: 1.1rem; }
        .phase-count { font-size: 0.9rem; color: #94a3b8; }
        .emotion-list-header { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 10px; font-size: 0.85rem; font-weight: 600; color: #94a3b8; }
        .emotion-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.03); }
        .emotion-main { display: flex; align-items: center; gap: 10px; flex: 1; }
        .emotion-name { font-weight: 500; min-width: 80px; font-size: 0.95rem; }
        .emotion-count { font-size: 0.9rem; color: #e2e8f0; }
        .emotion-metrics { display: flex; gap: 15px; font-size: 0.85rem; color: #94a3b8; }
        .metric-item { display: flex; align-items: center; gap: 4px; }
        .stat-star { color: #f59e0b; }
        .stat-sub-count { color: #a78bfa; }
        .stat-sub-detail { color: #64748b; font-size: 0.85em; }
        .broadcast-script-section, .conversion-log-section {
            background: rgba(0, 0, 0, 0.2);
            padding: 15px;
            border-radius: 8px;
        }
        .broadcast-script-section h4, .conversion-log-section h4 {
            color: #94a3b8;
            font-size: 0.95rem;
            margin-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.85rem;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        th {
            background: rgba(99, 102, 241, 0.1);
            color: #a5b4fc;
            font-weight: 500;
        }
        tr:hover { background: rgba(255, 255, 255, 0.02); }
        .footer {
            text-align: center;
            padding: 20px;
            color: #64748b;
            font-size: 0.85rem;
        }
        @media print {
            body { background: white; color: black; }
            .section { border: 1px solid #ddd; }
        }
        .conversion-log {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .conversion-item {
            background: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 8px;
            border-bottom: 1px dashed rgba(255, 255, 255, 0.2);
            margin-bottom: 15px;
        }
        .conversion-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .conversion-before-after {
            display: flex;
            flex-direction: row; 
            align-items: center;
            gap: 15px;
            margin-bottom: 10px;
            flex-wrap: wrap;
        }
        .conversion-before {
            background: rgba(239, 68, 68, 0.15);
            padding: 8px 12px;
            border-radius: 4px;
            color: #fca5a5;
            border-left: 3px solid #ef4444;
            flex: 1;
            min-width: 200px;
        }
        .conversion-before::before {
            content: '❌ SNS表現';
            display: block;
            font-size: 0.75rem;
            color: #ef4444;
            margin-bottom: 4px;
            font-weight: bold;
        }
        .conversion-arrow {
            font-size: 1.5rem;
            color: #9ca3af;
        }
        .conversion-after {
            background: rgba(34, 197, 94, 0.15);
            padding: 8px 12px;
            border-radius: 4px;
            color: #86efac;
            border-left: 3px solid #22c55e;
            flex: 1;
            min-width: 200px;
        }
        .conversion-after::before {
            content: '✅ 放送表現';
            display: block;
            font-size: 0.75rem;
            color: #22c55e;
            margin-bottom: 4px;
            font-weight: bold;
        }
        .conversion-reason {
            font-size: 0.9rem;
            color: #cbd5e1;
            padding-top: 10px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            margin-top: 10px;
        }
        .standard-ref {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            margin-right: 8px;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .standard-ref.ethics { background: rgba(124, 58, 237, 0.2); color: #d8b4fe; border-color: rgba(124, 58, 237, 0.5); }
        .standard-ref.minporen { background: rgba(8, 145, 178, 0.2); color: #67e8f9; border-color: rgba(8, 145, 178, 0.5); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 SNS世論・感情分析レポート</h1>
            <p>${topic}</p>
            <div class="meta-info">
                <span class="meta-badge">📅 ${dateStr}</span>
                <span class="meta-badge">📝 ${analyzedData.length}件の投稿</span>
                <span class="meta-badge">📊 ${phases.length}フェーズ</span>
            </div>
        </div>
        <div class="section">
            <h2>📊 感情シェアの推移</h2>
            <div class="chart-container">
                ${chartImage ? `<img src="${chartImage}" alt="感情シェアグラフ">` : '<p>グラフデータなし</p>'}
            </div>
            <div class="phase-legend">${phaseLegendContent}</div>
        </div>
        <div class="section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; border: none;">📊 フェーズ別詳細分析</h2>
                <span style="font-size: 0.9rem; color: #94a3b8;">※画面の表示結果をそのままコピー</span>
            </div>
            ${detailedStatsHtml}
        </div>
        <div class="section">
            <h2>📌 期間別要因分析レポート</h2>
            <div class="report-content">${pastAnalysisContent}</div>
        </div>
        <div class="section">
            <h2>📻 放送原稿</h2>
            <div class="broadcast-phases-container">${broadcastContent}</div>
        </div>
        <div class="section">
            <h2>📋 分析データ一覧</h2>
            <table>
                <thead>
                    <tr>
                        <th>投稿日時</th>
                        <th>テキスト</th>
                        <th>フェーズ</th>
                        <th>主要感情</th>
                        <th>強度</th>
                        <th>二次感情</th>
                        <th>スコア詳細</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
        <div class="footer">
            <p>SNS世論・感情分析システム | 決定論的・10感情モデル版</p>
            <p>生成日時: ${dateStr}</p>
        </div>
    </div>
</body>
</html>`;
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const safeTopic = topic.replace(/[\/\\:*?"<>|]/g, '_').substring(0, 30);
            a.download = `分析レポート_${safeTopic}_${new Date().toISOString().slice(0, 10)}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert('HTMLレポートを保存しました！');
        } catch (e) {
            alert('保存に失敗しました: ' + e.message);
        }
    }
    async function openComparisonDashboard() {
        selectedForComparison = [];
        comparisonResults.classList.add('hidden');
        currentCategoryFilter = 'all';
        categoryFilterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === 'all');
        });
        await renderComparisonList();
        comparisonModal.classList.remove('hidden');
    }
    function resetComparisonState() {
        selectedForComparison = [];
        comparisonCharts.forEach(chart => chart.destroy());
        comparisonCharts = [];
        if (timeNormalizedChart) {
            timeNormalizedChart.destroy();
            timeNormalizedChart = null;
        }
    }
    async function getAnalysisHistory() {
        try {
            const history = await HistoryDB.getAll();
            history.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
            return history;
        } catch (e) {
            return [];
        }
    }
    async function renderComparisonList() {
        comparisonList.innerHTML = '<p class="placeholder">読み込み中...</p>';
        const history = await getAnalysisHistory();
        if (history.length === 0) {
            comparisonList.innerHTML = '<p class="no-history">保存された分析がありません。</p>';
            runComparisonBtn.disabled = true;
            return;
        }
        const filtered = currentCategoryFilter === 'all'
            ? history
            : history.filter(h => h.category === currentCategoryFilter);
        if (filtered.length === 0) {
            comparisonList.innerHTML = '<p class="no-history">このカテゴリの分析がありません。</p>';
            runComparisonBtn.disabled = true;
            return;
        }
        comparisonList.innerHTML = filtered.map((item, idx) => {
            const cat = item.category ? (CATEGORIES[item.category] || CATEGORIES.other) : CATEGORIES.other;
            const isSelected = selectedForComparison.some(s => s.id === item.id);
            const date = new Date(item.savedAt).toLocaleDateString('ja-JP');
            const totalPosts = item.totalPosts || item.count || 0;
            const phasesCount = item.phasesCount || (item.phases ? item.phases.length : 0);
            return `
                <div class="comparison-item ${isSelected ? 'selected' : ''}" 
                     data-id="${item.id}" 
                     onclick="toggleComparisonItem('${item.id}')">
                    <input type="checkbox" ${isSelected ? 'checked' : ''} />
                    <div class="comparison-item-info">
                        <div class="comparison-item-name">
                            ${item.name}
                            <span class="category-badge ${item.category || 'other'}">${cat.emoji} ${cat.name}</span>
                        </div>
                        <div class="comparison-item-meta">
                            ${date} | ${totalPosts}件 | ${phasesCount}フェーズ
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        updateRunComparisonButton();
    }
    window.toggleComparisonItem = async function (id) {
        const history = await getAnalysisHistory();
        const item = history.find(h => h.id === id);
        if (!item) return;
        const idx = selectedForComparison.findIndex(s => s.id === id);
        if (idx >= 0) {
            selectedForComparison.splice(idx, 1);
        } else if (selectedForComparison.length < 8) {
            selectedForComparison.push(item);
        } else {
            alert('比較対象は最大8件までです');
            return;
        }
        renderComparisonList();
    };
    function updateRunComparisonButton() {
        const count = selectedForComparison.length;
        runComparisonBtn.disabled = count < 2;
        runComparisonBtn.textContent = count < 2
            ? '2件以上選択してください'
            : `${count}件を比較`;
    }
    const COMPARISON_COLORS = [
        '#6366f1', // indigo
        '#f59e0b', // amber
        '#10b981', // emerald
        '#ef4444', // red
        '#8b5cf6', // purple
        '#06b6d4', // cyan (New)
        '#ec4899', // pink (New)
        '#84cc16'  // lime (New)
    ];
    function runComparison() {
        if (selectedForComparison.length < 2) return;
        comparisonCharts.forEach(chart => chart.destroy());
        comparisonCharts = [];
        const phaseNames = ['初期', '中期', '後期'];
        comparisonChartsGrid.innerHTML = `
            <div class="comparison-grid-header">
                <div class="comparison-grid-label"></div>
                ${phaseNames.map(p => `<div class="comparison-phase-header">${p}</div>`).join('')}
            </div>
            ${selectedForComparison.map((item, idx) => {
            const color = COMPARISON_COLORS[idx % COMPARISON_COLORS.length];
            return `
                    <div class="comparison-row">
                        <div class="comparison-row-label" style="border-left: 4px solid ${color}">
                            ${item.name}
                        </div>
                        ${phaseNames.map((phase, phaseIdx) => `
                            <div class="comparison-chart-cell">
                                <canvas id="compChart${idx}_${phaseIdx}"></canvas>
                            </div>
                        `).join('')}
                    </div>
                `;
        }).join('')}
        `;
        selectedForComparison.forEach((item, idx) => {
            phaseNames.forEach((phaseName, phaseIdx) => {
                const canvas = document.getElementById(`compChart${idx}_${phaseIdx}`);
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                let emotionData = {};
                if (item.phaseEmotionData && item.phaseEmotionData[phaseIdx]) {
                    emotionData = item.phaseEmotionData[phaseIdx].distribution || {};
                } else if (item.analyzedData && item.phases && item.phases[phaseIdx]) {
                    const phase = item.phases[phaseIdx];
                    const phasePosts = item.analyzedData.filter(p => p.phase === phase.name);
                    phasePosts.forEach(p => {
                        emotionData[p.emotion] = (emotionData[p.emotion] || 0) + 1;
                    });
                } else {
                    emotionData = item.emotionDistribution || {};
                }
                const emotionOrder = Object.keys(GeminiAnalyzer.EMOTIONS);
                const labels = emotionOrder.map(k => GeminiAnalyzer.EMOTIONS[k]?.name || k);
                const data = emotionOrder.map(k => emotionData[k] || 0);
                const colors = emotionOrder.map(k => GeminiAnalyzer.EMOTIONS[k]?.color || '#666');
                const chart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: data,
                            backgroundColor: colors,
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: { display: false }
                        }
                    }
                });
                comparisonCharts.push(chart);
            });
        });
        renderComparisonTable();
        try {
            renderMultiLineCharts();
        } catch (e) {
        }
        comparisonResults.classList.remove('hidden');
    }
    const CATEGORY_MAP = {
        'manmade': { label: '人災', icon: '🔥' },
        'naturalfire': { label: '自然火災', icon: '🌲🔥' },
        'earthquake': { label: '地震', icon: '🌏' },
        'heavyrain': { label: '豪雨', icon: '🌧️' },
        'other': { label: 'その他', icon: '⚪' }
    };
    async function renderComparisonList() {
        const listContainer = document.getElementById('comparisonList');
        if (!listContainer) return;
        try {
            const allHistory = await HistoryDB.getAll();
            let filteredHistory = allHistory.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
            if (currentCategoryFilter !== 'all') {
                filteredHistory = filteredHistory.filter(h => h.category === currentCategoryFilter);
            }
            if (filteredHistory.length === 0) {
                listContainer.innerHTML = '<p class="no-history">条件に一致する分析データがありません。</p>';
                return;
            }
            listContainer.innerHTML = filteredHistory.map(item => {
                const isSelected = selectedForComparison.some(s => s.id === item.id);
                let dateDisplay = '';
                try {
                    let startTime = null;
                    let endTime = null;
                    if (item.phases && item.phases.length > 0) {
                        const starts = item.phases.map(p => p.startTime).filter(t => t);
                        const ends = item.phases.map(p => p.endTime).filter(t => t);
                        if (starts.length > 0) startTime = Math.min(...starts);
                        if (ends.length > 0) endTime = Math.max(...ends);
                    } else if (item.analyzedData && item.analyzedData.length > 0) {
                        const times = item.analyzedData.map(p => new Date(p.datetime).getTime()).filter(t => !isNaN(t));
                        if (times.length > 0) {
                            startTime = Math.min(...times);
                            endTime = Math.max(...times);
                        }
                    }
                    if (startTime && endTime) {
                        const formatDate = (ts) => {
                            const d = new Date(ts);
                            return `${d.getFullYear()}年${(d.getMonth() + 1).toString().padStart(2, '0')}月${d.getDate().toString().padStart(2, '0')}日`;
                        };
                        dateDisplay = `${formatDate(startTime)} ～ ${formatDate(endTime)}`;
                    }
                } catch (e) {
                }
                const categoryInfo = CATEGORY_MAP[item.category] || { label: item.category || 'その他', icon: '📄' };
                return `
                    <div class="comparison-item ${isSelected ? 'selected' : ''}" onclick="toggleComparisonSelect('${item.id}')">
                        <div class="comparison-item-header">
                            <span class="comparison-item-title">${item.name || '無題の分析'}</span>
                            <span class="comparison-item-date">${dateDisplay}</span>
                        </div>
                        <div class="comparison-item-meta">
                            <span>${categoryInfo.icon} ${categoryInfo.label}</span>
                            <span>データ数: ${item.analyzedData ? item.analyzedData.length : 0}</span>
                        </div>
                    </div>
                `;
            }).join('');
            updateComparisonButtonState();
        } catch (e) {
            listContainer.innerHTML = '<p class="error-message">履歴の読み込みに失敗しました。</p>';
        }
    }
    window.toggleComparisonSelect = async function (id) {
        try {
            const allHistory = await HistoryDB.getAll();
            const item = allHistory.find(h => h.id === id);
            if (!item) return;
            const idx = selectedForComparison.findIndex(s => s.id === id);
            if (idx >= 0) {
                selectedForComparison.splice(idx, 1);
            } else {
                if (selectedForComparison.length >= 8) {
                    alert('比較できるのは最大8件までです。');
                    return;
                }
                selectedForComparison.push(item);
            }
            renderComparisonList();
        } catch (e) {
        }
    };
    function updateComparisonButtonState() {
        const btn = document.getElementById('runComparison');
        if (btn) {
            btn.disabled = selectedForComparison.length < 2;
            btn.textContent = selectedForComparison.length >= 2 ?
                `${selectedForComparison.length}件を比較` : '選択した分析を比較（2件以上）';
        }
    }
    function renderComparisonTable() {
        const comparisonTableHead = document.getElementById('comparisonTableHead');
        const comparisonTableBody = document.getElementById('comparisonTableBody');
        if (!comparisonTableHead || !comparisonTableBody) return;
        let headerHtml = '<tr><th>感情</th>';
        selectedForComparison.forEach((item, idx) => {
            const color = COMPARISON_COLORS[idx % COMPARISON_COLORS.length];
            headerHtml += `<th colspan="3" style="border-top: 3px solid ${color}; color: ${color}">${item.name}</th>`;
        });
        headerHtml += '</tr><tr><th></th>';
        selectedForComparison.forEach(() => {
            headerHtml += '<th>初期</th><th>中期</th><th>後期</th>';
        });
        headerHtml += '</tr>';
        comparisonTableHead.innerHTML = headerHtml;
        const emotions = Object.keys(GeminiAnalyzer.EMOTIONS);
        comparisonTableBody.innerHTML = emotions.map(emotionKey => {
            const emotionInfo = GeminiAnalyzer.EMOTIONS[emotionKey];
            let rowHtml = `<tr><td><span style="color:${emotionInfo.color}">${emotionInfo.emoji} ${emotionInfo.name}</span></td>`;
            selectedForComparison.forEach(item => {
                const phases = ['初期', '中期', '後期'];
                phases.forEach((phaseName, phaseIdx) => {
                    let percentage = 0;
                    if (item.phaseEmotionData && item.phaseEmotionData[phaseIdx]) {
                        const dist = item.phaseEmotionData[phaseIdx].distribution;
                        const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
                        percentage = ((dist[emotionKey] || 0) / total) * 100;
                    } else if (item.analyzedData && item.phases) {
                        const phase = item.phases[phaseIdx];
                        if (phase) {
                            const phasePosts = item.analyzedData.filter(p => p.phase === phase.name);
                            const total = phasePosts.length || 1;
                            if (total > 0) {
                                percentage = (phasePosts.filter(p => p.emotion === emotionKey).length / total) * 100;
                            }
                        }
                    }
                    rowHtml += `<td>${percentage.toFixed(1)}%</td>`;
                });
            });
            rowHtml += '</tr>';
            return rowHtml;
        }).join('');
    }
    function runComparison() {
        const comparisonResults = document.getElementById('comparisonResults');
        if (!comparisonResults) return;
        if (selectedForComparison.length < 2) {
            alert('2件以上選択してください');
            return;
        }
        comparisonResults.classList.remove('hidden');
        renderComparisonTable();
        try {
            renderHeatmap();
        comparisonResults.scrollIntoView({ behavior: 'smooth' });
    }
    function renderHeatmap() {
        const heatmapContainer = document.getElementById('heatmapContainer');
        if (!heatmapContainer) return;
        comparisonCharts.forEach(chart => {
            if (chart) chart.destroy();
        });
        comparisonCharts = [];
        const selectIds = ['emotion1', 'emotion2', 'emotion3'];
        const selectedEmotions = selectIds.map(id => {
            const el = document.getElementById(id);
            return el ? el.value : 'FEAR';
        });
        const phases = ['初期', '中期', '後期'];
        let html = '<table class="heatmap-table">';
        html += '<thead><tr><th rowspan="2" class="heatmap-row-header">事例名</th>';
        selectedEmotions.forEach(emotion => {
            const info = GeminiAnalyzer.EMOTIONS[emotion] || { name: emotion, emoji: '', color: '#888' };
            html += `<th colspan="3" style="border-bottom: 3px solid ${info.color}; color: ${info.color}">${info.emoji} ${info.name}</th>`;
        });
        html += '</tr>';
        html += '<tr>';
        selectedEmotions.forEach(() => {
            phases.forEach(p => html += `<th>${p}</th>`);
        });
        html += '</tr></thead>';
        const maxValues = {};
        selectedEmotions.forEach(emotion => {
            let maxVal = 0;
            selectedForComparison.forEach(item => {
                phases.forEach((_, phaseIdx) => {
                    let p = 0;
                    if (item.phaseEmotionData && item.phaseEmotionData.length > phaseIdx) {
                        const phase = item.phaseEmotionData[phaseIdx];
                        if (phase && phase.distribution) {
                            const total = Object.values(phase.distribution).reduce((a, b) => a + b, 0) || 1;
                            p = ((phase.distribution[emotion] || 0) / total) * 100;
                        }
                    } else if (item.analyzedData && item.phases && item.phases.length > phaseIdx) {
                        const phase = item.phases[phaseIdx];
                        const phasePosts = item.analyzedData.filter(post => post.phase === phase.name);
                        const total = phasePosts.length || 1;
                        if (total > 0) {
                            p = (phasePosts.filter(post => post.emotion === emotion).length / total) * 100;
                        }
                    }
                    if (p > maxVal) maxVal = p;
                });
            });
            maxValues[emotion] = maxVal > 0 ? maxVal : 60; // Default to 60 if all 0 to avoid division by zero
        });
        html += '<tbody>';
        selectedForComparison.forEach((item, itemIdx) => {
            const itemColor = COMPARISON_COLORS[itemIdx % COMPARISON_COLORS.length];
            html += `<tr><td class="heatmap-row-header" style="border-left: 5px solid ${itemColor}">${item.name}</td>`;
            selectedEmotions.forEach(emotion => {
                const info = GeminiAnalyzer.EMOTIONS[emotion] || { color: '#888' };
                const localMax = maxValues[emotion]; // Max value for this emotion column
                phases.forEach((phaseName, phaseIdx) => {
                    let percentage = 0;
                    if (item.phaseEmotionData && item.phaseEmotionData.length > phaseIdx) {
                        const phase = item.phaseEmotionData[phaseIdx];
                        if (phase && phase.distribution) {
                            const dist = phase.distribution;
                            const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
                            percentage = ((dist[emotion] || 0) / total) * 100;
                        }
                    } else if (item.analyzedData && item.phases && item.phases.length > phaseIdx) {
                        const phase = item.phases[phaseIdx];
                        const phasePosts = item.analyzedData.filter(p => p.phase === phase.name);
                        const total = phasePosts.length || 1;
                        if (total > 0) {
                            percentage = (phasePosts.filter(p => p.emotion === emotion).length / total) * 100;
                        }
                    }
                    let opacity = percentage / localMax;
                    opacity = Math.min(1, Math.max(0, opacity));
                    const textColor = '#000';
                    const bgColor = `color-mix(in srgb, ${info.color}, transparent ${100 - (opacity * 100)}%)`;
                    html += `<td class="heatmap-cell" style="background-color: ${bgColor}; color: ${textColor}">
                        <div class="heatmap-value">${percentage.toFixed(1)}%</div>
                     </td>`;
                });
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        heatmapContainer.innerHTML = html;
    }
    const emotion1Select = document.getElementById('emotion1');
    const emotion2Select = document.getElementById('emotion2');
    const emotion3Select = document.getElementById('emotion3');
    [emotion1Select, emotion2Select, emotion3Select].forEach(select => {
        if (select) {
            select.addEventListener('change', () => {
                if (selectedForComparison.length >= 2) {
                    renderHeatmap();
                }
            });
        }
    });
    function formatDate(isoString) {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return isoString;
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            const hh = String(date.getHours()).padStart(2, '0');
            const mm = String(date.getMinutes()).padStart(2, '0');
            return `${y}/${m}/${d}-${hh}:${mm}`;
        } catch (e) {
            return isoString;
        }
    }
    function renderDataTable() {
        if (!dataTableBody) return;
        dataTableBody.innerHTML = analyzedData.map((post, idx) => {
            const emotionInfo = GeminiAnalyzer.EMOTIONS[post.emotion] || {};
            const secondaryInfo = post.secondary ? GeminiAnalyzer.EMOTIONS[post.secondary] : null;
            const isFactual = post.emotion === 'FACTUAL';
            const intensity = post.intensity || 3;
            const intensityStars = isFactual ? '-' : ('★'.repeat(intensity) + '☆'.repeat(5 - intensity));
            return `
                <tr>
                    <td>${formatDate(post.datetime)}</td>
                    <td class="text-cell" onclick="showTextDetail(${idx})">${post.text?.substring(0, 50)}${post.text?.length > 50 ? '...' : ''}</td>
                    <td>${post.phase || ''}</td>
                    <td><span style="color: ${emotionInfo.color}">${emotionInfo.emoji} ${emotionInfo.name}</span></td>
                    <td class="intensity-cell"><span class="intensity-stars" style="color: ${emotionInfo.color}">${intensityStars}</span></td>
                    <td>${!isFactual && secondaryInfo ? `<span style="color: ${secondaryInfo.color}">${secondaryInfo.emoji} ${secondaryInfo.name}</span>` : '<span class="no-secondary">-</span>'}</td>
                </tr>
            `;
        }).join('');
        if (dataCount) {
            dataCount.textContent = `${analyzedData.length}件`;
        }
    }
    window.showTextDetail = function (idx) {
        const post = analyzedData[idx];
        if (!post) return;
        const emotionInfo = GeminiAnalyzer.EMOTIONS[post.emotion] || {};
        if (detailDatetime) detailDatetime.textContent = formatDate(post.datetime || post.originalDatetime);
        if (detailPhase) detailPhase.textContent = post.phase || '';
        if (detailEmotion) {
            detailEmotion.innerHTML = `<span style="color: ${emotionInfo.color}">${emotionInfo.emoji} ${emotionInfo.name}</span>`;
        }
        if (detailText) detailText.textContent = post.text || '';
        if (detailScores && post.scores) {
            const scoresHtml = Object.entries(post.scores)
                .sort((a, b) => b[1] - a[1])
                .map(([emotion, score]) => {
                    const info = GeminiAnalyzer.EMOTIONS[emotion] || {};
                    return `
                        <div class="score-item">
                            <span style="color: ${info.color}">${info.emoji} ${info.name}</span>
                            <span>${(score * 100).toFixed(0)}%</span>
                        </div>
                    `;
                })
                .join('');
            detailScores.innerHTML = scoresHtml;
        } else if (detailScores) {
            detailScores.innerHTML = '<p class="placeholder">スコア詳細なし</p>';
        }
        textDetailModal.classList.remove('hidden');
    };
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    if (exportHtmlBtn) {
        exportHtmlBtn.addEventListener('click', exportHtmlReport);
    }
    if (settingsBtn) settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    if (closeModal) closeModal.addEventListener('click', () => settingsModal.classList.add('hidden'));
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings);
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) settingsModal.classList.add('hidden');
        });
    }
    if (closeTextModal) closeTextModal.addEventListener('click', () => textDetailModal.classList.add('hidden'));
    if (textDetailModal) {
        textDetailModal.addEventListener('click', (e) => {
            if (e.target === textDetailModal) textDetailModal.classList.add('hidden');
        });
    }
    if (closeSaveModal) closeSaveModal.addEventListener('click', () => saveModal.classList.add('hidden'));
    const confirmSave = document.getElementById('confirmSave');
    if (confirmSave) confirmSave.addEventListener('click', confirmSaveAnalysis);
    if (saveModal) {
        saveModal.addEventListener('click', (e) => {
            if (e.target === saveModal) saveModal.classList.add('hidden');
        });
    }
    if (historyBtn) historyBtn.addEventListener('click', openHistoryModal);
    if (closeHistoryModal) closeHistoryModal.addEventListener('click', () => historyModal.classList.add('hidden'));
    if (clearAllHistory) clearAllHistory.addEventListener('click', clearAllHistoryData);
    if (historyModal) {
        historyModal.addEventListener('click', (e) => {
            if (e.target === historyModal) historyModal.classList.add('hidden');
        });
    }
    const comparisonBtn = document.getElementById('comparisonBtn');
    if (comparisonBtn) comparisonBtn.addEventListener('click', openComparisonDashboard);
    if (closeComparisonModal) closeComparisonModal.addEventListener('click', () => comparisonModal.classList.add('hidden'));
    if (runComparisonBtn) runComparisonBtn.addEventListener('click', runComparison);
    if (comparisonModal) {
        comparisonModal.addEventListener('click', (e) => {
            if (e.target === comparisonModal) comparisonModal.classList.add('hidden');
        });
    }
    categoryFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategoryFilter = btn.dataset.category;
            renderComparisonList();
        });
    });
    const historyFilterBtns = document.querySelectorAll('.history-filter-btn');
    historyFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            historyFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentHistoryFilter = btn.dataset.category;
            renderHistoryList();
        });
    });
    const resetComparisonBtn = document.getElementById('resetComparison'); // If exists
    if (resetComparisonBtn) resetComparisonBtn.addEventListener('click', resetComparisonState);
    const runValidationBtn = document.getElementById('runValidationBtn');
    if (runValidationBtn) {
        runValidationBtn.addEventListener('click', async () => {
            if (phases.length === 0) {
                alert('分析データがありません。先にCSVファイルを分析してください。');
                return;
            }
            const apiKey = GeminiAnalyzer.getApiKey();
            if (!apiKey) {
                alert('APIキーが設定されていません。設定画面からAPIキーを入力してください。');
                return;
            }
            const totalPosts = phases.reduce((sum, p) => sum + p.posts.length, 0);
            const phaseInfo = phases.map(p => `${p.name}(${p.posts.length}件)`).join(', ');
            if (phases[0]?.posts?.[0]) {
            }
            const validationProgress = document.getElementById('validationProgress');
            const validationProgressFill = document.getElementById('validationProgressFill');
            const validationProgressText = document.getElementById('validationProgressText');
            const validationResults = document.getElementById('validationResults');
            runValidationBtn.disabled = true;
            runValidationBtn.textContent = '🔄 検証実行中...';
            validationProgress.style.display = 'block';
            validationResults.style.display = 'none';
            try {
                validationProgressFill.style.width = '20%';
                validationProgressText.textContent = '検証①: 感情分類の妥当性を審査中...';
                const labelResult = await GeminiAnalyzer.validateEmotionLabels(phases, apiKey);
                if (labelResult.details) {
                    console.groupCollapsed('🔍 検証① 詳細レポート（全30件の判定結果）');
                        `[${d.match ? '✅' : '❌'}] 元:${d.original} -> 新:${d.reClassified || '-'}\n   理由: ${d.reason}\n   投稿: ${d.text}`
                    ).join('\n\n'));
                    console.groupEnd();
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
                validationProgressFill.style.width = '50%';
                validationProgressText.textContent = '検証②: 数値から要因を逆推定中...';
                const factorResult = await GeminiAnalyzer.validateFactorConsistency(phases, apiKey);
                validationProgressFill.style.width = '100%';
                validationProgressText.textContent = '検証完了！';
                try {
                    const uniqueKey = `snsanalyz_validation_${currentCaseName || 'default'}`;
                    const savedValidation = {
                        labelResult: labelResult,
                        factorResult: factorResult,
                        savedAt: new Date().toISOString(),
                        phaseInfo: phaseInfo
                    };
                    localStorage.setItem(uniqueKey, JSON.stringify(savedValidation));
                } catch (e) {
                }
                setTimeout(() => {
                    validationProgress.style.display = 'none';
                    validationResults.style.display = 'block';
                    renderValidationResults(labelResult, factorResult);
                }, 500);
            } catch (error) {
                alert(`検証エラー: ${error.message}`);
                validationProgress.style.display = 'none';
            } finally {
                runValidationBtn.disabled = false;
                runValidationBtn.textContent = '🔍 自動検証を実行';
            }
        });
    }
    function renderValidationResults(labelResult, factorResult) {
        const container = document.getElementById('validationResults');
        if (!container) return;
        const getScoreColor = (score) => {
            if (score >= 80) return '#2E7D32';
            if (score >= 60) return '#F57F17';
            return '#C62828';
        };
        const periodCards = (factorResult.periodResults || []).map(pr => `
            <div style="flex:1; min-width:80px; background:#EFEBE9; padding:8px; border-radius:6px; text-align:center;">
                <div style="font-size:0.8em; font-weight:bold; color:#5D4037;">${pr.period}</div>
                <div style="font-size:1.4em; font-weight:bold; color:${getScoreColor(pr.score)};">${pr.score}%</div>
            </div>
        `).join('');
        container.innerHTML = `
            <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:1rem;">
                <!-- 検証① カード -->
                <div style="flex:1; min-width:250px; background:#E8F5E9; border-radius:8px; padding:1rem; border:1px solid #C8E6C9;">
                    <h4 style="margin:0 0 0.5rem; font-size:0.9em; color:#1B5E20;">🏷️ 検証① 感情分類の妥当性</h4>
                    <div style="display:flex; align-items:baseline; gap:0.5rem;">
                        <span style="font-size:2em; font-weight:bold; color:${getScoreColor(labelResult.accuracy)};">${labelResult.accuracy}%</span>
                        <span style="font-size:0.85em; color:#2E7D32;">(確信度: ${labelResult.avgConfidence}/5.0)</span>
                    </div>
                </div>
                <!-- 検証② カード -->
                <div style="flex:1; min-width:250px; background:#E3F2FD; border-radius:8px; padding:1rem; border:1px solid #BBDEFB;">
                    <h4 style="margin:0 0 0.5rem; font-size:0.9em; color:#0D47A1;">🔗 検証② 要因整合性</h4>
                    <div style="display:flex; align-items:baseline; gap:0.5rem;">
                        <span style="font-size:2em; font-weight:bold; color:${getScoreColor(factorResult.consistency)};">${factorResult.consistency}%</span>
                        <span style="font-size:0.85em; color:#1565C0;">(全体スコア)</span>
                    </div>
                    <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
                        ${periodCards}
                    </div>
                </div>
            </div>
        `;
    }
});